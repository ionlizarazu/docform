import { base64ToBytes, bytesToBase64, sha256Hex } from '../domain/encoding'
import {
  detectTemplateFormat,
  fillTemplate,
  MAX_UPLOAD_BYTES,
  parseTemplate,
} from '../domain/template'
import { MIME_TYPES, TemplateFormError } from '../domain/types'
import type {
  Answers,
  Field,
  FilledDocument,
  FormDefinition,
  FormPackage,
  FormSummary,
  FormView,
  IngestResult,
  StoredForm,
} from '../domain/types'
import type { FormStore } from '../storage/formStore'

export interface UploadFile {
  name: string
  size: number
  arrayBuffer(): Promise<ArrayBuffer>
  text?(): Promise<string>
}

function stripExtension(name: string): string {
  const stripped = name.replace(/\.[^.]+$/, '').trim()
  return stripped === '' ? name : stripped
}

function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim() || 'form'
}

function isField(value: unknown): value is Field {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  if (typeof candidate.label !== 'string' || candidate.label.trim() === '') {
    return false
  }
  if (
    candidate.kind !== 'text' &&
    candidate.kind !== 'textarea' &&
    candidate.kind !== 'select'
  ) {
    return false
  }
  if (candidate.kind === 'select') {
    return (
      Array.isArray(candidate.options) &&
      candidate.options.length > 0 &&
      candidate.options.every((option) => typeof option === 'string' && option !== '')
    )
  }
  return candidate.options === undefined
}

function parsePackage(text: string): FormPackage {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new TemplateFormError('invalid-package', 'The form package is not valid JSON.')
  }

  if (typeof value !== 'object' || value === null) {
    throw new TemplateFormError('invalid-package', 'The form package is missing its manifest.')
  }

  const candidate = value as Record<string, unknown>
  if (
    candidate.version !== 1 ||
    typeof candidate.route !== 'string' ||
    !/^[0-9a-f]{64}$/.test(candidate.route) ||
    typeof candidate.displayName !== 'string' ||
    candidate.displayName.trim() === '' ||
    typeof candidate.originalFilename !== 'string' ||
    (candidate.format !== 'docx' && candidate.format !== 'odt') ||
    typeof candidate.templateBase64 !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.createdAt)) ||
    typeof candidate.definition !== 'object' ||
    candidate.definition === null
  ) {
    throw new TemplateFormError('invalid-package', 'The form package manifest is incomplete.')
  }

  const definition = candidate.definition as Record<string, unknown>
  if (
    definition.route !== candidate.route ||
    definition.format !== candidate.format ||
    !Array.isArray(definition.fields) ||
    !definition.fields.every(isField)
  ) {
    throw new TemplateFormError(
      'invalid-package',
      'The form package definition does not match its template.',
    )
  }

  const labels = new Set(
    (definition.fields as Field[]).map((field) => field.label),
  )
  if (labels.size !== definition.fields.length) {
    throw new TemplateFormError(
      'invalid-package',
      'The form package definition contains duplicate labels.',
    )
  }

  return value as FormPackage
}

export interface FormsApi {
  ingest(file: UploadFile): Promise<IngestResult>
  list(): Promise<FormSummary[]>
  get(route: string): Promise<FormView | null>
  rename(route: string, displayName: string): Promise<void>
  remove(route: string): Promise<void>
  fill(route: string, answers: Answers): Promise<FilledDocument>
  exportPackage(route: string): Promise<{ blob: Blob; filename: string }>
  importPackage(file: UploadFile): Promise<IngestResult>
}

export class TemplateForms implements FormsApi {
  private readonly store: FormStore

  constructor(store: FormStore) {
    this.store = store
  }

