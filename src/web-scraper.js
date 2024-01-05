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
  #username = 'zeke'
  #password = 'coys'

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
      const valuesToCheck = []
      const showtimes = []
      const urlsToCheck = []

      // I changed the code as to retrieve the movie titles and their corresponding values straight from the DOM and creating an object with the info (same with the movie days, see code below), instead of hard coding them as before (similarly as in the scrapeCalendar method). Slice is used to slice away the "pick a movie"-option.
      const movieInfo = Array.from(dom.window.document.querySelectorAll('select#movie option')).slice(1, 4)

      // I iterate through the movieInfo array and push the text content and the value of each movie into the moviesToCheck object (code snippet suggested by chatGPT).
      movieInfo.forEach(movie => {
        const movieTitle = movie.textContent
        const movieValue = movie.value
        moviesToCheck[movieTitle] = movieValue
      })

      const movieTitles = Object.keys(moviesToCheck)

      const dayInfo = Array.from(dom.window.document.querySelectorAll('select#day option')).slice(1, 4)

      dayInfo.forEach(day => {
        const dayText = day.textContent
        const dayValue = day.value
        movieDays[dayText] = dayValue
      })

      // I want to check which days are available and push the corresponding values into the valuesToCheck array.
      for (const day in movieDays) {
        if (daysToCheck.includes(day)) {
          valuesToCheck.push(movieDays[day])
        }
      }

      // Here I use a nested for-loop to iterate through the available days and the movies to modify the url (with the retrieved values) so that I can use it in a fetch-request to check the showtimes for the available days.
      for (let i = 0; i < daysToCheck.length; i++) {
        for (let j = 0; j < movieTitles.length; j++) {
          const currentMovie = movieTitles[j]
          const urlToCheck = url + '/check?day=' + valuesToCheck[i] + '&movie=' + moviesToCheck[currentMovie]
          urlsToCheck.push(urlToCheck)
        }
      }

      for (const urlToCheck of urlsToCheck) {
        try {
          const response = await fetch(urlToCheck)
          const data = await response.json()

          if (!response.ok) {
            const error = new Error('There was an error fetching the cinema data!')
            error.status = response.status
            throw error
          } else {
            showtimes.push(data)
          }
        } catch (error) {
          console.log(error)
        }
      }

      const showtimesUpdated = showtimes.flat()

      // I want to iterate through the showtimesUpdated array and replace the day values with the day names.
      for (const showtime of showtimesUpdated) {
        if (showtime.day === '05') {
          showtime.day = 'Friday'
        } else if (showtime.day === '06') {
          showtime.day = 'Saturday'
        } else if (showtime.day === '07') {
          showtime.day = 'Sunday'
        }
      }

      // I want to iterate through the showtimesUpdated array to replace the movie values with the movie titles.
      for (const showtime of showtimesUpdated) {
        if (showtime.movie === '01') {
          showtime.movie = movieTitles[0]
        } else if (showtime.movie === '02') {
          showtime.movie = movieTitles[1]
        } else if (showtime.movie === '03') {
          showtime.movie = movieTitles[2]
        }
      }

      return showtimesUpdated
    } catch (error) {
      console.log(error)
    }
  }

  /** Method to scrape restaurant booking info.
   *
   * @async
   * @function
   * @param {object} url - the url to scrape.
   * @returns {Promise<string[]>} An array of strings containing the booking information found on the page.
   */
  async scrapeRestaurant (url) {
    try {
      const dom = await this.scrapeWebPage(url)

      // Here I retrieve the form action from the DOM and add it to the url to create the login url.
      const formAction = dom.window.document.querySelector('form').action
      const loginUrl = url + formAction

      const response = await fetch(loginUrl, {
        method: 'POST',
        // I set redirect manual here to be able to retrieve the cookie from the response (as recommended by Johan and Mats during a handledning).
        redirect: 'manual',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.#username,
          password: this.#password
        })
      })

      if (response.status !== 302) {
        const error = new Error('There was an error logging in!')
        error.status = response.status
        throw error
      } else {
        // Here I want to retrieve the cookie from the response and add it to the headers for the next fetch-request.
        const cookieToSend = response.headers.raw()['set-cookie']

        // Here I want to retrieve the next url to send the cookie to, from the response.
        const redirectUrl = response.headers.get('Location')

        const response2 = await fetch(redirectUrl, {
          method: 'GET',
          redirect: 'manual',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieToSend
          }
        })

        // Here I want to make sure that the response is ok before I retrieve the data.
        if (!response2.ok) {
          const error = new Error('There was an error fetching the restaurant data!')
          error.status = response2.status
          throw error
        } else {
          const restaurantData = await response2.text()

          // I want to create a new DOM from the data retrieved from the response so that I can retrieve the restaurant info from the DOM.
          const dom2 = new jsdom.JSDOM(restaurantData)

          // Here I retrieve the restaurant info from the DOM, targeting the radio buttons (that contain the values with the booking information).
          const restaurantInfo = Array.from(dom2.window.document.querySelectorAll('.MsoNormal input[type="radio"]'))

          const bookableTimes = []

          // I want to iterate through the restaurantInfo array to retrieve the values with the booking information and push them into a new array.
          for (const radiobtn of restaurantInfo) {
            bookableTimes.push(radiobtn.value)
          }

          return bookableTimes
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
