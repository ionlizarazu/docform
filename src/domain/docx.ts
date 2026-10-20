import type { TextMatch } from './declaration'
import { hasAncestor } from './xml'

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

export interface DocxUnit {
  el: Element
  text: string
  start: number
  end: number
}

export interface DocxParagraph {
  element: Element
  location: string
  supported: boolean
  text: string
  units: DocxUnit[]
}

function isWordElement(element: Element, name: string): boolean {
  return element.namespaceURI === W_NS && element.localName === name
}

function isTextBoxContainer(element: Element): boolean {
  return isWordElement(element, 'txbxContent')
}

function nearestParagraph(node: Node): Element | null {
  let current: Node | null = node.parentNode
  while (current !== null) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as Element
      if (element.namespaceURI === W_NS && element.localName === 'p') {
        return element
      }
    }
    current = current.parentNode
  }
  return null
}

export function collectDocxParagraphs(doc: Document, location: string): DocxParagraph[] {
  const paragraphs = Array.from(doc.getElementsByTagNameNS(W_NS, 'p'))
  const result: DocxParagraph[] = []

  for (const paragraph of paragraphs) {
    const supported = !hasAncestor(paragraph, isTextBoxContainer)
    const units: DocxUnit[] = []
    let offset = 0

    for (const textElement of Array.from(paragraph.getElementsByTagNameNS(W_NS, 't'))) {
      if (nearestParagraph(textElement) !== paragraph) {
        continue
      }
      if (supported && hasAncestor(textElement, isTextBoxContainer)) {
        continue
      }
      const text = textElement.textContent ?? ''
      if (text === '') {
        continue
      }
      units.push({
        el: textElement,
        text,
        start: offset,
        end: offset + text.length,
      })
      offset += text.length
    }

    if (units.length === 0) {
      continue
    }

    result.push({
      element: paragraph,
      location,
      supported,
      text: units.map((unit) => unit.text).join(''),
      units,
    })
  }

  return result
}

function getRunProperties(run: Element): Element | null {
  for (const child of Array.from(run.children)) {
    if (isWordElement(child, 'rPr')) {
      return child
    }
  }
  return null
}

function createRun(doc: Document, properties: Element | null, text: string): Element {
  const run = doc.createElementNS(W_NS, 'w:r')
  if (properties !== null) {
    run.appendChild(properties.cloneNode(true))
  }
  const textElement = doc.createElementNS(W_NS, 'w:t')
  textElement.setAttribute('xml:space', 'preserve')
  textElement.textContent = text
  run.appendChild(textElement)
  return run
}

function createBreakRun(doc: Document, properties: Element | null): Element {
  const run = doc.createElementNS(W_NS, 'w:r')
  if (properties !== null) {
    run.appendChild(properties.cloneNode(true))
  }
  run.appendChild(doc.createElementNS(W_NS, 'w:br'))
  return run
}

function setText(element: Element, text: string): void {
  element.textContent = text
  if (/^\s|\s$/.test(text)) {
    element.setAttribute('xml:space', 'preserve')
  }
}

export function substituteDocxParagraph(
  paragraph: DocxParagraph,
  match: TextMatch,
  value: string,
): void {
  const { units } = paragraph
  const firstIndex = units.findIndex(
    (unit) => match.start >= unit.start && match.start < unit.end,
  )
  if (firstIndex === -1) {
    return
  }

  const first = units[firstIndex]
  const firstText = first.el.textContent ?? ''
  const firstOffset = match.start - first.start
  const before = firstText.slice(0, firstOffset)
  const endsInFirst = match.end <= first.end
  const after = endsInFirst ? firstText.slice(match.end - first.start) : ''
  const normalized = value.replace(/\r\n?/g, '\n')
  const segments = normalized.split('\n')

  setText(first.el, before + segments[0] + (segments.length === 1 && endsInFirst ? after : ''))

  for (let index = firstIndex + 1; index < units.length; index += 1) {
    const unit = units[index]
    if (unit.start >= match.end) {
      break
    }
    if (unit.end <= match.end) {
      setText(unit.el, '')
      continue
    }
    setText(unit.el, (unit.el.textContent ?? '').slice(match.end - unit.start))
    break
  }

  if (segments.length === 1) {
    return
  }

  const run = first.el.parentNode
  if (run === null) {
    return
  }
  const parent = run.parentNode
  if (parent === null) {
    return
  }

  const properties = getRunProperties(run as Element)
  const doc = paragraph.element.ownerDocument
  const cursor = run.nextSibling

  for (let index = 1; index < segments.length; index += 1) {
    parent.insertBefore(createBreakRun(doc, properties), cursor)
    if (segments[index] !== '') {
      parent.insertBefore(createRun(doc, properties, segments[index]), cursor)
    }
  }

  if (after !== '') {
    parent.insertBefore(createRun(doc, properties, after), cursor)
  }
}
