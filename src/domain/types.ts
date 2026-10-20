export type TemplateFormat = 'docx' | 'odt'

export type FieldKind = 'text' | 'textarea' | 'select'

export interface Field {
  label: string
  kind: FieldKind
  options?: string[]
}

export interface FormDefinition {
  route: string
  format: TemplateFormat
  fields: Field[]
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
  format: TemplateFormat
  createdAt: string
}

export interface FormView extends FormSummary {
  definition: FormDefinition
}

export interface StoredForm extends FormView {
  template: Uint8Array
}

export type StoredFormMeta = Omit<StoredForm, 'template'>

export type IngestResult =
  | {
      ok: true
      route: string
      displayName: string
      definition: FormDefinition
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
}

export interface FormPackage {
  version: 1
  route: string
  displayName: string
  originalFilename: string
  format: TemplateFormat
  definition: FormDefinition
  templateBase64: string
  createdAt: string
}

export const MIME_TYPES: Record<TemplateFormat, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
}

export class TemplateFormError extends Error {
  code: TemplateErrorCode

  constructor(code: TemplateErrorCode, message: string) {
    super(message)
    this.name = 'TemplateFormError'
    this.code = code
  }
}
