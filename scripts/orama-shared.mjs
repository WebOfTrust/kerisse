/**
 * Shared Orama schema and document helpers for build + browser search.
 */

export const SEARCH_INDEX_DIRNAME = 'search-index';
export const MANIFEST_FILENAME = 'manifest.json';

/** Stable slug for a category, used in shard filenames and the picker UI. */
export function categorySlug(category) {
  const slug = String(category || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'uncategorized';
}

export function shardFilename(slug) {
  return `${slug}.orama.msgpack.gz`;
}

/** Orama's inverted index nests deeper than msgpack's default maxDepth (100). */
export const MSGPACK_OPTIONS = { maxDepth: 10_000 };

// Only full-text (string) fields — enum facet fields are not searchable as properties.
export const SEARCH_PROPERTIES = [
  'content',
  'firstHeadingBeforeElement',
  'pageTitle',
  'siteName',
  'url',
  'imgMeta',
];

export const FACET_ATTRIBUTES = ['category', 'source', 'author', 'mediaType', 'tag'];

export const ORAMA_SCHEMA = {
  id: 'string',
  siteName: 'string',
  // Facet fields use enum so InstantSearch filters match exact values
  // (string fields are tokenized and can over-match, e.g. "Sam" → "Sam Smith").
  source: 'enum',
  author: 'enum',
  creationDate: 'string',
  url: 'string',
  content: 'string',
  contentLength: 'number',
  tag: 'enum',
  imgUrl: 'string',
  imgMeta: 'string',
  imgMetaLength: 'number',
  imgWidth: 'number',
  imgHeight: 'number',
  knowledgeLevel: 'string',
  type: 'string',
  pageTitle: 'string',
  firstHeadingBeforeElement: 'string',
  mediaType: 'enum',
  category: 'enum',
  curated: 'boolean',
};

const JUNK_CONTENT = new Set(['1', 'Top highlight', '']);

export function normalizeDocument(raw, id) {
  return {
    id: String(id),
    siteName: raw.siteName || '',
    source: raw.source || '',
    author: raw.author || '',
    creationDate: raw.creationDate || '',
    url: raw.url || '',
    content: raw.content || '',
    contentLength: Number(raw.contentLength) || 0,
    tag: raw.tag || '',
    imgUrl: raw.imgUrl || '',
    imgMeta: raw.imgMeta || '',
    imgMetaLength: Number(raw.imgMetaLength) || 0,
    imgWidth: Number(raw.imgWidth) || 0,
    imgHeight: Number(raw.imgHeight) || 0,
    knowledgeLevel: raw.knowledgeLevel || '',
    type: raw.type || '',
    pageTitle: raw.pageTitle || '',
    firstHeadingBeforeElement: raw.firstHeadingBeforeElement || '',
    mediaType: raw.mediaType || '',
    category: raw.category || '',
    curated: raw.curated === true,
  };
}

export function shouldIncludeDocument(raw) {
  if (raw.tag === 'img') {
    return Boolean(raw.imgUrl || raw.imgMeta);
  }

  const content = (raw.content || '').trim();
  if (JUNK_CONTENT.has(content)) {
    return false;
  }

  return content.length >= 2 || Boolean(raw.imgMeta);
}

export function compareHits(a, b) {
  if (b.imgWidth !== a.imgWidth) {
    return b.imgWidth - a.imgWidth;
  }
  if (b.contentLength !== a.contentLength) {
    return b.contentLength - a.contentLength;
  }
  const aHasImg = a.imgUrl ? 1 : 0;
  const bHasImg = b.imgUrl ? 1 : 0;
  return bHasImg - aHasImg;
}

export function groupHitsByUrl(hits) {
  const byUrl = new Map();

  for (const hit of hits) {
    const doc = hit.document;
    const existing = byUrl.get(doc.url);
    if (!existing || compareHits(existing.document, doc) > 0) {
      byUrl.set(doc.url, hit);
    }
  }

  return Array.from(byUrl.values());
}
