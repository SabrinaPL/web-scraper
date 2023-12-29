/**
 * Web Scraper module.
 *
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 1.0.0
 */

import validator from 'validator'
import jsdom from 'jsdom'
import fetch from 'node-fetch'

/**
 * Represents a web scraper.
 *
 * @class
 */
export class WebScraper {
  /**
   * Asyncronous method to scrape information from a webpage.
   *
   * @param {string} url - The URL to scrape.
   * @returns {Promise<string[]>} An array of strings containing the URLs found on the page.
   */
  async scrapeWebPage (url) {
    try {
      if (!validator.isURL(url)) {
        throw new Error('Invalid URL')
      } else {
        const response = await fetch(url)
        const body = await response.text()
        const dom = new jsdom.JSDOM(body)

        return dom
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Method to find urls.
   *
   * @function
   * @param {object} url - the url to scrape.
   * @returns {Promise<string[]>} An array of strings containing the URLs found on the page.
   */
  async scrapeUrls (url) {
    try {
      const dom = await this.scrapeWebPage(url)

      // Here I select all the a-tags from the previously generated DOM and create an array of all the urls (containing http and https) on the page and convert the NodeList to a true array using Array.from(), as in the example shown by Mats in övningsuppgift The promising web scraper - lösningsförslag.
      const links = Array.from(dom.window.document.querySelectorAll('a[href]'))

      let href = []
      // Here I want to iterate through the links array, pick out the hrefs and push them into a new array.
      for (const link of links) {
        href.push(link.href)
      }

      // Here I want to remove any duplicate links from the href array and I do this by using the Set object, as shown by Mats in övningsuppgift The promising web scraper - lösningsförslag.
      href = [...new Set(href)]

      return href
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Method to scrape available dates.
   *
   * @async
   * @function
   * @param {object} url - the url to scrape.
   * @returns {Promise<string[]>} An array of strings containing the available dates found on the page.
   */
  async scrapeCalendar (url) {
    try {
      const dom = await this.scrapeWebPage(url)

      const daysInfo = Array.from(dom.window.document.querySelectorAll('thead tr th'))
      const availableInfo = Array.from(dom.window.document.querySelectorAll('tbody tr td'))

      // Here I retrieve the text content of the available dates (with a code snippet suggested by chatGPT) and also convert the text to uppercase to make it easier to compare the dates later on.
      const days = daysInfo.map(day => day.textContent)
      const available = availableInfo.map(date => date.textContent.toUpperCase())

      const calendar = { }

      for (let i = 0; i < days.length; i++) {
        calendar[days[i]] = available[i]
      }

      return calendar
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Method to scrape showtimes.
   *
   * @async
   * @function
   * @param {object} url - the url to scrape.
   * @param {string[]} availableDays - An array of strings containing the available days for the friends to meet.
   * @returns {Promise<string[]>} An array of strings containing the showtimes found on the page.
   */
  async scrapeShowtimes (url, availableDays) {
    try {
      const dom = await this.scrapeWebPage(url)

      const daysToCheck = availableDays
      const moviesToCheck = {}
      const movieDays = {}
      const movieTitles = []
      const valuesToCheck = []

      // I changed the code as to retrieve the movie titles and their corresponding values straight from the DOM and creating an object with the info (same with the movie days, see code below), instead of hard coding them as before (similarly as in the scrapeCalendar method). Slice is used to slice away the "pick a movie"-option.
      const movieInfo = Array.from(dom.window.document.querySelectorAll('select#movie option')).slice(1, 4)

      // I iterate through the movieInfo array and push the text content and the value of each movie into the moviesToCheck object (code snippet suggested by chatGPT).
      movieInfo.forEach(movie => {
        const movieTitle = movie.textContent
        const movieValue = movie.value
        moviesToCheck[movieTitle] = movieValue
      })

      movieTitles.push(Object.keys(moviesToCheck))

      console.log(moviesToCheck)
      console.log(movieTitles)

      const dayInfo = Array.from(dom.window.document.querySelectorAll('select#day option')).slice(1, 4)

      dayInfo.forEach(day => {
        const dayText = day.textContent
        const dayValue = day.value
        movieDays[dayText] = dayValue
      })
      console.log(movieDays)

      // Here I use a nested for-loop to iterate through the available days and the movies to modify the url (with the retrieved values) so that I can use it in a fetch-request to check the showtimes for the available days.
      for (let i = 0; i < daysToCheck.length; i++) {
        for (let j = 0; j < movieTitles.length; j++) {
          const currentMovie = movieTitles[j]
          const urlToCheck = url + '/check?day=' + valuesToCheck[i] + '&movie=' + moviesToCheck[currentMovie]
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
