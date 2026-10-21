import JSZip from 'jszip'
import { collectFields, parseDeclaration, scanDeclarations } from './declaration'
import { collectDocxParagraphs, substituteDocxParagraph } from './docx'
import { collectOdtParagraphs, substituteOdtParagraph } from './odt'
import { parseXml, serializeXml } from './xml'
import { MIME_TYPES, TemplateFormError } from './types'
import type {
  Answers,
  Field,
  TemplateError,
  TemplateErrorDetail,
  TemplateFormat,
} from './types'

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

const DOCX_HEADER = /^word\/header\d*\.xml$/
const DOCX_FOOTER = /^word\/footer\d*\.xml$/
const DOCX_UNSUPPORTED = [
  'word/footnotes.xml',
  'word/endnotes.xml',
  'word/comments.xml',
]

interface DetectedTemplate {
  format: TemplateFormat
  zip: JSZip
}

function invalidFormat(
  message: string,
  detail: TemplateErrorDetail,
  params?: { path?: string },
): TemplateFormError {
  return new TemplateFormError('invalid-format', message, { detail, params })
}

function numericSuffix(path: string): number {
  const match = path.match(/(\d+)\.xml$/)
  return match ? Number(match[1]) : 0
}

export async function detectTemplate(bytes: Uint8Array): Promise<DetectedTemplate> {
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new TemplateFormError(
      'too-large',
      `The file is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
      {
        detail: 'too-large',
        params: { maxMb: Math.round(MAX_UPLOAD_BYTES / (1024 * 1024)) },
      },
    )
  }

  if (
    bytes.byteLength < 4 ||
    bytes[0] !== 0x50 ||
    bytes[1] !== 0x4b ||
    bytes[2] !== 0x03 ||
    bytes[3] !== 0x04
  ) {
    throw invalidFormat(
      'This file is not a DOCX or ODT package.',
      'not-a-package',
    )
  }

  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw invalidFormat(
      'This file is not a readable DOCX or ODT package.',
      'unreadable-package',
    )
  }

  const contentTypes = zip.file('[Content_Types].xml')
  if (contentTypes !== null && zip.file('word/document.xml') !== null) {
    const content = await contentTypes.async('string')
    if (
      zip.file('word/vbaProject.bin') !== null ||
      /macroEnabled|vbaProject/i.test(content)
    ) {
      throw invalidFormat(
        'Macro-enabled documents are not supported. Save a .docx without macros.',
        'macro-enabled',
      )
    }
    if (!/wordprocessingml\.document(?:\.main)?\+xml/.test(content)) {
      throw invalidFormat(
        'This package is not a Word text document.',
        'not-word',
      )
    }
    return { format: 'docx', zip }
  }

  const mimetypeFile = zip.file('mimetype')
  if (mimetypeFile !== null && zip.file('content.xml') !== null) {
    const mimetype = (await mimetypeFile.async('string')).trim()
    if (mimetype === MIME_TYPES.odt) {
      return { format: 'odt', zip }
    }
    if (mimetype.startsWith('application/vnd.oasis.opendocument.')) {
      throw invalidFormat(
        'Only ODT text documents are supported.',
        'only-odt',
      )
    }
  }

  throw invalidFormat(
    'This package is not a DOCX or ODT text document.',
    'not-text-document',
  )
}

function supportedParts(zip: JSZip, format: TemplateFormat): string[] {
  if (format === 'docx') {
    const headers = Object.keys(zip.files)
      .filter((path) => DOCX_HEADER.test(path))
      .sort((a, b) => numericSuffix(a) - numericSuffix(b))
    const footers = Object.keys(zip.files)
      .filter((path) => DOCX_FOOTER.test(path))
      .sort((a, b) => numericSuffix(a) - numericSuffix(b))
    return ['word/document.xml', ...headers, ...footers]
  }
  return ['content.xml', 'styles.xml']
}

interface ParagraphText {
  location: string
  supported: boolean
  text: string
}

async function collectParagraphs(
  zip: JSZip,
  format: TemplateFormat,
): Promise<{ paragraphs: ParagraphText[]; errors: TemplateError[] }> {
  const paragraphs: ParagraphText[] = []
  const errors: TemplateError[] = []

  const readPart = async (path: string, forceUnsupported: boolean) => {
    const file = zip.file(path)
    if (file === null) {
      return
    }
    let doc: Document
    try {
      doc = parseXml(await file.async('string'))
    } catch {
      errors.push({
        code: 'invalid-format',
        detail: 'invalid-xml',
        params: { path },
        message: `The package part "${path}" is not valid XML.`,
        location: path,
      })
      return
    }

    if (format === 'docx') {
      for (const paragraph of collectDocxParagraphs(doc, path)) {
        paragraphs.push({
          location: path,
          supported: forceUnsupported ? false : paragraph.supported,
          text: paragraph.text,
        })
      }
    } else {
      for (const paragraph of collectOdtParagraphs(doc, path)) {
        paragraphs.push({
          location: path,
          supported: forceUnsupported ? false : paragraph.supported,
          text: paragraph.text,
        })
      }
    }
  }

  for (const path of supportedParts(zip, format)) {
    await readPart(path, false)
  }

  if (format === 'docx') {
    for (const path of DOCX_UNSUPPORTED) {
      await readPart(path, true)
    }
  }

  return { paragraphs, errors }
}

export interface ParsedTemplate {
  route: string
  format: TemplateFormat
  fields: Field[]
}

export async function detectTemplateFormat(bytes: Uint8Array): Promise<TemplateFormat> {
  const detected = await detectTemplate(bytes)
  return detected.format
}

export async function parseTemplate(
  bytes: Uint8Array,
  route: string,
): Promise<
  { ok: true; definition: ParsedTemplate } | { ok: false; errors: TemplateError[] }
> {
  let detected: DetectedTemplate
  try {
    detected = await detectTemplate(bytes)
  } catch (error) {
    if (error instanceof TemplateFormError) {
      return {
        ok: false,
        errors: [
          {
            code: error.code,
            detail: error.detail,
            params: error.params,
            message: error.message,
            label: error.label,
            location: error.location,
          },
        ],
      }
    }
    return {
      ok: false,
      errors: [
        {
          code: 'invalid-format',
          detail: 'unreadable-template',
          message: 'The template could not be read.',
        },
      ],
    }
  }

  const { paragraphs, errors } = await collectParagraphs(detected.zip, detected.format)
  const fields: Field[] = []
  const seen = new Map<string, string>()

  for (const paragraph of paragraphs) {
    const scan = scanDeclarations(paragraph.text)
    if (!paragraph.supported) {
      if (scan.matches.length > 0 || scan.errors.length > 0 || paragraph.text.includes('{{')) {
        errors.push({
          code: 'unsupported-region',
          detail: 'unsupported-region',
          params: { location: paragraph.location },
          message: `A placeholder in "${paragraph.location}" is outside the supported regions. Move it into the document body, a table, a header, or a footer.`,
          location: paragraph.location,
        })
      }
      continue
    }
    errors.push(...collectFields(scan, fields, seen))
  }

  if (errors.length === 0 && fields.length === 0) {
    errors.push({
      code: 'no-placeholders',
      detail: 'no-placeholders',
      message:
        'This template has no placeholders. Add at least one {{Label}} declaration.',
    })
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    definition: {
      route,
      format: detected.format,
      fields,
    },
  }
}

async function fillDocx(
  zip: JSZip,
  answers: Answers,
): Promise<Uint8Array> {
  for (const path of supportedParts(zip, 'docx')) {
    const file = zip.file(path)
    if (file === null) {
      continue
    }
    const doc = parseXml(await file.async('string'))
    let changed = false

    for (const paragraph of collectDocxParagraphs(doc, path)) {
      if (!paragraph.supported) {
        continue
      }
      const scan = scanDeclarations(paragraph.text)
      for (let index = scan.matches.length - 1; index >= 0; index -= 1) {
        const match = scan.matches[index]
        const parsed = parseDeclaration(match.raw)
        if (!parsed.ok) {
          continue
        }
        substituteDocxParagraph(paragraph, match, answers.get(parsed.declaration.label) ?? '')
        changed = true
      }
    }

    if (changed) {
      zip.file(path, serializeXml(doc))
    }
  }

  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    mimeType: MIME_TYPES.docx,
  })
}

async function fillOdt(zip: JSZip, answers: Answers): Promise<Uint8Array> {
  const modified = new Map<string, string>()

  for (const path of supportedParts(zip, 'odt')) {
    const file = zip.file(path)
    if (file === null) {
      continue
    }
    const doc = parseXml(await file.async('string'))
    let changed = false

    for (const paragraph of collectOdtParagraphs(doc, path)) {
      if (!paragraph.supported) {
        continue
      }
      const scan = scanDeclarations(paragraph.text)
      for (let index = scan.matches.length - 1; index >= 0; index -= 1) {
        const match = scan.matches[index]
        const parsed = parseDeclaration(match.raw)
        if (!parsed.ok) {
          continue
        }
        substituteOdtParagraph(paragraph, match, answers.get(parsed.declaration.label) ?? '')
        changed = true
      }
    }

    if (changed) {
      modified.set(path, serializeXml(doc))
    }
  }

  const output = new JSZip()
  const mimetypeFile = zip.file('mimetype')
  const mimetype = mimetypeFile
    ? (await mimetypeFile.async('string')).trim()
    : MIME_TYPES.odt
  output.file('mimetype', mimetype, { compression: 'STORE' })

  for (const [path, file] of Object.entries(zip.files)) {
    if (path === 'mimetype') {
      continue
    }
    if (file.dir) {
      output.folder(path)
      continue
    }
    const contents = modified.get(path)
    output.file(path, contents ?? (await file.async('uint8array')))
  }

  return output.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    mimeType: MIME_TYPES.odt,
  })
}

export async function fillTemplate(
  bytes: Uint8Array,
  format: TemplateFormat,
  answers: Answers,
): Promise<Uint8Array> {
  let detected: DetectedTemplate
  try {
    detected = await detectTemplate(bytes)
  } catch (error) {
    if (error instanceof TemplateFormError) {
      throw error
    }
    throw new TemplateFormError(
      'invalid-format',
      'The template could not be read.',
      { detail: 'unreadable-template' },
    )
  }

  if (detected.format !== format) {
    throw new TemplateFormError(
      'invalid-format',
      'The stored format does not match the template package.',
      { detail: 'format-mismatch' },
    )
  }

  return format === 'docx'
    ? fillDocx(detected.zip, answers)
    : fillOdt(detected.zip, answers)
}
