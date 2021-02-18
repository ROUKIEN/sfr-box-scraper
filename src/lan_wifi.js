const cheerio = require('cheerio')

/**
 * Iterates over the lan wired connections to collect metrics
 */
async function lanWifi (page) {
  await page.goto(`${process.env.BOX_URL}/state/lan`)

  const $ = cheerio.load(await page.content())
  const metrics = $('.content:nth-child(4) table.wlanhost_stats').map((i, item) => {
    const macAddr = $(item).find('thead tr:nth-child(1) td').text().trim()
    const ipAddr = $(item).find('thead tr:nth-child(2) td').text().trim()
    const signalStrengthDb = parseInt($(item).find('tbody .rssidb').text().replace('dB', '').trim())

    return {
      macAddr,
      ipAddr,
      signalStrengthDb
    }
  })

  return metrics.get()
}

/**
 * Formats the lan port metrics
 *
 * @param {DomElement} node
 */
const evaluateWlanDevice = node => {
  const macAddr = node.querySelector('thead tr:nth-child(1) td').innerText
  const ipAddr = node.querySelector('thead tr:nth-child(2) td').innerText
  const signalStrength = node.querySelector('tbody .rssidb').innerText

  return {
    macAddr,
    ipAddr,
    signalStrength,
  }
}

module.exports = lanWifi
