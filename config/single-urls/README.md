# Single URLs

One-off pages (blog posts, HackMD notes, etc.) that do not have a useful site-wide sitemap.

Edit [`urls.json`](urls.json). Each entry needs at least `url` and usually a content selector:

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

Example:

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

Output file: `search-index-entries/site-{index}-{pageTitle-slug}.jsonl`  
(The `{index}` is the entry’s position in the JSON array — inserting in the middle renumbers later files.)

For a whole site with a sitemap, use [`../generic-sites.mjs`](../generic-sites.mjs) instead.
