import { Page } from 'puppeteer'

interface Tags {
  'nate-action-type'?: 'click' | 'select' | 'input' | 'check'
  'nate-dict-key'?: string
}

const tagElement = async (page: Page, selector: string, tags: Tags) => {
  const handles = await page.$$(selector)
  if (!handles.length) {
    throw Error(`could not locate any matching element: ${selector}`)
  }

  if (handles.length > 1) {
    throw Error(`found more than one matching element: ${selector}`)
  }

  const element = handles[0]

  const addAttribute = (elem: Element, attribute: string, value: string) => {
    elem.setAttribute(attribute, value)
  }

  const ps: Promise<any>[] = []
  Object.entries(tags).forEach(([key, value]) => {
    const p = page.evaluate(addAttribute, element, key, value)
    ps.push(p)
  })

  await Promise.all(ps)
  return element
}

const tagElementWithContent = async (
  page: Page,
  selector: string,
  tags: Tags,
  content: string
) => {
  const handles = await page.$$(selector)
  const elems = []

  const filterByContent = (handle: Element, text: string) => (handle.innerHTML === text)

  for (const handle of handles) {
    const hasContent = await page.evaluate(filterByContent, handle, content)
    if (hasContent) {
      elems.push(handle)
    }
  }

  if (!elems.length) {
    throw Error(
      `could not locate any matching element with content [${content}]: ${selector}`
    )
  }

  if (elems.length > 1) {
    throw Error(
      `found more than one matching element with content [${content}]: ${selector}`
    )
  }

  const element = elems[0]

  const addAttribute = (elem: Element, attribute: string, value: string) => {
    elem.setAttribute(attribute, value)
  }

  const ps: Promise<any>[] = []
  Object.entries(tags).forEach(([key, value]) => {
    const p = page.evaluate(addAttribute, element, key, value)
    ps.push(p)
  })

  await Promise.all(ps)
  return element
}

export { tagElement, tagElementWithContent }
