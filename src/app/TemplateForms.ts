import JSZip from 'jszip'
import { base64ToBytes, bytesToBase64, sha256Hex } from '../domain/encoding'
import {
  detectTemplateFormat,
  fillTemplate,
  MAX_UPLOAD_BYTES,
  parseTemplate,
} from '../domain/template'
import {
  MIME_TYPES,
  TemplateFormError,
  ZIP_MIME,
} from '../domain/types'
import type {
  Answers,
  Field,
  FilledDocument,
  FilledDocumentSet,
  FormDefinition,
  FormPackage,
  FormPackageV1,
  FormPackageV2,
  FormSummary,
  FormView,
  IngestResult,
  StoredForm,
  TemplateError,
  TemplateErrorParams,
  TemplateFormat,
  VariantDefinition,
} from '../domain/types'
import {
  fieldByLabel,
  normalizeLocale,
  primaryVariantOf,
  validateVariantDefinitions,
} from '../domain/variants'
import type { FormStore } from '../storage/formStore'

export interface UploadFile {
  name: string
  size: number
  arrayBuffer(): Promise<ArrayBuffer>
  text?(): Promise<string>
}

export interface UploadVariant {
  file: UploadFile
  locale: string
  primary?: boolean
}

const HASH_PATTERN = /^[0-9a-f]{64}$/

function stripExtension(name: string): string {
  const stripped = name.replace(/\.[^.]+$/, '').trim()
  return stripped === '' ? name : stripped
}

function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim() || 'form'
}

function stripLocaleSuffix(name: string, locale: string): string {
  const base = stripExtension(name)
  if (locale === 'und') {
    return base
  }
  const lower = base.toLowerCase()
  for (const suffix of [`.${locale}`, `_${locale}`, `-${locale}`]) {
    if (lower.endsWith(suffix)) {
      return base.slice(0, -suffix.length)
    }
  }
  return base
}

function isTemplateFormat(value: unknown): value is TemplateFormat {
  return value === 'docx' || value === 'odt'
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
      candidate.options.every((option) => typeof option === 'string' && option !== '') &&
      new Set(candidate.options).size === candidate.options.length
    )
  }
  return candidate.options === undefined
}

function isVariantDefinition(value: unknown): value is VariantDefinition {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  if (
    typeof candidate.locale !== 'string' ||
    normalizeLocale(candidate.locale) !== candidate.locale ||
    !isTemplateFormat(candidate.format) ||
    typeof candidate.templateHash !== 'string' ||
    !HASH_PATTERN.test(candidate.templateHash) ||
    !Array.isArray(candidate.fields) ||
    candidate.fields.length === 0 ||
    !candidate.fields.every(isField)
  ) {
    return false
  }
  const labels = new Set(
    (candidate.fields as Field[]).map((field) => field.label),
  )
  return labels.size === candidate.fields.length
}

function isFormDefinition(value: unknown, route: string): value is FormDefinition {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  if (
    candidate.route !== route ||
    typeof candidate.primaryLocale !== 'string' ||
    normalizeLocale(candidate.primaryLocale) !== candidate.primaryLocale ||
    !Array.isArray(candidate.variants) ||
    candidate.variants.length === 0 ||
    !candidate.variants.every(isVariantDefinition)
  ) {
    return false
  }
  const locales = new Set(
    (candidate.variants as VariantDefinition[]).map((variant) => variant.locale),
  )
  return (
    locales.size === candidate.variants.length &&
    locales.has(candidate.primaryLocale)
  )
}

function parsePackageV1(candidate: Record<string, unknown>): FormPackageV1 {
  if (
    candidate.version !== 1 ||
    typeof candidate.route !== 'string' ||
    !HASH_PATTERN.test(candidate.route) ||
    typeof candidate.displayName !== 'string' ||
    candidate.displayName.trim() === '' ||
    typeof candidate.originalFilename !== 'string' ||
    !isTemplateFormat(candidate.format) ||
    typeof candidate.templateBase64 !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.createdAt)) ||
    typeof candidate.definition !== 'object' ||
    candidate.definition === null
  ) {
    throw new TemplateFormError(
      'invalid-package',
      'The form package manifest is incomplete.',
      { detail: 'incomplete' },
    )
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
      { detail: 'definition-mismatch' },
    )
  }

  const labels = new Set((definition.fields as Field[]).map((field) => field.label))
  if (labels.size !== definition.fields.length) {
    throw new TemplateFormError(
      'invalid-package',
      'The form package definition contains duplicate labels.',
      { detail: 'duplicate-labels' },
    )
  }

  return candidate as unknown as FormPackageV1
}

