export interface Messages {
  appName: string
  appTagline: string
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
  optionPairing: string
  fieldKindText: string
  fieldKindTextarea: string
  fieldKindSelect: string
}
