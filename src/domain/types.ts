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

export interface TemplateError {
  code: TemplateErrorCode
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

  constructor(code: TemplateErrorCode, message: string) {
    super(message)
    this.name = 'TemplateFormError'
    this.code = code
  }
}
