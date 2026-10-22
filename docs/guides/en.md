# Docform guide

Docform turns a Word or OpenDocument template into a form you fill in once. It downloads a filled document for each language in the form. Everything happens in your browser: there is no account and no server.

This guide is written for first-time users. It explains the whole flow without assuming any technical knowledge.

## What you need

- One DOCX or ODT template for each language.
- The same field labels and field kinds in every template.
- For a select field, the same number of options in the same order in every template.
- Each template can be up to 25 MB.

## 1. Create a form

1. Open Docform and click **New form**.
2. For each language, choose a DOCX or ODT file and type its document language tag, such as `en`, `es`, or `eu`.
3. Mark exactly one template as the **Primary language**. Its labels, field order, and options are the ones the person filling the form will see.
4. Click **Create form**.
5. Check the **Detected fields** screen and the option pairing. If a label or an option list is different, fix the templates and upload them again.

The primary language is only the language of the form controls. It does not change the language of the other documents.

### Placeholders

Placeholders tell Docform where the answers go. Put them in the document body, a table, a header, or a footer.

| What you want | Write in the template |
| --- | --- |
| A short text answer | `{{Name}}` |
| A long text answer | `{{Notes\|textarea}}` |
| A choice from a list | `{{Country[Spain;;France;;Germany]}}` |

- `;;` separates the options of a select field. A single `;`, a comma, and a `|` inside an option are ordinary characters.
- A label is trimmed and internal spaces are collapsed. The same label must mean the same thing everywhere.
- All fields are optional. Leaving a field blank inserts an empty value.
- Only text, long text, and select fields exist. An unknown modifier such as `|number` is rejected.

Placeholders inside text boxes, shapes, footnotes, comments, or annotations are not supported. Move them into the document body, a table, a header, or a footer.

### Select options are paired by position

If the English template says `Spain / France / Germany`, the Spanish template must say `España / Francia / Alemania` in the same order. Docform pairs the first option with the first option, the second with the second, and so on. It cannot detect two lists that have the same length but a different meaning, so keep the order aligned.

## 2. Fill and download

1. Open the form link.
2. Fill the fields once.
3. Click **Download filled document** or **Download filled documents**.
4. With one language you get one document. With several languages you get a ZIP containing one file per language, named like `contract-en-filled.docx` and `contract-es-filled.odt`.
5. Click **Preview** if you want to check the result before downloading.

You only fill the form once. The same answers are placed into every language document.

## 3. Preview and print

The preview is approximate. It is useful for checking the layout, but the downloaded document is the exact result. Use **Print** in the preview if you need a paper copy.

## 4. Languages

There are two different language choices:

- **Interface language** in the header changes the buttons, messages, dates, and this guide. It is shown as `eu | es | en`, with the selected code in bold; screen readers announce the choices as Euskara, Español, and English.
- **Document language** belongs to a template. It controls the labels, options, and filled document for that language variant.

Changing the interface language does not change the form's document languages or the documents you download.

The header menu has **Forms**, which returns to the form library, and **Docs**, which opens this guide.

## 5. Back up or move a form

Forms are stored only in this browser. To move one to another browser or device, use the form package:

1. In the library, click **Export** next to the form.
2. Save the `.formpack.json` file.
3. On the other browser or device, click **Import package** and choose the file.

The published site and localhost are different browser origins. A form created on localhost does not appear on the published site, and vice versa. Use a form package to move it.

Clearing the browser's site data deletes the forms stored there. Keep a form package if the form matters.

## 6. If something goes wrong

| Message or problem | What to do |
| --- | --- |
| This template has no placeholders | Add at least one `{{Label}}` declaration in the body, a table, a header, or a footer. |
| A placeholder is malformed | Check the double braces and the option syntax. Every `{{` needs a `}}`. |
| The label is declared with conflicting kinds or options | Use the same label with the same field kind and the same options everywhere in that template. |
| The locale does not declare the same labels | Make every language template use exactly the same labels. |
| The select field has a different number of options | Give every language template the same number of options, in the same order. |
| A placeholder is outside the supported regions | Move it out of a text box, shape, footnote, comment, or annotation. |
| The file is larger than 25 MB | Use a smaller template. |
| The form is not stored on this device | Open the form in the browser profile that created it, or import its form package. |
| The preview looks different from the download | The preview is approximate. The downloaded document is the authoritative result. |
| Macro-enabled documents are not supported | Save the template as a normal `.docx` without macros. |

## Privacy

Docform does not upload your templates or answers. Form definitions, templates, and browser preferences stay in your browser. Export a form package if you want a backup.

Only DOCX and ODT text documents are supported. PDF, `.doc`, and macro-enabled `.docm` files are not supported.

## Tips for template authors

- Use short, meaningful labels.
- Keep select options in the same order in every language.
- Test the download, not only the preview.
- Use a clear filename for the primary template; Docform uses it as the form name.
- Export a form package before clearing browser data or changing device.
