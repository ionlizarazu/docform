import type {
  FieldKind,
  TemplateErrorCode,
  TemplateErrorDetail,
  TemplateErrorParams,
} from '../../domain/types'

export interface LocalizedError {
  code: TemplateErrorCode
  detail?: TemplateErrorDetail
  params?: TemplateErrorParams
  label?: string
  location?: string
}

export type ErrorMessage = (error: LocalizedError) => string

export interface Messages {
  appName: string
  appTagline: string
  docs: string
  interfaceLanguage: string
  libraryTitle: string
  librarySubtitle: string
  libraryEmpty: string
  upload: string
  uploadHint: string
  importPackage: string
  openForm: string
  rename: string
  export: string
  delete: string
  save: string
  cancel: string
  formNameLabel: string
  routeLabel: string
  uploadedLabel: string
  deleteConfirm: string
  errorsTitle: string
  errorDetail: string
  loading: string
  loadFailed: string
  notFoundTitle: string
  notFoundBody: string
  unknownRouteTitle: string
  unknownRouteBody: string
  errorTitle: string
  errorBody: string
  backToLibrary: string
  singleLanguage: string
  languageCount: (count: number) => string
  newFormTitle: string
  newFormHint: string
  createForm: string
  addLanguage: string
  removeLanguage: string
  templateNumberLabel: (index: number) => string
  documentLanguageNumberLabel: (index: number) => string
  primaryLabel: string
  primaryHint: string
  addAtLeastOneTemplate: string
  chooseFileForEveryLanguage: string
  invalidDocumentLocale: (locale: string) => string
  duplicateDocumentLocale: (locale: string) => string
  chooseOnePrimary: string
  detectedTitle: string
  detectedHint: string
  languageVariants: string
  documentLanguages: string
  optionPairing: string
  fieldKind: (kind: FieldKind) => string
  fieldsOptional: string
  chooseOption: string
  download: string
  downloadDocuments: string
  preview: string
  leaveWarning: string
  previewTitle: string
  previewNotice: string
  previewNoticePlural: string
  print: string
  downloadInstead: string
  previewUnavailable: string
  previewNeedsAnswers: string
  backToForm: string
  technicalDetails: string
  loadingDocument: (locale: string) => string
  errors: Record<TemplateErrorCode, ErrorMessage>
}
