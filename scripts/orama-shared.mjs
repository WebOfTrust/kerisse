/**
 * Shared Orama schema and document helpers for build + browser search.
 */

export const ORAMA_INDEX_FILENAME = 'search-index.orama.json.gz';

export const SEARCH_PROPERTIES = [
  'content',
  'firstHeadingBeforeElement',
  'pageTitle',
  'siteName',
  'source',
  'url',
  'imgMeta',
];

export const FACET_ATTRIBUTES = ['category', 'source', 'author', 'mediaType', 'tag'];

export const ORAMA_SCHEMA = {
  id: 'string',
  siteName: 'string',
  source: 'string',
  author: 'string',
  creationDate: 'string',
  url: 'string',
  content: 'string',
  contentLength: 'number',
  tag: 'string',
  imgUrl: 'string',
  imgMeta: 'string',
  imgMetaLength: 'number',
  imgWidth: 'number',
  imgHeight: 'number',
  hierarchyLvl1: 'string',
  knowledgeLevel: 'string',
  type: 'string',
  pageTitle: 'string',
  firstHeadingBeforeElement: 'string',
  mediaType: 'string',
  category: 'string',
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
    hierarchyLvl1: raw['hierarchy.lvl1'] || '',
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
