export function parseXml(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = doc.getElementsByTagName('parsererror')
  if (parserError.length > 0) {
    throw new Error(parserError[0]?.textContent ?? 'Invalid XML')
  }
  return doc
}

export function serializeXml(doc: Document): string {
  const serialized = new XMLSerializer()
    .serializeToString(doc)
    .replace(/^\uFEFF?\s*<\?xml[^>]*\?>\s*/, '')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${serialized}`
}

export function hasAncestor(node: Node, predicate: (element: Element) => boolean): boolean {
  let current: Node | null = node.parentNode
  while (current !== null) {
    if (current.nodeType === Node.ELEMENT_NODE && predicate(current as Element)) {
      return true
    }
    current = current.parentNode
  }
  return false
}
