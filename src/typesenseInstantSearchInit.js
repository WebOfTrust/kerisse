/**
 * @file This file fetches HTML content from indexed-in-KERISSE on this same domain using the `fetch` API.
   
   It then parses the fetched HTML using `DOMParser` and queries the DOM to find a paragraph element with the id "index-created-timestamp-source".
   
   If the element is found, its text content is added to the search result page; otherwise, an appropriate message indicating the absence of such an element is logged.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2023-05-19
 */

import paths from "../paths";

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