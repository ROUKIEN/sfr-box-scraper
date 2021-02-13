const scrape = require('../src/scrape.js')

const safeScrape = async () => {
  process.stdout.write('scraping...')
  try {
    await scrape()
    process.stdout.write('done. \n')
  } catch(err) {
    console.error(`failed to scrape: ${err.message}`)
  }
}

safeScrape()

setInterval(safeScrape, 5 * 60 * 1000)
