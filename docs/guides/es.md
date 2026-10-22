# Guía de Docform

Docform convierte una plantilla de Word u OpenDocument en un formulario que se rellena una sola vez. Descarga un documento relleno por cada idioma del formulario. Todo ocurre en tu navegador: no hay cuenta ni servidor.

Esta guía está pensada para quien usa Docform por primera vez. Explica todo el proceso sin dar por supuestos conocimientos técnicos.

## Qué necesitas

- Una plantilla DOCX u ODT por idioma.
- Las mismas etiquetas y los mismos tipos de campo en todas las plantillas.
- Para un campo de selección, la misma cantidad de opciones y en el mismo orden en todas las plantillas.
- Cada plantilla puede ocupar hasta 25 MB.

## 1. Crear un formulario

1. Abre Docform y pulsa **Nuevo formulario**.
2. Para cada idioma, elige un archivo DOCX u ODT y escribe su etiqueta de idioma del documento, por ejemplo `en`, `es` o `eu`.
3. Marca exactamente una plantilla como **Idioma principal**. Sus etiquetas, orden de campos y opciones son los que verá quien rellene el formulario.
4. Pulsa **Crear formulario**.
5. Revisa la pantalla **Campos detectados** y el emparejamiento de opciones. Si alguna etiqueta o lista de opciones no coincide, corrige las plantillas y vuelve a subirlas.

El idioma principal solo determina el idioma de los controles del formulario. No cambia el idioma de los demás documentos.

### Marcadores

Los marcadores indican a Docform dónde van las respuestas. Puedes ponerlos en el cuerpo del documento, una tabla, un encabezado o un pie.

| Lo que quieres | Escribe en la plantilla |
| --- | --- |
| Una respuesta de texto corta | `{{Nombre}}` |
| Una respuesta de texto largo | `{{Notas\|textarea}}` |
| Una opción de una lista | `{{País[España;;Francia;;Alemania]}}` |

- `;;` separa las opciones de un campo de selección. Un `;`, una coma o un `|` dentro de una opción son caracteres normales.
- Las etiquetas se recortan y los espacios interiores se unen. La misma etiqueta debe significar lo mismo en todas partes.
- Todos los campos son opcionales. Si dejas un campo vacío, se inserta un valor vacío.
- Solo existen campos de texto, texto largo y selección. Un modificador desconocido como `|number` se rechaza.

No se admiten marcadores dentro de cuadros de texto, formas, notas al pie, comentarios ni anotaciones. Muévelos al cuerpo del documento, una tabla, un encabezado o un pie.

### Las opciones se emparejan por posición

Si la plantilla inglesa dice `Spain / France / Germany`, la plantilla española debe decir `España / Francia / Alemania` en el mismo orden. Docform empareja la primera opción con la primera, la segunda con la segunda, y así sucesivamente. No puede detectar dos listas con la misma cantidad de elementos pero distinto significado, así que mantén el orden alineado.

## 2. Rellenar y descargar

1. Abre el enlace del formulario.
2. Rellena los campos una sola vez.
3. Pulsa **Descargar documento relleno** o **Descargar documentos rellenos**.
4. Con un idioma obtienes un documento. Con varios idiomas obtienes un ZIP con un archivo por idioma, con nombres como `contrato-en-filled.docx` y `contrato-es-filled.odt`.
5. Pulsa **Vista previa** si quieres comprobar el resultado antes de descargar.

El formulario se rellena una sola vez. Las mismas respuestas se colocan en todos los documentos de idioma.

## 3. Vista previa e impresión

La vista previa es aproximada. Sirve para comprobar la disposición, pero el documento descargado es el resultado exacto. Usa **Imprimir** en la vista previa si necesitas una copia en papel.

## 4. Idiomas

Hay dos elecciones de idioma diferentes:

- El **Idioma de la interfaz** de la cabecera cambia los botones, los mensajes, las fechas y esta guía. Se muestra como `eu | es | en`, con el código seleccionado en negrita; los lectores de pantalla anuncian las opciones como Euskara, Español e English.
- El **Idioma del documento** pertenece a una plantilla. Controla las etiquetas, las opciones y el documento relleno de esa variante de idioma.

Cambiar el idioma de la interfaz no cambia los idiomas de los documentos del formulario ni los documentos que descargas.

El menú de la cabecera tiene **Formularios**, que vuelve a la biblioteca de formularios, y **Guía**, que abre esta guía.

## 5. Copia de seguridad o mover un formulario

Los formularios solo se guardan en este navegador. Para mover uno a otro navegador o dispositivo, usa el paquete de formulario:

1. En la biblioteca, pulsa **Exportar** junto al formulario.
2. Guarda el archivo `.formpack.json`.
3. En el otro navegador o dispositivo, pulsa **Importar paquete** y elige el archivo.

El sitio publicado y localhost son orígenes de navegador diferentes. Un formulario creado en localhost no aparece en el sitio publicado, y viceversa. Usa un paquete de formulario para moverlo.

Borrar los datos del sitio en el navegador elimina los formularios guardados allí. Guarda un paquete de formulario si el formulario es importante.

## 6. Si algo va mal

| Mensaje o problema | Qué hacer |
| --- | --- |
| Esta plantilla no tiene marcadores | Añade al menos una declaración `{{Etiqueta}}` en el cuerpo, una tabla, un encabezado o un pie. |
| Un marcador no es válido | Revisa las llaves dobles y la sintaxis de las opciones. Cada `{{` necesita un `}}`. |
| La etiqueta se declara con tipos u opciones en conflicto | Usa la misma etiqueta con el mismo tipo de campo y las mismas opciones en toda la plantilla. |
| El idioma no declara las mismas etiquetas | Haz que todas las plantillas de idioma usen exactamente las mismas etiquetas. |
| El campo de selección tiene una cantidad distinta de opciones | Da a todas las plantillas el mismo número de opciones, en el mismo orden. |
| Un marcador está fuera de las regiones admitidas | Sácalo de un cuadro de texto, una forma, una nota al pie, un comentario o una anotación. |
| El archivo supera los 25 MB | Usa una plantilla más pequeña. |
| El formulario no está guardado en este dispositivo | Abre el formulario en el perfil del navegador que lo creó o importa su paquete de formulario. |
| La vista previa no coincide con la descarga | La vista previa es aproximada. El documento descargado es el resultado autoritativo. |
| No se admiten documentos con macros | Guarda la plantilla como un `.docx` normal, sin macros. |

## Privacidad

Docform no sube tus plantillas ni tus respuestas. Las definiciones, las plantillas y las preferencias del navegador se quedan en tu navegador. Exporta un paquete de formulario si quieres una copia de seguridad.

Solo se admiten documentos de texto DOCX y ODT. No se admiten PDF, `.doc` ni `.docm` con macros.

## Consejos para quien crea plantillas

- Usa etiquetas cortas y con significado.
- Mantén las opciones de selección en el mismo orden en todos los idiomas.
- Prueba la descarga, no solo la vista previa.
- Usa un nombre de archivo claro para la plantilla principal; Docform lo usa como nombre del formulario.
- Exporta un paquete de formulario antes de borrar los datos del navegador o cambiar de dispositivo.
