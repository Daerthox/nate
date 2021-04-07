import { Page } from 'puppeteer'
import { mkdir, appendFile } from 'fs/promises'

interface PageLogger {
  logPage: (filename: string) => Promise<void>
}

interface Logger extends PageLogger {
  pageSnapshot: () => Promise<PageLogger>
}

let logger: Logger

const extractCssFromSheet = (page: Page, sheetIndex: number) =>
  page.evaluate((i) => {
    const sheet = document.styleSheets.item(i) // eslint-disable-line no-undef
    let content = ''
    try {
      const { cssRules } = sheet!
      for (let j = 0; j < cssRules.length; j += 1) {
        const rule = cssRules.item(j)
        content += `${rule!.cssText}\n`
      }
    } catch (err) {
      console.log('failed to read some css rules', err) // eslint-disable-line no-console
      return '/* Failed to retrieve css rules */'
    }

    return content
  }, sheetIndex)

const extractCss = async (page: Page) => {
  const sheets: string[] = []
  // eslint-disable-next-line no-undef
  const sheetsLen = await page.evaluate(() => document.styleSheets.length)
  for (let i = 0; i < sheetsLen; i += 1) {
    const css = await extractCssFromSheet(page, i)
    sheets.push(css)
  }

  return sheets
}

const logPage = async (page: Page, logDir: string, filename: string) => {
  const content = await page.content()
  const sheets = await extractCss(page)

  await appendFile(`${logDir}/${filename}.html`, content)

  for (let i = 0; i < sheets.length; i += 1) {
    const sheet = sheets[i]
    await appendFile(`${logDir}/${filename}-${i}.css`, sheet)
  }
}

const pageSnapshot = async (page: Page, logDir: string) => {
  const content = await page.content()
  const sheets = await extractCss(page)

  return {
    logPage: async (filename: string) => {
      await appendFile(`${logDir}/${filename}.html`, content)

      for (let i = 0; i < sheets.length; i += 1) {
        const sheet = sheets[i]
        await appendFile(`${logDir}/${filename}-${i}.css`, sheet)
      }
    },
  }
}

const createLogger = async (page: Page, logDir: string) => {
  if (logger) {
    return logger
  }

  await mkdir(logDir, { recursive: true })

  logger = {
    logPage: (filename: string) => logPage(page, logDir, filename),
    pageSnapshot: () => pageSnapshot(page, logDir),
  }

  return logger
}

export { createLogger }