function parsePackageV2(candidate: Record<string, unknown>): FormPackageV2 {
  if (
    candidate.version !== 2 ||
    typeof candidate.route !== 'string' ||
    !HASH_PATTERN.test(candidate.route) ||
    typeof candidate.displayName !== 'string' ||
    candidate.displayName.trim() === '' ||
    typeof candidate.originalFilename !== 'string' ||
    typeof candidate.primaryLocale !== 'string' ||
    normalizeLocale(candidate.primaryLocale) !== candidate.primaryLocale ||
    typeof candidate.createdAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.createdAt)) ||
    typeof candidate.definition !== 'object' ||
    !isFormDefinition(candidate.definition, candidate.route) ||
    candidate.definition.primaryLocale !== candidate.primaryLocale ||
    !Array.isArray(candidate.variants)
  ) {
    throw new TemplateFormError(
      'invalid-package',
      'The form package manifest is incomplete.',
      { detail: 'incomplete' },
    )
  }

  const definition = candidate.definition
  const packageVariants = candidate.variants as Array<Record<string, unknown>>
  const definitionLocales = new Set(
    definition.variants.map((variant) => variant.locale),
  )
  const packageLocales = new Set<string>()

  for (const variant of packageVariants) {
    if (
      typeof variant !== 'object' ||
      variant === null ||
      typeof variant.locale !== 'string' ||
      normalizeLocale(variant.locale) !== variant.locale ||
      !isTemplateFormat(variant.format) ||
      typeof variant.templateBase64 !== 'string'
    ) {
      throw new TemplateFormError(
        'invalid-package',
        'A package variant is missing its locale, format, or template.',
        { detail: 'variant-incomplete' },
      )
    }
    if (packageLocales.has(variant.locale)) {
      throw new TemplateFormError(
        'invalid-package',
        `The package contains the locale "${variant.locale}" more than once.`,
        {
          detail: 'duplicate-locale',
          params: { locale: variant.locale },
        },
      )
    }
    packageLocales.add(variant.locale)

    const declared = definition.variants.find(
      (item) => item.locale === variant.locale,
    )
    if (declared === undefined || declared.format !== variant.format) {
      throw new TemplateFormError(
        'invalid-package',
        `The package variant "${variant.locale}" does not match the form definition.`,
        {
          detail: 'variant-mismatch',
          params: { locale: variant.locale },
        },
      )
    }
  }

  if (
    packageLocales.size !== definitionLocales.size ||
    [...definitionLocales].some((locale) => !packageLocales.has(locale))
  ) {
    throw new TemplateFormError(
      'invalid-package',
      'The package variants do not match the form definition locales.',
      { detail: 'locale-set-mismatch' },
    )
  }

  return candidate as unknown as FormPackageV2
}

function parsePackage(text: string): FormPackage {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new TemplateFormError(
      'invalid-package',
      'The form package is not valid JSON.',
      { detail: 'not-json' },
    )
  }

  if (typeof value !== 'object' || value === null) {
    throw new TemplateFormError(
      'invalid-package',
      'The form package is missing its manifest.',
      { detail: 'missing-manifest' },
    )
  }

  const candidate = value as Record<string, unknown>
  if (candidate.version === 1) {
    return parsePackageV1(candidate)
  }
  if (candidate.version === 2) {
    return parsePackageV2(candidate)
  }
  throw new TemplateFormError(
    'invalid-package',
    'The form package uses an unsupported manifest version.',
    { detail: 'unsupported-version' },
  )
}

async function computeVariantRoute(
  variants: VariantDefinition[],
  primaryLocale: string,
): Promise<string> {
  if (variants.length === 1 && variants[0].locale === 'und') {
    return variants[0].templateHash
  }
  const manifest = [
    'docform:variant-set:v2',
    `primary:${primaryLocale}`,
    ...variants.map((variant) => `${variant.locale}:${variant.templateHash}`),
  ].join('\n')
  return sha256Hex(new TextEncoder().encode(manifest))
}

function failure(
  code: TemplateError['code'],
  message: string,
  detail?: string,
  params?: TemplateErrorParams,
): IngestResult {
  return { ok: false, errors: [{ code, detail, params, message }] }
}

