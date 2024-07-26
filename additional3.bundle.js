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

/***/ "./src/backToTop.js":
/*!**************************!*\
  !*** ./src/backToTop.js ***!
  \**************************/
/***/ (() => {

eval("/*\n  Author: Kor Dwarshuis, kor@dwarshuis.com\n  Created: 2024-04-01\n  Description: \n   Adds a back-to-top button that appears when the user scrolls down the page. When clicked, the page scrolls to the top.\n   Styling in /assets/css/backToTop.css\n*/\n\nfunction backToTop() {\n   /*****************/\n   /* CONFIGURATION */\n   const anchor = \"#search\"; // The ID of the element to which the page should scroll when the back-to-top button is clicked\n\n\n   /* END CONFIGURATION */\n   /*********************/\n\n   const backToTopBtn = document.createElement(\"a\");\n   backToTopBtn.id = \"back-to-top-a1zncgtqfpzsig8\";\n   backToTopBtn.href = anchor;\n   backToTopBtn.innerHTML = `↑`;\n   document.body.appendChild(backToTopBtn);\n\n   function debounce(func, wait) {\n      let timeout;\n      return function executedFunction() {\n         const context = this;\n         const args = arguments;\n         clearTimeout(timeout);\n         timeout = setTimeout(() => func.apply(context, args), wait);\n      };\n   }\n\n   function handleScroll() {\n      if (window.scrollY > 300) {\n         backToTopBtn.style.display = \"flex\";\n      } else {\n         backToTopBtn.style.display = \"none\";\n      }\n   }\n   const debouncedSearchAndHighlight = debounce(handleScroll, 600);\n\n   window.addEventListener(\"scroll\", function () {\n      debouncedSearchAndHighlight();\n   });\n}\n\ndocument.addEventListener(\"DOMContentLoaded\", function () {\n   backToTop();\n});\n\n\n//# sourceURL=webpack://kerisse/./src/backToTop.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/backToTop.js"]();
/******/ 	
/******/ })()
;