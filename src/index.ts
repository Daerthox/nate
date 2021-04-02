import puppeteer from 'puppeteer'
import { createWriteStream, mkdirSync, existsSync } from 'fs'

const navigate = async (url: string) => {
  const logsDir = 'logs'
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir)
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  let selector = 'input[type="button"][value="Start"]'
  await page.evaluate((selector) => {
    const elem = document.querySelector(selector)
    if (!elem) {
      throw new Error(`could not locate element: ${selector}`)
    }
    elem.setAttribute('nate-action-type', 'click')
  }, selector)

  let content = await page.content()

  const [page2] = await Promise.all([
      page.waitForNavigation(),
      page.click(selector),
  ])

  let writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
  writer.write(content)
  writer.close()

  if (!page2 || !page2.ok()) {
    throw new Error(`failed to navigate to next page from selector: ${selector}`)
  }

  await page.waitForSelector('#content-section', { visible: true, timeout: 60000 })
  
  selector = '.custom-select-trigger'
  await page.evaluate((selector) => {
    const elem = document.querySelector(selector)
    if (!elem) {
      throw new Error(`could not locate element: ${selector}`)
    }
    elem.setAttribute('nate-action-type', 'click')
  }, selector)

  content = await page.content()
  page.click(selector)

  writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
  writer.write(content)
  writer.close()

  selector = '//span[contains(., "London")]'
  const city = await page.waitForXPath(selector, { visible: true })

  if (!city) {
    throw new Error(`could not locate element: ${selector}`)
  }

  await city.hover()
  await city.click({ delay: 100 })

  selector = '#next-page-btn:enabled'
  await page.evaluate((selector) => {
    const elem = document.querySelector(selector)
    if (!elem) {
      throw new Error(`could not locate element: ${selector}`)
    }
    elem.setAttribute('nate-action-type', 'click')
  }, selector)

  content = await page.content()

  const nextPage = await page.waitForSelector(selector)
  if (!nextPage) {
    throw new Error(`could not locate element: ${selector}`)
  }

  writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
  writer.write(content)
  writer.close()

  const [page3] = await Promise.all([
    page.waitForNavigation(),
    nextPage.click(),
  ])

  if (!page3 || !page3.ok()) {
    throw new Error(`failed to navigate to next page from selector: ${selector}`)
  }

  try {
    await page.waitForSelector('#popup', { visible: true, timeout: 10000 })
    selector = 'input[type="button"][value="X"]'
    await page.evaluate((selector) => {
      const elem = document.querySelector(selector)
      if (!elem) {
        throw new Error(`could not locate element: ${selector}`)
      }
      elem.setAttribute('nate-action-type', 'click')
    }, selector)
    content = await page.content()
    const close = await page.waitForSelector(selector)
    close && close.click()
    writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
    writer.write(content)
    writer.close()
  } catch {
    console.log('no popup')
  }

  const nameInput = await page.waitForSelector('#name', { visible: true })
  nameInput && await nameInput.type('nate', { delay: 300 })

  const pwdInput = await page.waitForSelector('#pwd', { visible: true })
  pwdInput && await pwdInput.type('07000000000', { delay: 300 })

  const phoneInput = await page.waitForSelector('#phone', { visible: true })
  phoneInput && await phoneInput.type('07000000000', { delay: 300 })

  const emailInput = await page.waitForSelector('#email', { visible: true })
  emailInput && await emailInput.type('nate@nate.tech', { delay: 300 })

  const genderCheckbox = await page.waitForSelector('input[type="checkbox"][value="female"]')
  genderCheckbox && await genderCheckbox.click()

  const submit = await page.waitForSelector('#btn', { visible: true })
  
  if (!submit) {
    return null
  }

  const [page4] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    submit.click(),
  ])

  if (!page4 || !page4.ok()) {
    return null
  }

  await page.screenshot({ path: 'screenshot.png' })
  await browser.close()
  writer.close()
}

navigate('https://nate-eu-west-1-prediction-test-webpages.s3-eu-west-1.amazonaws.com/tech-challenge/page1.html')