export interface FormsApi {
  ingest(file: UploadFile): Promise<IngestResult>
  ingestVariants(variants: UploadVariant[]): Promise<IngestResult>
  list(): Promise<FormSummary[]>
  get(route: string): Promise<FormView | null>
  rename(route: string, displayName: string): Promise<void>
  remove(route: string): Promise<void>
  fill(route: string, answers: Answers): Promise<FilledDocumentSet>
  exportPackage(route: string): Promise<{ blob: Blob; filename: string }>
  importPackage(file: UploadFile): Promise<IngestResult>
}

export class TemplateForms implements FormsApi {
  private readonly store: FormStore

  constructor(store: FormStore) {
    this.store = store
  }

  async ingest(file: UploadFile): Promise<IngestResult> {
    return this.ingestVariants([{ file, locale: 'und', primary: true }])
  }

  async ingestVariants(input: UploadVariant[]): Promise<IngestResult> {
    if (input.length === 0) {
      return failure(
        'no-variants',
        'Add at least one language template.',
        'no-variants',
      )
    }

    const errors: TemplateError[] = []
    const seenLocales = new Set<string>()
    let primaryLocale: string | null = null

    interface PreparedVariant {
      locale: string
      file: UploadFile
      bytes: Uint8Array
      format: TemplateFormat
      fields: Field[]
      templateHash: string
      primary: boolean
    }

    const prepared: PreparedVariant[] = []

    for (const inputVariant of input) {
      const locale = normalizeLocale(inputVariant.locale)
      if (locale === null) {
        errors.push({
          code: 'invalid-locale',
          detail: 'invalid-locale',
          params: { locale: inputVariant.locale },
          message: `"${inputVariant.locale}" is not a valid locale code. Use a tag such as en, es, eu, or en-GB.`,
        })
        continue
      }
      if (seenLocales.has(locale)) {
        errors.push({
          code: 'duplicate-locale',
          detail: 'duplicate-locale',
          params: { locale },
          message: `The locale "${locale}" is used by more than one template.`,
        })
        continue
      }
      seenLocales.add(locale)

      if (inputVariant.file.size > MAX_UPLOAD_BYTES) {
        errors.push({
          code: 'too-large',
          detail: 'too-large',
          params: {
            maxMb: Math.round(MAX_UPLOAD_BYTES / (1024 * 1024)),
            path: inputVariant.file.name,
          },
          message: `"${inputVariant.file.name}" is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
          location: inputVariant.file.name,
        })
        continue
      }

      let bytes: Uint8Array
      try {
        bytes = new Uint8Array(await inputVariant.file.arrayBuffer())
      } catch {
        errors.push({
          code: 'invalid-format',
          detail: 'unreadable-file',
          params: { path: inputVariant.file.name },
          message: `"${inputVariant.file.name}" could not be read.`,
          location: inputVariant.file.name,
        })
        continue
      }

      const templateHash = await sha256Hex(bytes)
      const parsed = await parseTemplate(bytes, templateHash)
      if (!parsed.ok) {
        errors.push(
          ...parsed.errors.map((error) => ({
            ...error,
            location: error.location ?? inputVariant.file.name,
          })),
        )
        continue
      }

      if (inputVariant.primary === true) {
        if (primaryLocale !== null) {
          errors.push({
            code: 'invalid-locale',
            detail: 'multiple-primary',
            message: 'Choose exactly one primary language variant.',
          })
        } else {
          primaryLocale = locale
        }
      }

      prepared.push({
        locale,
        file: inputVariant.file,
        bytes,
        format: parsed.definition.format,
        fields: parsed.definition.fields,
        templateHash,
        primary: inputVariant.primary === true,
      })
    }

    if (errors.length > 0) {
      return { ok: false, errors }
    }

    if (prepared.length === 0) {
      return failure(
        'no-variants',
        'Add at least one language template.',
        'no-variants',
      )
    }

    if (primaryLocale === null) {
      primaryLocale = prepared[0].locale
      prepared[0].primary = true
    }

    const definitionVariants: VariantDefinition[] = prepared.map((variant) => ({
      locale: variant.locale,
      format: variant.format,
      templateHash: variant.templateHash,
      fields: variant.fields,
    }))

    const validationErrors = validateVariantDefinitions(
      definitionVariants,
      primaryLocale,
    )
    if (validationErrors.length > 0) {
      return { ok: false, errors: validationErrors }
    }

    const route = await computeVariantRoute(definitionVariants, primaryLocale)
    const existing = await this.store.get(route)
    if (existing !== undefined) {
      return {
        ok: true,
        route,
        displayName: existing.displayName,
        definition: existing.definition,
        primaryLocale: existing.primaryLocale,
        locales: existing.locales,
        existed: true,
      }
    }

    const primary = prepared.find((variant) => variant.locale === primaryLocale)
    if (primary === undefined) {
      return failure(
        'no-variants',
        'The primary language variant is missing.',
        'missing-primary',
        { primaryLocale },
      )
    }

    const displayName = stripLocaleSuffix(primary.file.name, primary.locale)
    const record: StoredForm = {
      route,
      displayName,
      originalFilename: primary.file.name,
      primaryLocale,
      locales: prepared.map((variant) => variant.locale),
      variantCount: prepared.length,
      definition: {
        route,
        primaryLocale,
        variants: definitionVariants,
      },
      templates: prepared.map((variant) => ({
        locale: variant.locale,
        format: variant.format,
        bytes: variant.bytes,
      })),
      createdAt: new Date().toISOString(),
    }

    await this.store.put(record)

    return {
      ok: true,
      route,
      displayName,
      definition: record.definition,
      primaryLocale,
      locales: record.locales,
      existed: false,
    }
  }

  async list(): Promise<FormSummary[]> {
    const forms = await this.store.list()
    return forms
      .map(
        ({
          route,
          displayName,
          originalFilename,
          primaryLocale,
          locales,
          variantCount,
          createdAt,
        }) => ({
          route,
          displayName,
          originalFilename,
          primaryLocale,
          locales,
          variantCount,
          createdAt,
        }),
      )
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
      primaryLocale: form.primaryLocale,
      locales: form.locales,
      variantCount: form.variantCount,
      createdAt: form.createdAt,
      definition: form.definition,
    }
  }

  async rename(route: string, displayName: string): Promise<void> {
    const trimmed = displayName.trim()
    if (trimmed === '') {
      throw new TemplateFormError(
        'invalid-package',
        'A display name cannot be empty.',
        { detail: 'empty-display-name' },
      )
    }
    const form = await this.store.get(route)
    if (form === undefined) {
      throw new TemplateFormError(
        'not-found',
        'This form is not stored on this device.',
        { detail: 'not-found' },
      )
    }
    await this.store.put({ ...form, displayName: trimmed })
  }

  async remove(route: string): Promise<void> {
    await this.store.delete(route)
  }

  async fill(route: string, answers: Answers): Promise<FilledDocumentSet> {
    const form = await this.store.get(route)
    if (form === undefined) {
      throw new TemplateFormError('not-found', 'This form is not stored on this device.')
    }

    const primary = primaryVariantOf(form.definition)

    for (const field of primary.fields) {
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

    const documents: FilledDocument[] = []
    const base = safeFilename(stripLocaleSuffix(form.originalFilename, form.primaryLocale))

    for (const variant of form.definition.variants) {
      const stored = form.templates.find((item) => item.locale === variant.locale)
      if (stored === undefined) {
        throw new TemplateFormError(
          'invalid-format',
          `The template for locale "${variant.locale}" is missing.`,
        )
      }

      const variantAnswers = new Map<string, string>()
      for (const field of variant.fields) {
        if (field.kind !== 'select') {
          variantAnswers.set(field.label, answers.get(field.label) ?? '')
          continue
        }

        const primaryField = fieldByLabel(primary.fields, field.label)
        if (primaryField === undefined) {
          throw new TemplateFormError(
            'variant-mismatch',
            `The field "${field.label}" is missing from the primary variant.`,
          )
        }

        const selected = answers.get(field.label) ?? ''
        if (selected === '') {
          variantAnswers.set(field.label, '')
          continue
        }

        const index = (primaryField.options ?? []).indexOf(selected)
        if (index === -1) {
          throw new TemplateFormError(
            'invalid-answer',
            `"${selected}" is not an option for "${field.label}".`,
          )
        }

        const option = (field.options ?? [])[index]
        if (option === undefined) {
          throw new TemplateFormError(
            'option-count-mismatch',
            `The select field "${field.label}" does not have an option at position ${index + 1} in "${variant.locale}".`,
          )
        }
        variantAnswers.set(field.label, option)
      }

      const bytes = await fillTemplate(stored.bytes, stored.format, variantAnswers)
      const legacySingle = form.variantCount === 1 && variant.locale === 'und'
      const filename = legacySingle
        ? `${base}-filled.${stored.format}`
        : `${base}-${variant.locale}-filled.${stored.format}`

      documents.push({
        bytes,
        filename,
        mimeType: MIME_TYPES[stored.format],
        format: stored.format,
        locale: variant.locale,
      })
    }

    let zip: { blob: Blob; filename: string } | null = null
    if (documents.length > 1) {
      const archive = new JSZip()
      for (const document of documents) {
        archive.file(document.filename, document.bytes)
      }
      const zipped = await archive.generateAsync({
        type: 'uint8array',
        compression: 'DEFLATE',
      })
      zip = {
        blob: new Blob([zipped.buffer as ArrayBuffer], { type: ZIP_MIME }),
        filename: `${base}.zip`,
      }
    }

    return { documents, zip }
  }

  async exportPackage(route: string): Promise<{ blob: Blob; filename: string }> {
    const form = await this.store.get(route)
    if (form === undefined) {
      throw new TemplateFormError(
        'not-found',
        'This form is not stored on this device.',
        { detail: 'not-found' },
      )
    }

    const variants = form.definition.variants.map((variant) => {
      const stored = form.templates.find((item) => item.locale === variant.locale)
      if (stored === undefined) {
        throw new TemplateFormError(
          'invalid-format',
          `The template for locale "${variant.locale}" is missing.`,
          {
            detail: 'missing-template',
            params: { locale: variant.locale },
          },
        )
      }
      return {
        locale: variant.locale,
        format: stored.format,
        templateBase64: bytesToBase64(stored.bytes),
      }
    })

    const packageValue: FormPackageV2 = {
      version: 2,
      route: form.route,
      displayName: form.displayName,
      originalFilename: form.originalFilename,
      primaryLocale: form.primaryLocale,
      definition: form.definition,
      variants,
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
      return failure(
        'invalid-package',
        'The package could not be read.',
        'unreadable-package',
      )
    }

    let packageValue: FormPackage
    try {
      packageValue = parsePackage(await file.text())
    } catch (error) {
      if (error instanceof TemplateFormError) {
        return failure(
          error.code,
          error.message,
          error.detail,
          error.params,
        )
      }
      return failure(
        'invalid-package',
        'The package could not be read.',
        'unreadable-package',
      )
    }

    if (packageValue.version === 1) {
      return this.importV1(packageValue)
    }
    return this.importV2(packageValue)
  }

  private async importV1(packageValue: FormPackageV1): Promise<IngestResult> {
    let bytes: Uint8Array
    try {
      bytes = base64ToBytes(packageValue.templateBase64)
    } catch {
      return failure(
        'invalid-package',
        'The package template is not valid base64.',
        'invalid-base64',
      )
    }
    if (bytes.byteLength > MAX_UPLOAD_BYTES) {
      return failure(
        'too-large',
        `The package is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
        'too-large',
        { maxMb: Math.round(MAX_UPLOAD_BYTES / (1024 * 1024)) },
      )
    }

    const route = await sha256Hex(bytes)
    if (route !== packageValue.route) {
      return failure(
        'invalid-package',
        'The package route does not match its template contents.',
        'route-mismatch',
      )
    }

    let detectedFormat: TemplateFormat
    try {
      detectedFormat = await detectTemplateFormat(bytes)
    } catch {
      return failure(
        'invalid-package',
        'The package template is not a DOCX or ODT file.',
        'wrong-format',
      )
    }
    if (detectedFormat !== packageValue.format) {
      return failure(
        'invalid-package',
        'The package template is not the declared DOCX or ODT format.',
        'wrong-format',
      )
    }

    const existing = await this.store.get(route)
    if (existing !== undefined) {
      return {
        ok: true,
        route,
        displayName: existing.displayName,
        definition: existing.definition,
        primaryLocale: existing.primaryLocale,
        locales: existing.locales,
        existed: true,
      }
    }

    const definition: FormDefinition = {
      route,
      primaryLocale: 'und',
      variants: [
        {
          locale: 'und',
          format: packageValue.format,
          templateHash: route,
          fields: packageValue.definition.fields,
        },
      ],
    }
    const record: StoredForm = {
      route,
      displayName: packageValue.displayName,
      originalFilename: packageValue.originalFilename,
      primaryLocale: 'und',
      locales: ['und'],
      variantCount: 1,
      definition,
      templates: [
        { locale: 'und', format: packageValue.format, bytes },
      ],
      createdAt: packageValue.createdAt,
    }
    await this.store.put(record)

    return {
      ok: true,
      route,
      displayName: record.displayName,
      definition,
      primaryLocale: 'und',
      locales: ['und'],
      existed: false,
    }
  }

  private async importV2(packageValue: FormPackageV2): Promise<IngestResult> {
    const templates: Array<{
      locale: string
      format: TemplateFormat
      bytes: Uint8Array
    }> = []
    const verifiedVariants: VariantDefinition[] = []

    for (const packageVariant of packageValue.variants) {
      const declared = packageValue.definition.variants.find(
        (variant) => variant.locale === packageVariant.locale,
      )
      if (declared === undefined) {
        return failure(
          'invalid-package',
          `The package variant "${packageVariant.locale}" has no form definition.`,
          'variant-missing',
          { locale: packageVariant.locale },
        )
      }

      let bytes: Uint8Array
      try {
        bytes = base64ToBytes(packageVariant.templateBase64)
      } catch {
        return failure(
          'invalid-package',
          'A package template is not valid base64.',
          'invalid-base64',
          { locale: packageVariant.locale },
        )
      }
      if (bytes.byteLength > MAX_UPLOAD_BYTES) {
        return failure(
          'too-large',
          `A package template is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
          'too-large',
          {
            maxMb: Math.round(MAX_UPLOAD_BYTES / (1024 * 1024)),
            locale: packageVariant.locale,
          },
        )
      }

      let detectedFormat: TemplateFormat
      try {
        detectedFormat = await detectTemplateFormat(bytes)
      } catch {
        return failure(
          'invalid-package',
          `The package template for "${packageVariant.locale}" is not a DOCX or ODT file.`,
          'wrong-format',
          { locale: packageVariant.locale },
        )
      }
      if (detectedFormat !== packageVariant.format || detectedFormat !== declared.format) {
        return failure(
          'invalid-package',
          `The package template for "${packageVariant.locale}" does not match its declared format.`,
          'wrong-format',
          { locale: packageVariant.locale },
        )
      }

      const templateHash = await sha256Hex(bytes)
      if (templateHash !== declared.templateHash) {
        return failure(
          'invalid-package',
          `The package template for "${packageVariant.locale}" does not match its recorded hash.`,
          'hash-mismatch',
          { locale: packageVariant.locale },
        )
      }

      verifiedVariants.push({
        ...declared,
        templateHash,
      })
      templates.push({
        locale: packageVariant.locale,
        format: detectedFormat,
        bytes,
      })
    }

    if (verifiedVariants.length !== packageValue.definition.variants.length) {
      return failure(
        'invalid-package',
        'The package variants do not match the form definition locales.',
        'locale-set-mismatch',
      )
    }

    const validationErrors = validateVariantDefinitions(
      verifiedVariants,
      packageValue.primaryLocale,
    )
    if (validationErrors.length > 0) {
      return { ok: false, errors: validationErrors }
    }

    const route = await computeVariantRoute(
      verifiedVariants,
      packageValue.primaryLocale,
    )
    if (route !== packageValue.route) {
      return failure(
        'invalid-package',
        'The package route does not match its variant set.',
        'route-mismatch',
      )
    }

    const existing = await this.store.get(route)
    if (existing !== undefined) {
      return {
        ok: true,
        route,
        displayName: existing.displayName,
        definition: existing.definition,
        primaryLocale: existing.primaryLocale,
        locales: existing.locales,
        existed: true,
      }
    }

    const definition: FormDefinition = {
      route,
      primaryLocale: packageValue.primaryLocale,
      variants: verifiedVariants,
    }
    const record: StoredForm = {
      route,
      displayName: packageValue.displayName,
      originalFilename: packageValue.originalFilename,
      primaryLocale: packageValue.primaryLocale,
      locales: verifiedVariants.map((variant) => variant.locale),
      variantCount: verifiedVariants.length,
      definition,
      templates,
      createdAt: packageValue.createdAt,
    }
    await this.store.put(record)

    return {
      ok: true,
      route,
      displayName: record.displayName,
      definition,
      primaryLocale: record.primaryLocale,
      locales: record.locales,
      existed: false,
    }
  }
}
