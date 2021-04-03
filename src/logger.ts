import { Page } from 'puppeteer'
import { createWriteStream, mkdirSync, existsSync } from 'fs'

interface Logger {
  logPage: (filename: string) => Promise<void>
  logToFile: (filename: string, content: string) => void
}

let logger: Logger | undefined = undefined

const createLogger = (page: Page, logDir: string) => {
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
      logToFile: (filename: string, content: string) => {
        const writer = createWriteStream(`${logDir}/${filename}`)
        writer.write(content)
        writer.close()
      },
    }
  }

  return logger
}

export { createLogger }
