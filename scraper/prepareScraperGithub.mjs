import createInput from './modules/createInput.mjs';
import scrape from './modules/scrape.mjs';
import { config as dotenvConfig } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import {
    githubDestinationFile,
    githubSitemapFilename,
} from './modules/githubEntryPaths.mjs';

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
        'configGithubRepos.json'
    );

    try {
        const entries = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        for (const entry of entries) {
            if (entry.skipCrawl === true) {
                console.log(
                    `Skipping crawl (skipCrawl): ${entry.owner}/${entry.repo} (${entry.branch})`
                );
                continue;
            }
            const config = await createConfig(entry);
            await scrape(config);
        }
    } catch (err) {
        console.error(`Error preparing GitHub scraper from ${configPath}: ${err.message}`);
    }
};
