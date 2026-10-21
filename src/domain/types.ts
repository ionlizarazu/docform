export type TemplateFormat = 'docx' | 'odt'

export type FieldKind = 'text' | 'textarea' | 'select'

export interface Field {
  label: string
  kind: FieldKind
  options?: string[]
}

export interface VariantDefinition {
  locale: string
  format: TemplateFormat
  templateHash: string
  fields: Field[]
}

export interface FormDefinition {
  route: string
  primaryLocale: string
  variants: VariantDefinition[]
}

export type Answers = ReadonlyMap<string, string>

export type TemplateErrorCode =
  | 'invalid-format'
  | 'too-large'
  | 'no-placeholders'
  | 'malformed-placeholder'
  | 'unknown-modifier'
  | 'empty-label'
  | 'empty-option'
  | 'conflicting-label'
  | 'unsupported-region'
  | 'not-found'
  | 'invalid-answer'
  | 'invalid-package'
  | 'no-variants'
  | 'invalid-locale'
  | 'duplicate-locale'
  | 'variant-mismatch'
  | 'option-count-mismatch'

export type TemplateErrorDetail =
  | 'closing-bracket-without-opening'
  | 'conflicting-label'
  | 'definition-mismatch'
  | 'duplicate-labels'
  | 'duplicate-locale'
  | 'empty-display-name'
  | 'empty-label'
  | 'empty-option'
  | 'format-mismatch'
  | 'hash-mismatch'
  | 'incomplete'
  | 'invalid-answer'
  | 'invalid-base64'
  | 'invalid-locale'
  | 'invalid-textarea'
  | 'invalid-xml'
  | 'kind-mismatch'
  | 'label-set-mismatch'
  | 'locale-set-mismatch'
  | 'macro-enabled'
  | 'missing-closing-bracket'
  | 'missing-double-brace'
  | 'missing-field'
  | 'missing-manifest'
  | 'missing-option-at-index'
  | 'missing-primary'
  | 'missing-template'
  | 'modifier-with-options'
  | 'multiple-option-lists'
  | 'multiple-primary'
  | 'nested-open'
  | 'no-placeholders'
  | 'no-variants'
  | 'not-a-package'
  | 'not-found'
  | 'not-json'
  | 'not-text-document'
  | 'not-word'
  | 'only-odt'
  | 'option-closing-bracket'
  | 'option-count-mismatch'
  | 'route-mismatch'
  | 'text-after-options'
  | 'too-large'
  | 'unexpected'
  | 'unknown-modifier'
  | 'unreadable-file'
  | 'unreadable-package'
  | 'unreadable-template'
  | 'unsupported-region'
  | 'unsupported-version'
  | 'variant-incomplete'
  | 'variant-mismatch'
  | 'variant-missing'
  | 'wrong-format'

export interface TemplateErrorParams {
  locale?: string
  primaryLocale?: string
  label?: string
  missing?: string[]
  extra?: string[]
  count?: number
  primaryCount?: number
  variantCount?: number
  maxMb?: number
  placeholder?: string
  modifier?: string
  path?: string
  location?: string
  answer?: string
  index?: number
  kind?: FieldKind
  primaryKind?: FieldKind
  variantKind?: FieldKind
}

export interface TemplateError {
  code: TemplateErrorCode
  detail?: TemplateErrorDetail
  params?: TemplateErrorParams
  message: string
  label?: string
  location?: string
}

export interface FormSummary {
  route: string
  displayName: string
  originalFilename: string
  primaryLocale: string
  locales: string[]
  variantCount: number
  createdAt: string
}

export interface FormView extends FormSummary {
  definition: FormDefinition
}

export interface StoredTemplateVariant {
  locale: string
  format: TemplateFormat
  bytes: Uint8Array
}

export interface StoredForm extends FormView {
  templates: StoredTemplateVariant[]
}

export type StoredFormMeta = Omit<StoredForm, 'templates'>

export type IngestResult =
  | {
      ok: true
      route: string
      displayName: string
      definition: FormDefinition
      primaryLocale: string
      locales: string[]
      existed: boolean
    }
  | {
      ok: false
      errors: TemplateError[]
    }

export interface FilledDocument {
  bytes: Uint8Array
  filename: string
  mimeType: string
  format: TemplateFormat
  locale: string
}

export interface FilledDocumentSet {
  documents: FilledDocument[]
  zip: { blob: Blob; filename: string } | null
}

export interface FormDefinitionV1 {
  route: string
  format: TemplateFormat
  fields: Field[]
}

export interface FormPackageV1 {
  version: 1
  route: string
  displayName: string
  originalFilename: string
  format: TemplateFormat
  definition: FormDefinitionV1
  templateBase64: string
  createdAt: string
}

export interface FormPackageV2 {
  version: 2
  route: string
  displayName: string
  originalFilename: string
  primaryLocale: string
  definition: FormDefinition
  variants: Array<{
    locale: string
    format: TemplateFormat
    templateBase64: string
  }>
  createdAt: string
}

export type FormPackage = FormPackageV1 | FormPackageV2

export const MIME_TYPES: Record<TemplateFormat, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
}

export const ZIP_MIME = 'application/zip'

export class TemplateFormError extends Error {
  code: TemplateErrorCode
  detail?: TemplateErrorDetail
  params?: TemplateErrorParams
  label?: string
  location?: string

  constructor(
    code: TemplateErrorCode,
    message: string,
    options: {
      detail?: TemplateErrorDetail
      params?: TemplateErrorParams
      label?: string
      location?: string
    } = {},
  ) {
    super(message)
    this.name = 'TemplateFormError'
    this.code = code
    this.detail = options.detail
    this.params = options.params
    this.label = options.label
    this.location = options.location
  }
}
