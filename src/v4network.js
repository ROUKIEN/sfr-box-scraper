const cheerio = require('cheerio')

/**
 * Iterates over the lan wired connections to collect metrics
 */
async function v4network (page) {
  await page.goto(`${process.env.BOX_URL}/network`)

  const $ = cheerio.load(await page.content())
  const metrics = $('table#network_clients tbody tr').map((i, connectedItem) => {
    const macAddr = $(connectedItem).find('td:nth-child(2)').text().trim()
    const hostname = $(connectedItem).find('td:nth-child(3)').text().trim()
    const ipv4Addr = $(connectedItem).find('td:nth-child(4)').text().trim()
    const port = $(connectedItem).find('td:nth-child(5)').text().trim()

    return {
      macAddr,
      hostname,
      ipv4Addr,
      port
    }
  })

  return metrics.get()
}

module.exports = v4network
