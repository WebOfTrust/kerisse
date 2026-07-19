/**
 * Preserve / restore search-index entry files for config entries marked skipCrawl.
 * Used around the wipe in prepare_file_system.sh so frozen sources stay searchable.
 *
 * Usage:
 *   node scraper/preserveFrozenEntries.mjs preserve
 *   node scraper/preserveFrozenEntries.mjs restore
 */

import { promises as fs } from 'fs';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import { githubDestinationBasename } from './modules/githubEntryPaths.mjs';

dotenvConfig();

const mode = process.argv[2];
if (mode !== 'preserve' && mode !== 'restore') {
    console.error('Usage: node scraper/preserveFrozenEntries.mjs <preserve|restore>');
    process.exit(1);
}

const entriesDir = process.env.SEARCH_INDEX_ENTRIES_DIR;
const stashDir = path.join(process.env.SEARCH_INDEX_TEMP_DIR || 'scraper/temp', 'frozen-entries');
const configPath = path.join(
    process.env.SEARCH_INDEX_CONFIG_DIR,
    'configGithubRepos.json'
);

async function frozenBasenames() {
    const entries = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return entries
        .filter((entry) => entry.skipCrawl === true)
        .map((entry) => githubDestinationBasename(entry));
}

async function preserve() {
    await fs.rm(stashDir, { recursive: true, force: true });
    await fs.mkdir(stashDir, { recursive: true });

    const names = await frozenBasenames();
    for (const name of names) {
        const src = path.join(entriesDir, name);
        try {
            await fs.access(src);
        } catch {
            console.warn(`skipCrawl: no existing entry to preserve: ${src}`);
            continue;
        }
        await fs.copyFile(src, path.join(stashDir, name));
        console.log(`Preserved frozen entry: ${name}`);
    }
}

async function restore() {
    let names;
    try {
        names = await fs.readdir(stashDir);
    } catch {
        return;
    }

    await fs.mkdir(entriesDir, { recursive: true });
    for (const name of names) {
        if (!name.endsWith('.jsonl') && !name.endsWith('.json')) {
            continue;
        }
        await fs.copyFile(path.join(stashDir, name), path.join(entriesDir, name));
        console.log(`Restored frozen entry: ${name}`);
    }
    await fs.rm(stashDir, { recursive: true, force: true });
}

await (mode === 'preserve' ? preserve() : restore());
