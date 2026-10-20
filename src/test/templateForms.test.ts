import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { TemplateForms } from '../app/TemplateForms'
import type { UploadFile } from '../app/TemplateForms'
import { sha256Hex } from '../domain/encoding'
import { FormStore } from '../storage/formStore'
import {
  docxBytes,
  odtBytes,
  odtParagraph,
  odtSpan,
  odtText,
  paragraph,
  run,
  textBox,
} from './fixtures'

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

function upload(bytes: Uint8Array, name: string): UploadFile {
  return {
    name,
    size: bytes.byteLength,
    arrayBuffer: async () =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
  }
}

function textUpload(text: string, name: string): UploadFile {
  return {
    name,
    size: text.length,
    arrayBuffer: async () => new TextEncoder().encode(text).buffer as ArrayBuffer,
    text: async () => text,
  }
}

function makeForms(): TemplateForms {
  const databaseName = `template-form-test-${crypto.randomUUID()}`
  return new TemplateForms(new FormStore(databaseName))
}

async function readPart(bytes: Uint8Array, path: string): Promise<string> {
  const zip = await JSZip.loadAsync(bytes)
  const file = zip.file(path)
  if (file === null) {
    throw new Error(`Missing part ${path}`)
  }
  return file.async('string')
}

describe('TemplateForms ingest', () => {
  it('parses declarations, snapshots the definition, and dedupes bytes', async () => {
    const bytes = await docxBytes(
      [
        paragraph(run('Hello '), run('{{Name}}', { bold: true })),
        paragraph(run('{{Bio|textarea}}')),
        paragraph(run('{{Country[Spain;;France;;Other, with ; semicolon]}}')),
        paragraph(run('Again: {{Name}}')),
      ].join(''),
    )
    const forms = makeForms()
    const result = await forms.ingest(upload(bytes, 'contract.docx'))

    if (!result.ok) {
      throw new Error(JSON.stringify(result.errors))
    }

    expect(result.route).toBe(await sha256Hex(bytes))
    expect(result.displayName).toBe('contract')
    expect(result.definition.fields).toEqual([
      { label: 'Name', kind: 'text' },
      { label: 'Bio', kind: 'textarea' },
      {
        label: 'Country',
        kind: 'select',
        options: ['Spain', 'France', 'Other, with ; semicolon'],
      },
    ])

    const again = await forms.ingest(upload(bytes, 'contract.docx'))
    if (!again.ok) {
      throw new Error(JSON.stringify(again.errors))
    }
    expect(again.existed).toBe(true)

    const stored = await forms.get(result.route)
    expect(stored?.definition).toEqual(result.definition)
  })

  it('keeps the snapshotted definition even when the template is re-read', async () => {
    const bytes = await docxBytes(paragraph(run('{{Name}}')))
    const forms = makeForms()
    const result = await forms.ingest(upload(bytes, 'simple.docx'))
    if (!result.ok) {
      throw new Error('ingest failed')
    }

    const first = await forms.get(result.route)
    const second = await forms.get(result.route)
    expect(first?.definition).toEqual(second?.definition)
    expect(first?.definition.fields).toEqual([{ label: 'Name', kind: 'text' }])
  })

  it('rejects invalid templates with specific error codes', async () => {
    const cases: Array<{ name: string; bytes: Uint8Array; code: string }> = []

    cases.push({
      name: 'empty.docx',
      bytes: await docxBytes(paragraph(run('No placeholders here'))),
      code: 'no-placeholders',
    })
    cases.push({
      name: 'modifier.docx',
      bytes: await docxBytes(paragraph(run('{{Name|number}}'))),
      code: 'unknown-modifier',
    })
    cases.push({
      name: 'conflict.docx',
      bytes: await docxBytes(
        paragraph(run('{{Choice[One]}}')) + paragraph(run('{{Choice[Two]}}')),
      ),
      code: 'conflicting-label',
    })
    cases.push({
      name: 'empty-option.docx',
      bytes: await docxBytes(paragraph(run('{{Choice[]}}'))),
      code: 'empty-option',
    })
    cases.push({
      name: 'textbox.docx',
      bytes: await docxBytes(
        paragraph(run('{{Name}}')) +
          textBox(paragraph(run('{{InsideTextBox}}'))),
      ),
      code: 'unsupported-region',
    })
    cases.push({
      name: 'footnote.docx',
      bytes: await docxBytes(paragraph(run('{{Name}}')), {
        footnotes: `<w:footnote w:id="1">${paragraph(run('{{Note}}'))}</w:footnote>`,
      }),
      code: 'unsupported-region',
    })
    cases.push({
      name: 'broken.docx',
      bytes: new Uint8Array([1, 2, 3, 4]),
      code: 'invalid-format',
    })

    for (const testCase of cases) {
      const forms = makeForms()
      const result = await forms.ingest(upload(testCase.bytes, testCase.name))
      if (result.ok) {
        throw new Error(`Expected ${testCase.name} to be rejected`)
      }
      expect(
        result.errors.map((error) => error.code),
        testCase.name,
      ).toContain(testCase.code)
    }
  })

  it('rejects files above the size limit before reading them', async () => {
    const forms = makeForms()
    const result = await forms.ingest({
      name: 'huge.docx',
      size: 26 * 1024 * 1024,
      arrayBuffer: async () => new ArrayBuffer(0),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0].code).toBe('too-large')
    }
  })
})

