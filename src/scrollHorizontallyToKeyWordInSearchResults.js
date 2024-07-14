/**
 * @file This file scrolls every search results that shows code in a < pre > element horizontally to the first < mark > element in the < pre > element.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2023-08-09
 */

function scrollToMarkElementInPre() {
  // Find all <pre> elements on the page
  const preElements = document.querySelectorAll('pre');

  // For each <pre> element
  preElements.forEach(pre => {
    // Find the first <mark> element
    const mark = pre.querySelector('mark');

    if (mark) {
      // Get the position of the <mark> relative to its parent <pre>
      const startPosition = mark.getBoundingClientRect().left;
      const parentStart = pre.getBoundingClientRect().left;

      // Calculate the offset
      const scrollOffset = startPosition - parentStart;

      // Scroll the parent <pre> horizontally
      pre.scrollLeft = scrollOffset;
    }

  });
}

const scrollHorizontallyToKeyWordInSearchResults = () => {
  // Select the node that you want to observe
  const targetNode = document.getElementById('hits'); // Works, presumable because it's harcoded in the html
  // const targetNode = document.querySelector('.ais-Hits-list');// Does not work

  // Create an observer instance with a callback function
  var observer = new MutationObserver(function (mutationsList) {
    for (var mutation of mutationsList) {
      if (mutation.type == 'childList') {
        // console.log('Content of the target node has changed.');
        scrollToMarkElementInPre();
      }
    }
  });

  // Configuration of the observer:
  var config = {
    childList: true,  // observe direct children addition/removal
    attributes: false,  // don't observe attribute changes
    characterData: true,  // don't observe text changes
    subtree: true  // observe any descendant changes
  };

  // Start observing the target node with the configured parameters
  observer.observe(targetNode, config);

  // Later, you can stop observing
  // observer.disconnect();
};

scrollHorizontallyToKeyWordInSearchResults();