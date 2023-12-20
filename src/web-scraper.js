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
        // Here I select all the a-tags from the previously generated DOM and create an array of all the urls (containing http and https) on the page and convert the NodeList to a true array using Array.from(), as in the example shown by Mats in övningsuppgift The promising web scraper - lösningsförslag.
        const links = Array.from(dom.window.document.querySelectorAll('a[href^="http"],a[href^="https"]'))
        // Here I want to iterate through the links array, pick out the hrefs and push them into a new array.
        const href = []
        for (const link of links) {
          href.push(link.href)
        }
        // Console log to test that the href array contains the correct links.
        console.log(href)
        return href
      }
    } catch (error) {
      console.error(error)
    }
  }
}
