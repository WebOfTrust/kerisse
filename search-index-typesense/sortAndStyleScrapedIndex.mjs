/**
 * Sorts the lines in a file alphabetically and wraps them in HTML list elements.
 * The first line of the file is preserved as a header.
 * Usage: node sortAndStyleScrapedIndex.js <fileName>
 * Example:
 * $ node search-index-typesense/sortAndStyleScrapedIndex.mjs docs/overview/indexed-in-KERISSE.md
 * 
 */

import fs from 'fs';
import logger from './modules/logger.mjs';
import { format } from 'date-fns';

const urlRegex = /(https?:\/\/[^\s]+)/g;

function sortLinesInFile(fileName) {
  // Read the file
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      logger.setLogFile('error.log');
      logger.log('Error reading the file:' + err);

      return;
    }

    // Check if the content already contains <ul> or <li>
    if (data.includes('<ul>') || data.includes('<li>')) {
      logger.setLogFile('error.log');
      logger.log('The content already contains HTML list elements, skipping processing.');

      return;
    }

    // Split the data into lines
    const lines = data.split('\n');

    // Remove empty lines
    const nonEmptyLines = lines.filter(line => line.trim() !== '');

    // Count the entries
    const pagesCount = nonEmptyLines.length;

    // Sort the non-empty lines alphabetically
    const sortedLines = nonEmptyLines.sort();

    // Wrap and convert URL lines to clickable links
    const wrappedLines = sortedLines.map(line => {
      const isURL = line.match(urlRegex);
      if (isURL) {
        const url = isURL[0];
        const wrappedURL = `<a href="${url}" target="_blank">${url}</a>`;
        return `<li>${wrappedURL}</li>`;
      }
      return `<li>${line}</li>`;
    });

    // Join the wrapped lines into a single string
    const wrappedContent = wrappedLines.join('\n');

    // Wrap the content in <ul> and </ul>
    const finalContent = `<ol>\n${wrappedContent}\n</ol>`;

    // Get the current time
    const currentTime = format(new Date(), 'dd MMMM yyyy HH:mm');

    // Add a header
    const header = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kerisse search</title>
        <meta name="description" content="Kerisse search through KERI documentation.">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="custom.css">
      </head>
      <body class="container p-3">
      <h1>Indexed in KERISSE</h1>
      `;
    const footer = `</body></html>`;

    // Final string to write to the file
    const contentWithHeader = `${header}\n<p>Indexed at <span id='index-created-timestamp-source'>${currentTime}</span></p>\n<p><span id='index-created-page-count-source'>${pagesCount}</span> indexed pages</p>\n${finalContent}\n${footer}`;

    // Write the final content back to the file
    fs.writeFile(fileName, contentWithHeader, 'utf8', (err) => {
      if (err) {
        logger.setLogFile('error.log');
        logger.log('Error writing to the file:' + err);

        return;
      }
      logger.setLogFile('success.log');
      logger.log('File sorted and wrapped in HTML successfully!');
    });
  });
}

// Usage: node sortFile.js <fileName>
const fileName = process.argv[2];
if (!fileName) {
  logger.setLogFile('error.log');
  logger.log('Please provide a file name as an argument.');

  process.exit(1);
}

sortLinesInFile(fileName);
