/*
  Author: Kor Dwarshuis
  Created: 2023-03-16
  Updated: 2026-07-31
  Description: Run all scrapers and wait for them to finish before exit.
*/

import scraperGithub from './prepareScraperGithub.mjs';
import scraperGenericSingleUrls from './prepareScraperSingleUrls.mjs';
import scraperGenericSitemap from '../config/generic-sites.mjs';

await Promise.all([
  scraperGithub(),
  scraperGenericSingleUrls(),
  scraperGenericSitemap(),
]);
