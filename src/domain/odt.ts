import type { TextMatch } from './declaration'
import { hasAncestor } from './xml'

const TEXT_NS = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'
const DRAW_NS = 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0'
const OFFICE_NS = 'urn:oasis:names:tc:opendocument:xmlns:office:1.0'

export interface OdtUnit {
  node: Text
  text: string
  start: number
  end: number
}

export interface OdtParagraph {
  element: Element
  location: string
  supported: boolean
  text: string
  units: OdtUnit[]
}

function isUnsupportedContainer(element: Element): boolean {
  if (element.namespaceURI === DRAW_NS && element.localName === 'text-box') {
    return true
  }
  if (element.namespaceURI === TEXT_NS && element.localName === 'note') {
    return true
  }
  return element.namespaceURI === OFFICE_NS && element.localName === 'annotation'
}

function isParagraph(element: Element): boolean {
  return (
    element.namespaceURI === TEXT_NS &&
    (element.localName === 'p' || element.localName === 'h')
  )
}

export function collectOdtParagraphs(doc: Document, location: string): OdtParagraph[] {
  const elements = Array.from(doc.getElementsByTagName('*'))
  const result: OdtParagraph[] = []

  for (const element of elements) {
    if (!isParagraph(element)) {
      continue
    }

    const supported = !hasAncestor(element, isUnsupportedContainer)
    const units: OdtUnit[] = []
    let offset = 0

    const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current !== null) {
      const textNode = current as Text
      if (supported && hasAncestor(textNode, isUnsupportedContainer)) {
        current = walker.nextNode()
        continue
      }
      const text = textNode.data
      if (text !== '') {
        units.push({
          node: textNode,
          text,
          start: offset,
          end: offset + text.length,
        })
        offset += text.length
      }
      current = walker.nextNode()
    }

    if (units.length === 0) {
      continue
    }

    result.push({
      element,
      location,
      supported,
      text: units.map((unit) => unit.text).join(''),
      units,
    })
  }

  return result
}

export function substituteOdtParagraph(
  paragraph: OdtParagraph,
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
  const firstOffset = match.start - first.start
  const target = first.node.splitText(firstOffset)
  const withinFirst = Math.min(match.end, first.end) - match.start
  target.splitText(withinFirst)

  const doc = paragraph.element.ownerDocument
  const fragment = doc.createDocumentFragment()
  const normalized = value.replace(/\r\n?/g, '\n')
  const segments = normalized.split('\n')

  for (let index = 0; index < segments.length; index += 1) {
    if (index > 0) {
      fragment.appendChild(doc.createElementNS(TEXT_NS, 'text:line-break'))
    }
    if (segments[index] !== '') {
      fragment.appendChild(doc.createTextNode(segments[index]))
    }
  }

  target.parentNode?.replaceChild(fragment, target)

  for (let index = firstIndex + 1; index < units.length; index += 1) {
    const unit = units[index]
    if (unit.start >= match.end) {
      break
    }
    if (unit.end <= match.end) {
      unit.node.parentNode?.removeChild(unit.node)
      continue
    }
    unit.node.deleteData(0, match.end - unit.start)
    break
  }
}
