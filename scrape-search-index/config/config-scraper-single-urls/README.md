# Generic scraper single URLs

Local config for scraping individual blog posts and articles (formerly sourced from a Google Sheet).

Edit `genericScraperSingleUrls.json` to add or update URLs. Each entry needs at least a `url`; other fields match the scraper columns:

- `url` — page to scrape
- `siteName` — display name of the site
- `pageTitle` — title used in output filenames and search index
- `creationDate` — optional metadata
- `source` — e.g. `Blogposts`, `Hackmd`
- `author`
- `category` — e.g. `Blogs`, `Tutorials`
- `type` — optional tag(s)
- `querySelector` — CSS selector(s) for main content extraction
