const puppeteer = require('puppeteer')
const { InfluxDB } = require('@influxdata/influxdb-client')

require('dotenv').config()

// You can generate a Token from the "Tokens Tab" in the UI
const token = process.env.INFLUXDB_TOKEN
const url = process.env.INFLUXDB_URL
const org = process.env.INFLUXDB_ORG
const bucket = process.env.INFLUXDB_BUCKET

const client = new InfluxDB({ url, token });

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({
    width: 1024,
    height: 768,
  })
  await page.goto(`${process.env.BOX_URL}/login`)

  await page.type('#login', process.env.BOX_USERNAME)
  await page.type('#password', process.env.BOX_PASSWORD)
  await page.click('button[name="submit_button"]')

  await page.waitForNavigation()

  // const modelVersion = await page.evaluate(() => document.querySelector('.pull-right tr:first').textContent)
  const wanStatus = await page.evaluate(() => document.querySelector('#wan_status').classList)
  console.log(wanStatus[0])
  const wanUptime = await page.evaluate(() => document.querySelector('#wan_uptime').innerText)
  console.log(wanUptime)

  const {Point} = require('@influxdata/influxdb-client')
  const writeApi = client.getWriteApi(org, bucket)
  // writeApi.useDefaultTags({ modelVersion: 'host1' })
  const points = []
  points.push(new Point('wan_status')
    .stringField('value', wanStatus[0]))

  points.push(new Point('wan_uptime')
    .stringField('value', wanUptime))

  points.forEach(point => writeApi.writePoint(point))
  await writeApi.close()
  await browser.close()
})()
