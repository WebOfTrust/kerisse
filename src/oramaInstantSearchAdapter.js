/**
 * InstantSearch.js client backed by a static Orama index (GitHub Pages).
 */

import { create, load, search as oramaSearch } from '@orama/orama';
import {
  FACET_ATTRIBUTES,
  groupHitsByUrl,
  ORAMA_INDEX_FILENAME,
  SEARCH_PROPERTIES,
} from './oramaShared';

const MAX_RAW_HITS = 5000;
const HIGHLIGHT_FIELDS = [
  'content',
  'pageTitle',
  'siteName',
  'source',
  'url',
  'author',
  'imgMeta',
];

let dbPromise = null;

function resolveIndexUrl() {
  return ORAMA_INDEX_FILENAME;
}

export function loadOramaDatabase() {
  if (!dbPromise) {
    dbPromise = fetch(resolveIndexUrl(), {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load search index (${response.status})`);
        }

        const compressed = await response.arrayBuffer();
        const decompressedStream = new Response(
          new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')),
        );
        const json = await decompressedStream.text();
        const db = create({
          schema: {
            __placeholder: 'string',
          },
        });
        load(db, JSON.parse(json));
        return db;
      });
  }

  return dbPromise;
}

function parseRequestParams(params) {
  if (typeof params === 'object' && params !== null) {
    return params;
  }

  const parsed = {};
  const searchParams = new URLSearchParams(params);

  for (const [key, value] of searchParams.entries()) {
    if (key === 'facets' || key === 'facetFilters' || key === 'numericFilters') {
      parsed[key] = JSON.parse(value);
      continue;
    }

    if (key === 'page' || key === 'hitsPerPage' || key === 'maxValuesPerFacet') {
      parsed[key] = Number.parseInt(value, 10);
      continue;
    }

    parsed[key] = value;
  }

  return parsed;
}

function parseFacetFilters(facetFilters) {
  if (!facetFilters?.length) {
    return {};
  }

  const where = {};

  facetFilters.forEach((group) => {
    const valuesByAttribute = {};

    group.forEach((filter) => {
      const separatorIndex = filter.indexOf(':');
      if (separatorIndex === -1) {
        return;
      }

      const attribute = filter.slice(0, separatorIndex);
      const value = filter.slice(separatorIndex + 1);
      if (!valuesByAttribute[attribute]) {
        valuesByAttribute[attribute] = [];
      }
      valuesByAttribute[attribute].push(value);
    });

    Object.entries(valuesByAttribute).forEach(([attribute, values]) => {
      where[attribute] = values.length === 1 ? values[0] : values;
    });
  });

  return where;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
  if (!text || !query?.trim()) {
    return escapeHtml(text || '');
  }

  const terms = query.trim().split(/\s+/).filter(Boolean);
  let highlighted = escapeHtml(text);

  terms.forEach((term) => {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });

  return highlighted;
}

function buildHighlightResult(document, query) {
  const highlightResult = {};

  HIGHLIGHT_FIELDS.forEach((field) => {
    const value = document[field] || '';
    highlightResult[field] = {
      value: highlightText(value, query),
      matchLevel: query && value.toLowerCase().includes(query.toLowerCase()) ? 'full' : 'none',
    };
  });

  return highlightResult;
}

function toInstantSearchHit(hit, query) {
  const document = hit.document;

  return {
    ...document,
    objectID: document.id,
    'hierarchy.lvl1': document.hierarchyLvl1 || '',
    _highlightResult: buildHighlightResult(document, query),
  };
}

function toInstantSearchFacets(oramaFacets) {
  if (!oramaFacets) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(oramaFacets).map(([attribute, facet]) => [attribute, facet.values || {}]),
  );
}

function buildFacetConfig(facets) {
  const requestedFacets = facets?.length ? facets : FACET_ATTRIBUTES;
  return Object.fromEntries(requestedFacets.map((facet) => [facet, { limit: 100 }]));
}

async function runSearch(db, request) {
  const params = parseRequestParams(request.params);
  const query = params.query || '';
  const page = Number.isInteger(params.page) ? params.page : 0;
  const hitsPerPage = params.hitsPerPage || 10;
  const where = parseFacetFilters(params.facetFilters);

  if (!query.trim()) {
    return {
      hits: [],
      nbHits: 0,
      page,
      nbPages: 0,
      hitsPerPage,
      facets: Object.fromEntries(FACET_ATTRIBUTES.map((facet) => [facet, {}])),
      exhaustiveNbHits: true,
      query,
      params: typeof request.params === 'string' ? request.params : JSON.stringify(params),
      processingTimeMS: 1,
    };
  }

  const searchResult = await oramaSearch(db, {
    term: query,
    properties: SEARCH_PROPERTIES,
    where,
    facets: buildFacetConfig(params.facets),
    limit: MAX_RAW_HITS,
  });

  const groupedHits = groupHitsByUrl(searchResult.hits);
  const nbHits = groupedHits.length;
  const nbPages = Math.max(1, Math.ceil(nbHits / hitsPerPage));
  const start = page * hitsPerPage;
  const pageHits = groupedHits
    .slice(start, start + hitsPerPage)
    .map((hit) => toInstantSearchHit(hit, query));

  return {
    hits: pageHits,
    nbHits,
    page,
    nbPages,
    hitsPerPage,
    facets: toInstantSearchFacets(searchResult.facets),
    exhaustiveNbHits: searchResult.hits.length < MAX_RAW_HITS,
    query,
    params: typeof request.params === 'string' ? request.params : JSON.stringify(params),
    processingTimeMS: searchResult.elapsed?.raw ? Math.round(searchResult.elapsed.raw / 1000) : 1,
  };
}

export async function createOramaInstantSearchAdapter() {
  const db = await loadOramaDatabase();

  return {
    searchClient: {
      search(requests) {
        return Promise.all(requests.map((request) => runSearch(db, request))).then((results) => ({
          results,
        }));
      },
    },
  };
}
