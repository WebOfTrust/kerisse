# GitHub repos scrape list

Edit `configGithubRepos.json` to add or update repositories that get a GitHub sitemap and scrape.

Each entry:

- `owner` — GitHub org/user
- `repo` — repository name
- `branch` — branch to index
- `category` — search facet (e.g. `Code`, `Whitepapers`)
- `skipCrawl` — optional; when `true`, keep the existing `search-index-entries/{owner}-{repo}-{branch}.jsonl`, do not regenerate that repo’s sitemap, and do not re-scrape (useful for PDF-heavy repos that rarely change)

Output file for a repo: `search-index-entries/{owner}-{repo}-{branch}.jsonl`.
