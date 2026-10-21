import type { Messages } from './types'

export const es: Messages = {
  appName: 'Docform',
  appTagline: 'Convierte documentos en formularios sin salir del navegador.',
  interfaceLanguage: 'Idioma de la interfaz',
  libraryTitle: 'Tus formularios',
  librarySubtitle: 'Las plantillas que subes se quedan en este navegador.',
  libraryEmpty:
    'Aún no hay formularios. Sube una plantilla DOCX u ODT para empezar.',
  upload: 'Nuevo formulario',
  uploadHint:
    'Añade una plantilla DOCX u ODT por idioma, de hasta 25 MB cada una. Declara los campos con {{Label}}.',
  importPackage: 'Importar paquete',
  openForm: 'Abrir formulario',
  rename: 'Renombrar',
  export: 'Exportar',
  delete: 'Eliminar',
  save: 'Guardar',
  cancel: 'Cancelar',
  formNameLabel: 'Nombre del formulario',
  routeLabel: 'Ruta',
  uploadedLabel: 'Subido',
  deleteConfirm:
    '¿Eliminar este formulario? Se eliminarán sus plantillas y su ruta.',
  errorsTitle: 'No se pudo completar la acción',
  errorDetail: 'Inténtalo de nuevo.',
  loading: 'Cargando…',
  loadFailed: 'No se pudo cargar este formulario.',
  notFoundTitle: 'Formulario no encontrado en este dispositivo',
  notFoundBody:
    'Los formularios solo se guardan en este navegador. El enlace puede pertenecer a otro dispositivo o el formulario puede haberse eliminado.',
  unknownRouteTitle: 'Página no encontrada',
  unknownRouteBody: 'Esta página no existe.',
  errorTitle: 'Algo ha ido mal',
  errorBody:
    'La aplicación ha encontrado un error inesperado. Recarga la página o vuelve a la biblioteca.',
  backToLibrary: 'Volver a los formularios',
  singleLanguage: 'Idioma único',
  languageCount: (count) => `${count} ${count === 1 ? 'idioma' : 'idiomas'}`,
  newFormTitle: 'Nuevo formulario',
  newFormHint:
    'Cada plantilla de idioma debe declarar las mismas etiquetas y tipos de campo. Las opciones de selección se emparejan por posición, así que mantén el mismo orden.',
  createForm: 'Crear formulario',
  addLanguage: 'Añadir idioma',
  removeLanguage: 'Quitar',
  templateNumberLabel: (index) => `Plantilla ${index}`,
  documentLanguageNumberLabel: (index) => `Idioma del documento ${index}`,
  primaryLabel: 'Idioma principal',
  primaryHint:
    'El idioma principal proporciona las etiquetas, el orden de los campos y las opciones que ve quien rellena el formulario.',
  addAtLeastOneTemplate: 'Añade al menos una plantilla de idioma.',
  chooseFileForEveryLanguage:
    'Elige un archivo DOCX u ODT para cada idioma.',
  invalidDocumentLocale: (locale) =>
    `"${locale}" no es una etiqueta de idioma de documento válida. Usa una etiqueta como en, es, eu o en-GB.`,
  duplicateDocumentLocale: (locale) =>
    `El idioma del documento "${locale}" se usa más de una vez.`,
  chooseOnePrimary: 'Elige un idioma principal.',
  detectedTitle: 'Campos detectados',
  detectedHint:
    'Esta es una vista de solo lectura de la definición del formulario capturada de tus plantillas.',
  languageVariants: 'Idiomas de los documentos',
  optionPairing:
    'Las opciones de selección se emparejan por posición entre idiomas.',
  fieldKindText: 'Texto',
  fieldKindTextarea: 'Texto largo',
  fieldKindSelect: 'Selección',
  fieldsOptional: 'Todos los campos son opcionales.',
  chooseOption: 'Elige…',
  download: 'Descargar documento relleno',
  downloadDocuments: 'Descargar documentos rellenos',
  preview: 'Vista previa',
  leaveWarning:
    'Tienes respuestas sin guardar. ¿Salir de esta página de todos modos?',
  previewTitle: 'Vista previa aproximada',
  previewNotice:
    'Esta vista previa es aproximada. Descarga el documento relleno para obtener el resultado exacto.',
  previewNoticePlural:
    'Esta vista previa es aproximada. Descarga los documentos rellenos para obtener los resultados exactos.',
  print: 'Imprimir',
  downloadInstead: 'Descargar en su lugar',
  previewUnavailable:
    'No se pudo renderizar la vista previa de este documento.',
  previewNeedsAnswers:
    'Rellena el formulario primero para previsualizar un documento.',
  backToForm: 'Volver al formulario',
  technicalDetails: 'Detalles técnicos',
  loadingDocument: (locale) => `Cargando ${locale}…`,
}
