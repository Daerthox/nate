import puppeteer from 'puppeteer'
import config from './config'
import { tagElement, tagElementWithContent } from './tagging'
import { createLogger } from './logger'

const navigate = async (url: string) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const page1 = await page.goto(url)

  if (!page1 || !page1.ok()) {
    throw Error(`failed to open url: [${url}]`)
  }

  const logger = createLogger(page, 'logs')

  const startButton = await tagElement(
    page,
    'input[type="button"][value="start" i]',
    {
      'nate-action-type': 'click',
    }
  )

  let snapshot = await logger.pageSnapshot()

  const [page2] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    startButton.click(),
  ])

  await snapshot.logPage(`${Date.now()}-start`)

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
  await logger.logPage(`${Date.now()}-select-options`)

  const city = await tagElementWithContent(
    page,
    'span',
    { 'nate-action-type': 'select' },
    config.city
  )

  await city.hover()
  await city.click({ delay: 100 })
  await logger.logPage(`${Date.now()}-selected`)

  const nextPageBtn = await tagElement(page, '#next-page-btn:enabled', {
    'nate-action-type': 'click',
  })

  snapshot = await logger.pageSnapshot()

  const [page3] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    nextPageBtn.click(),
  ])

  await snapshot.logPage(`${Date.now()}-next-page`)

  if (!page3 || !page3.ok()) {
    throw Error(`failed to navigate to next page from next page button`)
  }

  const checkForPopup = setInterval(() => {
    page
      .waitForSelector('#popup', { visible: true, timeout: 300 })
      .then(async () => {
        const closeButton = await tagElement(
          page,
          'input[type="button"][value="x" i]',
          {
            'nate-action-type': 'click',
          }
        )
        let snapshot = await logger.pageSnapshot()
        await closeButton.click()
        await snapshot.logPage(`${Date.now()}-close-popup`)
        clearInterval(checkForPopup)
      })
      .catch(() => {
        /* Do nothing */
      })
  }, 500)

  const nameInput = await tagElement(page, '#name', {
    'nate-action-type': 'input',
    'nate-dict-key': config.name,
  })
  await nameInput.type(config.name, { delay: 300 })
  await logger.logPage(`${Date.now()}-input-name`)

  const pwdInput = await tagElement(page, '#pwd', {
    'nate-action-type': 'input',
    'nate-dict-key': config.password,
  })
  await pwdInput.type(config.password, { delay: 300 })
  await logger.logPage(`${Date.now()}-input-password`)

  const phoneInput = await tagElement(page, '#phone', {
    'nate-action-type': 'input',
    'nate-dict-key': config.phone,
  })
  await phoneInput.type(config.phone, { delay: 300 })
  await logger.logPage(`${Date.now()}-input-phone`)

  const emailInput = await tagElement(page, '#email', {
    'nate-action-type': 'input',
    'nate-dict-key': config.email,
  })
  await emailInput.type(config.email, { delay: 300 })
  await logger.logPage(`${Date.now()}-input-email`)

  const genderCheckbox = await tagElement(
    page,
    `input[type="checkbox"][value="${config.gender}" i]`,
    {
      'nate-action-type': 'check',
    }
  )
  await genderCheckbox.click()
  await logger.logPage(`${Date.now()}-check-gender`)

  const submit = await tagElement(page, '#btn', { 'nate-action-type': 'click' })

  snapshot = await logger.pageSnapshot()

  const [page4] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    submit.click(),
  ])

  await snapshot.logPage(`${Date.now()}-submit`)

  if (!page4 || !page4.ok()) {
    throw Error('failed to navigate to next page from submit button')
  }

  await logger.logPage(`${Date.now()}-complete`)
  await browser.close()
  clearInterval(checkForPopup)
}

navigate(config.url)
