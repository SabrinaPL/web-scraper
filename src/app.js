/**
 * Main application file.
 *
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 1.0.0
 */

import { Orchestrator } from './application.js'

try {
  // I want to delete the two default items in process.argv and then create a new array with the remaining items, which should be the url that has been inputted by the user.
  const commandLineInput = process.argv.slice(2)

  // Here I want to throw an error if the user does not enter a single URL or if the user enters more than one start url.
  if (commandLineInput.length <= 0 || commandLineInput.length >= 2) {
    throw new Error('Please enter a single start url to begin the process of web scraping')
  } else {
    const url = commandLineInput[0]

    const orchestrator = new Orchestrator()
    orchestrator.start(url)
  }
} catch (error) {
  console.log(error)
} finally {
  console.log('The web scraper has finished running')
}
