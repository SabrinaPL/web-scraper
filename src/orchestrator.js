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
  #availableDays = []

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
      await this.scraper.scrapeWebPage(this.#url)
      this.#href = await this.scraper.scrapeUrls(this.#url)
      console.log('Scraping links... OK')

      await this.checkCalendar()
      console.log('Scraping available days... OK')

      await this.checkShowTimes()
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Method to check calendar.
   *
   * @async
   * @function
   */
  async checkCalendar () {
    const calendarLinks = await this.scraper.scrapeUrls(this.#href[0])

    const calendars = []

    for (let i = 0; i < calendarLinks.length; i++) {
      const calendarLinkAbsolute = this.createAbsoluteUrl(this.#href[0], calendarLinks[i])
      calendars.push(await this.scraper.scrapeCalendar(calendarLinkAbsolute))
    }

    console.log(calendars)

    // Here I use the every-method to check (against the key value pairs in the calendar object) if all friends are available on a specific day.
    const fridayOK = calendars.every(calendar => calendar.Friday === 'OK')
    const saturdayOK = calendars.every(calendar => calendar.Saturday === 'OK')
    const sundayOK = calendars.every(calendar => calendar.Sunday === 'OK')

    if (fridayOK) {
      this.#availableDays.push('Friday')
    }
    if (saturdayOK) {
      this.#availableDays.push('Saturday')
    }
    if (sundayOK) {
      this.#availableDays.push('Sunday')
    }

    console.log(this.#availableDays)
  }

  /**
   * Method to scrape show times from the cinema page.
   *
   * @async
   * @function
   */
  async checkShowTimes () {
    try {
      // Code to scrape showtimes.
      const showtimes = await this.scraper.scrapeShowtimes(this.#href[1], this.#availableDays)
      console.log(showtimes)
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Method to convert a relative url to an absolute url.
   *
   * @function
   * @param {string} url - The url pathway.
   * @param {string} relativeUrl - The relative url to convert to an absolute url.
   * @returns {string} The absolute url.
   */
  createAbsoluteUrl (url, relativeUrl) {
    // Here I decided to use the slice-method to remove the first two characters from the relative url and then concatenate the url and the relative url to create an absolute url.
    relativeUrl = relativeUrl.slice(2, relativeUrl.length)
    const absoluteUrl = url + relativeUrl

    return absoluteUrl
  }
}
