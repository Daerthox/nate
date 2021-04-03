import { Page } from 'puppeteer'
import { createWriteStream, mkdirSync, existsSync } from 'fs'

interface Logger {
  logPage: (filename: string) => Promise<void>
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