describe('filled documents', () => {
  it('substitutes DOCX values everywhere, preserves formatting, and removes syntax', async () => {
    const bytes = await docxBytes(
      [
        paragraph(run('Hello '), run('{{Name}}', { bold: true })),
        paragraph(run('{{Bio|textarea}}')),
        paragraph(run('{{Country[Spain;;France]}}')),
        paragraph(run('Again: {{Name}}')),
      ].join(''),
    )
    const forms = makeForms()
    const ingested = await forms.ingest(upload(bytes, 'contract.docx'))
    if (!ingested.ok) {
      throw new Error(JSON.stringify(ingested.errors))
    }

    const filled = await forms.fill(
      ingested.route,
      new Map([
        ['Name', 'Ada'],
        ['Bio', 'Line one\nLine two'],
        ['Country', 'France'],
      ]),
    )

    expect(filled.filename).toBe('contract-filled.docx')
    const xml = await readPart(filled.bytes, 'word/document.xml')
    expect(xml.match(/<\?xml/g)).toHaveLength(1)
    expect(xml).not.toContain('{{')
    expect(xml).toContain('Line one')
    expect(xml).toContain('Line two')
    expect(xml).toContain('<w:br')
    expect(xml.match(/Ada/g)?.length).toBe(2)
    expect(xml).toContain('France')

    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    const runs = Array.from(doc.getElementsByTagNameNS(WORD_NS, 'r'))
    const adaRuns = runs.filter((element) => element.textContent?.includes('Ada'))
    expect(adaRuns).toHaveLength(2)
    expect(adaRuns[0].getElementsByTagNameNS(WORD_NS, 'b')).toHaveLength(1)
    expect(adaRuns[1].getElementsByTagNameNS(WORD_NS, 'b')).toHaveLength(0)
  })

  it('substitutes a blank answer with nothing', async () => {
    const bytes = await docxBytes(paragraph(run('A{{Name}}B')))
    const forms = makeForms()
    const ingested = await forms.ingest(upload(bytes, 'blank.docx'))
    if (!ingested.ok) {
      throw new Error(JSON.stringify(ingested.errors))
    }

    const filled = await forms.fill(ingested.route, new Map([['Name', '']]))
    const xml = await readPart(filled.bytes, 'word/document.xml')
    expect(xml).toContain('AB')
    expect(xml).not.toContain('{{')
  })

  it('substitutes ODT values across spans, in headers, and with line breaks', async () => {
    const bytes = await odtBytes(
      [
        odtParagraph(odtSpan('{{Na'), odtSpan('me}}')),
        odtParagraph(odtText('{{Bio|textarea}}')),
        odtParagraph(odtText('{{Country[Spain;;France]}}')),
      ].join(''),
      { header: odtParagraph(odtText('{{Title}}')) },
    )
    const forms = makeForms()
    const ingested = await forms.ingest(upload(bytes, 'letter.odt'))
    if (!ingested.ok) {
      throw new Error(JSON.stringify(ingested.errors))
    }

    expect(ingested.definition.fields).toEqual([
      { label: 'Name', kind: 'text' },
      { label: 'Bio', kind: 'textarea' },
      { label: 'Country', kind: 'select', options: ['Spain', 'France'] },
      { label: 'Title', kind: 'text' },
    ])

    const filled = await forms.fill(
      ingested.route,
      new Map([
        ['Name', 'Ada'],
        ['Bio', 'Line one\nLine two'],
        ['Country', 'Spain'],
        ['Title', 'Doctor'],
      ]),
    )

    expect(filled.filename).toBe('letter-filled.odt')
    const content = await readPart(filled.bytes, 'content.xml')
    const styles = await readPart(filled.bytes, 'styles.xml')
    expect(content.match(/<\?xml/g)).toHaveLength(1)
    expect(styles.match(/<\?xml/g)).toHaveLength(1)
    expect(content).not.toContain('{{')
    expect(content).toContain('Line one')
    expect(content).toContain('Line two')
    expect(content).toContain('<text:line-break')
    expect(content).toContain('Spain')
    expect(styles).toContain('Doctor')

    const zip = await JSZip.loadAsync(filled.bytes)
    expect(Object.keys(zip.files)[0]).toBe('mimetype')
    expect(await zip.file('mimetype')?.async('string')).toBe(
      'application/vnd.oasis.opendocument.text',
    )
  })

  it('rejects select answers outside the declared options', async () => {
    const bytes = await odtBytes(odtParagraph(odtText('{{Country[Spain;;France]}}')))
    const forms = makeForms()
    const ingested = await forms.ingest(upload(bytes, 'country.odt'))
    if (!ingested.ok) {
      throw new Error(JSON.stringify(ingested.errors))
    }

    await expect(
      forms.fill(ingested.route, new Map([['Country', 'Mars']])),
    ).rejects.toMatchObject({ code: 'invalid-answer' })
  })

  it('reports a missing route when filling', async () => {
    const forms = makeForms()
    await expect(forms.fill('missing', new Map())).rejects.toMatchObject({
      code: 'not-found',
    })
  })
})