  async ingest(file: UploadFile): Promise<IngestResult> {
    if (file.size > MAX_UPLOAD_BYTES) {
      return {
        ok: false,
        errors: [
          {
            code: 'too-large',
            message: `The file is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
          },
        ],
      }
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const route = await sha256Hex(bytes)
    const existing = await this.store.get(route)

    if (existing !== undefined) {
      return {
        ok: true,
        route,
        displayName: existing.displayName,
        definition: existing.definition,
        existed: true,
      }
    }

    const parsed = await parseTemplate(bytes, route)
    if (!parsed.ok) {
      return { ok: false, errors: parsed.errors }
    }

    const displayName = stripExtension(file.name)
    const record: StoredForm = {
      route,
      displayName,
      originalFilename: file.name,
      format: parsed.definition.format,
      definition: parsed.definition,
      template: bytes,
      createdAt: new Date().toISOString(),
    }
    await this.store.put(record)

    return {
      ok: true,
      route,
      displayName,
      definition: parsed.definition,
      existed: false,
    }
  }

  async list(): Promise<FormSummary[]> {
    const forms = await this.store.list()
    return forms
      .map(({ route, displayName, originalFilename, format, createdAt }) => ({
        route,
        displayName,
        originalFilename,
        format,
        createdAt,
      }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }

  async get(route: string): Promise<FormView | null> {
    const form = await this.store.get(route)
    if (form === undefined) {
      return null
    }
    return {
      route: form.route,
      displayName: form.displayName,
      originalFilename: form.originalFilename,
      format: form.format,
      createdAt: form.createdAt,
      definition: form.definition,
    }
  }

  async rename(route: string, displayName: string): Promise<void> {
    const trimmed = displayName.trim()
    if (trimmed === '') {
      throw new TemplateFormError('invalid-package', 'A display name cannot be empty.')
    }
    const form = await this.store.get(route)
    if (form === undefined) {
      throw new TemplateFormError('not-found', 'This form is not stored on this device.')
    }
    await this.store.put({ ...form, displayName: trimmed })
  }

  async remove(route: string): Promise<void> {
    await this.store.delete(route)
  }

  async fill(route: string, answers: Answers): Promise<FilledDocument> {
    const form = await this.store.get(route)
    if (form === undefined) {
      throw new TemplateFormError('not-found', 'This form is not stored on this device.')
    }

    for (const field of form.definition.fields) {
      if (field.kind !== 'select') {
        continue
      }
      const answer = answers.get(field.label) ?? ''
      if (answer !== '' && !(field.options ?? []).includes(answer)) {
        throw new TemplateFormError(
          'invalid-answer',
          `"${answer}" is not an option for "${field.label}".`,
        )
      }
    }

    const bytes = await fillTemplate(form.template, form.format, answers)
    const base = stripExtension(form.originalFilename)
    return {
      bytes,
      filename: `${safeFilename(base)}-filled.${form.format}`,
      mimeType: MIME_TYPES[form.format],
    }
  }

  async exportPackage(route: string): Promise<{ blob: Blob; filename: string }> {
    const form = await this.store.get(route)
    if (form === undefined) {
      throw new TemplateFormError('not-found', 'This form is not stored on this device.')
    }

    const packageValue: FormPackage = {
      version: 1,
      route: form.route,
      displayName: form.displayName,
      originalFilename: form.originalFilename,
      format: form.format,
      definition: form.definition,
      templateBase64: bytesToBase64(form.template),
      createdAt: form.createdAt,
    }

    return {
      blob: new Blob([JSON.stringify(packageValue, null, 2)], {
        type: 'application/json',
      }),
      filename: `${safeFilename(form.displayName)}.formpack.json`,
    }
  }

  async importPackage(file: UploadFile): Promise<IngestResult> {
    if (typeof file.text !== 'function') {
      return {
        ok: false,
        errors: [{ code: 'invalid-package', message: 'The package could not be read.' }],
      }
    }

    let packageValue: FormPackage
    try {
      packageValue = parsePackage(await file.text())
    } catch (error) {
      if (error instanceof TemplateFormError) {
        return { ok: false, errors: [{ code: error.code, message: error.message }] }
      }
      return {
        ok: false,
        errors: [{ code: 'invalid-package', message: 'The package could not be read.' }],
      }
    }

    let bytes: Uint8Array
    try {
      bytes = base64ToBytes(packageValue.templateBase64)
    } catch {
      return {
        ok: false,
        errors: [
          { code: 'invalid-package', message: 'The package template is not valid base64.' },
        ],
      }
    }

    if (bytes.byteLength > MAX_UPLOAD_BYTES) {
      return {
        ok: false,
        errors: [
          {
            code: 'too-large',
            message: `The package is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
          },
        ],
      }
    }

    const route = await sha256Hex(bytes)
    if (route !== packageValue.route) {
      return {
        ok: false,
        errors: [
          {
            code: 'invalid-package',
            message: 'The package route does not match its template contents.',
          },
        ],
      }
    }

    let detectedFormat: string | null
    try {
      detectedFormat = await detectTemplateFormat(bytes)
    } catch {
      detectedFormat = null
    }
    if (detectedFormat !== packageValue.format) {
      return {
        ok: false,
        errors: [
          {
            code: 'invalid-package',
            message: 'The package template is not the declared DOCX or ODT format.',
          },
        ],
      }
    }

    const existing = await this.store.get(route)
    if (existing !== undefined) {
      return {
        ok: true,
        route,
        displayName: existing.displayName,
        definition: existing.definition,
        existed: true,
      }
    }

    const definition: FormDefinition = {
      route,
      format: packageValue.format,
      fields: packageValue.definition.fields,
    }
    const record: StoredForm = {
      route,
      displayName: packageValue.displayName,
      originalFilename: packageValue.originalFilename,
      format: packageValue.format,
      definition,
      template: bytes,
      createdAt: packageValue.createdAt,
    }
    await this.store.put(record)

    return {
      ok: true,
      route,
      displayName: record.displayName,
      definition,
      existed: false,
    }
  }
}


