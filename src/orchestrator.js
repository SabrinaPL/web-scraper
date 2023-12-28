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
  #url = ''

  /**
   * Creates an instance of the Web Scraper.
   *
   *
   */
  constructor () {
    this.scraper = new WebScraper()
  }

  /**
   * Method to start and orchestrate application process.
   *
   * @async
   * @function
   * @param {string} url - The URL to scrape.
   */
  async start (url) {
    try {
      this.#url = url
      await this.scrapeData()
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Method to scrape data.
   *
   * @async
   * @function
   */
  async scrapeData () {
    try {
      const href = await this.scraper.findUrls(this.#url)

      const calendarLinks = await this.scraper.findUrls(href[0])

      console.log('Scraping links... OK')

      const availableDates = []

      for (let i = 0; i < calendarLinks.length; i++) {
        const calendarLinkAbsolute = await this.scraper.createAbsoluteUrl(href[0], calendarLinks[i])
        availableDates.push(await this.scraper.findAvailableDates(calendarLinkAbsolute))
      }

      console.log('Scraping dates... OK')
    } catch (error) {
      console.log(error)
    }
  }
}
