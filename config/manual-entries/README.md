# Manual index entries

Pre-built search-index files that skip crawling. Place `.json` or `.jsonl` files here; they are copied into `search-index-entries/` at scrape start.

You may name the files freely. Schema should match other scraper output (fields like `url`, `content`, `pageTitle`, `category`, …).

Examples:

- [`handmade.json`](handmade.json) — small hand-authored entries
- [`gleifPDF.jsonl`](gleifPDF.jsonl) — Gleif PDF-derived entries (frozen / not re-scraped live)
