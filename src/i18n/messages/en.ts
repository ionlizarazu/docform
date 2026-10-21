import type { FieldKind, TemplateErrorParams } from '../../domain/types'
import type { LocalizedError, Messages } from './types'

function fieldKind(kind: FieldKind): string {
  if (kind === 'text') {
    return 'Text'
  }
  if (kind === 'textarea') {
    return 'Long text'
  }
  return 'Select'
}

function kindName(kind: FieldKind | undefined): string {
  return kind === undefined ? 'field' : fieldKind(kind)
}

function params(error: LocalizedError): TemplateErrorParams {
  return error.params ?? {}
}

export const en: Messages = {
  appName: 'Docform',
  appTagline: 'Turn documents into forms without leaving your browser.',
  interfaceLanguage: 'Interface language',
  libraryTitle: 'Your forms',
  librarySubtitle: 'Templates you upload stay in this browser.',
  libraryEmpty: 'No forms yet. Upload a DOCX or ODT template to begin.',
  upload: 'New form',
  uploadHint:
    'Add one DOCX or ODT template per language, up to 25 MB each. Declare fields with {{Label}}.',
  importPackage: 'Import package',
  openForm: 'Open form',
  rename: 'Rename',
  export: 'Export',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  formNameLabel: 'Form name',
  routeLabel: 'Route',
  uploadedLabel: 'Uploaded',
  deleteConfirm: 'Delete this form? Its stored templates and route will be removed.',
  errorsTitle: 'Could not complete that action',
  errorDetail: 'Please try again.',
  loading: 'Loading…',
  loadFailed: 'This form could not be loaded.',
  notFoundTitle: 'Form not found on this device',
  notFoundBody:
    'Forms are stored only in this browser. The link may belong to another device, or the form may have been deleted.',
  unknownRouteTitle: 'Page not found',
  unknownRouteBody: 'This page does not exist.',
  errorTitle: 'Something went wrong',
  errorBody:
    'The app hit an unexpected error. Reload the page or return to the library.',
  backToLibrary: 'Back to forms',
  singleLanguage: 'Single language',
  languageCount: (count) =>
    `${count} ${count === 1 ? 'language' : 'languages'}`,
  newFormTitle: 'New form',
  newFormHint:
    'Every language template must declare the same labels and field kinds. Select options are paired by position, so keep their order aligned.',
  createForm: 'Create form',
  addLanguage: 'Add language',
  removeLanguage: 'Remove',
  templateNumberLabel: (index) => `Template ${index}`,
  documentLanguageNumberLabel: (index) => `Document language ${index}`,
  primaryLabel: 'Primary language',
  primaryHint:
    'The primary language supplies the labels, field order, and options shown to the filler.',
  addAtLeastOneTemplate: 'Add at least one language template.',
  chooseFileForEveryLanguage: 'Choose a DOCX or ODT file for every language.',
  invalidDocumentLocale: (locale) =>
    `"${locale}" is not a valid document language tag. Use a tag such as en, es, eu, or en-GB.`,
  duplicateDocumentLocale: (locale) =>
    `The document language "${locale}" is used more than once.`,
  chooseOnePrimary: 'Choose one primary language.',
  detectedTitle: 'Detected fields',
  detectedHint:
    'This is a read-only view of the form definition captured from your templates.',
  languageVariants: 'Language variants',
  documentLanguages: 'Document languages',
  optionPairing: 'Select options are paired by position across languages.',
  fieldKind,
  fieldsOptional: 'All fields are optional.',
  chooseOption: 'Choose…',
  download: 'Download filled document',
  downloadDocuments: 'Download filled documents',
  preview: 'Preview',
  leaveWarning: 'You have unsaved answers. Leave this page anyway?',
  previewTitle: 'Approximate preview',
  previewNotice:
    'This preview is approximate. Download the filled document for the exact result.',
  previewNoticePlural:
    'This preview is approximate. Download the filled documents for the exact results.',
  print: 'Print',
  downloadInstead: 'Download instead',
  previewUnavailable: 'The preview could not be rendered for this document.',
  previewNeedsAnswers: 'Fill the form first to preview a document.',
  backToForm: 'Back to form',
  technicalDetails: 'Technical details',
  loadingDocument: (locale) => `Loading ${locale}…`,
  errors: {
    'invalid-format': (error) => {
      const p = params(error)
      switch (error.detail) {
        case 'not-a-package':
          return 'This file is not a DOCX or ODT package.'
        case 'unreadable-package':
          return 'This file is not a readable DOCX or ODT package.'
        case 'macro-enabled':
          return 'Macro-enabled documents are not supported. Save a .docx without macros.'
        case 'not-word':
          return 'This package is not a Word text document.'
        case 'only-odt':
          return 'Only ODT text documents are supported.'
        case 'not-text-document':
          return 'This package is not a DOCX or ODT text document.'
        case 'invalid-xml':
          return `The package part "${p.path ?? error.location ?? 'document'}" is not valid XML.`
        case 'unreadable-template':
          return 'The template could not be read.'
        case 'format-mismatch':
          return 'The stored format does not match the template package.'
        case 'missing-template':
          return `The template for "${p.locale ?? ''}" is missing.`
        case 'unreadable-file':
          return `"${p.path ?? error.location ?? ''}" could not be read.`
        default:
          return 'This file is not a supported DOCX or ODT document.'
      }
    },
    'too-large': (error) => {
      const p = params(error)
      const limit = p.maxMb ?? 25
      return p.path === undefined
        ? `The file is larger than ${limit} MB.`
        : `"${p.path}" is larger than ${limit} MB.`
    },
    'no-placeholders': () =>
      'This template has no placeholders. Add at least one {{Label}} declaration.',
    'malformed-placeholder': (error) => {
      const p = params(error)
      const placeholder = p.placeholder ?? ''
      switch (error.detail) {
        case 'missing-closing-bracket':
          return `The placeholder {{${placeholder}}} is missing a closing bracket.`
        case 'text-after-options':
          return `The placeholder {{${placeholder}}} has text after its option list.`
        case 'multiple-option-lists':
          return `The placeholder {{${placeholder}}} has more than one option list.`
        case 'modifier-with-options':
          return `The placeholder {{${placeholder}}} mixes a modifier with an option list.`
        case 'option-closing-bracket':
          return `An option for "${p.label ?? error.label ?? ''}" contains a closing bracket.`
        case 'closing-bracket-without-opening':
          return `The placeholder {{${placeholder}}} has a closing bracket without an opening one.`
        case 'missing-double-brace':
          return `A placeholder near "${placeholder}" is missing "}}".`
        case 'nested-open':
          return `A placeholder near "${placeholder}" opens without closing.`
        case 'invalid-textarea':
          return `The placeholder {{${placeholder}}} has an invalid textarea declaration.`
        default:
          return 'A placeholder is malformed. Check the double braces and option syntax.'
      }
    },
    'unknown-modifier': (error) => {
      const p = params(error)
      return `The placeholder {{${p.placeholder ?? ''}}} uses the unknown modifier "${p.modifier ?? ''}". Only "|textarea" is supported.`
    },
    'empty-label': () => 'A placeholder has an empty label.',
    'empty-option': (error) =>
      `The select field "${params(error).label ?? error.label ?? ''}" has an empty option.`,
    'conflicting-label': (error) =>
      `The label "${params(error).label ?? error.label ?? ''}" is declared with conflicting kinds or options.`,
    'unsupported-region': (error) =>
      `A placeholder in "${params(error).location ?? error.location ?? ''}" is outside the supported regions. Move it into the document body, a table, a header, or a footer.`,
    'not-found': () => 'This form is not stored on this device.',
    'invalid-answer': (error) =>
      `"${params(error).answer ?? ''}" is not an option for "${params(error).label ?? error.label ?? ''}".`,
    'invalid-package': (error) => {
      const p = params(error)
      switch (error.detail) {
        case 'not-json':
          return 'The form package is not valid JSON.'
        case 'missing-manifest':
          return 'The form package is missing its manifest.'
        case 'unsupported-version':
          return 'The form package uses an unsupported manifest version.'
        case 'incomplete':
          return 'The form package manifest is incomplete.'
        case 'definition-mismatch':
          return 'The form package definition does not match its template.'
        case 'duplicate-labels':
          return 'The form package definition contains duplicate labels.'
        case 'variant-incomplete':
          return 'A package variant is missing its locale, format, or template.'
        case 'duplicate-locale':
          return `The package contains the locale "${p.locale ?? ''}" more than once.`
        case 'variant-mismatch':
          return `The package variant "${p.locale ?? ''}" does not match the form definition.`
        case 'locale-set-mismatch':
          return 'The package variants do not match the form definition locales.'
        case 'variant-missing':
          return `The package variant "${p.locale ?? ''}" has no form definition.`
        case 'invalid-base64':
          return 'The package template is not valid base64.'
        case 'wrong-format':
          return p.locale === undefined
            ? 'The package template is not a valid DOCX or ODT file, or does not match its declared format.'
            : `The package template for "${p.locale}" is not a valid DOCX or ODT file, or does not match its declared format.`
        case 'hash-mismatch':
          return `The package template for "${p.locale ?? ''}" does not match its recorded hash.`
        case 'route-mismatch':
          return 'The package route does not match its contents.'
        case 'unreadable-package':
          return 'The package could not be read.'
        case 'empty-display-name':
          return 'A display name cannot be empty.'
        default:
          return 'The form package is invalid.'
      }
    },
    'no-variants': () => 'Add at least one language template.',
    'invalid-locale': (error) =>
      error.detail === 'multiple-primary'
        ? 'Choose exactly one primary language variant.'
        : `"${params(error).locale ?? ''}" is not a valid locale code. Use a tag such as en, es, eu, or en-GB.`,
    'duplicate-locale': (error) =>
      `The locale "${params(error).locale ?? error.label ?? ''}" is used by more than one template.`,
    'variant-mismatch': (error) => {
      const p = params(error)
      if (error.detail === 'missing-primary') {
        return `The primary locale "${p.primaryLocale ?? ''}" does not match any variant.`
      }
      if (error.detail === 'label-set-mismatch') {
        const missing = (p.missing ?? []).join(', ')
        const extra = (p.extra ?? []).join(', ')
        const details = [
          missing === '' ? '' : `missing: ${missing}`,
          extra === '' ? '' : `extra: ${extra}`,
        ]
          .filter((part) => part !== '')
          .join('; ')
        return `The locale "${p.locale ?? ''}" does not declare the same labels as "${p.primaryLocale ?? ''}"${details === '' ? '' : ` (${details})`}.`
      }
      if (error.detail === 'kind-mismatch') {
        return `The field "${p.label ?? error.label ?? ''}" is "${kindName(p.primaryKind)}" in "${p.primaryLocale ?? ''}" but "${kindName(p.kind)}" in "${p.locale ?? ''}".`
      }
      if (error.detail === 'missing-field') {
        return `The field "${p.label ?? error.label ?? ''}" is missing from the primary variant.`
      }
      return 'The language variants do not declare the same fields.'
    },
    'option-count-mismatch': (error) => {
      const p = params(error)
      if (error.detail === 'missing-option-at-index') {
        return `The select field "${p.label ?? error.label ?? ''}" has no option at position ${(p.index ?? 0) + 1} in "${p.locale ?? ''}".`
      }
      return `The select field "${p.label ?? error.label ?? ''}" has ${p.primaryCount ?? 0} options in "${p.primaryLocale ?? ''}" but ${p.variantCount ?? 0} in "${p.locale ?? ''}". Options are paired by position, so the counts must match.`
    },
  },
}
