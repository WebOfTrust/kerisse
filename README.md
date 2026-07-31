# Kerisse search engine

## Information for developers

- Add custom css in /src/assets/main.scss

- The references in manifest.json point to files in the final distribution: `/dist`
- `/dist` is generated from source via `npm run build`
- Start local webserver: `npm start`, this will start a server on `http://localhost:8080/`

### Static search (Orama)

Search runs entirely in the browser. At build time, scraped JSONL entries are compiled into a gzipped Orama index (`output/search-index.orama.json.gz`, copied to `dist/`).

- Rebuild only the index: `npm run build:search-index`
- Full site build (index + webpack): `npm run build`
- Requires scraped entries in `search-index-entries/` (`.jsonl` and `.json`), **or** a committed `output/search-index.orama.json.gz` fallback for CI

GitHub Actions needs one of these in the repo:

1. **Preferred:** commit `search-index-entries/*.jsonl` after scraping (`.not-split` backups stay gitignored)
2. **Alternative:** commit `output/search-index.orama.json.gz` (CI reuses it when entries are absent)

### Scraping (search index)

Scraper tooling lives in `scraper/` (run via `npm run scrape` or `sh scraper/main.sh`). Sources are declared under `config/`; scraped JSONL goes to `search-index-entries/`.

The scraper uses Puppeteer and needs Chrome/Chromium. On macOS it uses the installed Google Chrome app by default. You can override the browser path with `PUPPETEER_EXECUTABLE_PATH` in `.env`. If no system browser is found, run `node node_modules/puppeteer/install.js` to download a bundled Chromium.

After changing scrape sources, regenerate the overview:

```bash
npm run diagram:scrape
```

See [`config/scrape-sources.md`](config/scrape-sources.md) for the current inventory.

#### What do you want to add?

| I want to… | Edit |
|------------|------|
| Index a **GitHub repository** (source + issues) | [`config/github-repos.json`](config/github-repos.json) |
| Index a **whole website** (sitemap / docs site) | [`config/generic-sites.mjs`](config/generic-sites.mjs) |
| Index a **single page** (blog post, HackMD, …) | [`config/single-urls/urls.json`](config/single-urls/urls.json) |
| **Skip URLs** from a site’s sitemap | [`config/exclude-urls/`](config/exclude-urls/) |
| Supply a **hand-made sitemap** XML | [`config/manual-sitemaps/`](config/manual-sitemaps/) |
| Drop in **ready-made index entries** (no crawl) | [`config/manual-entries/`](config/manual-entries/) |

Shared DOM selectors for generic sites: `scraper/modules/genericSiteScrape.mjs` (`DOM_QUERY`, `makeScraper`).

```
config/
├── scrape-sources.md     ← generated overview
├── github-repos.json     ← GitHub API scrape list
├── generic-sites.mjs     ← websites with sitemaps
├── single-urls/          ← one-off pages (urls.json)
├── exclude-urls/         ← URL skip lists
├── manual-sitemaps/      ← hand-crafted sitemap XML
└── manual-entries/       ← pre-built JSON/JSONL entries
```

#### GitHub repos

Edit `config/github-repos.json`. Each entry:

| Field | Required | Meaning |
|-------|----------|---------|
| `owner` | yes | GitHub org/user |
| `repo` | yes | Repository name |
| `branch` | yes | Branch to index |
| `category` | yes | Search facet (e.g. `Code`, `Whitepapers`) |
| `skipCrawl` | no | When `true`, keep existing JSONL; do not regenerate sitemap or re-scrape |

```json
{ "owner": "WebOfTrust", "repo": "keripy", "branch": "main", "category": "Code" }
```

For each crawlable repo, the sitemap includes all file blob URLs on the branch plus all issues (open and closed; pull requests excluded). Issues are fetched via the GitHub API (title, body, comments).

Output: `search-index-entries/{owner}-{repo}-{branch}.jsonl`.

This indexes **repository source**, not GitHub Pages. For `*.github.io` docs sites, use generic sites below.

#### Websites (generic sites)

1. Open `config/generic-sites.mjs`.
2. Copy a block that matches the site type:
   - Docusaurus / GitHub Pages → `DOM_QUERY.docusaurus`
   - ReadTheDocs → `DOM_QUERY.readTheDocs`
   - WordPress (block theme) → `DOM_QUERY.wordpressEntryContent`
3. Set `sourcePath` (usually `…/sitemap.xml`), `siteName`, `destinationFile`.
4. Add `scrape(configYourSite, scrapeSimple.…)` in the **export at the bottom** — only those calls run.
5. Optional: create `config/exclude-urls/<name>.json` and set `excludeURLs: 'config/exclude-urls/<name>.json'`.
6. `npm run diagram:scrape`

#### Single URLs

One-off pages without a useful site-wide sitemap. Edit `config/single-urls/urls.json`:

| Field | Required | Meaning |
|-------|----------|---------|
| `url` | yes | Page to scrape |
| `querySelector` | yes* | CSS selector(s) for main content |
| `pageTitle` | yes* | Title in the search index and output filename |
| `siteName` | recommended | Display name of the site |
| `source` | recommended | e.g. `Blogposts`, `Hackmd` |
| `author` | optional | |
| `category` | recommended | e.g. `Blogs`, `Tutorials` |
| `type` | optional | Extra tag(s) |

\* Practically required for useful index entries.

```json
{
  "url": "https://example.com/post",
  "siteName": "Example Blog",
  "pageTitle": "My Post Title",
  "source": "Blogposts",
  "author": "Ada",
  "category": "Blogs",
  "querySelector": "article p, article h1, article h2, article li"
}
```

Output: `search-index-entries/site-{index}-{pageTitle-slug}.jsonl`  
(`{index}` is the entry’s position in the JSON array — inserting in the middle renumbers later files.)

#### Exclude URLs

JSON arrays under `config/exclude-urls/` to drop URLs from a site’s discovered list. Wire from `generic-sites.mjs`:

```js
excludeURLs: 'config/exclude-urls/gleif.json',
```

- Path fragments use **substring** matching: `"newsroom"` drops every URL containing `newsroom`.
- Full `http://` / `https://` URLs match **exactly** (trailing slash ignored).

```json
[
    "https://kericonf.com/archive/"
]
```

If the file is missing, the scraper logs an error and continues with no excludes. Current files: `gleif.json`, `wot-terms.json`, `kericonf.json`.

#### Manual sitemaps

Hand-crafted `sitemap.xml` for sources that do not publish one. **Both steps required:**

1. Add the XML under `config/manual-sitemaps/` (copied to `scraper/sitemaps/` at scrape start).
2. Wire a scrape config in `generic-sites.mjs` with `sourceType: 'localXMLsitemap'` and `sourcePath: 'scraper/sitemaps/<your-file>.xml'`, then add `scrape(...)` to the export.

Step 1 alone does not scrape anything. Example: `slack-keri-archive.xml` is a one-time archive. `sitemap-www.gleif.org-pdf.xml` is historical; Gleif PDFs currently come from `manual-entries/gleifPDF.jsonl`.

#### Manual index entries

Pre-built `.json` / `.jsonl` files under `config/manual-entries/` are copied into `search-index-entries/` at scrape start (no crawl). Schema should match other scraper output (`url`, `content`, `pageTitle`, `category`, …). Examples: `handmade.json`, `gleifPDF.jsonl`.
