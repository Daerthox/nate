import { Page } from 'puppeteer'
import { mkdir, appendFile } from 'fs/promises'

interface PageLogger {
  logPage: (filename: string) => Promise<void>
}

interface Logger extends PageLogger {
  pageSnapshot: () => Promise<PageLogger>
}

let logger: Logger | undefined = undefined

const createLogger = async (page: Page, logDir: string) => {
  if (!!logger) {
    return logger
  }

  await mkdir(logDir, { recursive: true })

  logger = {
    logPage: (filename: string) => logPage(page, logDir, filename),
    pageSnapshot: () => pageSnapshot(page, logDir),
  }

  return logger
}

const logPage = async (page: Page, logDir: string, filename: string) => {
  const content = await page.content()
  const sheets = await extractCss(page)

  await appendFile(`${logDir}/${filename}.html`, content)

  for (let i = 0; i < sheets.length; i++) {
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

      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i]
        await appendFile(`${logDir}/${filename}-${i}.css`, sheet)
      }
    },
  }
}

const extractCss = async (page: Page) => {
  const sheets: string[] = []
  const sheetsLen = await page.evaluate(() => document.styleSheets.length)
  for (let i = 0; i < sheetsLen; i++) {
    const css = await extractCssFromSheet(page, i)
    sheets.push(css)
  }

  return sheets
}

const extractCssFromSheet = (page: Page, sheetIndex: number) => {
  return page.evaluate((i) => {
    const sheet = document.styleSheets.item(i)
    let content = ''
    try {
      const cssRules = sheet!.cssRules
      for (let j = 0; j < cssRules.length; j++) {
        const rule = cssRules.item(j)
        content += `${rule!.cssText}\n`
      }
    } catch (err) {
      console.log('failed to read some css rules', err)
      return '/* Failed to retrieve css rules */'
    }

    return content
  }, sheetIndex)
}

export { createLogger }
