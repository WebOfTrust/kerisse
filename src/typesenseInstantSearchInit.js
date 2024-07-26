/**
 * @file This file creates the DOM elements for the Typesense search box and search results. The DOM elements for the search hits are in the main Typesense InstantSearch plugin code.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2023-05-19
 */

import paths from "../paths";

const typesenseInstantSearchCreateDomElements = () => {
    const domStringSearchResult = `
<div id="search" class="container p-3">
    <div class="hero">
        <div class="row">
            <div class="col text-center">
                <a href="https://weboftrust.github.io/keridoc/"><img class="hero-image"
                        src="icons/10119973341678815049.svg" alt="">
                    KERIDoc<br><small>doc.kerisse.org</small></a>
            </div>
            <div class="col text-center">
                <a href="https://weboftrust.github.io/WOT-terms/"><img class="hero-image"
                        src="icons/9491177161682829258.svg" alt="">
                    KERI Suite Glossary<br><small>glossary.kerisse.org</small></a>
            </div>
            <div class="col text-center">
                <a href="https://weboftrust.github.io/kerisse/"><img class="hero-image"
                        src="icons/1626701221679047824.svg" alt="">
                    KERISSE<br><small>search.kerisse.org</small></a>
            </div>
        </div>
    </div>

    <div class="hero2 p-2">
        <h1 class="search-heading text-center fs-2">KERISSE</h1>
        <p class="text-center">KERI Suite Search Engine</p>

        <div id="search-box" class="mt-3 mb-2"></div>
        <small class='d-block text-end'>
            <a class="d-inline" target="_blank" rel="noopener" href="indexed-in-KERISSE.html">
                Indexed:
                <span id='index-created-timestamp-target-search-modal'>–</span>,
                pages: <span id='index-created-page-count-target-search-modal'>–</span></a> |
            <a target="_blank" rel="noopener" class="d-inline text-end"
                href="https://github.com/weboftrust/kerisse/">GitHub repo</a> |
            <a target="_blank" rel="noopener" class="d-inline text-end"
                href="https://chromewebstore.google.com/detail/kerific/ckbmkbbmnfbeecfmoiohobcdmopekgmp">Kerific Browser
                Extension</a>
        </small>
    </div>

    <a href="#search-results" class="to-search-results btn btn-light btn-sm mt-3 mb-3 d-block d-md-none">
        Jump to search results
    </a>

    <!--
    <p id="example-search-terms" class="mt-4 text-center"><small>Try:
      <a role="button" class="clickable-search-term btn btn-outline-secondary btn-sm d-inline">Keri</a>
      <a role="button" class="clickable-search-term btn btn-outline-secondary btn-sm d-inline">ACDC</a>
      <a role="button" class="clickable-search-term btn btn-outline-secondary btn-sm d-inline">Trust over IP</a>
    </p>
    -->

    <ul class="nav justify-content-center">
        <li class="nav-item">
            <a target="_blank" rel="noopener" class="nav-link"
                href="https://docs.google.com/presentation/d/1lpzYcPrIox9V4hERtn4Kcf7uq01OVU9u3PuVm1aYzR0/edit#slide=id.ga411be7e84_0_0">KERI
                for Muggles</a>
        </li>
        <li class="nav-item">
            <a target="_blank" rel="noopener" class="nav-link" href="https://keri.one/keri-resources/">Resources</a>
        </li>
        <li class="nav-item">
            <a target="_blank" rel="noopener" class="nav-link"
                href="https://github.com/SmithSamuelM/Papers/blob/master/whitepapers/KERI_WP_2.x.web.pdf">Whitepaper</a>
        </li>
    </ul>

    <div class="search-results-container container mt-3" style="z-index: 1999;">

        <!-- Column with refinement filters -->
        <div class="row">
            <div class="col-md-3 p-1 pt-0 column-refinement-filters">
                <div class="container border-bottom border-top mb-4 pb-2 pt-3">
                    <div class="row">
                        <div class="col p-0" style='flex-basis: 0'>
                            <!-- Something goes wrong in build phase, this is to compensate -->
                            <h2 class="">Refine</h2>
                        </div>
                        <div class="text-end col p-0" id="clear-refinements" style='flex-basis: 0'></div>
                    </div>
                </div>

                <div class="" id="filters-section">
                    <div id="current-refinements-list-container">
                        <h3 id="current-refinements-list-heading" class="mt-1 fs-6">Current refinements</h3>
                        <div id="current-refinements-list" class="fs-6"></div>
                        <hr>
                    </div>

                    <h3 class="mt-1">Only Images</h3>
                    <div id="tag-refinement-list"></div>

                    <h3 class="mt-1">Category</h3>
                    <div id="category-refinement-list"></div>

                    <h3 class="mt-1">Source</h3>
                    <div id="source-refinement-list"></div>

                    <h3 class="mt-5">Author</h3>
                    <div id="author-refinement-list"></div>

                    <h3 class="mt-5">File type</h3>
                    <div id="media-type-refinement-list"></div>
                    <!--
                    <h3 class="mt-5">Knowledge Level</h3>
                    <div id="knowledgelevel-refinement-list"></div>

                    <h3 class="mt-5">Type</h3>
                    <div id="type-refinement-list"></div>

                    <h3 class="mt-5">Subject</h3>
                    <div id="subject-refinement-list"></div>
                    -->
                </div>
            </div>
            <!-- Column with search results -->
            <div class="col-md-9 p-0 ps-md-3">
                <h2 class="text-center border-bottom border-top mb-4 pb-3 pt-3" id="search-results">Results</h2>
                <div id="hits"></div>
                <div id="pagination"></div>
            </div>
        </div>
    </div>
</div>

<!-- Footer Section -->
<footer class="text-center text-lg-start mt-4">
    <div class="container p-4">
        <div class="row">
            <div class="col-lg-6 col-md-12 mb-4 mb-md-0">
                <h5 class="text-light text-uppercase">KERISSE</h5>
                <p class="text-light">
                    KERI Suite Search Engine.
                </p>
            </div>

            <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
                <h5 class="text-light">More</h5>
                <ul class="list-unstyled mb-0">
                    <li><a target="_blank" rel="noopener" class="text-light"
                            href="https://github.com/weboftrust/kerisse/">GitHub repo</a></li>
                    <li><a href="https://weboftrust.github.io/keridoc/" class="text-light" target="_blank"
                            rel="noopener">KERIDoc</a>
                    </li>
                    <li><a href="https://weboftrust.github.io/WOT-terms/" class="text-light" target="_blank"
                            rel="noopener">KERI Suite
                            Glossary</a></li>
                    <li><a href="https://weboftrust.github.io/kerisse/" class="text-light" target="_blank"
                            rel="noopener">KERISSE</a>
                    </li>
                    <li><a href="https://chromewebstore.google.com/detail/kerific/ckbmkbbmnfbeecfmoiohobcdmopekgmp"
                            class="text-light" target="_blank" rel="noopener">Kerific Browser Extension</a>
                    </li>
                </ul>
            </div>

            <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
                <h5 class="text-light">Important resources</h5>
                <ul class="list-unstyled mb-0">
                    <li><a href="https://docs.google.com/presentation/d/1lpzYcPrIox9V4hERtn4Kcf7uq01OVU9u3PuVm1aYzR0/edit#slide=id.ga411be7e84_0_0"
                            class="text-light" target="_blank" rel="noopener">KERI for Muggles</a></li>
                    <li><a href="https://keri.one/keri-resources/" class="text-light" target="_blank"
                            rel="noopener">KERI Resources</a></li>
                    <li><a href="https://github.com/SmithSamuelM/Papers/blob/master/whitepapers/KERI_WP_2.x.web.pdf"
                            class="text-light" target="_blank" rel="noopener">KERI Whitepaper</a></li>

                </ul>
            </div>
        </div>
    </div>

    <!--<div class="text-center p-3">
      © 2024 Copyright:
    </div>-->
</footer>
  `;

    // Add search to dom
    if (document.querySelector('#search') === null) {
        document
            .querySelector('body')
            .insertAdjacentHTML('afterbegin', domStringSearchResult);
    }


    /*
       TIMESTAMP   
 
       The code below Fetches HTML content from indexed-in-KERISSE on this same domain using the `fetch` API.
       
       It then parses the fetched HTML using `DOMParser` and queries the DOM to find a paragraph element with the id "index-created-timestamp-source".
       
       If the element is found, its text content is added to the search result page; otherwise, an appropriate message indicating the absence of such an element is logged.
    */

    // Fetching the HTML content
    fetch(paths.indexedInKERISSE, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
        .then(response => response.text())
        .then(html => {
            // Parsing the fetched HTML string into a DOM object
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Finding the paragraph elements by their id's
            const timestampElement = doc.querySelector('#index-created-timestamp-source');
            const pageCountElement = doc.querySelector('#index-created-page-count-source');

            if (timestampElement) {
                // Extracting and logging the content of the paragraph
                const timestampContent = timestampElement.textContent;
                document.querySelector('#index-created-timestamp-target-search-modal').textContent = timestampContent;
            } else {
                console.log('Element with id "index-created-timestamp-source" not found.');
            }

            if (pageCountElement) {
                // Extracting and logging the content of the paragraph
                const pageCountContent = pageCountElement.textContent;
                document.querySelector('#index-created-page-count-target-search-modal').innerHTML = pageCountContent;
            } else {
                console.log('Element with id "index-created-page-count-source" not found.');
            }
        })
        .catch(error => {
            console.error(`Error fetching the content: ${error}`);
        });
    // END TIMESTAMP



};

typesenseInstantSearchCreateDomElements();