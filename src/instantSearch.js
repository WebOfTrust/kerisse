/**
 * @file InstantSearch.js UI backed by a static Orama index (GitHub Pages).
 * @author Kor Dwarshuis
 * @version 2.0.0
 * @since 2023-05-19
 */

import instantsearch from 'instantsearch.js/es';

import {
  searchBox,
  hits,
  pagination,
  // infiniteHits,
  configure,
  // stats,
  // analytics,
  refinementList,
  clearRefinements,
  // menu,
  sortBy,
  currentRefinements,
} from 'instantsearch.js/es/widgets';

import { createOramaInstantSearchAdapter, loadSearchManifest } from './oramaInstantSearchAdapter';

// import { connectSearchBox } from 'instantsearch.js/es/connectors'
import { connectRefinementList } from 'instantsearch.js/es/connectors';

// This is a custom widget that displays the refinement list for the "tag" attribute, but only for items that have the label "img". This is a replacement for the standard refinementList widget. The standard refinementList widget does not allow you to show a message when there are no items available. This custom widget does.
const refinementListImageToggle = connectRefinementList((renderOptions, isFirstRender) => {
  const { items, widgetParams } = renderOptions;

  const container = document.querySelector("#tag-refinement-list");

  if (items.length === 0) {
    // Display "No results" if there are no items
    container.innerHTML = '<div class="mb-3">No images available</div>';
  } else {
    // Otherwise, build and display the refinement list
    const list = items.map(item => {
      return `<label>
                <input type="checkbox" value="${item.value}" ${item.isRefined ? 'checked' : ''} />
                ${item.label} (${item.count})
              </label>`;
    }).join('');

    container.innerHTML = `<div class="refinement-list">${list}</div>`;
  }
});

const SEARCH_LOADING_MESSAGES = [
  'This is a local search engine — the index runs in your browser, not on a remote server.',
  'Unlike Google or Algolia, no queries are sent to a cloud search API.',
  'We download the search index to your device so everything stays private.',
  'That first download takes a moment; afterwards searching is instant and offline-friendly.',
  'Your browser builds the search index itself — that is why startup feels slower.',
  'Smaller dataset selections download faster; you can change them anytime.',
  'Once loaded, every keystroke is searched locally on this machine.',
  'Hang tight — finishing the local index load…',
];

function startSearchBoxLoadingMessages() {
  const messageEl = document.querySelector('#search-box-loading-message');
  if (!messageEl) {
    return () => {};
  }

  let index = 0;
  const intervalId = setInterval(() => {
    index = (index + 1) % SEARCH_LOADING_MESSAGES.length;
    messageEl.textContent = SEARCH_LOADING_MESSAGES[index];
  }, 3500);

  return () => clearInterval(intervalId);
}

function stopSearchBoxLoading() {
  const loadingEl = document.querySelector('#search-box-loading');
  if (loadingEl) {
    loadingEl.remove();
  }
}

// ---------------------------------------------------------------------------
// Dataset picker: the index is sharded per category; the user chooses which
// subsets to download and search. Selection is remembered in localStorage.
// ---------------------------------------------------------------------------

