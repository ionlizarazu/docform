import type { FieldKind, TemplateErrorParams } from '../../domain/types'
import type { LocalizedError, Messages } from './types'

function fieldKind(kind: FieldKind): string {
  if (kind === 'text') {
    return 'Testua'
  }
  if (kind === 'textarea') {
    return 'Testu luzea'
  }
  return 'Hautaketa'
}

function kindName(kind: FieldKind | undefined): string {
  return kind === undefined ? 'eremua' : fieldKind(kind)
}

function params(error: LocalizedError): TemplateErrorParams {
  return error.params ?? {}
}

export const eu: Messages = {
  appName: 'Docform',
  appTagline:
    'Bihurtu dokumentuak formulario nabigatzailetik irten gabe.',
  interfaceLanguage: 'Interfazaren hizkuntza',
  libraryTitle: 'Zure formularioak',
  librarySubtitle:
    'Igoko dituzun txantiloiak nabigatzaile honetan gordetzen dira.',
  libraryEmpty:
    'Oraindik ez dago formulariorik. Igo DOCX edo ODT txantiloi bat hasteko.',
  upload: 'Formulario berria',
  uploadHint:
    'Gehitu DOCX edo ODT txantiloi bat hizkuntza bakoitzeko, gehienez 25 MB bakoitza. Adierazi eremuak {{Label}}-rekin.',
  importPackage: 'Inportatu paketea',
  openForm: 'Ireki formularioa',
  rename: 'Izena aldatu',
  export: 'Esportatu',
  delete: 'Ezabatu',
  save: 'Gorde',
  cancel: 'Ezeztatu',
  formNameLabel: 'Formularioaren izena',
  routeLabel: 'Ibilbidea',
  uploadedLabel: 'Igoera',
  deleteConfirm:
    'Formulario hau ezabatu? Bere txantiloiak eta ibilbidea kenduko dira.',
  errorsTitle: 'Ezin izan da ekintza osatu',
  errorDetail: 'Saiatu berriro.',
  loading: 'Kargatzen…',
  loadFailed: 'Ezin izan da formulario hau kargatu.',
  notFoundTitle: 'Formularioa ez da gailu honetan aurkitu',
  notFoundBody:
    'Formularioak nabigatzaile honetan soilik gordetzen dira. Esteka beste gailu batekoa izan daiteke, edo formularioa ezabatu egin da.',
  unknownRouteTitle: 'Orria ez da aurkitu',
  unknownRouteBody: 'Orri hau ez da existitzen.',
  errorTitle: 'Zerbait gaizki joan da',
  errorBody:
    'Aplikazioak ustekabeko errore bat aurkitu du. Freskatu orria edo itzuli liburutegira.',
  backToLibrary: 'Itzuli formularioetara',
  singleLanguage: 'Hizkuntza bakarra',
  languageCount: (count) => `${count} hizkuntza`,
  newFormTitle: 'Formulario berria',
  newFormHint:
    'Hizkuntza bakoitzeko txantiloiak etiketa eta eremu-mota berberak adierazi behar ditu. Aukera-eremuak posizioaren arabera parekatzen dira, beraz, mantendu ordena bera.',
  createForm: 'Sortu formularioa',
  addLanguage: 'Gehitu hizkuntza',
  removeLanguage: 'Kendu',
  templateNumberLabel: (index) => `Txantiloia ${index}`,
  documentLanguageNumberLabel: (index) =>
    `Dokumentuaren hizkuntza ${index}`,
  primaryLabel: 'Hizkuntza nagusia',
  primaryHint:
    'Hizkuntza nagusiak formularioa betetzen duenari erakusten zaizkion etiketak, eremu-ordena eta aukerak ematen ditu.',
  addAtLeastOneTemplate: 'Gehitu gutxienez hizkuntza-txantiloi bat.',
  chooseFileForEveryLanguage:
    'Aukeratu DOCX edo ODT fitxategi bat hizkuntza bakoitzeko.',
  invalidDocumentLocale: (locale) =>
    `"${locale}" ez da dokumentu-hizkuntzaren etiketa baliozkoa. Erabili en, es, eu edo en-GB bezalako etiketa bat.`,
  duplicateDocumentLocale: (locale) =>
    `"${locale}" dokumentu-hizkuntza behin baino gehiagotan erabili da.`,
  chooseOnePrimary: 'Aukeratu hizkuntza nagusi bat.',
  detectedTitle: 'Detektatutako eremuak',
  detectedHint:
    'Hau zure txantiloietatik ateratako formularioaren definizioaren irakurketa-soileko ikuspegia da.',
  languageVariants: 'Hizkuntza-aldaerak',
  documentLanguages: 'Dokumentuen hizkuntzak',
  optionPairing:
    'Aukera-eremuak posizioaren arabera parekatzen dira hizkuntzen artean.',
  fieldKind,
  fieldsOptional: 'Eremu guztiak hautazkoak dira.',
  chooseOption: 'Aukeratu…',
  download: 'Deskargatu betetako dokumentua',
  downloadDocuments: 'Deskargatu betetako dokumentuak',
  preview: 'Aurrebista',
  leaveWarning: 'Gorde gabeko erantzunak dituzu. Orrialde hau utzi nahi duzu?',
  previewTitle: 'Aurrebista gutxi gorabeherakoa',
  previewNotice:
    'Aurrebista hau gutxi gorabeherakoa da. Deskargatu betetako dokumentua emaitza zehatza lortzeko.',
  previewNoticePlural:
    'Aurrebista hau gutxi gorabeherakoa da. Deskargatu betetako dokumentuak emaitza zehatzak lortzeko.',
  print: 'Inprimatu',
  downloadInstead: 'Deskargatu horren ordez',
  previewUnavailable: 'Ezin izan da dokumentu honen aurrebista bistaratu.',
  previewNeedsAnswers:
    'Bete formularioa lehenengo dokumentu baten aurrebista ikusteko.',
  backToForm: 'Itzuli formulariora',
  technicalDetails: 'Xehetasun teknikoak',
  loadingDocument: (locale) => `${locale} kargatzen…`,
  errors: {
    'invalid-format': (error) => {
      const p = params(error)
      switch (error.detail) {
        case 'not-a-package':
          return 'Fitxategi hau ez da DOCX edo ODT pakete bat.'
        case 'unreadable-package':
          return 'Fitxategi hau ez da DOCX edo ODT pakete irakurgarri bat.'
        case 'macro-enabled':
          return 'Makroak dituzten dokumentuak ez dira onartzen. Gorde .docx bat makrorik gabe.'
        case 'not-word':
          return 'Pakete hau ez da Word testu-dokumentu bat.'
        case 'only-odt':
          return 'ODT testu-dokumentuak soilik onartzen dira.'
        case 'not-text-document':
          return 'Pakete hau ez da DOCX edo ODT testu-dokumentu bat.'
        case 'invalid-xml':
          return `Paketeko "${p.path ?? error.location ?? 'dokumentua'}" atala ez da XML baliozkoa.`
        case 'unreadable-template':
          return 'Ezin izan da txantiloia irakurri.'
        case 'format-mismatch':
          return 'Gordetako formatua ez dator bat txantiloiaren paketearekin.'
        case 'missing-template':
          return `"${p.locale ?? ''}" hizkuntzako txantiloia falta da.`
        case 'unreadable-file':
          return `Ezin izan da "${p.path ?? error.location ?? ''}" irakurri.`
        default:
          return 'Fitxategi hau ez da DOCX edo ODT dokumentu onargarri bat.'
      }
    },
    'too-large': (error) => {
      const p = params(error)
      const limit = p.maxMb ?? 25
      return p.path === undefined
        ? `Fitxategiak ${limit} MB gainditzen ditu.`
        : `"${p.path}" fitxategiak ${limit} MB gainditzen ditu.`
    },
    'no-placeholders': () =>
      'Txantiloi honek ez du markatzailerik. Gehitu gutxienez {{Label}} adierazpen bat.',
    'malformed-placeholder': (error) => {
      const p = params(error)
      const placeholder = p.placeholder ?? ''
      switch (error.detail) {
        case 'missing-closing-bracket':
          return `{{${placeholder}}} markatzailerik falta zaio itxiera-parentesia.`
        case 'text-after-options':
          return `{{${placeholder}}} markatzaileak testua du aukera-zerrendaren ondoren.`
        case 'multiple-option-lists':
          return `{{${placeholder}}} markatzaileak aukera-zerrenda bat baino gehiago ditu.`
        case 'modifier-with-options':
          return `{{${placeholder}}} markatzaileak modifikatzaile bat eta aukera-zerrenda bat nahasten ditu.`
        case 'option-closing-bracket':
          return `"${p.label ?? error.label ?? ''}" aukerak itxiera-parentesi bat du.`
        case 'closing-bracket-without-opening':
          return `{{${placeholder}}} markatzaileak itxiera-parentesi bat du irekiera-parentesirik gabe.`
        case 'missing-double-brace':
          return `"${placeholder}" inguruko markatzaile bati "}}" falta zaio.`
        case 'nested-open':
          return `"${placeholder}" inguruko markatzaile bat ireki egiten da itxi gabe.`
        case 'invalid-textarea':
          return `{{${placeholder}}} markatzaileak textarea-adierazpen baliogabea du.`
        default:
          return 'Markatzaile bat baliogabea da. Egiaztatu giltza bikoitzak eta aukeren sintaxia.'
      }
    },
    'unknown-modifier': (error) => {
      const p = params(error)
      return `{{${p.placeholder ?? ''}}} markatzaileak "${p.modifier ?? ''}" modifikatzaile ezezaguna erabiltzen du. "|textarea" soilik onartzen da.`
    },
    'empty-label': () => 'Markatzaile batek etiketa hutsa du.',
    'empty-option': (error) =>
      `"${params(error).label ?? error.label ?? ''}" hautaketa-eremuak aukera hutsa du.`,
    'conflicting-label': (error) =>
      `"${params(error).label ?? error.label ?? ''}" etiketa mota edo aukera kontrajarriekin adierazten da.`,
    'unsupported-region': (error) =>
      `"${params(error).location ?? error.location ?? ''}" lekuan markatzaile bat dago onartutako eremuetatik kanpo. Eraman ezazu dokumentuaren gorputzera, taula batera, goiburura edo orri-oinean.`,
    'not-found': () => 'Formulario hau ez dago gailu honetan gordeta.',
    'invalid-answer': (error) =>
      `"${params(error).answer ?? ''}" ez da "${params(error).label ?? error.label ?? ''}" eremuko aukera bat.`,
    'invalid-package': (error) => {
      const p = params(error)
      switch (error.detail) {
        case 'not-json':
          return 'Formularioaren paketea ez da JSON baliozkoa.'
        case 'missing-manifest':
          return 'Formularioaren paketeari manifestua falta zaio.'
        case 'unsupported-version':
          return 'Formularioaren paketeak manifestu-bertsio bateraezina erabiltzen du.'
        case 'incomplete':
          return 'Formularioaren paketearen manifestua osatu gabe dago.'
        case 'definition-mismatch':
          return 'Paketearen definizioa ez dator bat bere txantiloiarekin.'
        case 'duplicate-labels':
          return 'Paketearen definizioak etiketa bikoiztuak ditu.'
        case 'variant-incomplete':
          return 'Paketeko aldaera bati hizkuntza, formatua edo txantiloia falta zaio.'
        case 'duplicate-locale':
          return `Paketeak "${p.locale ?? ''}" hizkuntza behin baino gehiagotan dauka.`
        case 'variant-mismatch':
          return `Paketeko "${p.locale ?? ''}" aldaera ez dator bat formularioaren definizioarekin.`
        case 'locale-set-mismatch':
          return 'Paketeko aldaerak ez datoz bat formularioaren definizioko hizkuntzekin.'
        case 'variant-missing':
          return `Paketeko "${p.locale ?? ''}" aldaerak ez du formulario-definiziorik.`
        case 'invalid-base64':
          return 'Paketearen txantiloia ez da base64 baliozkoa.'
        case 'wrong-format':
          return p.locale === undefined
            ? 'Paketearen txantiloia ez da DOCX edo ODT fitxategi baliozkoa, edo ez dator bat adierazitako formatuarekin.'
            : `Paketeko "${p.locale}" hizkuntzako txantiloia ez da DOCX edo ODT fitxategi baliozkoa, edo ez dator bat adierazitako formatuarekin.`
        case 'hash-mismatch':
          return `Paketeko "${p.locale ?? ''}" hizkuntzako txantiloia ez dator bat erregistratutako hasharekin.`
        case 'route-mismatch':
          return 'Paketearen ibilbidea ez dator bat bere edukiarekin.'
        case 'unreadable-package':
          return 'Ezin izan da paketea irakurri.'
        case 'empty-display-name':
          return 'Formularioaren izena ezin da hutsa izan.'
        default:
          return 'Formularioaren paketea ez da baliozkoa.'
      }
    },
    'no-variants': () => 'Gehitu gutxienez hizkuntza-txantiloi bat.',
    'invalid-locale': (error) =>
      error.detail === 'multiple-primary'
        ? 'Aukeratu hizkuntza nagusiaren aldaera bat soilik.'
        : `"${params(error).locale ?? ''}" ez da hizkuntza-etiketa baliozkoa. Erabili en, es, eu edo en-GB bezalako etiketa bat.`,
    'duplicate-locale': (error) =>
      `"${params(error).locale ?? error.label ?? ''}" hizkuntza txantiloi batean baino gehiagotan erabiltzen da.`,
    'variant-mismatch': (error) => {
      const p = params(error)
      if (error.detail === 'missing-primary') {
        return `"${p.primaryLocale ?? ''}" hizkuntza nagusia ez dator bat inongo aldaerarekin.`
      }
      if (error.detail === 'label-set-mismatch') {
        const missing = (p.missing ?? []).join(', ')
        const extra = (p.extra ?? []).join(', ')
        const details = [
          missing === '' ? '' : `falta dira: ${missing}`,
          extra === '' ? '' : `soberan: ${extra}`,
        ]
          .filter((part) => part !== '')
          .join('; ')
        return `"${p.locale ?? ''}" hizkuntzak ez ditu "${p.primaryLocale ?? ''}" hizkuntzaren etiketa berberak adierazten${details === '' ? '' : ` (${details})`}.`
      }
      if (error.detail === 'kind-mismatch') {
        return `"${p.label ?? error.label ?? ''}" eremua "${kindName(p.primaryKind)}" da "${p.primaryLocale ?? ''}" hizkuntzan, baina "${kindName(p.kind)}" "${p.locale ?? ''}" hizkuntzan.`
      }
      if (error.detail === 'missing-field') {
        return `"${p.label ?? error.label ?? ''}" eremua falta da aldaera nagusian.`
      }
      return 'Hizkuntza-aldaerek ez dituzte eremu berberak adierazten.'
    },
    'option-count-mismatch': (error) => {
      const p = params(error)
      if (error.detail === 'missing-option-at-index') {
        return `"${p.label ?? error.label ?? ''}" hautaketa-eremuak ez du aukerarik ${(p.index ?? 0) + 1}. posizioan "${p.locale ?? ''}" hizkuntzan.`
      }
      return `"${p.label ?? error.label ?? ''}" hautaketa-eremuak ${p.primaryCount ?? 0} aukera ditu "${p.primaryLocale ?? ''}" hizkuntzan, baina ${p.variantCount ?? 0} "${p.locale ?? ''}" hizkuntzan. Aukerak posizioaren arabera parekatzen dira, beraz, kopuruek bat etorri behar dute.`
    },
  },
}
