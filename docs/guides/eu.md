# Docform gida

Docform-ek Word edo OpenDocument txantiloi bat behin betetzen den formulario bihurtzen du. Formularioaren hizkuntza bakoitzeko dokumentu bete bat deskargatzen du. Dena zure nabigatzailean gertatzen da: ez dago konturik eta ez dago zerbitzaririk.

Gida hau Docform lehen aldiz erabiltzen duenarentzat da. Prozesu osoa azaltzen du, ezagutza teknikoak eman gabe.

## Zer behar duzu

- Hizkuntza bakoitzeko DOCX edo ODT txantiloi bat.
- Etiketa eta eremu-mota berberak txantiloi guztietan.
- Hautaketa-eremu baterako, aukera-kopuru bera eta ordena bera txantiloi guztietan.
- Txantiloi bakoitzak gehienez 25 MB izan ditzake.

## 1. Sortu formulario bat

1. Ireki Docform eta sakatu **Formulario berria**.
2. Hizkuntza bakoitzeko, aukeratu DOCX edo ODT fitxategi bat eta idatzi dokumentuaren hizkuntza-etiketa, adibidez `en`, `es` edo `eu`.
3. Markatu txantiloi bat **Hizkuntza nagusia** gisa. Haren etiketak, eremu-ordena eta aukerak izango dira formularioa betetzen duenak ikusiko dituenak.
4. Sakatu **Sortu formularioa**.
5. Egiaztatu **Detektatutako eremuak** pantaila eta aukeren parekatzea. Etiketa edo aukera-zerrendaren bat ez badator, zuzendu txantiloiak eta igo berriro.

Hizkuntza nagusiak formularioko kontrolen hizkuntza baino ez du zehazten. Ez du beste dokumentuen hizkuntza aldatzen.

### Markatzaileak

Markatzaileek Docform-i esaten diote non joango diren erantzunak. Jar ditzakezu dokumentuaren gorputzean, taula batean, goiburuan edo orri-oinean.

| Zer nahi duzu | Idatzi txantiloian |
| --- | --- |
| Testu-erantzun laburra | `{{Izena}}` |
| Testu-erantzun luzea | `{{Oharrak\|textarea}}` |
| Zerrendako aukera bat | `{{Herria[Espainia;;Frantzia;;Alemania]}}` |

- `;;` karaktereak hautaketa-eremu baten aukerak bereizten ditu. Aukera baten barruko `;`, koma eta `|` karaktere arruntak dira.
- Etiketak moztu egiten dira eta barruko zuriuneak batu. Etiketa berak esanahi bera izan behar du leku guztietan.
- Eremu guztiak hautazkoak dira. Eremu bat hutsik uzten baduzu, balio hutsa sartzen da.
- Testu, testu luze eta hautaketa eremuak baino ez daude. `|number` bezalako modifikatzaile ezezaguna baztertu egiten da.

Ez dira onartzen testu-koadro, forma, oin-ohar, iruzkin edo oharren barruko markatzaileak. Eraman itzazu dokumentuaren gorputzera, taula batera, goiburura edo orri-oinean.

### Aukerak posizioaren arabera parekatzen dira

Ingelesezko txantiloiak `Spain / France / Germany` badio, espainierazko txantiloiak `España / Francia / Alemania` esan behar du, ordena berean. Docform-ek lehen aukera lehenarekin parekatzen du, bigarrena bigarrenarekin, eta horrela. Ezin ditu detektatu luzera bera baina esanahi desberdina duten bi zerrenda, beraz, mantendu ordena lerrokatuta.

## 2. Bete eta deskargatu

1. Ireki formularioaren esteka.
2. Bete eremuak behin.
3. Sakatu **Deskargatu betetako dokumentua** edo **Deskargatu betetako dokumentuak**.
4. Hizkuntza batekin dokumentu bat lortzen duzu. Hizkuntza batzuekin, ZIP bat lortzen duzu, hizkuntza bakoitzeko fitxategi batekin: `kontratua-en-filled.docx` eta `kontratua-es-filled.odt` bezalako izenekin.
5. Sakatu **Aurrebista** emaitza deskargatu aurretik egiaztatu nahi baduzu.

Formularioa behin betetzen da. Erantzun berberak jartzen dira hizkuntza-dokumentu guztietan.

## 3. Aurrebista eta inprimaketa

