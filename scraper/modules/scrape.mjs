/*
  Author: Kor Dwarshuis
  Created: 2023-03-16
  Updated: -
  Description: Scrape websites using puppeteer.
*/

import launchBrowser from './launchBrowser.mjs';
import createOutput from './createOutput.mjs';
import appendToFile from './appendToFile.mjs';
import fs from 'fs';
import logger from './logger.mjs';
import { githubPDF } from './github-pdf.mjs';
import { processPDF as generalPDF } from './general-pdf.mjs';
import {
    getFileContent as githubContent,
    getIssueContent as githubIssueContent,
} from './github-API.mjs';

export default async function scrape(config, customScrape) {
    const browser = await launchBrowser();// for production
    // const browser = await launchBrowser({ headless: false });// for testing
    const page = await browser.newPage();
    // Set a custom user agent header
    await page.setUserAgent('KERISSE-Web-of-Trust-Scraper');
    let scraped = {};

    function getFileExtension(url) {
        try {
            const parsedUrl = new URL(url);

            // Split the pathname into segments and get the last segment
            const segments = parsedUrl.pathname.split('/');
            const lastSegment = segments[segments.length - 1];

            // Use a regular expression to extract the file extension
            const match = /\.([a-z0-9]+)$/i.exec(lastSegment);
            if (match) {
                return match[1]; // Return the file extension without the dot
            } else {
                return "Web page"; // No file extension found, so we'll assume it's a web page
            }

        } catch (err) {
            logger.setLogFile('error.log');
            logger.log(err.message);

            return null; // Invalid URL
        }
    }

    function extractGithubIssueParts(url) {
        const githubIssueRegex =
            /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)\/?$/;
        const match = url.match(githubIssueRegex);

        if (!match) {
            return null;
        }

        return {
            owner: match[1],
            repo: match[2],
            issueNumber: match[3],
        };
    }

    function extractGithubParts(url) {
        // Check if the URL is a valid GitHub blob URL
        const githubRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
        const match = url.match(githubRegex);

        if (!match) {
            logger.setLogFile('error.log');
            logger.log('Invalid GitHub URL');

            throw new Error('Invalid GitHub URL');
        }

        return {
            owner: match[1],
            repo: match[2],
            branch: match[3],
            // Sitemap URLs may be percent-encoded; API helper re-encodes safely.
            path: match[4],
        };
    }

    if (config && config.sitemap && config.sitemap.urlset && Array.isArray(config.sitemap.urlset.url)) {
        // Iterate over each URL in the sitemap and create an array of entries for each URL
        // console.log('Indexing pages...');
        for (const url of config.sitemap.urlset.url) {// for production
            // for (const url of config.sitemap.urlset.url.slice(150, 163)) {// for testing
            const pageUrl = url.loc[0];
            const pageExtension = getFileExtension(pageUrl);
            const parsedUrl = new URL(pageUrl);
            logger.setLogFile('success.log');
            logger.log(`Indexing ${pageUrl}`);

            try {
                // Navigate to the page URL and process the page content using the specified function

                // PDF:
                if (pageUrl.toLowerCase().endsWith('.pdf')) {
                    // PDF + github.com
                    if (parsedUrl.hostname.includes('github.com')) {
                        await page.goto(pageUrl);
                        scraped = await githubPDF(page, pageUrl);
                    }
                    // PDF + not github.com
                    else {
                        scraped = await generalPDF(pageUrl);
                    }

                }

                // Not PDF:
                else {
                    // Not PDF + github.com (not wiki)
                    if (parsedUrl.hostname.includes('github.com') && !parsedUrl.pathname.includes('/wiki/')) {
                        const issueParts = extractGithubIssueParts(url.loc[0]);

                        if (issueParts) {
                            const issue = await githubIssueContent(
                                issueParts.owner,
                                issueParts.repo,
                                issueParts.issueNumber
                            );
                            scraped.mainContent = [{
                                content: issue.content,
                                contentLength: issue.content.length,
                                tag: 'issue',
                            }];
                            scraped.pageTitle = issue.title;
                        } else {
                            const parts = extractGithubParts(url.loc[0]);
                            let content;
                            try {
                                content = await githubContent(
                                    parts.owner,
                                    parts.repo,
                                    parts.branch,
                                    parts.path,
                                );
                            } catch (error) {
                                logger.setLogFile('error.log');
                                logger.log(
                                    `Failed to fetch file content for ${pageUrl}: ${error.message}`,
                                );
                                continue;
                            }

                            if (typeof content !== 'string' || content.length === 0) {
                                logger.setLogFile('error.log');
                                logger.log(`Empty content for ${pageUrl}`);
                                continue;
                            }

                            scraped.mainContent = [{
                                content,
                                contentLength: content.length,
                                tag: 'textarea',
                            }];
                            scraped.pageTitle = parts.path;
                        }
                    }

                    // Not PDF + not github.com
                    else {
                        await page.goto(pageUrl);
                        scraped = await customScrape(page, config.domQueryForContent, pageUrl);//TODO: find out if pageUrl is needed
                    }
                }

                /* 
                  -if an entry is not passed, createOutput({…}) creates a default entry.
                  -everything that is assigned via scraped, like scraped,knowledgeLevel, can be added via customScrape. But mediaType for example cannot be assigned via the custom Scraper but get its data via a local var.
                */

                if (!Array.isArray(scraped.mainContent) || scraped.mainContent.length === 0) {
                    logger.setLogFile('error.log');
                    logger.log(`No content extracted from ${pageUrl} (selector matched 0 elements)`);
                    continue;
                }

                let strOutput = createOutput({
                    siteName: config.siteName,
                    source: config.source,
                    author: config.author,
                    category: config.category,
                    pageUrl: pageUrl,
                    mainContent: scraped.mainContent,
                    knowledgeLevel: scraped.knowledgeLevel,
                    type: scraped.type,
                    creationDate: scraped.creationDate,
                    pageTitle: scraped.pageTitle,
                    firstHeadingBeforeElements: scraped.firstHeadingBeforeElements,
                    mediaType: pageExtension
                });

                if (!strOutput.trim()) {
                    logger.setLogFile('error.log');
                    logger.log(`No index entries created for ${pageUrl}`);
                    continue;
                }

                appendToFile(strOutput, config.destinationFile);
                // Log the page URL to a log file and to a markdown file
                fs.appendFileSync('scraper/logs/scraped.log', `Scraped: ${pageUrl}\n`);
                fs.appendFileSync(process.env.INDEX_OVERVIEW_FILE, `${pageUrl}\n\n`);

            } catch (err) {
                logger.setLogFile('error.log');
                logger.log(`Error processing page ${pageUrl}: ${err}`);
            }
        }
    } else {
        logger.setLogFile('error.log');
        logger.log('config.sitemap.urlset.url is not defined or not an array');
    }

    // await new Promise(resolve => setTimeout(resolve, 1000000000)); // For testing: Delay the script termination

    await browser.close();
}
