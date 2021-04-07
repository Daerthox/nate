import puppeteer, { Browser, Page } from 'puppeteer'
import { tagElement, tagElementWithContent } from '../../src/tagging'

describe('tagging API', () => {
  const html = `
        <!DOCTYPE html>
        <html>
            <body>
                <div id='unique-tag'>unique content</div>
                <div class='multi-tag'>multi content</div>
                <div class='multi-tag'>multi content</div>
                <div class='multi-tag'>different content</div>
            </body>
        </html>
    `

  type setupValues = [Page, Browser]
  const setupPage = async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(html)

    return [page, browser] as setupValues
  }

  describe('tagElement()', () => {
    it('should throw an error when no element matches the selector', async () => {
      const [page, browser] = await setupPage()
      expect(() => tagElement(page, '#non-exisiting-id', {})).rejects.toThrow()
      await browser.close()
    })
    it('should throw an error when more than one element matches the selector', async () => {
      const [page, browser] = await setupPage()
      expect(() => tagElement(page, '.multi-tag', {})).rejects.toThrow()
      await browser.close()
    })
    it('should tag the element targeted by the selector', async () => {
      const [page, browser] = await setupPage()
      await tagElement(page, '#unique-tag', {
        'nate-action-type': 'click',
        'nate-dict-key': 'test',
      })
      const actionType = await page.evaluate(() =>
        document.getElementById('unique-tag')?.getAttribute('nate-action-type')
      )
      expect(actionType).toBe('click')

      const dictionaryKey = await page.evaluate(() =>
        document.getElementById('unique-tag')?.getAttribute('nate-dict-key')
      )
      expect(dictionaryKey).toBe('test')

      await browser.close()
    })
  })
  describe('tagElementWithContent()', () => {
    it('should throw an error when no element with the specified content matches the selector', async () => {
      const [page, browser] = await setupPage()
      expect(() =>
        tagElementWithContent(page, '#non-exisiting-id', {}, '')
      ).rejects.toThrow()
      expect(() =>
        tagElementWithContent(page, '#unique-tag', {}, 'non-existing-content')
      ).rejects.toThrow()

      await browser.close()
    })
    it('should throw an error when more than one element with the specified content matches the selector', async () => {
      const [page, browser] = await setupPage()
      expect(() =>
        tagElementWithContent(page, '.multi-tag', {}, 'multi content')
      ).rejects.toThrow()
      expect(() =>
        tagElementWithContent(page, 'div', {}, 'multi content')
      ).rejects.toThrow()

      await browser.close()
    })
    it('should tag the element targeted by the selector if it has the specified content', async () => {
      const [page, browser] = await setupPage()
      await tagElementWithContent(
        page,
        '.multi-tag',
        {
          'nate-dict-key': 'test',
          'nate-action-type': 'select',
        },
        'different content'
      )

      const retrieveTags: () => string[] = () => {
        const divs = document.getElementsByClassName('multi-tag')
        if (!divs) {
          throw Error('could not find any matching div')
        }

        const lastDiv = divs.length - 1
        const div = divs.item(lastDiv)

        if (!div) {
          throw Error('failed to retrieve last div')
        }

        return [
          div.getAttribute('nate-action-type') || '',
          div.getAttribute('nate-dict-key') || '',
        ]
      }
      const [actionType, dictionaryKey] = await page.evaluate(retrieveTags)

      expect(actionType).toBe('select')
      expect(dictionaryKey).toBe('test')

      await browser.close()
    })
  })
})
