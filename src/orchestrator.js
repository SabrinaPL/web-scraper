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
  #href

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
      await this.scrapeLinks()
      await this.scrapeCalendar()
      await this.checkPossibleDays()
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
  async scrapeLinks () {
    try {
      // Code to scrape links.
      this.#href = await this.scraper.findUrls(this.#url)

      console.log('Scraping links... OK')
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Method to scrape calendar.
   *
   * @async
   * @function
   */
  async scrapeCalendar () {
    const calendarLinks = await this.scraper.findUrls(this.#href[0])

    const availableDates = []

    for (let i = 0; i < calendarLinks.length; i++) {
      const calendarLinkAbsolute = this.scraper.createAbsoluteUrl(this.#href[0], calendarLinks[i])
      availableDates.push(await this.scraper.findAvailableDates(calendarLinkAbsolute))
    }

    console.log('Scraping available days... OK')
  }

  /**
   * Method to scrape show times from the cinema page.
   *
   * @async
   * @function
   */
  async scrapeShowTimes () {
    try {
      // Code to scrape showtimes.
      await this.scraper.findShowtimes(this.#href[1])
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Method to check which days the friends are available.
   *
   * @function
   */
  checkPossibleDays () {
    const possibleDays = []

    console.log(possibleDays)
  }
}
