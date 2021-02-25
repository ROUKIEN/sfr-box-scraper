const puppeteer = require('puppeteer')
const { InfluxDB, Point } = require('@influxdata/influxdb-client')
const lanNetworkStats = require('./lan_network_stats.js')
const lanWifi = require('./lan_wifi.js')
const v4network = require('./v4network.js')

require('dotenv').config()

const token = process.env.INFLUXDB_TOKEN
const url = process.env.INFLUXDB_URL
const org = process.env.INFLUXDB_ORG
const bucket = process.env.INFLUXDB_BUCKET

const labels = [
  {
    identifier: 'wan_type',
    fn: () => document.querySelector('.pull-left tr:nth-child(3) td').innerText
  },
  {
    identifier: 'ipv4_addr',
    fn: () => document.querySelector('.pull-left tr:nth-child(4) td').innerText
  },
  {
    identifier: 'router_model',
    fn: () => document.querySelector('.pull-right tr:nth-child(1) td').innerText
  },
  {
    identifier: 'main_version',
    fn: () => document.querySelector('.pull-right tr:nth-child(3) td').innerText
  },
  {
    identifier: 'rescue_version',
    fn: () => document.querySelector('.pull-right tr:nth-child(4) td').innerText
  },
  {
    identifier: 'dsl_version_driver',
    fn: () => document.querySelector('.pull-right tr:nth-child(5) td').innerText
  },
]

const scrape = async () => {
  const client = new InfluxDB({ url, token })
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const writeApi = client.getWriteApi(org, bucket)
  try {
    await page.setViewport({
      width: 1024,
      height: 768,
    })
    await page.goto(`${process.env.BOX_URL}/login`)

    await page.type('#login', process.env.BOX_USERNAME)
    await page.type('#password', process.env.BOX_PASSWORD)
    await page.click('button[name="submit_button"]')

    await page.waitForNavigation()
    const points = []

    const resolvedLabels = []
    for (const label of labels) {
      const value = await page.evaluate(label.fn)
      resolvedLabels.push({ identifier: label.identifier, value })
    }

    const wanStatus = await page.evaluate(() => document.querySelector('#wan_status').classList[0])
    points.push(newPoint('wan_status', wanStatus, resolvedLabels))

    const wanUptime = await page.evaluate(() => document.querySelector('#wan_uptime').innerText)
    points.push(newPoint('wan_uptime', wanUptime, resolvedLabels))

    const uptime = await page.evaluate(() => document.querySelector('.pull-right tr:nth-child(2) td').innerText)
    points.push(newPoint('uptime', uptime, resolvedLabels))

    const v4devices = await v4network(page)
    v4devices.forEach(v4Device => {
      const thePoint = newMultiplePoint(
        `v4_device`,
        [{ key: 'test', value: 1 }],
        [
          { identifier: 'port', value: v4Device.port },
          { identifier: 'ipv4_addr', value: v4Device.ipv4Addr },
          { identifier: 'mac_addr', value: v4Device.macAddr },
          { identifier: 'hostname', value: v4Device.hostname },
          { identifier: 'kind', value: v4Device.port == 'Wifi' ? 'Wifi' : 'lan' },
        ]
      )

      points.push(thePoint)
    })

    const lanNetworkMetrics = await lanNetworkStats(page)
    lanNetworkMetrics.forEach(lanNetworkMetric => {
      const thePoint = newMultiplePoint(
        `lan_network`,
        lanNetworkMetric.metrics.map(m => ({
          key: Object.keys(m)[0],
          value: m[Object.keys(m)[0]]
        })),
        [{ identifier: 'lan_port', value: lanNetworkMetric.label }]
      )

      points.push(thePoint)
    })

    const wlanDevices = await lanWifi(page)
    wlanDevices.forEach(wlanDevice => {
      const thePoint = newMultiplePoint(
        `wlan_device`,
        [
          {key: 'signal_strength_db', value: wlanDevice.signalStrengthDb }
        ],
        [
          { identifier: 'mac_addr', value: wlanDevice.macAddr },
          { identifier: 'ip_addr', value: wlanDevice.ipAddr },
        ]
      )

      points.push(thePoint)
    })

    points.forEach(point => writeApi.writePoint(point))
  } catch (err) {
    throw err
  } finally {
    await writeApi.close()
    await browser.close()
  }
}

function newPoint (label, value, resolvedLabels) {
  const point = new Point(label)
  resolvedLabels.forEach(({ identifier, value }) => {
    point.tag(identifier, value)
  })

  point.stringField('value', value)

  return point
}

function newMultiplePoint (label, values, resolvedLabels) {
  const point = new Point(label)
  resolvedLabels.forEach(({ identifier, value }) => {
    point.tag(identifier, value)
  })

  values.forEach(({ key, value }) => {
    point.intField(key, value)
  })

  return point
}

module.exports = scrape
