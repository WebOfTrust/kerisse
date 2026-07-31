# GitHub repos

Edit [`github-repos.json`](github-repos.json) to add or update repositories that get a GitHub sitemap and scrape.

Each entry:

| Field | Required | Meaning |
|-------|----------|---------|
| `owner` | yes | GitHub org/user |
| `repo` | yes | Repository name |
| `branch` | yes | Branch to index |
| `category` | yes | Search facet (e.g. `Code`, `Whitepapers`) |
| `skipCrawl` | no | When `true`, keep existing JSONL; do not regenerate sitemap or re-scrape |

Example:

```json
{ "owner": "WebOfTrust", "repo": "keripy", "branch": "main", "category": "Code" }
```

For each crawlable repo, the sitemap includes:

- All file blob URLs on the configured branch
- All issues (open and closed); pull requests are excluded

Issue pages are fetched via the GitHub API (title, body, and comments).

Output: `search-index-entries/{owner}-{repo}-{branch}.jsonl`.

This indexes **repository source**, not GitHub Pages sites. For `*.github.io` docs sites, use [`generic-sites.mjs`](generic-sites.mjs) instead — see [README.md](README.md).
