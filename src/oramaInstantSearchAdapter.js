/**
 * InstantSearch.js client backed by static Orama index shards.
 *
 * The index is split into one shard per category (see scripts/build-orama-index.mjs).
 * A manifest lists the shards; the user picks which subsets to load, and only
 * those shards are downloaded and searched.
 *
 * Shards can be hosted on another domain (e.g. https://keri.foundation) —
 * set `searchIndexBaseUrl` in paths.js.
 */

import { decode } from '@msgpack/msgpack';
import { create, load, search as oramaSearch } from '@orama/orama';
import paths from '../paths';
import {
  FACET_ATTRIBUTES,
  groupHitsByUrl,
  MANIFEST_FILENAME,
  MSGPACK_OPTIONS,
  SEARCH_PROPERTIES,
} from '../scripts/orama-shared.mjs';

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

function resolveBaseUrl() {
  const base = paths.searchIndexBaseUrl || 'search-index/';
  return base.endsWith('/') ? base : `${base}/`;
}

let manifestPromise = null;

export function loadSearchManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(`${resolveBaseUrl()}${MANIFEST_FILENAME}`, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load search index manifest (${response.status})`);
      }
      return response.json();
    });
  }

  return manifestPromise;
}

const shardPromises = new Map();

function loadShard(file) {
  if (!shardPromises.has(file)) {
    const promise = fetch(`${resolveBaseUrl()}${file}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load search index shard ${file} (${response.status})`);
        }

        const compressed = await response.arrayBuffer();
        const decompressed = await new Response(
          new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')),
        ).arrayBuffer();
        const db = create({
          schema: {
            __placeholder: 'string',
          },
        });
        load(db, decode(new Uint8Array(decompressed), MSGPACK_OPTIONS));
        return db;
      });
    shardPromises.set(file, promise);
  }

  return shardPromises.get(file);
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

function toOramaEnumFilter(values) {
  return values.length === 1 ? { eq: values[0] } : { in: values };
}

/**
 * InstantSearch facetFilters are either:
 * - "attr:value" (AND with other top-level entries)
 * - ["attr:a", "attr:b"] (OR within the same attribute)
 */
function parseFacetFilters(facetFilters) {
  if (!facetFilters?.length) {
    return {};
  }

  const where = {};

  facetFilters.forEach((group) => {
    const filters = Array.isArray(group) ? group : [group];
    const valuesByAttribute = {};

    filters.forEach((filter) => {
      if (typeof filter !== 'string') {
        return;
      }

      const separatorIndex = filter.indexOf(':');
      if (separatorIndex === -1) {
        return;
      }

      const attribute = filter.slice(0, separatorIndex);
      const value = filter.slice(separatorIndex + 1);

      // InstantSearch exclude syntax: "attr:-value"
      if (value.startsWith('-') || !FACET_ATTRIBUTES.includes(attribute)) {
        return;
      }

      if (!valuesByAttribute[attribute]) {
        valuesByAttribute[attribute] = [];
      }
      valuesByAttribute[attribute].push(value);
    });

    Object.entries(valuesByAttribute).forEach(([attribute, values]) => {
      where[attribute] = toOramaEnumFilter(values);
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
    _highlightResult: buildHighlightResult(document, query),
  };
}

/** Sum facet value counts across shard results. */
function mergeOramaFacets(results) {
  const merged = {};

  for (const result of results) {
    if (!result.facets) {
      continue;
    }

    for (const [attribute, facet] of Object.entries(result.facets)) {
      const values = facet.values || {};
      if (!merged[attribute]) {
        merged[attribute] = {};
      }
      for (const [label, count] of Object.entries(values)) {
        if (label.trim() === '') {
          continue;
        }
        merged[attribute][label] = (merged[attribute][label] || 0) + count;
      }
    }
  }

  return merged;
}

/**
 * InstantSearch sends facets as:
 * - string[] for the main hits query
 * - a single string for each disjunctive-facet follow-up query
 * - ["*"] when all facets are requested
 */
function normalizeRequestedFacets(facets) {
  if (facets == null || facets === '' || facets === '*') {
    return FACET_ATTRIBUTES;
  }

  const list = Array.isArray(facets) ? facets : [facets];
  if (!list.length || list.includes('*')) {
    return FACET_ATTRIBUTES;
  }

  const known = list.filter((facet) => FACET_ATTRIBUTES.includes(facet));
  return known.length ? known : FACET_ATTRIBUTES;
}

function buildFacetConfig(facets) {
  return Object.fromEntries(
    normalizeRequestedFacets(facets).map((facet) => [facet, { limit: 100 }]),
  );
}

async function runSearch(dbs, request) {
  const params = parseRequestParams(request.params);
  const query = params.query || '';
  const page = Number.isInteger(params.page) ? params.page : 0;
  const hitsPerPage = params.hitsPerPage || 10;
  const where = parseFacetFilters(params.facetFilters);
  const hasQuery = Boolean(query.trim());
  const hasFilters = Object.keys(where).length > 0;
  // Empty term matches all docs so facet options stay populated without a query.
  // Skip collecting hits until the user searches or applies a filter.
  const wantHits = hasQuery || hasFilters;

  const shardResults = await Promise.all(
    dbs.map((db) =>
      oramaSearch(db, {
        term: query,
        properties: SEARCH_PROPERTIES,
        where,
        facets: buildFacetConfig(params.facets),
        limit: wantHits ? MAX_RAW_HITS : 0,
      }),
    ),
  );

  const processingTimeMS = Math.max(
    1,
    ...shardResults.map((result) => (result.elapsed?.raw ? Math.round(result.elapsed.raw / 1000) : 1)),
  );
  const paramsString =
    typeof request.params === 'string' ? request.params : JSON.stringify(params);
  const facets = mergeOramaFacets(shardResults);

  if (!wantHits) {
    return {
      hits: [],
      nbHits: 0,
      page,
      nbPages: 0,
      hitsPerPage,
      facets,
      exhaustiveNbHits: true,
      query,
      params: paramsString,
      processingTimeMS,
    };
  }

  const allHits = shardResults
    .flatMap((result) => result.hits)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  const exhaustive = shardResults.every((result) => result.hits.length < MAX_RAW_HITS);

  const groupedHits = groupHitsByUrl(allHits);
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
    facets,
    exhaustiveNbHits: exhaustive,
    query,
    params: paramsString,
    processingTimeMS,
  };
}

/**
 * @param {string[]} slugs category slugs (from the manifest) to load and search
 */
export async function createOramaInstantSearchAdapter(slugs) {
  const manifest = await loadSearchManifest();
  const selected = manifest.shards.filter((shard) => slugs.includes(shard.slug));

  if (!selected.length) {
    throw new Error('No search index shards selected');
  }

  const dbs = await Promise.all(selected.map((shard) => loadShard(shard.file)));

  return {
    searchClient: {
      search(requests) {
        return Promise.all(requests.map((request) => runSearch(dbs, request))).then((results) => ({
          results,
        }));
      },
    },
  };
}
