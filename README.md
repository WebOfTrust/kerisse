# Kerisse search engine

## Information for developers

- Add custom css in /src/assets/main.scss

- The references in manifest.json point to files in the final distribution: `/dist`
- `/dist` is generated from source via `npm run build`
- Start local webserver: `npm start`, this will start a server on `http://localhost:8080/`

### Static search (Orama, sharded per category)

Search runs entirely in the browser. At build time, scraped JSONL entries are compiled into **one gzipped MessagePack Orama index per category** plus a manifest:

```
output/search-index/
  manifest.json                 # shard list: category, slug, file, doc count, size
  repository.orama.msgpack.gz
  keridoc.orama.msgpack.gz
  blogs.orama.msgpack.gz
  ...
```

On the search page the user first picks which categories to search in (choice is remembered in localStorage); only those shards are downloaded and loaded, which keeps both startup and query time fast.

- Rebuild only the index: `npm run build:search-index`
- Full local site build (index + webpack): `npm run build`
- Requires scraped entries in `search-index-entries/`, **or** already-built shards in `output/search-index/`
- GitHub Actions runs **webpack only** and sets `SEARCH_INDEX_BASE_URL` so the live site loads shards from `https://keri.foundation/kerisse/search-index/` (override with the repo Actions variable of the same name). The Repository shard is over GitHub’s 100 MB file limit, so the index cannot be deployed on GitHub Pages.

### Dataset & index hosting (kept out of git)

`search-index-entries/` (the full scraped corpus, ~350 MB) and `output/search-index/` are **gitignored** — they are too large for the repo. They live on an external host (e.g. `https://keri.foundation` on Hostinger) instead:

- **Upload** shards + full dataset: `npm run upload:search-data` (rsync over SSH; set `KERISSE_SSH_HOST`, `KERISSE_SSH_PORT`, `KERISSE_SSH_USER`, `KERISSE_REMOTE_DIR` in `.env`). The full JSONL corpus is uploaded to `…/dataset/` so it stays available as a whole (e.g. for AI training), and the shards to `…/search-index/`.
- **Download** the corpus on another machine (no re-scrape needed): `npm run download:search-data` (set `KERISSE_DATASET_URL` in `.env`).
- **CORS**: the search UI runs on a different domain than the index files, so the remote `search-index/` directory needs the `.htaccess` from [`hosting/htaccess-search-index`](hosting/htaccess-search-index) (the upload script installs it automatically). No PHP required — everything is static files.
- **Point the frontend at the host**: set `searchIndexBaseUrl` in [`paths.js`](paths.js), e.g. `https://keri.foundation/kerisse/search-index/`. The default `search-index/` serves the shards from the same origin (webpack copies `output/search-index/` into `dist/`), which is what `npm start` uses locally.

GitHub Actions does not scrape or build the index. After you upload shards (`npm run upload:search-data`), search on GitHub Pages reads them from `SEARCH_INDEX_BASE_URL`. Local `npm start` still uses `search-index/` on the same origin.

### Scraping (search index)

Run a full scrape with `npm run scrape` (or `sh scraper/main.sh`). Output goes to `search-index-entries/`.

Browser: Puppeteer needs Chrome/Chromium. On macOS it uses Google Chrome by default; override with `PUPPETEER_EXECUTABLE_PATH` in `.env`, or run `node node_modules/puppeteer/install.js`.

Current inventory (generated): [`config/scrape-sources.md`](config/scrape-sources.md) — refresh with `npm run diagram:scrape`.

---

#### GitHub API token (required for repo indexing)

Indexing entries in [`config/github-repos.json`](config/github-repos.json) uses the GitHub API (file trees, file contents, issues). Without a valid token, GitHub’s anonymous limit is **60 requests/hour**, so the crawl will fail or write almost nothing — and the **Repository** category will not appear in search.

1. Copy [`.env.example`](.env.example) to `.env` if you do not already have one.
2. Create a **classic** personal access token:  
   GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token**.
