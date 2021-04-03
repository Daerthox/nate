import puppeteer from 'puppeteer'
import { tagElements, tagElementsWithContent } from './tagging'
import { createLogger } from './logger'

const navigate = async (url: string) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const logger = createLogger(page, 'logs')

  let selector = 'input[type="button"][value="Start"]'
  await tagElements(page, selector, { 'nate-action-type': 'click' })
  let content = await page.content()

  const [page2] = await Promise.all([
    page.waitForNavigation(),
    page.click(selector),
  ])

  logger.logToFile(`${Date.now()}-start.html`, content)

  if (!page2 || !page2.ok()) {
    throw new Error(
      `failed to navigate to next page from selector: ${selector}`
    )
  }

  await page.waitForSelector('#content-section', {
    visible: true,
    timeout: 60000,
  })

  selector = '.custom-select-trigger'
  await tagElements(page, selector, { 'nate-action-type': 'click' })
  page.click(selector)

  await logger.logPage(`${Date.now()}-select-options.html`)

  selector = '//span[contains(., "London")]'
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

  selector = '#next-page-btn:enabled'
  await tagElements(page, selector, { 'nate-action-type': 'click' })
  content = await page.content()

  const nextPage = await page.waitForSelector(selector)
  if (!nextPage) {
    throw new Error(`could not locate element: ${selector}`)
  }

  const [page3] = await Promise.all([
    page.waitForNavigation(),
    nextPage.click(),
  ])

  logger.logToFile(`${Date.now()}-next-page.html`, content)

  if (!page3 || !page3.ok()) {
    throw new Error(
      `failed to navigate to next page from selector: ${selector}`
    )
  }

  try {
    await page.waitForSelector('#popup', { visible: true, timeout: 10000 })
    selector = 'input[type="button"][value="X"]'
    await tagElements(page, selector, { 'nate-action-type': 'click' })
    content = await page.content()
    const close = await page.waitForSelector(selector)
    close && close.click()
    logger.logToFile(`${Date.now()}-close-popup.html`, content)
  } catch {
    // probably no popup
    console.log('maybe no popup')
  }

  await tagElements(page, '#name', {
    'nate-action-type': 'input',
    'nate-dict-key': 'nate',
  })
  const nameInput = await page.waitForSelector('#name', { visible: true })
  nameInput && (await nameInput.type('nate', { delay: 300 }))
  await logger.logPage(`${Date.now()}-input-name.html`)

  await tagElements(page, '#pwd', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  const pwdInput = await page.waitForSelector('#pwd', { visible: true })
  pwdInput && (await pwdInput.type('07000000000', { delay: 300 }))
  await logger.logPage(`${Date.now()}-input-password.html`)

  await tagElements(page, '#phone', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  const phoneInput = await page.waitForSelector('#phone', { visible: true })
  phoneInput && (await phoneInput.type('07000000000', { delay: 300 }))
  await logger.logPage(`${Date.now()}-input-phone.html`)

  await tagElements(page, '#email', {
    'nate-action-type': 'input',
    'nate-dict-key': 'nate@nate.tech',
  })
  const emailInput = await page.waitForSelector('#email', { visible: true })
  emailInput && (await emailInput.type('nate@nate.tech', { delay: 300 }))
  await logger.logPage(`${Date.now()}-input-email.html`)

  selector = 'input[type="checkbox"][value="female"]'
  await tagElements(page, selector, { 'nate-action-type': 'check' })
  const genderCheckbox = await page.waitForSelector(selector)
  genderCheckbox && (await genderCheckbox.click())
  await logger.logPage(`${Date.now()}-check-gender.html`)

  await tagElements(page, '#btn', { 'nate-action-type': 'click' })
  const submit = await page.waitForSelector('#btn', { visible: true })

  content = await page.content()

  const [page4] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    submit && submit.click(),
  ])

  logger.logToFile(`${Date.now()}-submit.html`, content)

  if (!page4 || !page4.ok()) {
    return null
  }

  await logger.logPage(`${Date.now()}-complete.html`)
  await browser.close()
}

navigate(
  'https://nate-eu-west-1-prediction-test-webpages.s3-eu-west-1.amazonaws.com/tech-challenge/page1.html'
)
