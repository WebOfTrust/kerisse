# Manual sitemaps

Hand-crafted `sitemap.xml` files for sources that do not publish one (or need a fixed URL list).

## Two steps (both required)

1. **Add the XML here** — files are copied to `scraper/sitemaps/` at scrape start. You may name them freely.
2. **Wire a scrape config** in [`../generic-sites.mjs`](../generic-sites.mjs) with `sourceType: 'localXMLsitemap'` and `sourcePath: 'scraper/sitemaps/<your-file>.xml'`, then add `scrape(...)` to the export.

Step 1 alone does **not** scrape anything.

Example: [`slack-keri-archive.xml`](slack-keri-archive.xml) is a one-time archive sitemap (content no longer changes).

Note: [`sitemap-www.gleif.org-pdf.xml`](sitemap-www.gleif.org-pdf.xml) is copied for historical use; Gleif PDFs are currently supplied via [`../manual-entries/gleifPDF.jsonl`](../manual-entries/gleifPDF.jsonl), not an active scrape config.
