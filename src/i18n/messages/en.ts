import type { Messages } from './types'

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
}
