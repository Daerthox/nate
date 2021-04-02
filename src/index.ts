import puppeteer from 'puppeteer'

const takeScreenshot = async (url: string) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)
  await page.screenshot({ path: 'screenshot.png' })

  await browser.close()
}

takeScreenshot('https://www.bbc.co.uk')
