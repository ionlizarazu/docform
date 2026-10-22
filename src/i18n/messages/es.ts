import type { FieldKind, TemplateErrorParams } from '../../domain/types'
import type { LocalizedError, Messages } from './types'

function fieldKind(kind: FieldKind): string {
  if (kind === 'text') {
    return 'Texto'
  }
  if (kind === 'textarea') {
    return 'Texto largo'
  }
  return 'Selección'
}

function kindName(kind: FieldKind | undefined): string {
  return kind === undefined ? 'campo' : fieldKind(kind)
}

function params(error: LocalizedError): TemplateErrorParams {
  return error.params ?? {}
}

export const es: Messages = {
  appName: 'Docform',
  formsNav: 'Formularios',
  docs: 'Guía',
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
  languageVariants: 'Variantes de idioma',
  documentLanguages: 'Idiomas de los documentos',
  optionPairing:
    'Las opciones de selección se emparejan por posición entre idiomas.',
  fieldKind,
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
  errors: {
    'invalid-format': (error) => {
      const p = params(error)
      switch (error.detail) {
        case 'not-a-package':
          return 'Este archivo no es un paquete DOCX u ODT.'
        case 'unreadable-package':
          return 'Este archivo no es un paquete DOCX u ODT legible.'
        case 'macro-enabled':
          return 'No se admiten documentos con macros. Guarda un .docx sin macros.'
        case 'not-word':
          return 'Este paquete no es un documento de texto de Word.'
        case 'only-odt':
          return 'Solo se admiten documentos de texto ODT.'
        case 'not-text-document':
          return 'Este paquete no es un documento de texto DOCX u ODT.'
        case 'invalid-xml':
          return `La parte "${p.path ?? error.location ?? 'documento'}" del paquete no es XML válido.`
        case 'unreadable-template':
          return 'No se pudo leer la plantilla.'
        case 'format-mismatch':
          return 'El formato guardado no coincide con el paquete de la plantilla.'
        case 'missing-template':
          return `Falta la plantilla del idioma "${p.locale ?? ''}".`
        case 'unreadable-file':
          return `No se pudo leer "${p.path ?? error.location ?? ''}".`
        default:
          return 'Este archivo no es un documento DOCX u ODT compatible.'
      }
    },
    'too-large': (error) => {
      const p = params(error)
      const limit = p.maxMb ?? 25
      return p.path === undefined
        ? `El archivo supera los ${limit} MB.`
        : `"${p.path}" supera los ${limit} MB.`
    },
    'no-placeholders': () =>
      'Esta plantilla no tiene marcadores. Añade al menos una declaración {{Label}}.',
    'malformed-placeholder': (error) => {
      const p = params(error)
      const placeholder = p.placeholder ?? ''
      switch (error.detail) {
        case 'missing-closing-bracket':
          return `Al marcador {{${placeholder}}} le falta un corchete de cierre.`
        case 'text-after-options':
          return `El marcador {{${placeholder}}} tiene texto después de su lista de opciones.`
        case 'multiple-option-lists':
          return `El marcador {{${placeholder}}} tiene más de una lista de opciones.`
        case 'modifier-with-options':
          return `El marcador {{${placeholder}}} mezcla un modificador con una lista de opciones.`
        case 'option-closing-bracket':
          return `Una opción de "${p.label ?? error.label ?? ''}" contiene un corchete de cierre.`
        case 'closing-bracket-without-opening':
          return `El marcador {{${placeholder}}} tiene un corchete de cierre sin uno de apertura.`
        case 'missing-double-brace':
          return `A un marcador cerca de "${placeholder}" le faltan "}}".`
        case 'nested-open':
          return `Un marcador cerca de "${placeholder}" se abre sin cerrarse.`
        case 'invalid-textarea':
          return `El marcador {{${placeholder}}} tiene una declaración de textarea no válida.`
        default:
          return 'Un marcador no es válido. Revisa las llaves dobles y la sintaxis de las opciones.'
      }
    },
    'unknown-modifier': (error) => {
      const p = params(error)
      return `El marcador {{${p.placeholder ?? ''}}} usa el modificador desconocido "${p.modifier ?? ''}". Solo se admite "|textarea".`
    },
    'empty-label': () => 'Un marcador tiene una etiqueta vacía.',
    'empty-option': (error) =>
      `El campo de selección "${params(error).label ?? error.label ?? ''}" tiene una opción vacía.`,
    'conflicting-label': (error) =>
      `La etiqueta "${params(error).label ?? error.label ?? ''}" se declara con tipos u opciones en conflicto.`,
    'unsupported-region': (error) =>
      `Un marcador en "${params(error).location ?? error.location ?? ''}" está fuera de las regiones admitidas. Muévelo al cuerpo del documento, a una tabla, a un encabezado o a un pie.`,
    'not-found': () => 'Este formulario no está guardado en este dispositivo.',
    'invalid-answer': (error) =>
      `"${params(error).answer ?? ''}" no es una opción de "${params(error).label ?? error.label ?? ''}".`,
    'invalid-package': (error) => {
      const p = params(error)
      switch (error.detail) {
        case 'not-json':
          return 'El paquete del formulario no es JSON válido.'
        case 'missing-manifest':
          return 'Al paquete del formulario le falta el manifiesto.'
        case 'unsupported-version':
          return 'El paquete del formulario usa una versión de manifiesto no compatible.'
        case 'incomplete':
          return 'El manifiesto del paquete del formulario está incompleto.'
        case 'definition-mismatch':
          return 'La definición del paquete no coincide con su plantilla.'
        case 'duplicate-labels':
          return 'La definición del paquete contiene etiquetas duplicadas.'
        case 'variant-incomplete':
          return 'A una variante del paquete le falta el idioma, el formato o la plantilla.'
        case 'duplicate-locale':
          return `El paquete contiene el idioma "${p.locale ?? ''}" más de una vez.`
        case 'variant-mismatch':
          return `La variante "${p.locale ?? ''}" del paquete no coincide con la definición del formulario.`
        case 'locale-set-mismatch':
          return 'Las variantes del paquete no coinciden con los idiomas de la definición del formulario.'
        case 'variant-missing':
          return `La variante "${p.locale ?? ''}" del paquete no tiene definición de formulario.`
        case 'invalid-base64':
          return 'La plantilla del paquete no es base64 válido.'
        case 'wrong-format':
          return p.locale === undefined
            ? 'La plantilla del paquete no es un archivo DOCX u ODT válido o no coincide con el formato declarado.'
            : `La plantilla del idioma "${p.locale}" del paquete no es un archivo DOCX u ODT válido o no coincide con el formato declarado.`
        case 'hash-mismatch':
          return `La plantilla del idioma "${p.locale ?? ''}" del paquete no coincide con el hash registrado.`
        case 'route-mismatch':
          return 'La ruta del paquete no coincide con su contenido.'
        case 'unreadable-package':
          return 'No se pudo leer el paquete.'
        case 'empty-display-name':
          return 'El nombre del formulario no puede estar vacío.'
        default:
          return 'El paquete del formulario no es válido.'
      }
    },
    'no-variants': () => 'Añade al menos una plantilla de idioma.',
    'invalid-locale': (error) =>
      error.detail === 'multiple-primary'
        ? 'Elige exactamente una variante de idioma principal.'
        : `"${params(error).locale ?? ''}" no es una etiqueta de idioma válida. Usa una etiqueta como en, es, eu o en-GB.`,
    'duplicate-locale': (error) =>
      `El idioma "${params(error).locale ?? error.label ?? ''}" se usa en más de una plantilla.`,
    'variant-mismatch': (error) => {
      const p = params(error)
      if (error.detail === 'missing-primary') {
        return `El idioma principal "${p.primaryLocale ?? ''}" no coincide con ninguna variante.`
      }
      if (error.detail === 'label-set-mismatch') {
        const missing = (p.missing ?? []).join(', ')
        const extra = (p.extra ?? []).join(', ')
        const details = [
          missing === '' ? '' : `faltan: ${missing}`,
          extra === '' ? '' : `sobran: ${extra}`,
        ]
          .filter((part) => part !== '')
          .join('; ')
        return `El idioma "${p.locale ?? ''}" no declara las mismas etiquetas que "${p.primaryLocale ?? ''}"${details === '' ? '' : ` (${details})`}.`
      }
      if (error.detail === 'kind-mismatch') {
        return `El campo "${p.label ?? error.label ?? ''}" es "${kindName(p.primaryKind)}" en "${p.primaryLocale ?? ''}" pero "${kindName(p.kind)}" en "${p.locale ?? ''}".`
      }
      if (error.detail === 'missing-field') {
        return `Falta el campo "${p.label ?? error.label ?? ''}" en la variante principal.`
      }
      return 'Las variantes de idioma no declaran los mismos campos.'
    },
    'option-count-mismatch': (error) => {
      const p = params(error)
      if (error.detail === 'missing-option-at-index') {
        return `El campo de selección "${p.label ?? error.label ?? ''}" no tiene una opción en la posición ${(p.index ?? 0) + 1} en "${p.locale ?? ''}".`
      }
      return `El campo de selección "${p.label ?? error.label ?? ''}" tiene ${p.primaryCount ?? 0} opciones en "${p.primaryLocale ?? ''}" pero ${p.variantCount ?? 0} en "${p.locale ?? ''}". Las opciones se emparejan por posición, así que las cantidades deben coincidir.`
    },
  },
}
