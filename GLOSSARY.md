# Docform

A client-only tool that turns one or more DOCX or ODT templates into one fillable form and returns a filled document per language variant.

## Language

**Template**:
A DOCX or ODT document uploaded by a template author, containing zero or more placeholders.
_Avoid_: Source file, document, form

**Language variant**:
One template in a form's variant set, tagged with a locale and producing one filled document.
_Avoid_: Translation, copy, version

**Variant set**:
The ordered collection of language variants filled by one form.
_Avoid_: Template pair, language pack

**Primary variant**:
The variant whose labels, field order, and select options the filler sees.
_Avoid_: Main template, base file

**Locale**:
A language tag such as `en`, `es`, `eu`, or `en-GB`. A document language and an interface locale are both locales, but they are chosen separately.
_Avoid_: Language code, selector

**Document language**:
The language of a template, its labels and options, and its filled document.
_Avoid_: Form language, template language (when ambiguous)

**Interface locale**:
The language of the app chrome, validation, dates, and assistive labels. It is independent of document languages.
_Avoid_: UI language, app language (when ambiguous)

**Option pairing**:
The positional correspondence between the options of the same select field across variants.
_Avoid_: Selector mapping, option translation

**Placeholder**:
A `{{...}}` expression in a template that declares a field and marks where its answer belongs.
_Avoid_: Variable, token, merge field

**Inline declaration**:
The part of a placeholder that determines the kind of field it produces.
_Avoid_: Configuration, field config, schema

**Field**:
One value the filler supplies, declared by a placeholder in the template.
_Avoid_: Input, question, control

**Select field**:
A field whose answer must be one of the options declared in the template.
_Avoid_: Dropdown, choice, enum

**Form definition**:
The shared ordered set of fields captured from a variant set; each variant carries its own select option labels.
_Avoid_: Schema, configuration, config

**Form route**:
The stable URL that renders one form definition.
_Avoid_: Link, page, endpoint

**Form package**:
A portable file containing every variant template and the shared form definition.
_Avoid_: Backup, export file, archive

**Fill**:
One set of answers supplied against a form definition.
_Avoid_: Submission, response

**Filled document**:
One variant's template with every placeholder replaced by its supplied value.
_Avoid_: Output, result, generated document

**Filled document set**:
One filled document per language variant, delivered together.
_Avoid_: Output bundle, translations

**Substitution**:
Replacing each placeholder with its answer when producing a filled document.
_Avoid_: Rendering, merge

**Approximate preview**:
A non-authoritative rendering of one filled document for screen viewing and printing.
_Avoid_: Preview (unqualified), PDF view

**Template author**:
The person who uploads templates and declares their fields and selectable options.
_Avoid_: Admin, uploader, editor

**Filler**:
The person who completes a form once and downloads the filled document set.
_Avoid_: End user, respondent
