import puppeteer, { Browser, Page } from 'puppeteer'
import { readFile, rm } from 'fs/promises'
import { createLogger } from '../../src/logger'

describe('logging API', () => {
    const html = '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<title>Initial page</title>' +
        '<style>' +
        'div {' +
        'color: blue;' +
        '}' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div id="original">blue</div>' +
        '</body>' +
        '</html>'

    const modified = (`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Modified page</title>
                <style>
                    div {
                        color: red;
                    }
                </style>
            </head>
            <body>
                <div id="modified">red</div>
            </body>
        </html>
    `)

    type setupValues = [Page, Browser]
    const setupPage = async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setContent(html)

        return [page, browser] as setupValues
    }

    const rootLogDir = `${__dirname}/logs`

    describe('page logger', () => {
        it('should log the page html and css to a files in the specified directory', async () => {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await page.setContent(html)

            const dir = `${rootLogDir}/logs`

            const logger = await createLogger(page, dir)
            
            // Test logPage()
            let filename = 'initial'
            await logger.logPage(filename)

            let content = await readFile(`${dir}/${filename}.html`, { encoding: 'utf-8' })
            expect(content).toBe(html)

            let css = await readFile(`${dir}/${filename}-0.css`, { encoding: 'utf-8' })
            expect(css).toBe('div { color: blue; }\n')

            // Test snapshot()
            filename = 'fromSnapshot'
            const snapshot = await logger.pageSnapshot()

            await page.setContent(modified)

            // confirm the content has changed
            const div = page.evaluate(() => document.getElementById('modified'))
            expect(div).not.toBeNull()

            await snapshot.logPage(filename)

            content = await readFile(`${dir}/${filename}.html`, { encoding: 'utf-8' })
            expect(content).toBe(html)

            css = await readFile(`${dir}/${filename}-0.css`, { encoding: 'utf-8' })
            expect(css).toBe('div { color: blue; }\n')

            await rm(dir, { recursive: true })
            await browser.close()
        })
    })
})