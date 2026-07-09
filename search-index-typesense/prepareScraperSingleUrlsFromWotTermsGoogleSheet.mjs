/**
 * @file Scrapes data from a list of single URLs defined in a local config file.
 * @module scraper-generic
 */

import fs from 'fs';
import path from 'path';
import scrape from './modules/scrape.mjs';
import extractMainContent from './modules/extractMainContent.mjs';
import { config as configDotEnv } from 'dotenv';
configDotEnv();

const configFilePath = path.join(
    process.env.SEARCH_INDEX_DIR,
    'config/config-scraper-single-urls/genericScraperSingleUrls.json'
);

const entries = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));

/**
 * Scrapes data from all websites in the list and saves it to a JSONL file.
 * @async
 */
async function scrapeAll() {
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry.url) {
            continue;
        }

        const pageTitleSlug = (entry.pageTitle || `entry-${i}`)
            .replace(/\s+/g, '-')
            .replace(/[/\\?%*:|"<>]/g, '-');

        const config = {
            sitemap: {
                "urlset": {
                    "url": [{ "loc": [entry.url] }]
                }
            },
            siteName: entry.siteName,
            source: entry.source,
            category: entry.category,
            author: entry.author,
            destinationFile: process.env.SEARCH_INDEX_DIR + '/search-index-entries/site-' + i + '-' + pageTitleSlug + '.jsonl',
            domQueryForContent: entry.querySelector
        };

        await scrape(config, (page, domQueryForContent, pageUrl) => {
            return customScrape(page, domQueryForContent, pageUrl, entry.type, entry.pageTitle);
        });
    }
}

/**
 * Custom scraping function that extracts the main content of a webpage.
 * @async
 * @param {Object} page - The webpage to scrape.
 * @param {string} domQueryForContent - The DOM query selector for the main content of the webpage.
 * @param {string} pageUrl - The URL of the webpage.
 * @returns {Object} - An object containing the main content, type, and page title of the webpage.
 */
async function customScrape(page, domQueryForContent, pageUrl, type, pageTitle) {
    const mainContent = await extractMainContent(page, domQueryForContent);
    let all = {};
    all.mainContent = mainContent;
    all.type = type;
    all.pageTitle = pageTitle;
    return all;
}

/**
 * Exports a function that scrapes data from a list of websites and saves it to a JSONL file.
 * @async
 */
export default async function () {
    await scrapeAll();
};
