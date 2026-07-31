/*
  Author: Kor Dwarshuis
  Created: 2023-03-16
  Updated: -
  Description: 
*/

import scraperGithub from './prepareScraperGithub.mjs';
import scraperGenericSingleUrls from './prepareScraperSingleUrls.mjs';
import scraperGenericSitemap from '../config/generic-sites.mjs';

scraperGithub();
scraperGenericSingleUrls();
scraperGenericSitemap();