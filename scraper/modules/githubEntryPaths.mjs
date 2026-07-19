/**
 * Shared naming for GitHub scrape destinations and sitemaps.
 * Must stay in sync with createSitemapGithub.mjs / prepareScraperGithub.mjs.
 */

import path from 'path';

export function githubDestinationBasename({ owner, repo, branch }) {
    return `${owner}-${repo}-${branch}.jsonl`;
}

export function githubDestinationFile(entriesDir, entry) {
    return path.join(entriesDir, githubDestinationBasename(entry));
}

export function githubSitemapFilename({ owner, repo, branch, category }) {
    return `sitemap.githubcom.${owner}.${repo}-${branch}.${category}.xml`;
}
