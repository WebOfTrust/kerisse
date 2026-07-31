# Exclude URLs

JSON arrays of strings to drop from a site’s discovered URL list before scraping.

Wire an exclude file from [`generic-sites.mjs`](../generic-sites.mjs):

```js
excludeURLs: 'config/exclude-urls/gleif.json',
```

Matching rules:

- Path fragments use **substring** matching: `"newsroom"` drops every URL that contains `newsroom`.
- Full `http://` / `https://` URLs match **exactly** (trailing slash ignored), so you can exclude a parent page without dropping its children.

Example (`kericonf.json`):

```json
[
    "https://kericonf.com/archive/"
]
```

If the file path is missing, the scraper logs an error and continues with no excludes.

Current files: `gleif.json`, `wot-terms.json`, `kericonf.json`.
