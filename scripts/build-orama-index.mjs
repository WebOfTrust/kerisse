/**
 * Build static Orama search index shards from scraped JSONL / JSON entries.
 *
 * Usage: node scripts/build-orama-index.mjs
 * Output: output/search-index/<category-slug>.orama.msgpack.gz  (one shard per category)
 *         output/search-index/manifest.json                     (shard list + sizes)
 *
 * The index is sharded by document `category` so the browser only has to
 * download and load the subsets the user actually wants to search in.
 *
 * Uses MessagePack instead of JSON.stringify — the serialized Orama dump
 * exceeds V8's max string length (~512MB) once the corpus grows large enough.
 */

import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import path from 'path';
import readline from 'readline';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { encode } from '@msgpack/msgpack';
import { create, insert, save } from '@orama/orama';
import {
  categorySlug,
  FACET_ATTRIBUTES,
  MANIFEST_FILENAME,
  MSGPACK_OPTIONS,
  normalizeDocument,
  ORAMA_SCHEMA,
  SEARCH_INDEX_DIRNAME,
  shardFilename,
  shouldIncludeDocument,
} from './orama-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const entriesDir = path.join(projectRoot, 'search-index-entries');
const outputDir = path.join(projectRoot, 'output', SEARCH_INDEX_DIRNAME);
const manifestFile = path.join(outputDir, MANIFEST_FILENAME);

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

async function directoryHasIndexFiles(dir) {
  try {
    const files = await fs.readdir(dir);
    return files.some((file) => file.endsWith('.jsonl') || file.endsWith('.json'));
  } catch {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Collect documents grouped by category slug. */
async function collectDocumentsByCategory() {
  const groups = new Map();
  let nextId = 1;

  const addDocument = (raw) => {
    if (!shouldIncludeDocument(raw)) {
      return;
    }
    const document = normalizeDocument(raw, nextId++);
    const slug = categorySlug(document.category);
    let group = groups.get(slug);
    if (!group) {
      group = { slug, category: document.category || 'Uncategorized', documents: [] };
      groups.set(slug, group);
    }
    group.documents.push(document);
  };

  const files = await fs.readdir(entriesDir);
  const jsonlFiles = files.filter((file) => file.endsWith('.jsonl'));
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  for (const file of jsonlFiles) {
    await readJsonlFile(path.join(entriesDir, file), addDocument);
  }

  for (const file of jsonFiles) {
    await readJsonArrayFile(path.join(entriesDir, file), addDocument);
  }

  return groups;
}

async function buildShard(group) {
  const db = create({ schema: ORAMA_SCHEMA });

  for (const document of group.documents) {
    await insert(db, document);
  }

  const dbExport = await save(db);
  // Orama's inverted index nests far deeper than msgpack's default maxDepth (100).
  const msgpack = encode(dbExport, MSGPACK_OPTIONS);
  const buffer = Buffer.from(msgpack.buffer, msgpack.byteOffset, msgpack.byteLength);

  const file = shardFilename(group.slug);
  const outputFile = path.join(outputDir, file);

  await pipeline(
    Readable.from(buffer),
    createGzip(),
    createWriteStream(outputFile),
  );

  const { size: gzippedBytes } = await fs.stat(outputFile);

  return {
    category: group.category,
    slug: group.slug,
    file,
    documents: group.documents.length,
    bytes: gzippedBytes,
  };
}

async function main() {
  await fs.mkdir(entriesDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  const hasEntries = await directoryHasIndexFiles(entriesDir);

  if (!hasEntries) {
    if (await fileExists(manifestFile)) {
      console.log(`No scraped entries in ${entriesDir}; using existing shards in ${outputDir}`);
      return;
    }
    console.warn(
      `No scraped entries in ${entriesDir} and no pre-built shards in ${outputDir}. ` +
        'Skipping index build (CI / webpack-only). Run `npm run scrape` or ' +
        '`npm run download:search-data` locally, then `npm run build:search-index`.',
    );
    return;
  }

  console.log('Reading scraped entries...');
  const groups = await collectDocumentsByCategory();
  const totalDocuments = Array.from(groups.values()).reduce(
    (sum, group) => sum + group.documents.length,
    0,
  );
  console.log(`Indexing ${totalDocuments} documents across ${groups.size} categories...`);

  // Remove stale shards from previous builds (renamed/removed categories).
  for (const existing of await fs.readdir(outputDir)) {
    if (existing.endsWith('.orama.msgpack.gz')) {
      await fs.rm(path.join(outputDir, existing));
    }
  }

  const shards = [];
  // Build sequentially, largest first, so peak memory stays bounded.
  const sortedGroups = Array.from(groups.values()).sort(
    (a, b) => b.documents.length - a.documents.length,
  );

  for (const group of sortedGroups) {
    console.log(`- ${group.category}: indexing ${group.documents.length} documents...`);
    const shard = await buildShard(group);
    const sizeMb = (shard.bytes / (1024 * 1024)).toFixed(2);
    console.log(`  wrote ${shard.file} (${sizeMb} MB gzipped)`);
    shards.push(shard);
    group.documents = null; // release memory before the next shard
  }

  shards.sort((a, b) => a.category.localeCompare(b.category));

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalDocuments,
    shards,
  };

  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));

  const totalMb = (shards.reduce((sum, shard) => sum + shard.bytes, 0) / (1024 * 1024)).toFixed(2);
  console.log(`Wrote ${manifestFile}`);
  console.log(`Total: ${shards.length} shards, ${totalDocuments} documents, ${totalMb} MB gzipped`);
  console.log(`Facets available: ${FACET_ATTRIBUTES.join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