const DATASET_STORAGE_KEY = 'kerisse-selected-datasets';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} kB`;
}

function getStoredDatasetSelection(manifest) {
  try {
    const stored = JSON.parse(localStorage.getItem(DATASET_STORAGE_KEY));
    if (!Array.isArray(stored)) {
      return null;
    }
    const valid = stored.filter((slug) => manifest.shards.some((shard) => shard.slug === slug));
    return valid.length ? valid : null;
  } catch {
    return null;
  }
}

function promptDatasetSelection(manifest) {
  const picker = document.querySelector('#dataset-picker');
  const optionsContainer = document.querySelector('#dataset-picker-options');
  const startButton = document.querySelector('#dataset-picker-start');

  optionsContainer.innerHTML = `
    <p class="mb-2">
      <a href="#" id="dataset-picker-all">Select all</a> ·
      <a href="#" id="dataset-picker-none">Select none</a>
    </p>
    ${manifest.shards
      .map(
        (shard) => `
      <label class="dataset-picker-option d-block">
        <input type="checkbox" class="form-check-input me-2" value="${escapeHtml(shard.slug)}">
        ${escapeHtml(shard.category)}
        <small class="text-body-secondary">
          (${shard.documents.toLocaleString('en-US')} items, ${formatSize(shard.bytes)})
        </small>
      </label>`,
      )
      .join('')}
  `;

  const checkboxes = () => Array.from(optionsContainer.querySelectorAll('input[type="checkbox"]'));

  return new Promise((resolve) => {
    const updateStartButton = () => {
      startButton.disabled = !checkboxes().some((checkbox) => checkbox.checked);
    };

    optionsContainer.addEventListener('change', updateStartButton);
    optionsContainer.querySelector('#dataset-picker-all').addEventListener('click', (event) => {
      event.preventDefault();
      checkboxes().forEach((checkbox) => (checkbox.checked = true));
      updateStartButton();
    });
    optionsContainer.querySelector('#dataset-picker-none').addEventListener('click', (event) => {
      event.preventDefault();
      checkboxes().forEach((checkbox) => (checkbox.checked = false));
      updateStartButton();
    });

    startButton.addEventListener('click', () => {
      const slugs = checkboxes()
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      picker.classList.add('d-none');
      resolve(slugs);
    });

    updateStartButton();
    picker.classList.remove('d-none');
  });
}

function renderDatasetSummary(manifest, slugs) {
  const summary = document.querySelector('#dataset-summary');
  const list = document.querySelector('#dataset-summary-list');
  const change = document.querySelector('#dataset-change');

  const names = manifest.shards
    .filter((shard) => slugs.includes(shard.slug))
    .map((shard) => shard.category);
  list.textContent = names.join(', ');

  change.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem(DATASET_STORAGE_KEY);
    window.location.reload();
  });

  summary.classList.remove('d-none');
}

const initKerisseSearch = async () => {
  const loader = document.querySelector('#loader');
  const searchBoxLoading = document.querySelector('#search-box-loading');

  loader.textContent = 'Loading…';

  const manifest = await loadSearchManifest();

  let selectedSlugs = getStoredDatasetSelection(manifest);
  if (!selectedSlugs) {
    searchBoxLoading.classList.add('d-none');
    loader.textContent = 'Choose what to search in';
    selectedSlugs = await promptDatasetSelection(manifest);
    localStorage.setItem(DATASET_STORAGE_KEY, JSON.stringify(selectedSlugs));
    searchBoxLoading.classList.remove('d-none');
  }

  renderDatasetSummary(manifest, selectedSlugs);

  const stopLoadingMessages = startSearchBoxLoadingMessages();
  loader.textContent = 'Loading search index…';

  // "Try searching for:"
  function handleSearchTermClick(event) {
    const searchBox = document.querySelector('.ais-SearchBox-input');
    search.helper.clearRefinements();
    searchBox.value = event.currentTarget.textContent;
    search.helper.setQuery(searchBox.value).search();
  }

  document.querySelectorAll('.clickable-search-term').forEach((el) => {
    el.addEventListener('click', handleSearchTermClick);
  });

  let searchClient;
  try {
    ({ searchClient } = await createOramaInstantSearchAdapter(selectedSlugs));
    stopLoadingMessages();
    loader.textContent = 'Search index loaded';
  } catch (error) {
    stopLoadingMessages();
    const loadingMessage = document.querySelector('#search-box-loading-message');
    if (loadingMessage) {
      loadingMessage.textContent = 'Failed to load search index.';
    }
    const spinner = document.querySelector('.search-box-spinner');
    if (spinner) {
      spinner.classList.add('search-box-spinner--stopped');
    }
    throw error;
  }

  const search = instantsearch({
    searchClient,
    indexName: 'kerisse',
    routing: true,
  });

  search.addWidgets([
    searchBox({
      container: '#search-box',
      showSubmit: false,
      showReset: false,
      showLoadingIndicator: true,
      placeholder: 'Enter Search…',
      autofocus: true,
      cssClasses: {
        input: 'form-control',
      },
      // queryHook(query, search) {
      //   const modifiedQuery = queryWithoutStopWords(query);
      //   if (modifiedQuery.trim() !== '') {
      //     search(modifiedQuery);
      //   }
      // },
    }),

    configure({
      hitsPerPage: 10,
    }),
    hits({
      container: '#hits',
      // Orama adapter already escapes hit text and injects <mark> highlights.
      // InstantSearch's default escapeHTML would escape those tags again,
      // so they show as literal text instead of rendered markup.
      escapeHTML: false,

      // to be used in the future
      // transformItems(items) {
      //   let sortedItems = applyCustomSorting(items);
      //   return sortedItems;
      // },
      templates: {
        item(item) {
          function makeCodeStringShorter(string) {
            /*
            Sometimes code blocks are very long and they take up a lot of space in the search results.
            
            This function takes a string as input and returns a modified version of the string.
            It finds the first occurrence of the <marker> tag and the </marker> tag in the input string.
            Then, it extracts a substring that includes 100 characters before the first <marker> and 100 characters after the first </marker>.
            The extracted substring is wrapped in an HTML <span> element with the class "highlighted".
            If either the <marker> tag or the </marker> tag is not found, the function returns the original string unchanged.
            */

            // Find the index of the first occurrence of <marker> and </marker> in the string
            let firstMarkerTagIndex = string.indexOf('<mark>');
            let lastMarkerTagIndex = string.indexOf('</mark>');

            // Check if either < marker > or </ > is not found in the string
            if (firstMarkerTagIndex === -1 || lastMarkerTagIndex === -1) {
              return string; // Return the original string if the tags are not found
            }

            // Calculate the start and end indices for the substring
            let start = Math.max(0, firstMarkerTagIndex - 300); // Start xxx characters before the first <marker> or at the beginning of the string
            let end = Math.min(string.length, lastMarkerTagIndex + 300); // End xxx characters after the first </marker> or at the end of the string

            // Extract the substring containing 100 characters before the first <marker> and 100 characters after the first </marker>
            let firstMarkerTagWith100CharactersBeforeAndAfterIt = string.substring(start, end);

            // Add a span with the "highlighted" class around the extracted substring
            firstMarkerTagWith100CharactersBeforeAndAfterIt = `<span class="shorter-code">${firstMarkerTagWith100CharactersBeforeAndAfterIt}</span>`;

            return firstMarkerTagWith100CharactersBeforeAndAfterIt; // Return the modified string
          }


          // External links should open in a new tab
          let openInNewTab = '';
          if (item.url.indexOf('weboftrust.github.io/WOT-terms') === -1) {
            openInNewTab = 'target="_blank" rel="noopener"';
          }

          // "Postprocess" the content. Especially code samples can be very long and take up a lot of space in the search results. This function makes the code samples shorter. TODO: check if other content types need to be shortened as well.
          let postProcessedCode = '';

          // If the tag is pre or textarea, wrap the content in a <pre> tag, first let's do the opening tag
          let postProcessedOpeningTag = '';
          if (item.tag === 'pre' || item.tag === 'textarea') {
            postProcessedOpeningTag = '<pre>';
            postProcessedCode = makeCodeStringShorter(item._highlightResult.content.value);
          } else { // Otherwise, wrap the content in a <p> tag
            postProcessedOpeningTag = '<p class="ms-5">'
            postProcessedCode = item._highlightResult.content.value;
          }

          // If the tag is pre or textarea, wrap the content in a <pre> tag, now let's do the closing tag
          let postProcessedClosingTag = '';
          if (item.tag === 'pre' || item.tag === 'textarea') {
            postProcessedClosingTag = '</pre>';
          } else { // Otherwise, wrap the content in a <p> tag
            postProcessedClosingTag = '</p>'
          }
          // END "Postprocess" the content

          // Only if curated is true, show a sticky label
          let itemCurated = item.curated === true ? `<p role="alert" class='alert alert-info text-center p-1 d-inline fs-6'><small class="">Sticky</small></p>` : '';

          // Only if siteName is not empty, show it
          let itemSiteNameTemplateString = item.siteName !== '' ? `${item._highlightResult.siteName.value}` : '';

          // Only if title is not empty, show it
          // mb-4
          let itemTitleTemplateString = item.pageTitle !== '' ? `<h3 class="page-title mb-2 ms-4">${item._highlightResult.pageTitle.value}</h3>` : '';

          // Only if author is not empty, show it
          let itemAuthorTemplateString = item.author !== '' ? `• ${item._highlightResult.author.value}` : '';


          // Add class to img based on imgWidth (img that are under 301 are assumed to be logos etc, above 301 are assumed to be explanations, flowcharts, etc)
          let imgClass = '';
          item.imgWidth < 301 ? imgClass = "inline-thumb-start" : imgClass = "";

          // Only if imgUrl is not empty, show it
          let itemImgUrlTemplateString = item.imgUrl !== '' ? `<img class="search-results-img ${imgClass}" src='${item.imgUrl}'>` : '';

          // Only if imgMeta is not empty, show it
          let itemImgMetaTemplateString = item.imgMeta !== '' ? `<p class="ms-5 mt-5">${item._highlightResult.imgMeta.value}</p>` : '';

          // Only if creationDate is not empty, show it
          let itemCreationDateTemplateString = item.creationDate !== '' ? `• ${item.creationDate}` : '';

          // Only if knowledgeLevel is not empty, show it
          let itemKnowledgeLevelTemplateString = item.knowledgeLevel !== '' ? `• Level: ${item.knowledgeLevel}` : '';

          // Only if type is not empty, show it
          let itemTypeTemplateString = item.type !== '' ? `• ${item.type}` : '';

          // Only if firstHeadingBeforeElement is not empty, show it
          let itemFirstHeadingBeforeElementTemplateString = item.firstHeadingBeforeElement !== '' ? `<h4 class="first-heading-before-element ms-5">${item.firstHeadingBeforeElement}</h4>` : '';

          let siteBrandingClass = '';
          if (item.siteName === "Gleif website") {
            siteBrandingClass = "gleif";
          }
          if (item.siteName === "eSSIF-Lab") {
            siteBrandingClass = "essif-lab";
          }
          if (item.siteName === "KERISSE (this site)") {
            siteBrandingClass = "kerisse";
          }
          return `
            <div class="card border-secondary mt-5 scroll-shadows" data-search-result-id="${item.id}">
              <div class="card-header ${siteBrandingClass}">
                ${itemCurated}<p class="d-inline"> Found on: ${itemSiteNameTemplateString}</p>
              </div>
              <div class="card-body text-secondary">
                <div style="font-size: 0.9rem;">
                  <a class="search-hit-url btn btn-outline-primary mb-2" href="${item.url}" ${openInNewTab}>${item._highlightResult.url.value}</a>
                  ${itemAuthorTemplateString}
                  ${itemCreationDateTemplateString}
                  ${itemKnowledgeLevelTemplateString}
                  ${itemTypeTemplateString}
                </div>
                <hr>
                ${itemTitleTemplateString}
                ${itemFirstHeadingBeforeElementTemplateString}

                ${postProcessedOpeningTag}
                  ${postProcessedCode}
                ${postProcessedClosingTag}

                ${itemImgUrlTemplateString}
                ${itemImgMetaTemplateString}
              </div>
              <div class="card-footer p-3">
                <a class="btn btn-outline-primary d-inline btn-sm align-self-start p-2" href="${item.url}">to URL</a>
                <button type="button" class="btn btn-outline-secondary d-inline align-self-end p-1 upvote">upvote ↑</button>
              </div>
            </div>
      `;
        },
      },
    }),

    pagination({
      container: '#pagination',
    }),
    clearRefinements({
      container: '#clear-refinements',
      templates: {
        resetLabel: 'Clear filters'
      },
      cssClasses: {
        button: 'btn btn-secondary btn-sm align-content-center mb-5 mt-3'
      }
    }),
    currentRefinements({
      container: '#current-refinements-list',
      cssClasses: {
        list: 'list-unstyled',
        item: '',
        delete: 'btn btn-sm btn-link text-decoration-none p-0 px-2',
      },
      transformItems: (items) => {
        // hide the heading if there are no current refinements
        document.querySelector("#current-refinements-list-container").classList.add("d-none");
        const labelLookup = {
          content: 'Content',
          author: 'Author',
          category: 'Category',
          source: 'Source',
          mediaType: 'File type',
        };
        const modifiedItems = items.map((item) => {
          // show the heading if there are current refinements
          document.querySelector("#current-refinements-list-container").classList.remove("d-none");
          return {
            ...item,
            label: labelLookup[item.attribute] || '',
          };
        });
        return modifiedItems;
      },
    }),
    // Currently not useful
    // sortBy({
    //   container: '#sort-by',
    //   items: [
    //     { label: 'Default Sort', value: 'Wot-terms' },
    //     { label: 'Content Length: Low to High', value: 'Wot-terms/sort/contentLength:asc' },
    //     { label: 'Content Length: High to Low', value: 'Wot-terms/sort/contentLength:desc' },
    //   ],
    //   cssClasses: {
    //     select: 'form-select form-select-sm mb-2 border-light-2',
    //   },
    // }),

    // // KNOWLEDGELEVEL
    // refinementList({
    //   container: '#knowledgelevel-refinement-list',
    //   attribute: 'knowledgeLevel',
    //   searchable: false,
    //   searchablePlaceholder: 'Search knowledge level',
    //   showMore: false,
    //   cssClasses: {
    //     searchableInput: 'form-control form-control-sm mb-2 border-light-2',
    //     searchableSubmit: 'hidden',
    //     searchableReset: 'hidden',
    //     showMore: 'btn btn-secondary btn-sm align-content-center',
    //     list: 'list-unstyled',
    //     count: '',
    //     label: '',
    //     checkbox: 'me-2',
    //   },

    //   sortBy: ['name:asc', 'count:desc'],
    // }),
    // // TYPE
    // refinementList({
    //   container: '#type-refinement-list',
    //   attribute: 'type',
    //   searchable: false,
    //   searchablePlaceholder: 'Search type',
    //   showMore: false,
    //   cssClasses: {
    //     searchableInput: 'form-control form-control-sm mb-2 border-light-2',
    //     searchableSubmit: 'hidden',
    //     searchableReset: 'hidden',
    //     showMore: 'btn btn-secondary btn-sm align-content-center',
    //     list: 'list-unstyled',
    //     count: '',
    //     label: '',
    //     checkbox: 'me-2',
    //   },

    //   sortBy: ['name:asc', 'count:desc'],
    // }),
    // TAG


    refinementListImageToggle({
      container: '#tag-refinement-list',
      attribute: 'tag',
      // Include other necessary widget options here
      transformItems: items => items.filter(item => ['img'].includes(item.label)),
      limit: 1000
    }),

    // CATEGORY
    refinementList({
      container: '#category-refinement-list',
      attribute: 'category',
      searchable: true,
      searchablePlaceholder: 'Category',
      showMore: false,
      // max_facet_values: 100, TODO: does this work?
      transformItems: (items) => items.filter((item) => item.label.trim() !== ''),
      cssClasses: {
        searchableInput: 'form-control form-control-sm mb-2 border-light-2',
        searchableSubmit: 'hidden',
        searchableReset: 'hidden',
        showMore: 'btn btn-secondary btn-sm align-content-center',
        list: 'list-unstyled',
        count: '',
        label: '',
        checkbox: 'me-2',
      },
      sortBy: ['name:asc', 'count:desc'],
    }),
    // SOURCE
    refinementList({
      container: '#source-refinement-list',
      attribute: 'source',
      searchable: true,
      searchablePlaceholder: 'Source',
      showMore: true,
      // max_facet_values: 100, TODO: does this work?
      transformItems: (items) => items.filter((item) => item.label.trim() !== ''),
      cssClasses: {
        searchableInput: 'form-control form-control-sm mb-2 border-light-2',
        searchableSubmit: 'hidden',
        searchableReset: 'hidden',
        showMore: 'btn btn-secondary btn-sm align-content-center',
        list: 'list-unstyled',
        count: '',
        label: '',
        checkbox: 'me-2',
      },
      sortBy: ['name:asc', 'count:desc'],
    }),

    refinementList({
      container: '#author-refinement-list',
      attribute: 'author',
      searchable: true,
      searchablePlaceholder: 'Author',
      showMore: true,
      // max_facet_values: 100,TODO: does this work?
      transformItems: (items) => items.filter((item) => item.label.trim() !== ''),
      cssClasses: {
        searchableInput: 'form-control form-control-sm mb-2 border-light-2',
        searchableSubmit: 'hidden',
        searchableReset: 'hidden',
        showMore: 'btn btn-secondary btn-sm align-content-center',
        list: 'list-unstyled',
        count: '',
        label: '',
        checkbox: 'me-2',
      },
      sortBy: ['name:asc', 'count:desc'],
    }),
    // MEDIATYPE
    refinementList({
      container: '#media-type-refinement-list',
      attribute: 'mediaType',
      searchable: true,
      searchablePlaceholder: 'File type',
      showMore: true,
      // max_facet_values: 100,TODO: does this work?
      transformItems: (items) => items.filter((item) => item.label.trim() !== ''),
      cssClasses: {
        searchableInput: 'form-control form-control-sm mb-2 border-light-2',
        searchableSubmit: 'hidden',
        searchableReset: 'hidden',
        showMore: 'btn btn-secondary btn-sm align-content-center',
        list: 'list-unstyled',
        count: '',
        label: '',
        checkbox: 'me-2',
      },
      sortBy: ['name:asc', 'count:desc'],
    }),
  ]);

  function debounce(func, delay) {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

  const debounceDelay = 600;

  search.on('render', debounce(function () {
    stopSearchBoxLoading();
    loader.textContent = 'Search results are loaded';
    loader.classList.add('visible');
    setTimeout(() => {
      loader.classList.remove('visible');
    }, 2000);
  }, debounceDelay));

  search.start();
  stopSearchBoxLoading();
};

initKerisseSearch().catch((error) => {
  const loader = document.querySelector('#loader');
  if (loader) {
    loader.textContent = 'Failed to load search index.';
    loader.classList.add('alert-danger');
  }
  console.error('Failed to initialize search:', error);
});

// export function onRouteDidUpdate({ location, previousLocation }) {
//   // Don't execute if we are still on the same page; the lifecycle may be fired
//   // because the hash changes (e.g. when navigating between headings)
//   if (location.pathname === previousLocation?.pathname) return;
//   typeSenseInstantSearch();
// }