Aurrebista gutxi gorabeherakoa da. Diseinua egiaztatzeko balio du, baina deskargatutako dokumentua da emaitza zehatza. Erabili **Inprimatu** aurrebistan paperezko kopia behar baduzu.

## 4. Hizkuntzak

Bi hizkuntza-hautaketa desberdin daude:

- Goiburuko **Interfazaren hizkuntzak** botoiak, mezuak, datak eta gida hau aldatzen ditu. Oraingo aukerak Euskara, Español eta English dira.
- **Dokumentuaren hizkuntza** txantiloi batekoa da. Hizkuntza-aldaera horren etiketak, aukerak eta dokumentu betea kontrolatzen ditu.

Interfazaren hizkuntza aldatzeak ez ditu formularioaren dokumentu-hizkuntzak edo deskargatzen dituzun dokumentuak aldatzen.

## 5. Formularioa babeskopiatu edo mugitu

Formularioak nabigatzaile honetan soilik gordetzen dira. Beste nabigatzaile edo gailu batera eramateko, erabili formulario-paketea:

1. Liburutegian, sakatu formularioaren ondoan **Esportatu**.
2. Gorde `.formpack.json` fitxategia.
3. Beste nabigatzaile edo gailuan, sakatu **Inportatu paketea** eta aukeratu fitxategia.

Argitaratutako gunea eta localhost nabigatzaile-origen desberdinak dira. Localhosten sortutako formularioa ez da argitaratutako gunean agertzen, eta alderantziz. Erabili formulario-paketea mugitzeko.

Nabigatzaileko gune-datuak ezabatzeak bertan gordetako formularioak ezabatzen ditu. Gorde formulario-paketea formularioa garrantzitsua bada.

## 6. Zerbait gaizki badoa

| Mezua edo arazoa | Zer egin |
| --- | --- |
| Txantiloi honek ez du markatzailerik | Gehitu gutxienez `{{Etiketa}}` adierazpen bat gorputzean, taula batean, goiburuan edo orri-oinean. |
| Markatzaile bat ez da baliozkoa | Egiaztatu giltza bikoitzak eta aukeren sintaxia. `{{` bakoitzak `}}` bat behar du. |
| Etiketa mota edo aukera kontrajarriekin adierazten da | Erabili etiketa bera, eremu-mota berarekin eta aukera berberekin, txantiloi osoan. |
| Hizkuntzak ez ditu etiketa berberak adierazten | Egin hizkuntza-txantiloi guztiek etiketa berberak erabiltzea. |
| Hautaketa-eremuak aukera-kopuru desberdina du | Eman txantiloi guztiei aukera-kopuru bera, ordena berean. |
| Markatzaile bat onartutako eremuetatik kanpo dago | Atera testu-koadro, forma, oin-ohar, iruzkin edo ohar batetik. |
| Fitxategiak 25 MB gainditzen ditu | Erabili txantiloi txikiagoa. |
| Formularioa ez dago gailu honetan gordeta | Ireki formularioa sortu zuen nabigatzaile-profilean edo inportatu bere formulario-paketea. |
| Aurrebistak ez du deskargak ematen duena ematen | Aurrebista gutxi gorabeherakoa da. Deskargatutako dokumentua da emaitza autoritatiboa. |
| Makroak dituzten dokumentuak ez dira onartzen | Gorde txantiloia `.docx` arrunt gisa, makrorik gabe. |

## Pribatutasuna

Docform-ek ez ditu zure txantiloiak edo erantzunak igotzen. Definizioak, txantiloiak eta nabigatzailearen lehentasunak zure nabigatzailean geratzen dira. Esportatu formulario-paketea babeskopia nahi baduzu.

DOCX eta ODT testu-dokumentuak soilik onartzen dira. PDF, `.doc` eta makroak dituzten `.docm` fitxategiak ez dira onartzen.

## Kontseiluak txantiloiak sortzen dituenarentzat

- Erabili etiketa laburrak eta esanguratsuak.
- Mantendu hautaketa-aukerak ordena berean hizkuntza guztietan.
- Probatu deskarga, ez bakarrik aurrebista.
- Erabili fitxategi-izen argia txantiloi nagusirako; Docform-ek formularioaren izen gisa erabiltzen du.
- Esportatu formulario-paketea nabigatzailearen datuak ezabatu edo gailuz aldatu aurretik.
