import puppeteer from 'puppeteer'
import { tagElements, tagElementsWithContent } from './tagging'
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
  await tagElements(page, selector, { 'nate-action-type': undefined })
  let content = await page.content()

  const [page2] = await Promise.all([
    page.waitForNavigation(),
    page.click(selector),
  ])

  let writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
  writer.write(content)
  writer.close()

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

  content = await page.content()
  page.click(selector)

  writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
  writer.write(content)
  writer.close()

  selector = '//span[contains(., "London")]'
  await tagElementsWithContent(
    page,
    'span',
    { 'nate-action-type': 'click' },
    'London'
  )
  const city = await page.waitForXPath(selector, { visible: true })

  if (!city) {
    throw new Error(`could not locate element: ${selector}`)
  }

  await city.hover()
  await city.click({ delay: 100 })

  selector = '#next-page-btn:enabled'
  await tagElements(page, selector, { 'nate-action-type': 'click' })

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
    writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
    writer.write(content)
    writer.close()
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

  await tagElements(page, '#pwd', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  const pwdInput = await page.waitForSelector('#pwd', { visible: true })
  pwdInput && (await pwdInput.type('07000000000', { delay: 300 }))

  await tagElements(page, '#phone', {
    'nate-action-type': 'input',
    'nate-dict-key': '07000000000',
  })
  const phoneInput = await page.waitForSelector('#phone', { visible: true })
  phoneInput && (await phoneInput.type('07000000000', { delay: 300 }))

  await tagElements(page, '#email', {
    'nate-action-type': 'input',
    'nate-dict-key': 'nate@nate.tech',
  })
  const emailInput = await page.waitForSelector('#email', { visible: true })
  emailInput && (await emailInput.type('nate@nate.tech', { delay: 300 }))

  selector = 'input[type="checkbox"][value="female"]'
  await tagElements(page, selector, { 'nate-action-type': 'check' })
  const genderCheckbox = await page.waitForSelector(selector)
  genderCheckbox && (await genderCheckbox.click())

  await tagElements(page, '#btn', { 'nate-action-type': 'click' })
  const submit = await page.waitForSelector('#btn', { visible: true })

  content = await page.content()

  writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
  writer.write(content)
  writer.close()

  const [page4] = await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    submit && submit.click(),
  ])

  if (!page4 || !page4.ok()) {
    return null
  }

  content = await page.content()

  writer = createWriteStream(`${logsDir}/${Date.now()}.html`)
  writer.write(content)
  writer.close()

  await browser.close()
}

navigate(
  'https://nate-eu-west-1-prediction-test-webpages.s3-eu-west-1.amazonaws.com/tech-challenge/page1.html'
)
