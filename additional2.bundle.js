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

/***/ "./src/scrollHorizontallyToKeyWordInSearchResults.js":
/*!***********************************************************!*\
  !*** ./src/scrollHorizontallyToKeyWordInSearchResults.js ***!
  \***********************************************************/
/***/ (() => {

eval("/**\n * @file This file scrolls every search results that shows code in a < pre > element horizontally to the first < mark > element in the < pre > element.\n * @author Kor Dwarshuis\n * @version 1.0.0\n * @since 2023-08-09\n */\n\nfunction scrollToMarkElementInPre() {\n  // Find all <pre> elements on the page\n  const preElements = document.querySelectorAll('pre');\n\n  // For each <pre> element\n  preElements.forEach(pre => {\n    // Find the first <mark> element\n    const mark = pre.querySelector('mark');\n\n    if (mark) {\n      // Get the position of the <mark> relative to its parent <pre>\n      const startPosition = mark.getBoundingClientRect().left;\n      const parentStart = pre.getBoundingClientRect().left;\n\n      // Calculate the offset\n      const scrollOffset = startPosition - parentStart;\n\n      // Scroll the parent <pre> horizontally\n      pre.scrollLeft = scrollOffset;\n    }\n\n  });\n}\n\nconst scrollHorizontallyToKeyWordInSearchResults = () => {\n  // Select the node that you want to observe\n  const targetNode = document.getElementById('hits'); // Works, presumable because it's harcoded in the html\n  // const targetNode = document.querySelector('.ais-Hits-list');// Does not work\n\n  // Create an observer instance with a callback function\n  var observer = new MutationObserver(function (mutationsList) {\n    for (var mutation of mutationsList) {\n      if (mutation.type == 'childList') {\n        // console.log('Content of the target node has changed.');\n        scrollToMarkElementInPre();\n      }\n    }\n  });\n\n  // Configuration of the observer:\n  var config = {\n    childList: true,  // observe direct children addition/removal\n    attributes: false,  // don't observe attribute changes\n    characterData: true,  // don't observe text changes\n    subtree: true  // observe any descendant changes\n  };\n\n  // Start observing the target node with the configured parameters\n  observer.observe(targetNode, config);\n\n  // Later, you can stop observing\n  // observer.disconnect();\n};\n\nscrollHorizontallyToKeyWordInSearchResults();\n\n//# sourceURL=webpack://kerisse/./src/scrollHorizontallyToKeyWordInSearchResults.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/scrollHorizontallyToKeyWordInSearchResults.js"]();
/******/ 	
/******/ })()
;