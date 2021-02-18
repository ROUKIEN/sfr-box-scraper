const lans = [
  {
    label: 'fiber',
    fn: () => document.querySelector('div#main div.content pre:nth-child(2)').innerText
  },
  {
    label: 'lan_1',
    fn: () => document.querySelector('div#main div.content pre:nth-child(4)').innerText
  },
  {
    label: 'lan_2',
    fn: () => document.querySelector('div#main div.content pre:nth-child(6)').innerText
  },
  {
    label: 'lan_3',
    fn: () => document.querySelector('div#main div.content pre:nth-child(8)').innerText
  },
  {
    label: 'lan_4',
    fn: () => document.querySelector('div#main div.content pre:nth-child(10)').innerText
  },
]

/**
 * Iterates over the lan wired connections to collect metrics
 */
async function lanNetworkStats (page) {
  await page.goto(`${process.env.BOX_URL}/state/lan/extra`)

  const metrics = await Promise.all(
    lans.map(async lan => {
      const lanStats = await page.evaluate(lan.fn)
      return {
        label: lan.label,
        metrics: evaluateMetrics(multiLineStrToArray(lanStats))
      }
    })
  )

  return metrics
}

/**
 * Parses a multiline string into an array of string whose every array entry is a line
 *
 * @param {String} str
 */
const multiLineStrToArray = str => str.split(/\r?\n/)

/**
 * Formats the lan port metrics
 *
 * @param {Array} lines
 */
const evaluateMetrics = lines =>
  lines
    .map(line => line.replace('\t', '').replaceAll(' ', ''))
    .filter(String)
    .map(line => {
      const [key, value] = line.split('=')

      return { [key]: parseInt(value) }
    })

module.exports = lanNetworkStats
