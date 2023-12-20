/**
 * Module to start the application.
 *
 *
 */

import { WebScraper } from './web-scraper.js'

try {
  const scraper = new WebScraper()
  scraper.scrapeWebPage('https://courselab.lnu.se/scraper-site-1')
} catch (error) {
  console.error(error)
}
