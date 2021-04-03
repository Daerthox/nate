import puppeteer from 'puppeteer'
import { tagElements, tagElementsWithContent } from './tagging'
import { createLogger } from './logger'

const navigate = async (url: string) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const logger = createLogger(page, 'logs')

  let elems = await tagElements(page, 'input[type="button"][value="Start"]', { 'nate-action-type': 'click' })
  const startButton = elems[0]

  let content = await page.content()

  const [page2] = await Promise.all([
    page.waitForNavigation(),
    startButton.click(),
  ])

  logger.logToFile(`${Date.now()}-start.html`, content)

  if (!page2 || !page2.ok()) {
    throw new Error(
      `failed to navigate to next page from start button`
    )
  }

  await page.waitForSelector('#content-section', {
    visible: true,
    timeout: 60000,
  })

  elems = await tagElements(page, '.custom-select-trigger', { 'nate-action-type': 'click' })
  const select = elems[0]
  select.click()

  await logger.logPage(`${Date.now()}-select-options.html`)

  const selector = '//span[contains(., "London")]'
  await tagElementsWithContent(
    page,
    'span',
    { 'nate-action-type': 'select' },
    'London'
  )
  const city = await page.waitForXPath(selector, { visible: true })

  if (!city) {
    throw new Error(`could not locate element: ${selector}`)
  }

  await city.hover()
  await city.click({ delay: 100 })

  await logger.logPage(`${Date.now()}-selected.html`)

  elems = await tagElements(page, '#next-page-btn:enabled', { 'nate-action-type': 'click' })
  const nextPageBtn = elems[0]
  
  content = await page.content()

  const [page3] = await Promise.all([
    page.waitForNavigation(),
    nextPageBtn.click(),
  ])

  await logger.logToFile(`${Date.now()}-next-page.html`, content)

  if (!page3 || !page3.ok()) {
    throw new Error(
      `failed to navigate to next page from next page button`
    )
  }

  try {
    await page.waitForSelector('#popup', { visible: true, timeout: 10000 })
    elems = await tagElements(page, 'input[type="button"][value="X"]', { 'nate-action-type': 'click' })
    const closeButton = elems[0]
    content = await page.content()
    await closeButton.click()
    await logger.logToFile(`${Date.now()}-close-popup.html`, content)
  } catch {
    // probably no popup
    console.log('maybe no popup')
  }

  elems = await tagElements(page, '#name', {
    'nate-action-type': 'input',
    'nate-dict-key': 'nate',
  })
  const nameInput = elems[0]
  await nameInput.type('nate', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-name.html`)

 elems = await tagElements(page, '#pwd', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  const pwdInput = elems[0]
  await pwdInput.type('07000000000', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-password.html`)

  elems = await tagElements(page, '#phone', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  const phoneInput = elems[0]
  await phoneInput.type('07000000000', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-phone.html`)

  elems = await tagElements(page, '#email', {
    'nate-action-type': 'input',
    'nate-dict-key': 'nate@nate.tech',
  })
  const emailInput = elems[0]
  await emailInput.type('nate@nate.tech', { delay: 300 })
  await logger.logPage(`${Date.now()}-input-email.html`)

  elems = await tagElements(page, 'input[type="checkbox"][value="female"]', { 'nate-action-type': 'check' })
  const genderCheckbox = elems[0]
  await genderCheckbox.click()
  await logger.logPage(`${Date.now()}-check-gender.html`)

  elems = await tagElements(page, '#btn', { 'nate-action-type': 'click' })
  const submit = elems[0]

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
