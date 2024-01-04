/**
 * Orchestrator module.
 *
 */

import { WebScraper } from './web-scraper.js'

/**
 * Represents a class that works as an orchestrator of the application process.
 *
 * @class
 */
export class Orchestrator {
  #url = ''
  #href
  #availableDays = []
  #availableShowtimes = []
  #earliestTimesToDine = []

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
      console.log('Scraping available times... OK')

      await this.checkShowTimes()
      console.log('Scraping showtimes... OK')

      await this.checkRestaurantInfo()
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
    } else if (!fridayOK && !saturdayOK && !sundayOK) {
      console.log('No days available when all friends can meet')
    }
  }

  /**
   * Method to retrieve and analyze available show times from the cinema page.
   *
   * @async
   * @function
   */
  async checkShowTimes () {
    try {
      const showtimesInfo = await this.scraper.scrapeShowtimes(this.#href[1], this.#availableDays)
      const showtimes = showtimesInfo.flat()

      for (const showtime of showtimes) {
        if (showtime.status === 1) {
          this.#availableShowtimes.push(showtime)
        }
      }

      console.log(showtimes)
      console.log(this.#availableShowtimes)
    } catch (error) {
      console.log(error)
    }
  }

  /** Method to retrieve and analyze restaurant data.
   *
   * @async
   * @function
   */
  async checkRestaurantInfo () {
    try {
      const restaurantInfo = await this.scraper.scrapeRestaurant(this.#href[2])
      console.log(restaurantInfo)

      await this.calculateEarliestTimeToDine()
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Method to calculate the earliest time when the friends can dine, based on available showtimes.
   *
   * @function
   */
  async calculateEarliestTimeToDine () {
    for (let i = 0; i < this.#availableShowtimes.length; i++) {
      // Here I use the slice-method to extract the hour and minutes from the available showtimes object (values with the time keyword) and then add two hours to the hour value, after string to number conversion, to calculate the earliest time when the friends will be able to dine after the movies.
      const showtime = this.#availableShowtimes[i].time
      const showtimeHourToCalc = showtime.slice(0, 2)
      const showtimeMinutesToCalc = showtime.slice(3, 5)
      const diningTime = Number(showtimeHourToCalc) + 2 + ':' + showtimeMinutesToCalc

      this.#earliestTimesToDine.push(diningTime)
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