describe('library and form packages', () => {
  it('lists, renames, exports, imports, and deletes forms', async () => {
    const bytes = await docxBytes(paragraph(run('{{Name}}')))
    const forms = makeForms()
    const ingested = await forms.ingest(upload(bytes, 'contract.docx'))
    if (!ingested.ok) {
      throw new Error(JSON.stringify(ingested.errors))
    }

    expect(await forms.list()).toHaveLength(1)
    await forms.rename(ingested.route, 'Employment contract')
    expect((await forms.get(ingested.route))?.displayName).toBe('Employment contract')

    const exported = await forms.exportPackage(ingested.route)
    expect(exported.filename).toBe('Employment contract.formpack.json')
    const text = await exported.blob.text()

    const otherForms = makeForms()
    const imported = await otherForms.importPackage(
      textUpload(text, 'Employment contract.formpack.json'),
    )
    if (!imported.ok) {
      throw new Error(JSON.stringify(imported.errors))
    }
    expect(imported.route).toBe(ingested.route)
    expect(imported.existed).toBe(false)
    expect((await otherForms.get(ingested.route))?.definition.fields).toEqual([
      { label: 'Name', kind: 'text' },
    ])

    const again = await otherForms.importPackage(
      textUpload(text, 'Employment contract.formpack.json'),
    )
    if (!again.ok) {
      throw new Error(JSON.stringify(again.errors))
    }
    expect(again.existed).toBe(true)

    await forms.remove(ingested.route)
    expect(await forms.get(ingested.route)).toBeNull()
  })

  it('rejects packages with malformed base64, format, or duplicate labels', async () => {
    const bytes = await docxBytes(paragraph(run('{{Name}}')))
    const forms = makeForms()
    const ingested = await forms.ingest(upload(bytes, 'contract.docx'))
    if (!ingested.ok) {
      throw new Error(JSON.stringify(ingested.errors))
    }
    const manifest = JSON.parse(
      await (await forms.exportPackage(ingested.route)).blob.text(),
    ) as Record<string, unknown>

    const malformed = await makeForms().importPackage(
      textUpload(JSON.stringify({ ...manifest, templateBase64: '***' }), 'bad.json'),
    )
    expect(malformed.ok).toBe(false)

    const wrongFormat = await makeForms().importPackage(
      textUpload(JSON.stringify({ ...manifest, format: 'odt' }), 'bad.json'),
    )
    expect(wrongFormat.ok).toBe(false)

    const duplicateLabels = await makeForms().importPackage(
      textUpload(
        JSON.stringify({
          ...manifest,
          definition: {
            ...(manifest.definition as Record<string, unknown>),
            fields: [
              { label: 'Name', kind: 'text' },
              { label: 'Name', kind: 'text' },
            ],
          },
        }),
        'bad.json',
      ),
    )
    expect(duplicateLabels.ok).toBe(false)
  })

  it('rejects a package whose route does not match its template', async () => {
    const bytes = await docxBytes(paragraph(run('{{Name}}')))
    const forms = makeForms()
    const ingested = await forms.ingest(upload(bytes, 'contract.docx'))
    if (!ingested.ok) {
      throw new Error(JSON.stringify(ingested.errors))
    }

    const exported = await forms.exportPackage(ingested.route)
    const manifest = JSON.parse(await exported.blob.text()) as Record<string, unknown>
    manifest.route = '0'.repeat(64)

    const result = await makeForms().importPackage(
      textUpload(JSON.stringify(manifest), 'bad.formpack.json'),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0].code).toBe('invalid-package')
    }
  })
})
