/**
 * Orchestrator module.
 *
 */

import { WebScraper } from './web-scraper.js'

/**
 * Represents a class that works as an orchestrator between modules in the application.
 *
 * @class
 */
export class Orchestrator {
  /**
   * Method to start application.
   *
   * @function
   * @param {string} url - The URL to scrape.
   */
  start (url) {
    const scraper = new WebScraper()
    scraper.findUrls(url)
  }
}
