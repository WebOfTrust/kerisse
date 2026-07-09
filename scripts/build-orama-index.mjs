/**
 * Build a static Orama search index from scraped JSONL / JSON entries.
 *
 * Usage: node scripts/build-orama-index.mjs
 * Output: output/search-index.orama.json (copied to dist/ by webpack)
 */

import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { gzipSync } from 'zlib';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { create, insert, save } from '@orama/orama';
import {
  FACET_ATTRIBUTES,
  normalizeDocument,
  ORAMA_INDEX_FILENAME,
  ORAMA_SCHEMA,
  shouldIncludeDocument,
} from './orama-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const entriesDir = path.join(projectRoot, 'search-index-typesense/search-index-entries');
const outputDir = path.join(projectRoot, 'output');
const outputFile = path.join(outputDir, ORAMA_INDEX_FILENAME);

async function readJsonlFile(filePath, onDocument) {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    try {
      onDocument(JSON.parse(trimmed));
    } catch (error) {
      console.warn(`Skipping invalid JSON line in ${filePath}: ${error.message}`);
    }
  }
}

async function readJsonArrayFile(filePath, onDocument) {
  const raw = await fs.readFile(filePath, 'utf8');
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    throw new Error(`${filePath} is not a JSON array`);
  }
  items.forEach(onDocument);
}

async function collectDocuments() {
  const documents = [];
  let nextId = 1;

  const files = await fs.readdir(entriesDir);
  const jsonlFiles = files.filter((file) => file.endsWith('.jsonl'));
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  for (const file of jsonlFiles) {
    await readJsonlFile(path.join(entriesDir, file), (raw) => {
      if (!shouldIncludeDocument(raw)) {
        return;
      }
      documents.push(normalizeDocument(raw, nextId++));
    });
  }

  for (const file of jsonFiles) {
    await readJsonArrayFile(path.join(entriesDir, file), (raw) => {
      if (!shouldIncludeDocument(raw)) {
        return;
      }
      documents.push(normalizeDocument(raw, nextId++));
    });
  }

  return documents;
}

async function main() {
  console.log('Reading scraped entries...');
  const documents = await collectDocuments();
  console.log(`Indexing ${documents.length} documents...`);

  const db = create({ schema: ORAMA_SCHEMA });

  for (const document of documents) {
    await insert(db, document);
  }

  const serialized = JSON.stringify(await save(db));
  const gzipped = gzipSync(Buffer.from(serialized, 'utf8'));
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, gzipped);

  const sizeMb = (gzipped.length / (1024 * 1024)).toFixed(2);
  const rawMb = (Buffer.byteLength(serialized, 'utf8') / (1024 * 1024)).toFixed(2);
  console.log(`Wrote ${outputFile} (${sizeMb} MB gzipped, ${rawMb} MB raw, ${documents.length} documents)`);

  const facetSummary = FACET_ATTRIBUTES.join(', ');
  console.log(`Facets available: ${facetSummary}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
