# Docform

A client-side tool that turns a DOCX or ODT template containing placeholders into a fillable form and returns a filled document.

## Language

**Template**:
A DOCX or ODT document uploaded by a template author, containing zero or more placeholders.
_Avoid_: Source file, document, form

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
The ordered set of fields captured from one template when it is uploaded.
_Avoid_: Schema, configuration, config

**Form route**:
The stable URL that renders one form definition.
_Avoid_: Link, page, endpoint

**Form package**:
A portable file containing everything needed to restore one form on another browser.
_Avoid_: Backup, export file, archive

**Fill**:
One set of answers supplied against a form definition.
_Avoid_: Submission, response

**Filled document**:
The template with every placeholder replaced by its supplied value.
_Avoid_: Output, result, generated document

**Substitution**:
Replacing each placeholder with its answer when producing the filled document.
_Avoid_: Rendering, merge

**Approximate preview**:
A non-authoritative rendering of a filled document for screen viewing and printing.
_Avoid_: Preview (unqualified), PDF view

**Template author**:
The person who uploads a template and declares its selectable options.
_Avoid_: Admin, uploader, editor

**Filler**:
The person who completes a form definition and downloads the filled document.
_Avoid_: End user, respondent
