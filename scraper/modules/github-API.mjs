/*
  Author: Kor Dwarshuis
  Created: 2023-08-12
  Updated: 2026-07-31
  Description: GitHub API helpers for repo file content and issues.
*/

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const GITHUB_AUTH_TOKEN = process.env.GITHUB_AUTH_TOKEN;

/**
 * GitHub expects `Bearer <token>` (or legacy `token <token>`).
 * Raw PATs in Authorization are rejected → anonymous 60 req/hr limits.
 */
export function authorizationHeader() {
    if (!GITHUB_AUTH_TOKEN) {
        return undefined;
    }
    const trimmed = GITHUB_AUTH_TOKEN.trim();
    if (/^(token|Bearer)\s+/i.test(trimmed)) {
        return trimmed;
    }
    return `Bearer ${trimmed}`;
}

function githubHeaders({ accept = 'application/vnd.github.v3+json', authorize = true } = {}) {
    const headers = {
        Accept: accept,
        'User-Agent': 'KERISSE-Web-of-Trust-Scraper',
    };
    if (authorize) {
        const authorization = authorizationHeader();
        if (authorization) {
            headers.Authorization = authorization;
        }
    }
    return headers;
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with auth. If a token is configured but GitHub returns 401, fail loudly
 * (do not silently fall back to anonymous 60 req/hr — that looks like a successful
 * scrape that writes nothing).
 */
async function fetchGithub(url, { accept, authorize = true } = {}) {
    const hasToken = Boolean(authorizationHeader());
    let response = await fetch(url, {
        headers: githubHeaders({ accept, authorize: authorize && hasToken }),
    });

    if (response.status === 401 && authorize && hasToken) {
        throw new Error(
            'GitHub API 401 Bad credentials — check GITHUB_AUTH_TOKEN in .env ' +
                '(use a valid classic or fine-grained PAT; header is sent as Bearer <token>). ' +
                `URL: ${url}`,
        );
    }

    if (response.status === 403) {
        const retryAfter = Number(response.headers.get('retry-after')) || 0;
        const remaining = response.headers.get('x-ratelimit-remaining');
        if (remaining === '0' || retryAfter > 0) {
            await sleep(Math.min(Math.max(retryAfter, 2), 60) * 1000);
            response = await fetch(url, {
                headers: githubHeaders({ accept, authorize: authorize && hasToken }),
            });
        }
    }

    return response;
}

async function fetchGithubJson(url) {
    const response = await fetchGithub(url);

    if (response.status !== 200) {
        throw new Error(`GitHub API responded with status: ${response.status} for ${url}`);
    }

    return response.json();
}

/**
 * Encode a repo-relative path for the Contents API (decode first if already %-encoded).
 */
function encodeContentsPath(filePath) {
    const decoded = filePath
        .split('/')
        .map((segment) => {
            try {
                return decodeURIComponent(segment);
            } catch {
                return segment;
            }
        })
        .join('/');

    return decoded
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
}

export async function getFileContent(owner, repo, branch, filePath) {
    const encodedPath = encodeContentsPath(filePath);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const response = await fetchGithub(url, {
        accept: 'application/vnd.github.v3.raw',
    });

    if (response.status !== 200) {
        throw new Error(`GitHub API responded with status: ${response.status} for ${url}`);
    }

    return response.text();
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
