import { Page } from 'puppeteer'

interface Tags {
  'nate-action-type'?: 'click' | 'select' | 'input' | 'check'
  'nate-dict-key'?: string
}

const tagElements = async (page: Page, selector: string, tags: Tags) => {
    const handles = await page.$$(selector)
    if (!handles.length) {
        throw new Error(`could not locate any matching element: ${selector}`)
    }

    const addAttribute = (handle: Element, attribute: string, value: string) => {
        handle.setAttribute(attribute, value)
    }

    const ps: Promise<any>[] = []
    handles.forEach((handle) => {
        Object.entries(tags).forEach(([key, value]) => {
            const p = page.evaluate(addAttribute, handle, key, value)
            ps.push(p)
        })
    })

    await Promise.all(ps)
    return handles
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
