/*
  Author: Kor Dwarshuis
  Created: 2023-08-12
  Updated: 2026-07-30
  Description: GitHub API helpers for repo file content and issues.
  Example usage

  getFileContent('WebOfTrust', 'keripy', 'development', 'src/keri/app/connecting.py')
     .then(content => {
         console.log(content);
     })
     .catch(error => {
         console.error(`Failed to fetch file content: ${error.message}`);
     });
*/


import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const GITHUB_AUTH_TOKEN = process.env.GITHUB_AUTH_TOKEN;

function authorizationHeader() {
    if (!GITHUB_AUTH_TOKEN) {
        return undefined;
    }
    // Env may already include a scheme (token / Bearer), or be a raw PAT.
    if (/^(token|Bearer)\s+/i.test(GITHUB_AUTH_TOKEN)) {
        return GITHUB_AUTH_TOKEN;
    }
    return `token ${GITHUB_AUTH_TOKEN}`;
}

async function fetchGithubJson(url) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'KERISSE-Web-of-Trust-Scraper',
    };
    const authorization = authorizationHeader();
    if (authorization) {
        headers['Authorization'] = authorization;
    }

    let response = await fetch(url, { headers });

    // Invalid/expired tokens 401 even on public repos; retry anonymously.
    if (response.status === 401 && authorization) {
        delete headers['Authorization'];
        response = await fetch(url, { headers });
    }

    if (response.status !== 200) {
        throw new Error(`GitHub API responded with status: ${response.status} for ${url}`);
    }

    return response.json();
}

export async function getFileContent(owner, repo, branch, path) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const headers = {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'KERISSE-Web-of-Trust-Scraper',
    };
    const authorization = authorizationHeader();
    if (authorization) {
        headers['Authorization'] = authorization;
    }

    const response = await fetch(url, { headers });

    if (response.status !== 200) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    return await response.text();
}

/**
 * List issue HTML URLs for a repo (open + closed). Pull requests are excluded.
 */
export async function listIssueUrls(owner, repo) {
    const urls = [];
    let page = 1;

    while (true) {
        const url =
            `https://api.github.com/repos/${owner}/${repo}/issues` +
            `?state=all&per_page=100&page=${page}`;
        const items = await fetchGithubJson(url);

        if (!Array.isArray(items) || items.length === 0) {
            break;
        }

        for (const item of items) {
            // The issues endpoint also returns pull requests.
            if (item.pull_request) {
                continue;
            }
            if (item.html_url) {
                urls.push(item.html_url);
            }
        }

        if (items.length < 100) {
            break;
        }
        page += 1;
    }

    return urls;
}

/**
 * Fetch one issue (title + body + comments) as searchable plain text.
 */
export async function getIssueContent(owner, repo, issueNumber) {
    const issueUrl =
        `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    const issue = await fetchGithubJson(issueUrl);

    const commentParts = [];
    let page = 1;

    while (true) {
        const commentsUrl =
            `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments` +
            `?per_page=100&page=${page}`;
        const comments = await fetchGithubJson(commentsUrl);

        if (!Array.isArray(comments) || comments.length === 0) {
            break;
        }

        for (const comment of comments) {
            const author = comment.user?.login || 'unknown';
            const body = (comment.body || '').trim();
            if (body) {
                commentParts.push(`Comment by ${author}:\n${body}`);
            }
        }

        if (comments.length < 100) {
            break;
        }
        page += 1;
    }

    const title = issue.title || `Issue #${issueNumber}`;
    const state = issue.state || '';
    const author = issue.user?.login || 'unknown';
    const body = (issue.body || '').trim();

    const sections = [
        title,
        `State: ${state}`,
        `Author: ${author}`,
        body,
        ...commentParts,
    ].filter(Boolean);

    return {
        title,
        content: sections.join('\n\n'),
    };
}
