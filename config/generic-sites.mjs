import createInput from '../scraper/modules/createInput.mjs';
import scrape from '../scraper/modules/scrape.mjs';
import {
    DOM_QUERY,
    TITLE_QUERY,
    makeScraper,
    scrapeDocusaurusWithMeta,
} from '../scraper/modules/genericSiteScrape.mjs';

/**
 * Generic websites (not GitHub API repos).
 *
 * How to add a site:
 * 1. Copy a block below that matches the template (Docusaurus, WordPress, ReadTheDocs, …).
 * 2. Set sitemap sourcePath, siteName, destinationFile, and DOM_QUERY.*.
 * 3. Append [configX, scrapeSimple.*] to the sites array — only those entries run.
 * 4. Optional: excludeURLs → config/exclude-urls/<name>.json
 * 5. npm run diagram:scrape
 *
 * See README.md (Scraping section) for all scrape channels.
 */

const scrapeSimple = {
    docusaurus: makeScraper({ titleSelector: TITLE_QUERY.docusaurus }),
    gleif: makeScraper({
        titleSelector: TITLE_QUERY.gleif,
        dateSelector: '.meta li',
    }),
    readTheDocs: makeScraper({ titleSelector: TITLE_QUERY.readTheDocs }),
    wordpress: makeScraper({ titleSelector: TITLE_QUERY.wordpressBlockTitle }),
    body: makeScraper({ titleSelector: TITLE_QUERY.h1 }),
};

/*
 * eSSIF-Lab (Docusaurus / GitHub Pages)
 */
const configESSIFlabs = {
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://essif-lab.github.io/framework/sitemap.xml',
    }),
    siteName: 'eSSIF-Lab',
    source: 'eSSIF-Lab',
    category: 'Blogs',
    author: '',
    destinationFile: 'search-index-entries/eSSIF-Lab.jsonl',
    domQueryForContent: DOM_QUERY.docusaurus,
};

/*
 * Gleif
 */
const configGleif = {
    sitemap: await createInput({
        sourceType: 'querySelector',
        sourcePath: 'https://www.gleif.org/en/meta/sitemap',
        queryString: '.content ul li a', // must be an a element
        excludeURLs: 'config/exclude-urls/gleif.json',
    }),
    siteName: 'Gleif website',
    source: 'Gleif website',
    category: 'Blogs',
    author: '',
    destinationFile: 'search-index-entries/gleif.jsonl',
    domQueryForContent: DOM_QUERY.gleif,
};

/*
 * ReadTheDocs — keripy / keria / signifypy
 */
const configReadTheDocsKeripy = {
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://keripy.readthedocs.io/sitemap.xml',
    }),
    siteName: 'Python Implementation of the KERI Core Libraries',
    source: 'Python Implementation of the KERI Core Libraries',
    category: 'Blogs',
    author: 'Dr. Samuel Smith and contributors',
    destinationFile: 'search-index-entries/readthedocs.keripy.io.jsonl',
    domQueryForContent: DOM_QUERY.readTheDocs,
};

const configReadTheDocsKeria = {
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://keria.readthedocs.io/sitemap.xml',
    }),
    siteName: 'Python Implementation of the KERI Core Libraries',
    source: 'Python Implementation of the KERI Core Libraries',
    category: 'Blogs',
    author: 'Dr. Samuel Smith and contributors',
    destinationFile: 'search-index-entries/readthedocs.keria.io.jsonl',
    domQueryForContent: DOM_QUERY.readTheDocs,
};

const configReadTheDocsSignifypy = {
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://signifypy.readthedocs.io/sitemap.xml',
    }),
    siteName: 'Python Implementation of the KERI Core Libraries',
    source: 'Python Implementation of the KERI Core Libraries',
    category: 'Blogs',
    author: 'Dr. Samuel Smith and contributors',
    destinationFile: 'search-index-entries/readthedocs.signifypy.io.jsonl',
    domQueryForContent: DOM_QUERY.readTheDocs,
};

/*
 * WOT-terms / keridoc (Docusaurus with type / level / breadcrumbs)
 */
const configWOTterms = {
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://weboftrust.github.io/WOT-terms/sitemap.xml',
        excludeURLs: 'config/exclude-urls/wot-terms.json',
    }),
    siteName: 'KERI Suite Glossary',
    source: 'KERI Suite Glossary',
    category: 'KERI Suite Glossary',
    author: 'Henk van Cann',
    destinationFile: 'search-index-entries/WOT-terms.jsonl',
    domQueryForContent: DOM_QUERY.docusaurus,
};

const configKeridoc = {
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://weboftrust.github.io/keridoc/sitemap.xml',
        excludeURLs: 'config/exclude-urls/wot-terms.json',
    }),
    siteName: 'KERIDoc',
    source: 'KERIDoc',
    category: 'KERIDoc',
    author: 'Henk van Cann',
    destinationFile: 'search-index-entries/keridoc.jsonl',
    domQueryForContent: DOM_QUERY.docusaurus,
};

/*
 * Slack Keri Archive (static HTML + manual sitemap)
 * Sitemap file lives in config/manual-sitemaps/ and is copied to scraper/sitemaps/.
 */
const configSlackKeriArchive = {
    sitemap: await createInput({
        sourceType: 'localXMLsitemap',
        sourcePath: 'scraper/sitemaps/slack-keri-archive.xml',
    }),
    siteName: 'Slack Keri Archive',
    source: 'Slack Keri Archive',
    category: 'Slack Keri Archive',
    author: 'Slack Keri Members',
    destinationFile: 'search-index-entries/slack-keri-archive.jsonl',
    domQueryForContent: DOM_QUERY.body,
};

/*
 * WordPress block themes
 */
const configKeriFoundation = {
    // WordPress sitemap index is /sitemap.xml; use the pages urlset directly
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://keri.foundation/wp-sitemap-posts-page-1.xml',
    }),
    siteName: 'KERI Foundation',
    source: 'KERI Foundation',
    category: 'Blogs',
    author: '',
    destinationFile: 'search-index-entries/keri-foundation.jsonl',
    domQueryForContent: DOM_QUERY.wordpressEntryContent,
};

const configKericonf = {
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://kericonf.com/wp-sitemap-posts-page-1.xml',
        // Parent/nav shells with title only (no .entry-content body)
        excludeURLs: 'config/exclude-urls/kericonf.json',
    }),
    siteName: 'KERI Conference',
    source: 'KERI Conference',
    category: 'Blogs',
    author: '',
    destinationFile: 'search-index-entries/kericonf.jsonl',
    domQueryForContent: DOM_QUERY.wordpressEntryContent,
};

/** Active scrapes — add [config, scraper] here when you add a site above. */
const sites = [
    [configESSIFlabs, scrapeSimple.docusaurus],
    [configGleif, scrapeSimple.gleif],
    [configReadTheDocsKeripy, scrapeSimple.readTheDocs],
    [configReadTheDocsKeria, scrapeSimple.readTheDocs],
    [configReadTheDocsSignifypy, scrapeSimple.readTheDocs],
    [configWOTterms, scrapeDocusaurusWithMeta],
    [configKeridoc, scrapeDocusaurusWithMeta],
    [configSlackKeriArchive, scrapeSimple.body],
    [configKeriFoundation, scrapeSimple.wordpress],
    [configKericonf, scrapeSimple.wordpress],
];

export default async function () {
    await Promise.all(sites.map(([config, scrapeFn]) => scrape(config, scrapeFn)));
}
