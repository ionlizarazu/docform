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
}
