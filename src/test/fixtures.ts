import JSZip from 'jszip'

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const OFFICE_NS = 'urn:oasis:names:tc:opendocument:xmlns:office:1.0'
const TEXT_NS = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'
const DRAW_NS = 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0'
const STYLE_NS = 'urn:oasis:names:tc:opendocument:xmlns:style:1.0'
const MANIFEST_NS = 'urn:oasis:names:tc:opendocument:xmlns:manifest:1.0'

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function run(text: string, options: { bold?: boolean } = {}): string {
  const properties = options.bold ? '<w:rPr><w:b/></w:rPr>' : ''
  return `<w:r>${properties}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`
}

export function paragraph(...runs: string[]): string {
  return `<w:p>${runs.join('')}</w:p>`
}

export function textBox(inner: string): string {
  return `<w:p><w:r><w:drawing><w:txbxContent>${inner}</w:txbxContent></w:drawing></w:r></w:p>`
}

export interface DocxOptions {
  header?: string
  footer?: string
  footnotes?: string
  extraBody?: string
}

export async function docxBytes(body: string, options: DocxOptions = {}): Promise<Uint8Array> {
  const zip = new JSZip()
  const headerRelationship =
    options.header !== undefined
      ? '<Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>'
      : ''
  const footerRelationship =
    options.footer !== undefined
      ? '<Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
      : ''
  const headerReference =
    options.header !== undefined
      ? '<w:headerReference w:type="default" r:id="rIdHeader"/>'
      : ''
  const footerReference =
    options.footer !== undefined
      ? '<w:footerReference w:type="default" r:id="rIdFooter"/>'
      : ''

  const overrides = [
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
    options.header !== undefined
      ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
      : '',
    options.footer !== undefined
      ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
      : '',
    options.footnotes !== undefined
      ? '<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>'
      : '',
  ].join('')

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides}</Types>`,
  )
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  )
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${WORD_NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}${options.extraBody ?? ''}<w:sectPr>${headerReference}${footerReference}</w:sectPr></w:body></w:document>`,
  )
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${headerRelationship}${footerRelationship}</Relationships>`,
  )

  if (options.header !== undefined) {
    zip.file(
      'word/header1.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="${WORD_NS}">${options.header}</w:hdr>`,
    )
  }
  if (options.footer !== undefined) {
    zip.file(
      'word/footer1.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="${WORD_NS}">${options.footer}</w:ftr>`,
    )
  }
  if (options.footnotes !== undefined) {
    zip.file(
      'word/footnotes.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:footnotes xmlns:w="${WORD_NS}">${options.footnotes}</w:footnotes>`,
    )
  }

  return zip.generateAsync({ type: 'uint8array' })
}

export function odtText(value: string): string {
  return escapeXml(value)
}

export function odtSpan(value: string): string {
  return `<text:span>${escapeXml(value)}</text:span>`
}

export function odtParagraph(...content: string[]): string {
  return `<text:p>${content.join('')}</text:p>`
}

export interface OdtOptions {
  header?: string
  footer?: string
}

export async function odtBytes(
  content: string,
  options: OdtOptions = {},
): Promise<Uint8Array> {
  const zip = new JSZip()
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', {
    compression: 'STORE',
  })
  zip.file(
    'META-INF/manifest.xml',
    `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="${MANIFEST_NS}" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/></manifest:manifest>`,
  )
  zip.file(
    'content.xml',
    `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="${OFFICE_NS}" xmlns:text="${TEXT_NS}" xmlns:draw="${DRAW_NS}" xmlns:style="${STYLE_NS}" office:version="1.2"><office:body><office:text>${content}</office:text></office:body></office:document-content>`,
  )
  const header =
    options.header !== undefined
      ? `<style:header>${options.header}</style:header>`
      : ''
  const footer =
    options.footer !== undefined
      ? `<style:footer>${options.footer}</style:footer>`
      : ''
  zip.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8"?><office:document-styles xmlns:office="${OFFICE_NS}" xmlns:text="${TEXT_NS}" xmlns:draw="${DRAW_NS}" xmlns:style="${STYLE_NS}" office:version="1.2"><office:styles/><office:automatic-styles/><office:master-styles><style:master-page style:name="Standard">${header}${footer}</style:master-page></office:master-styles></office:document-styles>`,
  )
  return zip.generateAsync({ type: 'uint8array' })
}

export function fileFrom(bytes: Uint8Array, name: string): File {
  const copy = new Uint8Array(bytes)
  return new File([copy.buffer as ArrayBuffer], name)
}

export function textFileFrom(text: string, name: string): File {
  return new File([text], name, { type: 'application/json' })
}
