import puppeteer from 'puppeteer'
import { tagElement, tagElementWithContent } from './tagging'
import { createLogger } from './logger'

const navigate = async (url: string) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const logger = createLogger(page, 'logs')

  const startButton = await tagElement(page, 'input[type="button"][value="start" i]', {
    'nate-action-type': 'click',
  })

  let content = await page.content()

  const [page2] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    startButton.click(),
  ])

  logger.logToFile(`${Date.now()}-start.html`, content)

  if (!page2 || !page2.ok()) {
    throw new Error(`failed to navigate to next page from start button`)
  }

  await page.waitForSelector('#content-section', {
    visible: true,
    timeout: 60000,
  })

  const select = await tagElement(page, '.custom-select-trigger', {
    'nate-action-type': 'click',
  })
  select.click()

  await logger.logPage(`${Date.now()}-select-options.html`)

  const city = await tagElementWithContent(
    page,
    'span',
    { 'nate-action-type': 'select' },
    'London'
  )

  await city.hover()
  await city.click({ delay: 100 })

  await logger.logPage(`${Date.now()}-selected.html`)

  const nextPageBtn = await tagElement(page, '#next-page-btn:enabled', {
    'nate-action-type': 'click',
  })

  content = await page.content()

  const [page3] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    nextPageBtn.click(),
  ])

  await logger.logToFile(`${Date.now()}-next-page.html`, content)

  if (!page3 || !page3.ok()) {
    throw new Error(`failed to navigate to next page from next page button`)
  }

  try {
    await page.waitForSelector('#popup', { visible: true, timeout: 10000 })
    const closeButton = await tagElement(page, 'input[type="button"][value="x" i]', {
      'nate-action-type': 'click',
    })
    content = await page.content()
    await closeButton.click()
    await logger.logToFile(`${Date.now()}-close-popup.html`, content)
  } catch {
    // probably no popup
    console.log('maybe no popup')
  }

  const nameInput = await tagElement(page, '#name', {
    'nate-action-type': 'input',
    'nate-dict-key': 'nate',
  })
  await nameInput.type('nate', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-name.html`)

  const pwdInput = await tagElement(page, '#pwd', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  await pwdInput.type('07000000000', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-password.html`)

  const phoneInput = await tagElement(page, '#phone', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  await phoneInput.type('07000000000', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-phone.html`)

  const emailInput = await tagElement(page, '#email', {
    'nate-action-type': 'input',
    'nate-dict-key': 'nate@nate.tech',
  })
  await emailInput.type('nate@nate.tech', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-email.html`)

  const genderCheckbox = await tagElement(page, 'input[type="checkbox"][value="female" i]', {
    'nate-action-type': 'check',
  })
  await genderCheckbox.click()
  await logger.logPage(`${Date.now()}-check-gender.html`)

  const submit = await tagElement(page, '#btn', { 'nate-action-type': 'click' })

  content = await page.content()

  const [page4] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    submit.click(),
  ])

  await logger.logToFile(`${Date.now()}-submit.html`, content)

  if (!page4 || !page4.ok()) {
    return null
  }

  await logger.logPage(`${Date.now()}-complete.html`)
  await browser.close()
}

navigate(
  'https://nate-eu-west-1-prediction-test-webpages.s3-eu-west-1.amazonaws.com/tech-challenge/page1.html'
)
