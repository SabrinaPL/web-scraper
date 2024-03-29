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
  #diningTimes = []
  #possibleDiningTimes = []
  #suggestedMovies = []
  #restaurantTime = ''

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
      console.log('Scraping possible reservations... OK')

      console.log('\n ~~~~ Suggestions ~~~~')
      await this.createSuggestion()
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
      const showtimes = await this.scraper.scrapeShowtimes(this.#href[1], this.#availableDays)

      for (const showtime of showtimes) {
        if (showtime.status === 1) {
          this.#availableShowtimes.push(showtime)
        }
      }
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
      const bookableTimes = []

      await this.calculateEarliestTimeToDine()

      // Here I use the slice-method to extract the day, hour and minute values from the restaurant info and then create objects for each bookable time and push them into the bookableTimes array.
      for (let i = 0; i < restaurantInfo.length; i++) {
        const day = restaurantInfo[i].slice(0, 3)
        const startHour = restaurantInfo[i].slice(3, 5)
        const endHour = restaurantInfo[i].slice(5, 7)
        const time = startHour + ':' + '00' + '-' + endHour + ':' + '00'
        bookableTimes.push({ day, time })
      }

      const diningDayInfo = []

      for (const days in this.#availableDays) {
        // Here I've created a dayKey variable to use for comparison with the keys in bookableTimes (as suggested by chatGPT).
        const dayKey = this.#availableDays[days].slice(0, 3).toLowerCase()
        for (const time in bookableTimes) {
          if (bookableTimes[time].day === dayKey) {
            diningDayInfo.push(bookableTimes[time])
          }
        }

        for (const times in this.#earliestTimesToDine) {
          const dineFromHourKey = this.#earliestTimesToDine[times].slice(0, 2)
          for (const dineInfo of diningDayInfo) {
            const startDiningHourKey = dineInfo.time.slice(0, 2)
            if (startDiningHourKey >= dineFromHourKey) {
              this.#diningTimes.push(dineInfo)
            }
          }
        }
      }
      this.#possibleDiningTimes = new Set(this.#diningTimes)
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
   * Method to create a suggestion based on the available showtimes and restaurant info.
   *
   * @function
   */
  async createSuggestion () {
    const movies = []

    // Here I want to check which movies are available before the earliest time to dine and push them into the suggestedMovies array.
    for (const movie in this.#availableShowtimes) {
      const movieTime = this.#availableShowtimes[movie].time
      const movieHour = movieTime.slice(0, 2)
      for (const diningTime of this.#possibleDiningTimes) {
        const diningHour = diningTime.time.slice(0, 2)
        if (movieHour < diningHour) {
          movies.push(this.#availableShowtimes[movie])
        }
      }
    }
    this.#suggestedMovies = new Set(movies)

    // Here I iterate through the suggestedMovies array and log the suggested movies, days and times and also free dining times to the console.
    for (const day of this.#suggestedMovies) {
      const movieDay = day.day
      const movieTime = day.time
      const movieTitle = day.movie
      const movieDayKey = movieDay.slice(0, 3).toLowerCase()

      // I want to retrieve the availale dining time that matches the current movie day.
      for (const diningTime of this.#possibleDiningTimes) {
        if (diningTime.day === movieDayKey) {
          this.#restaurantTime = diningTime.time
        }
      }

      console.log(`* On ${movieDay}, ${movieTitle} begins at ${movieTime} and there is a free table to book at the restaurant between ${this.#restaurantTime}`)
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
