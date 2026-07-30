import createInput from '../scraper/modules/createInput.mjs';
import scrape from '../scraper/modules/scrape.mjs';
import {
    DOM_QUERY,
    TITLE_QUERY,
    makeScraper,
    scrapeDocusaurusWithMeta,
} from '../scraper/modules/genericSiteScrape.mjs';

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
        excludeURLs: 'config/config-sitemaps-exlude-urls/gleifExcludeUrls.json',
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
        excludeURLs: 'config/config-sitemaps-exlude-urls/wotTermsExcludeUrls.json',
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
        excludeURLs: 'config/config-sitemaps-exlude-urls/wotTermsExcludeUrls.json',
    }),
    siteName: 'KERIDoc',
    source: 'KERIDoc',
    category: 'KERIDoc',
    author: 'Henk van Cann',
    destinationFile: 'search-index-entries/keridoc.jsonl',
    domQueryForContent: DOM_QUERY.docusaurus,
};

/*
 * Slack Keri Archive (static HTML)
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
    // WordPress serves a sitemap index at /sitemap.xml; use the pages urlset directly
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
    // WordPress serves a sitemap index at /sitemap.xml; use the pages urlset directly
    sitemap: await createInput({
        sourceType: 'remoteXMLsitemap',
        sourcePath: 'https://kericonf.com/wp-sitemap-posts-page-1.xml',
        // Parent/nav shells with title only (no .entry-content body)
        excludeURLs: 'config/config-sitemaps-exlude-urls/kericonfExcludeUrls.json',
    }),
    siteName: 'KERI Conference',
    source: 'KERI Conference',
    category: 'Blogs',
    author: '',
    destinationFile: 'search-index-entries/kericonf.jsonl',
    domQueryForContent: DOM_QUERY.wordpressEntryContent,
};

export default async function () {
    scrape(configESSIFlabs, scrapeSimple.docusaurus);
    scrape(configGleif, scrapeSimple.gleif);
    scrape(configReadTheDocsKeripy, scrapeSimple.readTheDocs);
    scrape(configReadTheDocsKeria, scrapeSimple.readTheDocs);
    scrape(configReadTheDocsSignifypy, scrapeSimple.readTheDocs);
    scrape(configWOTterms, scrapeDocusaurusWithMeta);
    scrape(configKeridoc, scrapeDocusaurusWithMeta);
    scrape(configSlackKeriArchive, scrapeSimple.body);
    scrape(configKeriFoundation, scrapeSimple.wordpress);
    scrape(configKericonf, scrapeSimple.wordpress);
}
