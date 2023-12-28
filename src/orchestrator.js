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
  async start (url) {
    const scraper = new WebScraper()
    const href = await scraper.findUrls(url)
    console.log(href)

    const calendarLinks = await scraper.findUrls(href[0])

    console.log(calendarLinks)

    const calendarLinkAbsolute = await scraper.createAbsoluteUrl(href[0], calendarLinks[0])
    console.log(calendarLinkAbsolute)

    const availableDates = await scraper.findAvailableDates(calendarLinkAbsolute)
    console.log(availableDates)
  }
}
