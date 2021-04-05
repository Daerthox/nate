import { Page } from 'puppeteer'
import { createWriteStream, mkdirSync, existsSync } from 'fs'

interface Logger {
  logPage: (filename: string) => Promise<void>
  logCss: (filename: string) => Promise<void>
  logToFile: (filename: string, content: string) => Promise<void>
}

let logger: Logger | undefined = undefined

const createLogger: (page: Page, logDir: string) => Logger = (page, logDir) => {
  if (!existsSync(logDir)) {
    mkdirSync(logDir)
  }

  if (!logger) {
    logger = {
      logPage: async (filename: string) => {
        const content = await page.content()
        const writer = createWriteStream(`${logDir}/${filename}`)
        writer.write(content)
        writer.close()
      },
      logCss: async (filename: string) => {
        const sheetsLen = await page.evaluate(() => document.styleSheets.length)
        for (let i = 0; i < sheetsLen; i++) {
          const writer = createWriteStream(`${logDir}/${filename}-${i}.css`)
          const css = await page.evaluate((i) => {
            const sheet = document.styleSheets.item(i)
            const cssRules = sheet!.cssRules
            let content = ''
            for (let j = 0; j < cssRules.length; j++) {
              const rule = cssRules.item(j)
              content += `${rule!.cssText}\n`
            }
            return content
          }, i)
          writer.write(css)
          writer.close()
        }
      },
      logToFile: (filename: string, content: string) => {
        return new Promise<void>((resolve) => {
          const writer = createWriteStream(`${logDir}/${filename}`)
          writer.write(content)
          writer.close()
          resolve()
        })
      },
    }
  }

  return logger
}

export { createLogger }