3. Scopes for the public repos in this project:

| Scope | Enough? |
|-------|---------|
| **`public_repo`** | Yes — preferred (least privilege) |
| **`repo`** (full) | Also works, but includes private-repo access you usually do not need |

You do **not** need workflow, gist, admin, or other scopes.

4. Put the **raw** token in `.env` (no `Bearer` / `token` prefix — the scraper adds `Bearer` automatically):

```bash
GITHUB_AUTH_TOKEN=ghp_yourNewTokenHere
GITHUB_ISSUE_AUTH_TOKEN=ghp_yourNewTokenHere
```

| Variable | Used by scraper? | Notes |
|----------|------------------|--------|
| `GITHUB_AUTH_TOKEN` | **Yes** — required | Reads repo files and issues for the search index |
| `GITHUB_ISSUE_AUTH_TOKEN` | No (unused today) | Safe to set to the **same** value for convenience, or leave empty |

5. Re-run scrape, then rebuild the index:

```bash
npm run scrape
npm run build:search-index
```

You should see files like `search-index-entries/WebOfTrust-keripy-main.jsonl` and a **Repository** option under the Category facet.

If the token is invalid, the scraper aborts GitHub crawling early with a clear `401 Bad credentials` message.

---

#### Pick your goal

| I want to… | Sitemap? | Where to edit |
|------------|----------|---------------|
| [Set up a GitHub API token](#github-api-token-required-for-repo-indexing) | — | `.env` |
| [Index a GitHub repository](#i-want-to-index-a-github-repository) | **Automatic** — built during scrape | `config/github-repos.json` |
| [Index a website that already has `sitemap.xml`](#i-want-to-index-a-website-that-already-has-sitemapxml) | **Use theirs** — point at the URL | `config/generic-sites.mjs` |
| [Index a website with no sitemap](#i-want-to-index-a-website-with-no-sitemap) | **You create one** | `config/manual-sitemaps/` **and** `config/generic-sites.mjs` |
| [Index one page only](#i-want-to-index-one-page-only) | None | `config/single-urls/urls.json` |
| [Skip some URLs from a site](#i-want-to-skip-some-urls-from-a-site) | (uses that site’s sitemap) | `config/exclude-urls/` **and** `config/generic-sites.mjs` |
| [Add content without scraping](#i-want-to-add-content-without-scraping) | None | `config/manual-entries/` |

---

#### I want to… index a GitHub repository

Indexes **source files + issues** via the GitHub API. You do **not** add a sitemap file — scrape generates it.

**Prerequisite:** a valid [`GITHUB_AUTH_TOKEN`](#github-api-token-required-for-repo-indexing) in `.env`.

1. Open [`config/github-repos.json`](config/github-repos.json).
2. Append an object:

```json
{ "owner": "WebOfTrust", "repo": "keripy", "branch": "main", "category": "Repository" }
```

| Field | Required | Meaning |
|-------|----------|---------|
| `owner` | yes | GitHub org/user |
| `repo` | yes | Repository name |
| `branch` | yes | Branch to index |
| `category` | yes | Search facet (e.g. `Repository`) |
| `skipCrawl` | no | `true` = keep existing JSONL; skip sitemap + scrape |

3. Run `npm run scrape` (builds the sitemap, then scrapes).
4. Optional: `npm run diagram:scrape`.

Output: `search-index-entries/{owner}-{repo}-{branch}.jsonl`.

**Not for GitHub Pages** (`*.github.io`). Those are normal websites — use the website recipes below.

---

#### I want to… index a website that already has `sitemap.xml`

Typical for Docusaurus, ReadTheDocs, many docs sites. You **point at their sitemap** — you do not create one.

1. Confirm the site publishes a sitemap (try `https://example.com/sitemap.xml`).
2. Open [`config/generic-sites.mjs`](config/generic-sites.mjs).
3. Copy a similar block (e.g. eSSIF-Lab for Docusaurus, keripy for ReadTheDocs, keri.foundation for WordPress).
4. Set at least:
   - `sourceType: 'remoteXMLsitemap'`
   - `sourcePath: 'https://…/sitemap.xml'`
   - `siteName`, `source`, `category`, `destinationFile`
   - `domQueryForContent: DOM_QUERY.docusaurus` (or `.readTheDocs` / `.wordpressEntryContent`)
5. Append to the **`sites` array**:

```js
[configYourSite, scrapeSimple.docusaurus], // or readTheDocs / wordpress
```

Only entries in that array actually run.

6. Optional: skip unwanted URLs — see [Skip some URLs](#i-want-to-skip-some-urls-from-a-site).
7. `npm run diagram:scrape`, then `npm run scrape`.

---

#### I want to… index a website with no sitemap

You must **create a sitemap and wire it** — dropping an XML file alone does nothing.

1. Create an XML sitemap, e.g. `config/manual-sitemaps/my-site.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/page-a</loc></url>
  <url><loc>https://example.com/page-b</loc></url>
</urlset>
```

(At scrape start this is copied to `scraper/sitemaps/`.)

2. Open [`config/generic-sites.mjs`](config/generic-sites.mjs) and add a config like Slack archive:

```js
const configMySite = {
    sitemap: await createInput({
        sourceType: 'localXMLsitemap',
        sourcePath: 'scraper/sitemaps/my-site.xml',
    }),
    siteName: 'My Site',
    source: 'My Site',
    category: 'Blogs',
    author: '',
    destinationFile: 'search-index-entries/my-site.jsonl',
    domQueryForContent: DOM_QUERY.body, // or another DOM_QUERY.* that fits
};
```

3. Append to the `sites` array: `[configMySite, scrapeSimple.body],`
4. `npm run diagram:scrape`, then `npm run scrape`.

---

#### I want to… index one page only

No sitemap. One JSON object per page.

1. Open [`config/single-urls/urls.json`](config/single-urls/urls.json).
2. Append:

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

| Field | Required | Meaning |
|-------|----------|---------|
| `url` | yes | Page to scrape |
| `querySelector` | yes | CSS selector(s) for main content |
| `pageTitle` | yes | Title in index + output filename |
| `siteName` / `source` / `category` | recommended | Facets in search |
| `author` / `type` | optional | |

3. `npm run scrape`.

Output: `search-index-entries/site-{index}-{pageTitle-slug}.jsonl`  
(`{index}` = position in the array — inserting in the middle renumbers later files.)

---

#### I want to… skip some URLs from a site

Only applies to sites configured in `generic-sites.mjs`.

1. Create `config/exclude-urls/my-site.json`:

```json
[
  "newsroom",
  "https://example.com/exact-page/"
]
```

- Fragments like `"newsroom"` = substring match (drops any URL containing it).
- Full `http(s)://…` URLs = exact match (trailing slash ignored).

2. In that site’s `createInput({…})` in `generic-sites.mjs`, set:

```js
excludeURLs: 'config/exclude-urls/my-site.json',
```

3. `npm run scrape`.

If the file is missing, the scraper logs an error and continues with no excludes.

---

#### I want to… add content without scraping

1. Put a `.json` or `.jsonl` file in [`config/manual-entries/`](config/manual-entries/).
2. Match the usual entry shape (`url`, `content`, `pageTitle`, `category`, …).
3. Run `npm run scrape` (or at least the copy step) — files are copied into `search-index-entries/`.

Examples already there: `handmade.json`, `gleifPDF.jsonl`.

---

#### Shared helpers

DOM presets live in `scraper/modules/genericSiteScrape.mjs`: `DOM_QUERY.docusaurus`, `.readTheDocs`, `.wordpressEntryContent`, `.gleif`, `.body`, plus `makeScraper` / `scrapeSimple.*`.
