import createInput from './modules/createInput.mjs';
import scrape from './modules/scrape.mjs';
import { config as dotenvConfig } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import {
    githubDestinationFile,
    githubSitemapFilename,
} from './modules/githubEntryPaths.mjs';
import { authorizationHeader, getFileContent } from './modules/github-API.mjs';

dotenvConfig();

const createConfig = async ({ owner, repo, branch, category }) => {
    const sitemapDir = path.join(process.env.SEARCH_INDEX_DIR, 'sitemaps/github');
    const filename = githubSitemapFilename({ owner, repo, branch, category });
    // Keep naming consistent with the previous filename-derived scheme:
    // destination was owner-(repo-branch).jsonl
    const repoWithBranch = `${repo}-${branch}`;

    return {
        sitemap: await createInput({
            sourceType: 'localXMLsitemap',
            sourcePath: path.join(sitemapDir, filename),
        }),
        siteName: `${owner} / ${repoWithBranch}`,
        source: `${owner} / ${repoWithBranch}`,
        category: category,
        author: owner,
        destinationFile: githubDestinationFile(
            process.env.SEARCH_INDEX_ENTRIES_DIR,
            { owner, repo, branch }
        ),
    };
};

export default async function () {
    const configPath = path.join(
        process.env.SEARCH_INDEX_CONFIG_DIR,
        'github-repos.json'
    );

    if (!authorizationHeader()) {
        console.error(
            'GITHUB_AUTH_TOKEN is not set. GitHub repo scraping needs a valid PAT ' +
                '(anonymous API is limited to 60 requests/hour and will not finish).',
        );
        return;
    }

    let entries;
    try {
        entries = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    } catch (err) {
        console.error(`Error reading GitHub repos config ${configPath}: ${err.message}`);
        return;
    }

    // Fail fast if the token is rejected before crawling dozens of repos.
    try {
        await getFileContent('WebOfTrust', 'keripy', 'main', 'README.md');
    } catch (err) {
        console.error(
            `GitHub auth check failed — aborting GitHub scrape.\n${err.message}`,
        );
        return;
    }

    for (const entry of entries) {
        if (entry.skipCrawl === true) {
            console.log(
                `Skipping crawl (skipCrawl): ${entry.owner}/${entry.repo} (${entry.branch})`
            );
            continue;
        }

        try {
            const config = await createConfig(entry);
            await scrape(config);
        } catch (err) {
            // Keep scraping other repos when one sitemap/config fails
            // (e.g. invalid XML from unescaped characters in file paths).
            console.error(
                `Error scraping GitHub repo ${entry.owner}/${entry.repo} (${entry.branch}): ${err.message}`
            );
        }
    }
};
