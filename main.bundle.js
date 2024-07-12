/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./paths.js":
/*!******************!*\
  !*** ./paths.js ***!
  \******************/
/***/ ((module) => {

eval("const paths = {\n    url: \"https://weboftrust.github.io\",\n    baseUrl: \"/kerisse/\",\n    indexedInKERISSE: \"indexed-in-KERISSE.html\"\n}\n\nmodule.exports = paths;\n\n//# sourceURL=webpack://kerisse/./paths.js?");

/***/ }),

/***/ "./src/typesenseInstantSearchInit.js":
/*!*******************************************!*\
  !*** ./src/typesenseInstantSearchInit.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _paths__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../paths */ \"./paths.js\");\n/* harmony import */ var _paths__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_paths__WEBPACK_IMPORTED_MODULE_0__);\n/**\n * @file This file creates the DOM elements for the Typesense search box and search results. The DOM elements for the search hits are in the main Typesense InstantSearch plugin code.\n * @author Kor Dwarshuis\n * @version 1.0.0\n * @since 2023-05-19\n */\n\n\n\nconst typesenseInstantSearchCreateDomElements = () => {\n    const domStringSearchStart = `<button id=\"search-start\">🔍</button>`;\n    const domStringSearchResult = `\n<div id=\"search\" class=\"container p-3\" style=\"max-width: 70em;\">\n    <h1 class=\"search-heading text-center fs-2\">KERI Suite Search Engine (KERISSE)</h1>\n    <p class='text-center'><span id='index-created-timestamp-target-search-modal'>–</span>, <span\n        id='index-created-page-count-target-search-modal'>–</span></p>\n    <div id=\"search-box\" class=\"mt-3 mb-2\"></div>\n    \n    <a href=\"#search-results\" class=\"to-search-results btn btn-light btn-sm mt-3 mb-3 d-block d-md-none\">\n        To search results\n    </a>\n\n    <!--\n    <p id=\"example-search-terms\" class=\"mt-4 text-center\"><small>Try:\n      <a role=\"button\" class=\"clickable-search-term btn btn-outline-secondary btn-sm d-inline\">Keri</a>\n      <a role=\"button\" class=\"clickable-search-term btn btn-outline-secondary btn-sm d-inline\">ACDC</a>\n      <a role=\"button\" class=\"clickable-search-term btn btn-outline-secondary btn-sm d-inline\">Trust over IP</a>\n    </p>\n    -->\n\n    <ul class=\"nav justify-content-center\">\n        <li class=\"nav-item\">\n            <a target=\"_blank\" rel=\"noopener\" class=\"nav-link\" href=\"https://keri.one/keri-resources/\">KERI resources</a>\n        </li>\n        <li class=\"nav-item\">\n            <a target=\"_blank\" rel=\"noopener\" class=\"nav-link\" href=\"https://github.com/SmithSamuelM/Papers/blob/master/whitepapers/KERI_WP_2.x.web.pdf\">KERI Whitepaper</a>\n        </li>\n        <li class=\"nav-item\">\n            <a target=\"_blank\" rel=\"noopener\" class=\"nav-link\" href=\"https://docs.google.com/presentation/d/1lpzYcPrIox9V4hERtn4Kcf7uq01OVU9u3PuVm1aYzR0/edit#slide=id.ga411be7e84_0_0\">KERI for Muggles</a>\n        </li>\n        <li class=\"nav-item\">\n            <a target=\"_blank\" rel=\"noopener\" class=\"nav-link\" href=\"https://weboftrust.github.io/WOT-terms/\">KERI Suite Glossary</a>\n        </li>\n        <li class=\"nav-item\">\n            <a target=\"_blank\" rel=\"noopener\" class=\"nav-link\" href=\"https://weboftrust.github.io/keridoc/\">KERI Doc</a>\n        </li>\n    </ul>\n    \n    <div class=\"search-results-container container mt-3\" style=\"z-index: 1999;\">\n\n        <!-- Column with refinement filters -->\n        <div class=\"row\">\n            <div class=\"col-md-3 p-1 pt-0 column-refinement-filters\">\n                <div class=\"container border-bottom border-top mb-4 pb-2 pt-3\">\n                    <div class=\"row\">\n                        <div class=\"col p-0\" style='flex-basis: 0'>\n                            <!-- Something goes wrong in build phase, this is to compensate -->\n                            <h2 class=\"\">Refine</h2>\n                        </div>\n                        <div class=\"text-end col p-0\" id=\"clear-refinements\" style='flex-basis: 0'></div>\n                    </div>\n                </div>\n\n                <div class=\"\" id=\"filters-section\">\n                    <div id=\"current-refinements-list-container\">\n                        <h3 id=\"current-refinements-list-heading\" class=\"mt-1 fs-6\">Current refinements</h3>\n                        <div id=\"current-refinements-list\" class=\"fs-6\"></div>\n                        <hr>\n                    </div>\n\n                    <h3 class=\"mt-1\">Only Images</h3>\n                    <div id=\"tag-refinement-list\"></div>\n\n                    <h3 class=\"mt-1\">Category</h3>\n                    <div id=\"category-refinement-list\"></div>\n\n                    <h3 class=\"mt-1\">Source</h3>\n                    <div id=\"source-refinement-list\"></div>\n\n                    <h3 class=\"mt-5\">Author</h3>\n                    <div id=\"author-refinement-list\"></div>\n\n                    <h3 class=\"mt-5\">File type</h3>\n                    <div id=\"media-type-refinement-list\"></div>\n                    <!--\n                    <h3 class=\"mt-5\">Knowledge Level</h3>\n                    <div id=\"knowledgelevel-refinement-list\"></div>\n\n                    <h3 class=\"mt-5\">Type</h3>\n                    <div id=\"type-refinement-list\"></div>\n\n                    <h3 class=\"mt-5\">Subject</h3>\n                    <div id=\"subject-refinement-list\"></div>\n                    -->\n                </div>\n            </div>\n            <!-- Column with search results -->\n            <div class=\"col-md-9 p-0 ps-md-3\">\n                <h2 class=\"text-center border-bottom border-top mb-4 pb-3 pt-3\" id=\"search-results\">Results</h2>\n                <div id=\"hits\"></div>\n                <div id=\"pagination\"></div>\n            </div>\n        </div>\n    </div>\n</div>\n  `;\n\n    // Add search to dom\n    if (document.querySelector('#search') === null) {\n        document\n            .querySelector('body')\n            .insertAdjacentHTML('afterbegin', domStringSearchResult);\n    }\n\n    // TODO: find out why check for null does not work\n    // if (document.querySelector('#search-start') === null) {\n    if (document.querySelector('#search-start')) {\n        document.querySelector('#search-start').remove();\n    }\n    document\n        .querySelector('body')\n        .insertAdjacentHTML('beforeend', domStringSearchStart);\n    // }\n\n\n    /*\n       TIMESTAMP   \n \n       The code below Fetches HTML content from indexed-in-KERISSE on this same domain using the `fetch` API.\n       \n       It then parses the fetched HTML using `DOMParser` and queries the DOM to find a paragraph element with the id \"index-created-timestamp-source\".\n       \n       If the element is found, its text content is added to the search result page; otherwise, an appropriate message indicating the absence of such an element is logged.\n    */\n\n    // Fetching the HTML content\n    fetch((_paths__WEBPACK_IMPORTED_MODULE_0___default().indexedInKERISSE), {\n        headers: {\n            'Cache-Control': 'no-cache',\n            'Pragma': 'no-cache',\n            'Expires': '0'\n        }\n    })\n        .then(response => response.text())\n        .then(html => {\n            // Parsing the fetched HTML string into a DOM object\n            const parser = new DOMParser();\n            const doc = parser.parseFromString(html, 'text/html');\n\n            // Finding the paragraph elements by their id's\n            const timestampElement = doc.querySelector('#index-created-timestamp-source');\n            const pageCountElement = doc.querySelector('#index-created-page-count-source');\n\n            if (timestampElement) {\n                // Extracting and logging the content of the paragraph\n                const timestampContent = timestampElement.textContent;\n                document.querySelector('#index-created-timestamp-target-search-modal').textContent = timestampContent;\n            } else {\n                console.log('Element with id \"index-created-timestamp-source\" not found.');\n            }\n\n            if (pageCountElement) {\n                // Extracting and logging the content of the paragraph\n                const pageCountContent = pageCountElement.textContent;\n                document.querySelector('#index-created-page-count-target-search-modal').textContent = pageCountContent;\n            } else {\n                console.log('Element with id \"index-created-page-count-source\" not found.');\n            }\n        })\n        .catch(error => {\n            console.error(`Error fetching the content: ${error}`);\n        });\n    // END TIMESTAMP\n\n\n\n};\n\ntypesenseInstantSearchCreateDomElements();\n\n// export function onRouteDidUpdate({ location, previousLocation }) {\n//     // Don't execute if we are still on the same page; the lifecycle may be fired\n//     // because the hash changes (e.g. when navigating between headings)\n//     if (location.pathname === previousLocation?.pathname) return;\n//     typesenseInstantSearchCreateDomElements();\n// }\n\n\n//# sourceURL=webpack://kerisse/./src/typesenseInstantSearchInit.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/typesenseInstantSearchInit.js");
/******/ 	
/******/ })()
;