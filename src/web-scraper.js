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
  #href = []

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
   */
  async findUrls (url) {
    try {
      const dom = await this.scrapeWebPage(url)

      // Here I select all the a-tags from the previously generated DOM and create an array of all the urls (containing http and https) on the page and convert the NodeList to a true array using Array.from(), as in the example shown by Mats in övningsuppgift The promising web scraper - lösningsförslag.
      const links = Array.from(dom.window.document.querySelectorAll('a[href^="http"],a[href^="https"]'))

      // Here I want to iterate through the links array, pick out the hrefs and push them into a new array.
      for (const link of links) {
        this.#href.push(link.href)
      }

      // Here I want to remove any duplicate links from the href array and I do this by using the Set object, as shown by Mats in övningsuppgift The promising web scraper - lösningsförslag.
      this.#href = [...new Set(this.#href)]

      console.log('Scraping links... OK')
    } catch (error) {
      console.error(error)
    }
  }
}
