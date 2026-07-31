# Scrape config

Everything the scraper indexes is declared here. Output lands in `search-index-entries/`.

After changing sources, regenerate the overview diagram:

```bash
npm run diagram:scrape
```

See [scrape-sources.md](scrape-sources.md) for the current inventory.

Run a full scrape with `npm run scrape` (or `sh scraper/main.sh`).

---

## What do you want to add?

| I want to… | Edit | Details |
|------------|------|---------|
| Index a **GitHub repository** (source + issues) | [github-repos.json](github-repos.json) | [github-repos.md](github-repos.md) |
| Index a **whole website** (sitemap / docs site) | [generic-sites.mjs](generic-sites.mjs) | section below |
| Index a **single page** (blog post, HackMD, …) | [single-urls/urls.json](single-urls/urls.json) | [single-urls/README.md](single-urls/README.md) |
| **Skip URLs** from a site’s sitemap | [exclude-urls/](exclude-urls/) | [exclude-urls/README.md](exclude-urls/README.md) |
| Supply a **hand-made sitemap** XML | [manual-sitemaps/](manual-sitemaps/) | [manual-sitemaps/README.md](manual-sitemaps/README.md) |
| Drop in **ready-made index entries** (no crawl) | [manual-entries/](manual-entries/) | [manual-entries/README.md](manual-entries/README.md) |

Shared DOM selectors for generic sites live in `scraper/modules/genericSiteScrape.mjs` (`DOM_QUERY`, `makeScraper`).

---

## Add a website (generic sites)

1. Open `generic-sites.mjs`.
2. Copy a block that matches the site type:
   - Docusaurus / GitHub Pages → `DOM_QUERY.docusaurus`
   - ReadTheDocs → `DOM_QUERY.readTheDocs`
   - WordPress (block theme) → `DOM_QUERY.wordpressEntryContent`
3. Set `sourcePath` (usually `…/sitemap.xml`), `siteName`, `destinationFile`.
4. Add `scrape(configYourSite, scrapeSimple.…)` in the **export at the bottom** — only those calls run.
5. Optional: create `exclude-urls/<name>.json` and set `excludeURLs: 'config/exclude-urls/<name>.json'`.
6. `npm run diagram:scrape`

**GitHub Pages** sites belong here (as websites), not in `github-repos.json`. That file is for repo source trees via the GitHub API.

---

## Folder layout

```
config/
├── README.md                 ← you are here
├── scrape-sources.md         ← generated overview
├── github-repos.json         ← GitHub API scrape list
├── github-repos.md
├── generic-sites.mjs         ← websites with sitemaps
├── single-urls/              ← one-off pages
├── exclude-urls/             ← URL skip lists
├── manual-sitemaps/          ← hand-crafted sitemap XML
└── manual-entries/           ← pre-built JSON/JSONL entries
```
