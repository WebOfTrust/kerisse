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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _paths__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../paths */ \"./paths.js\");\n/* harmony import */ var _paths__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_paths__WEBPACK_IMPORTED_MODULE_0__);\n/**\n * @file This file fetches HTML content from indexed-in-KERISSE on this same domain using the `fetch` API.\n   \n   It then parses the fetched HTML using `DOMParser` and queries the DOM to find a paragraph element with the id \"index-created-timestamp-source\".\n   \n   If the element is found, its text content is added to the search result page; otherwise, an appropriate message indicating the absence of such an element is logged.\n * @author Kor Dwarshuis\n * @version 1.0.0\n * @since 2023-05-19\n */\n\n\n\n// Fetching the HTML content\nfetch((_paths__WEBPACK_IMPORTED_MODULE_0___default().indexedInKERISSE), {\n    headers: {\n        'Cache-Control': 'no-cache',\n        'Pragma': 'no-cache',\n        'Expires': '0'\n    }\n})\n    .then(response => response.text())\n    .then(html => {\n        // Parsing the fetched HTML string into a DOM object\n        const parser = new DOMParser();\n        const doc = parser.parseFromString(html, 'text/html');\n\n        // Finding the paragraph elements by their id's\n        const timestampElement = doc.querySelector('#index-created-timestamp-source');\n        const pageCountElement = doc.querySelector('#index-created-page-count-source');\n\n        if (timestampElement) {\n            // Extracting and logging the content of the paragraph\n            const timestampContent = timestampElement.textContent;\n            document.querySelector('#index-created-timestamp-target-search-modal').textContent = timestampContent;\n        } else {\n            console.log('Element with id \"index-created-timestamp-source\" not found.');\n        }\n\n        if (pageCountElement) {\n            // Extracting and logging the content of the paragraph\n            const pageCountContent = pageCountElement.textContent;\n            document.querySelector('#index-created-page-count-target-search-modal').innerHTML = pageCountContent;\n        } else {\n            console.log('Element with id \"index-created-page-count-source\" not found.');\n        }\n    })\n    .catch(error => {\n        console.error(`Error fetching the content: ${error}`);\n    });\n// END TIMESTAMP\n\n//# sourceURL=webpack://kerisse/./src/typesenseInstantSearchInit.js?");

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