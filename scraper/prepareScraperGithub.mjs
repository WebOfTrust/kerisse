import createInput from './modules/createInput.mjs';
import scrape from './modules/scrape.mjs';
import { config as dotenvConfig } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

dotenvConfig();

/**
 * Sitemap filename convention (must match createSitemapGithub.mjs):
 * sitemap.githubcom.<owner>.<repo>-<branch>.<category>.xml
 */
function githubSitemapFilename({ owner, repo, branch, category }) {
    return `sitemap.githubcom.${owner}.${repo}-${branch}.${category}.xml`;
}

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
        destinationFile: path.join(
            process.env.SEARCH_INDEX_ENTRIES_DIR,
            `${owner}-${repoWithBranch}.jsonl`
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
            const config = await createConfig(entry);
            await scrape(config);
        }
    } catch (err) {
        console.error(`Error preparing GitHub scraper from ${configPath}: ${err.message}`);
    }
};
