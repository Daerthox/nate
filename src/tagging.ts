import { Page } from 'puppeteer'

interface Tags {
  'nate-action-type'?: 'click' | 'select' | 'input' | 'check'
  'nate-dict-key'?: string
}

const tagElements = (page: Page, selector: string, tags: Tags) => {
  return page.evaluate(
    (selector, tags) => {
      const elems = document.querySelectorAll(selector)
      if (!elems.length) {
        throw new Error(`could not locate any matching element: ${selector}`)
      }
      elems.forEach((elem) => {
        Object.entries(tags).forEach(([key, value]) => {
          elem.setAttribute(key, value)
        })
      })
    },
    selector,
    tags as Record<string, string>
  )
}

const tagElementsWithContent = (
  page: Page,
  selector: string,
  tags: Tags,
  content: string
) => {
  return page.evaluate(
    (selector, tags, content) => {
      const elems = document.querySelectorAll(selector)
      if (!elems.length) {
        throw new Error(`could not locate any matching element: ${selector}`)
      }

      elems.forEach((elem) => {
        if (elem.innerHTML !== content) {
          return
        }
        Object.entries(tags).forEach(([key, value]) => {
          elem.setAttribute(key, value)
        })
      })
    },
    selector,
    tags as Record<string, string>,
    content
  )
}

export { tagElements, tagElementsWithContent }
