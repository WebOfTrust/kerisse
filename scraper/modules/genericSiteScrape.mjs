/*
  Shared DOM selectors and scrape helpers for generic (non-GitHub-API) sites.
  Used by config/generic-sites.mjs.
*/

import extractMainContent from './extractMainContent.mjs';
import getTextContent from './getTextContent.mjs';
import logger from './logger.mjs';

const CONTENT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'img', 'pre', 'code'];

/** Build a comma-separated selector list scoped under a content root. */
export function within(root) {
    return CONTENT_TAGS.map((tag) => `${root} ${tag}`).join(', ');
}

/**
 * Reusable content selectors keyed by common site templates.
 * Prefer these over one-off strings when the DOM matches.
 */
export const DOM_QUERY = {
    docusaurus: within('article .markdown'),
    gleif: within('article .content'),
    readTheDocs: '.document',
    wordpressEntryContent: within('.entry-content'),
    body: 'body',
};

export const TITLE_QUERY = {
    docusaurus: 'article h1',
    docusaurusFirst: 'article h1:first-of-type',
    gleif: '.content h1',
    readTheDocs: 'section h1',
    wordpressBlockTitle: '.wp-block-post-title',
    h1: 'h1',
};

/**
 * Standard scraper: main content + page title (+ optional creation date).
 * Returns a function suitable for scrape(config, customScrape).
 */
export function makeScraper({ titleSelector, dateSelector } = {}) {
    return async function customScrape(page, domQueryForContent, pageUrl) {
        logger.setLogFile('success.log');
        logger.log('pageUrl: ' + pageUrl);

        const all = {
            mainContent: await extractMainContent(page, domQueryForContent),
            pageTitle: titleSelector
                ? await getTextContent(page, titleSelector)
                : undefined,
        };

        if (dateSelector) {
            all.creationDate = await getTextContent(page, dateSelector);
        }

        return all;
    };
}

/**
 * Docusaurus sites that expose data-type / data-level / breadcrumbs
 * (WOT-terms, keridoc).
 */
export async function scrapeDocusaurusWithMeta(page, domQueryForContent, pageUrl) {
    logger.setLogFile('success.log');
    logger.log('pageUrl: ' + pageUrl);

    const mainContent = await extractMainContent(page, domQueryForContent);

    let type = await page.$eval('article', (element) => {
        switch (element.getAttribute('data-type')) {
            case 'G':
                return 'General';
            case 'S':
                return 'SSI';
            case 'K':
                return 'KERI/ACDC specific';
        }
    });

    const knowledgeLevel = await page.$eval('article', (element) => {
        return element.getAttribute('data-level');
    });

    const pageTitle = await getTextContent(page, TITLE_QUERY.docusaurusFirst);

    return {
        mainContent,
        type,
        knowledgeLevel,
        pageTitle,
    };
}
