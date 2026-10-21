import type { Messages } from './types'

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
  languageVariants: 'Dokumentuen hizkuntzak',
  optionPairing:
    'Aukera-eremuak posizioaren arabera parekatzen dira hizkuntzen artean.',
  fieldKindText: 'Testua',
  fieldKindTextarea: 'Testu luzea',
  fieldKindSelect: 'Hautaketa',
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
}
