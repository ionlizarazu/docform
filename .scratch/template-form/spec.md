# Docform

Status: done

## Multilingual extension

The product now supports **multilingual variant sets**, implemented after the original single-template spec. A form owns an ordered set of language variants: one template per locale, tagged at upload, with exactly one primary variant. The filler fills once; the app produces one filled document per variant and downloads them as one ZIP.

- Every variant must declare the same labels and field kinds. Field order may differ; the form follows the primary variant's order.
- Select fields must declare the same number of options in every variant. Options are paired **by position** across variants. The app shows a read-only pairing table at upload; there is no mapping editor.
- The primary variant supplies the labels, field order, and select options shown to the filler.
- A multi-variant route is a hash of the ordered variant list and the primary locale. A single template uploaded with the legacy `und` locale keeps the original content-hash route.
- Form packages use a version 2 manifest; version 1 packages still import as a single `und` variant.
- Adding, removing, or editing a variant creates a new route.
- The user stories, implementation decisions, and testing decisions below describe the original single-template baseline. A single-template form is now a variant set of one.
- See [`docs/adr/0002-language-variant-sets.md`](../../docs/adr/0002-language-variant-sets.md).

## Problem Statement

People who own a DOCX or ODT template full of `{{placeholders}}` need other people to fill it in, but sending the raw document invites layout damage, accidental edits, and inconsistent answers. Manually replacing placeholders is slow and error-prone, and a fixed web form built by hand drifts from the document every time the template changes.

The template author needs to upload a document once and get a stable form route that always renders the same fields for that document. The filler needs to open that route, answer a small form, and download the document with their answers in the right places, without an account or a server.

## Solution

A client-only React application that turns a DOCX or ODT template into a fillable form:

- The template author uploads a DOCX or ODT file whose placeholders declare their own field kinds and select options.
- The app validates the template, snapshots a form definition, stores both the template and the definition in the browser, and exposes an immutable route keyed by the template's content hash.
- The filler opens the route, completes the form, optionally views an approximate preview, prints it, and downloads a filled document in the original format.
- A library lists forms stored in that browser, with rename, delete, and export/import of a form package.

Nothing leaves the browser.

## User Stories

### Template author

1. As a template author, I want to upload a DOCX template, so that I can turn an existing document into a form without rebuilding it.
2. As a template author, I want to upload an ODT template, so that LibreOffice-based documents are supported equally.
3. As a template author, I want the app to detect every placeholder in my document, so that I know the form is complete before I publish it.
4. As a template author, I want to see the detected fields in a read-only list after upload, so that I can confirm the app understood my declarations.
5. As a template author, I want a stable form route for each upload, so that I can bookmark or share it on this device.
6. As a template author, I want the same file bytes to resolve to the same route every time, so that re-uploading does not create duplicates.
7. As a template author, I want an edited template to produce a new route while keeping the old form, so that I never silently change what a published route renders.
8. As a template author, I want a clear list of validation errors when an upload is rejected, so that I can fix the document.
9. As a template author, I want to know when a placeholder sits in an unsupported region, so that I do not ship a form with silently unfilled text.
10. As a template author, I want uploads with zero placeholders rejected, so that I do not create an empty form.
11. As a template author, I want files that are not really DOCX or ODT rejected, so that renaming a PDF to `.docx` fails safely.
12. As a template author, I want a library of my forms, so that I can return to them later.
13. As a template author, I want to rename a form in the library, so that the list is readable, without changing its route.
14. As a template author, I want to delete a form after confirming, so that I can remove templates I no longer need.
15. As a template author, I want to export a form package, so that I can back it up or move it to another browser.
16. As a template author, I want to import a form package, so that the same route is restored on another device.
17. As a template author, I want to be told that forms are stored only in this browser, so that I understand the risk of clearing site data.
18. As a template author, I want to re-import a package that already exists without creating a duplicate, so that imports are idempotent.

### Filler

19. As a filler, I want to open a form route and see the form immediately, so that I do not need an account or an app install.
20. As a filler, I want to see the template's display name as the form title, so that I know I am filling the right document.
21. As a filler, I want fields in the order they appear in the document, so that the form follows the document's logic.
22. As a filler, I want text fields for plain placeholders, so that short values are easy to enter.
23. As a filler, I want textareas for `|textarea` placeholders, so that long values are comfortable to write.
24. As a filler, I want select fields to show exactly the options declared in the template, so that I cannot invent a value the document does not expect.
25. As a filler, I want a select to start blank, so that I make a deliberate choice instead of accepting an accidental default.
26. As a filler, I want to leave any field blank, so that optional parts of the document stay empty.
27. As a filler, I want a blank answer to remove its placeholder from the document, so that no template syntax survives into the download.
28. As a filler, I want the same field to appear once even if the placeholder repeats, so that I do not answer the same question twice.
29. As a filler, I want my answer inserted at every occurrence of its placeholder, so that repeated references stay consistent.
30. As a filler, I want an approximate preview of the filled document, so that I can check the result before downloading.
31. As a filler, I want the preview clearly labelled as approximate, so that I know the downloaded file is authoritative.
32. As a filler, I want to print the preview, so that I can produce a paper or PDF copy from the browser.
33. As a filler, I want to download the filled document in the same format I uploaded, so that it still opens in Word or LibreOffice.
34. As a filler, I want the download named `<original>-filled`, so that I can tell it apart from the template.
35. As a filler, I want the document's formatting preserved around substituted values, so that the template's design survives.
36. As a filler, I want newlines in a textarea answer to become line breaks, so that multi-line answers keep their shape.
37. As a filler, I want answers containing `{{` or `}}` inserted literally, so that my text is never interpreted as template syntax.
38. As a filler, I want to be warned before leaving a partly completed form, so that I do not lose work by accident.
39. As a filler, I want a clear "form not found on this device" page for an unknown route, so that I understand why the link does not work.
40. As a filler, I want the download to remain available when preview conversion fails, so that an unusual document does not block me.
41. As a filler, I want the form to work on a phone as well as a desktop, so that I can fill it wherever I am.
42. As a filler, I want to complete the form with a keyboard and a screen reader, so that the form is accessible.

### Platform

43. As a user, I want my documents to stay in my browser, so that confidential templates never leave my machine.
44. As a user, I want the app to work without a network connection after it loads, so that I can fill forms offline.
45. As a user, I want clear, specific error messages instead of a blank screen, so that I can recover from failures.
46. As a user, I want the app to refuse uploads above the size limit with a clear message, so that I do not hit an opaque browser failure.
47. As a user, I want the interface in English with all strings centralised, so that translation can be added later without rewriting components.

## Implementation Decisions

### Stack and shape

- React 19 + TypeScript + Vite, on the existing template.
- Client-side routing with three pages: the library, the form at `/f/<route>`, and the preview at `/f/<route>/preview`. Upload is an action on the library page, not a separate route.
- No server, no authentication, no network calls at runtime, no analytics.
- Static hosting; all data lives in IndexedDB.

### Identity and determinism

- A form's route is the lowercase hex SHA-256 of the exact uploaded bytes, computed with Web Crypto.
- The form definition is snapshotted at ingest and stored beside the template bytes. Routes never re-parse the template, so app upgrades cannot change an existing form.
- The same bytes always produce the same route and the same definition; byte-identical re-upload returns the existing form with an `existed` flag.
- An edited template produces a new route. The old form and its bytes remain until explicitly deleted.
- Renaming changes display metadata only; route, definition, and answers are unaffected.

### Inline declaration grammar

- `{{Label}}` produces a text field.
- `{{Label|textarea}}` produces a textarea field.
- `{{Label[o1;;o2;;o3]}}` produces a select field, with `;;` separating options.
- Inside an option, `;`, `,`, and `|` are literal characters. `]` terminates the option list and is not allowed inside an option.
- `{{Label[]}}`, an empty label, an empty option, a missing `]`, and a declaration mixing `|textarea` with `[...]` are errors.
- An unknown modifier such as `{{Label|number}}` is an error, not a text field.
- A label is trimmed, has internal whitespace collapsed to single spaces, and is Unicode NFC-normalised. Identity is case-sensitive.
- Repeated declarations with the same label and same kind collapse into one field. The same label with different kinds or options is an error.
- No escaping exists for literal `{{`; templates that need it are out of scope.

### Form definition and answers

- A form definition is `{ route, format, fields }`, where each field is `{ label, kind, options? }` with `kind` one of `text`, `textarea`, `select`, and `options` present only for select fields.
- Field order is the document order of each field's first occurrence.
- Answers are keyed by the exact field label. The implementation uses a key-safe structure rather than a plain object, so labels such as `__proto__` cannot corrupt state.
- All fields are optional. A select answer must be the empty string or one of its declared options; anything else is rejected by the application service.
- Duplicate options within one declaration collapse to the first occurrence.

### Template validation

- Detect format by ZIP signature plus package metadata, never by filename extension. Accept only OOXML wordprocessing and ODF text packages.
- Reject `.doc`, `.docm`, PDF, archives that are neither format, and files above 25 MB.
- Reject a template with zero placeholders.
- Reject placeholders in unsupported regions: DOCX text boxes, shapes, footnotes, and comments; ODT text boxes, footnotes, and annotations.
- Supported regions: DOCX body, tables, headers, and footers (`word/document.xml`, `word/header*.xml`, `word/footer*.xml`); ODT body, tables, headers, and footers (`content.xml`, `styles.xml`).
- Every rejection returns a structured list of errors with a code, a human-readable message, and the label or location where known. Ingest never fails silently and never partially stores a form.

### Substitution

- Substitution is implemented in-house on JSZip plus XML DOM traversal, for both formats. No fill library is used, because the declaration grammar is custom.
- Within each paragraph, adjacent text nodes are merged before matching, so placeholders split across DOCX runs or ODT spans are found.
- The answer is written into the first text node's position, inheriting that node's formatting; the remaining matched text nodes are emptied. The first node's formatting wins when the placeholder spans differently formatted runs.
- A placeholder split across paragraphs is treated as malformed and rejected at ingest.
- Textarea newlines become a line break inside the same paragraph: `<w:br/>` for DOCX, `<text:line-break/>` for ODT.
- Blank answers substitute an empty string.
- Answers are inserted as literal text, never re-parsed as placeholders.
- Every occurrence of a field receives the same value.
- The ZIP package structure, untouched parts, and unrelated XML are preserved; only the affected text nodes change.

### Storage

- IndexedDB database `template-form-docs`, object store `forms`, keyed by route.
- Each record holds: route, display name, original filename, format, template bytes as a Blob, the snapshotted form definition, and creation time.
- Delete removes the record and with it the route. Unknown routes render the not-found page.
- No draft persistence. A dirty form warns on unload.

### Form package

- A package is a single `.formpack.json` file with a versioned manifest: version, route, display name, original filename, format, definition, template bytes as base64, and creation time.
- Import validates the manifest shape, recomputes the template hash, and rejects the package if it does not equal the recorded route.
- Importing a route that already exists returns the existing form instead of duplicating it.

### Preview and download

- Preview is exposed through a `PreviewRenderer` port: `render(filledDocument)` returns rendered HTML or an unavailable reason.
- DOCX preview uses `docx-preview`. ODT preview uses `@opendocument/odr-core`, dynamically imported only when an ODT preview is requested.
- Rendered preview content is isolated in a sandboxed iframe; document-supplied scripts must not execute.
- Printing uses the iframe's print path with a scoped print stylesheet sized for A4 and with app chrome hidden.
- Conversion failure or timeout shows a download-only notice; it never blocks filling or downloading.
- WebODF is excluded because it is AGPL and unmaintained.

### Application service

`TemplateForms` is the only surface the UI consumes. It hides parsing, hashing, storage, and substitution:

- `ingest(file)` → `{ ok: true, route, definition, displayName, existed }` or `{ ok: false, errors }`
- `list()` → form summaries
- `get(route)` → definition and display name, or null
- `rename(route, displayName)`
- `remove(route)`
- `fill(route, answers)` → `{ blob, filename }`
- `exportPackage(route)` → Blob
- `importPackage(file)` → summary, or validation errors

Typed error results are used for user-correctable failures; unexpected failures surface through an error boundary.

### UI

- Library: upload action, form list with display name, route, upload date, rename, delete with confirmation, export, and import.
- Form page: title from the display name, fields in definition order, labels associated with controls, select starting on a blank entry, no required markers.
- Preview page: approximate-preview notice, print action, download action, fallback notice on failure.
- Not-found page: explains that forms are stored locally and offers the library and upload actions.
- All user-facing strings in one module. English only in v1.
- Keyboard accessible, screen-reader labelled, responsive.

### Dependencies

- Runtime: JSZip (reading and writing packages), `docx-preview`, `@opendocument/odr-core` (dynamic, ODT preview only), a small IndexedDB wrapper, a router.
- Development: Vitest, React Testing Library, `fake-indexeddb`, jsdom, and Playwright for the browser-only preview path.
- No fill library; no AGPL dependency.

## Testing Decisions

A good test asserts external behaviour: what a template author or filler observes, or what a document contains after a round trip. Tests must not assert private function calls, internal module structure, or exact DOM implementation details.

### Seam A — `TemplateForms` integration tests

This is the primary seam and the highest one available. The parser, store, hashing, and substitution are exercised through it, never tested directly.

- Fixtures are real DOCX and ODT documents committed with the suite, covering: placeholders split across runs/spans, placeholders in tables, headers, and footers, each of the three field kinds, literal `;` and `,` inside select options, repeated placeholders, and multi-line answers.
- Ingest tests assert the resulting definition, field order, route determinism, deduplication, snapshot stability, and the exact error codes for malformed declarations, unknown modifiers, conflicting labels, empty options, zero placeholders, unsupported regions, and non-package uploads.
- Fill tests unzip the output and assert that no placeholder remains, that values landed at every occurrence, that surrounding text is unchanged, that the first run's formatting is preserved, and that textarea newlines became line breaks.
- Store tests run against `fake-indexeddb`: save, list, get, rename without route change, delete, not-found, export/import round trip restoring the same route, and idempotent import.
- Determinism tests assert the same bytes yield the same route and that a changed document yields a different one.

### Seam B — preview port

Tests inject a fake renderer to assert that preview HTML is shown when available and that a download-only fallback appears when the port reports unavailable or throws. The real renderers are covered by one Playwright smoke test that uploads a DOCX and an ODT fixture, opens preview, and asserts the print and download controls exist.

### UI tests

Page tests run above a faked `TemplateForms`: upload success and error lists, library rendering and actions, field order and control kinds, select options and blank default, blank answers accepted, download triggered with the expected filename, unload warning for a dirty form, not-found page, and preview fallback.

### Tooling and prior art

There is no test infrastructure or prior art in this repository; this spec establishes the patterns. Vitest is the runner, React Testing Library for pages, `fake-indexeddb` for storage, and Playwright for the single browser-only smoke path. The in-house parser and document writer justify a rich fixture suite: they are the highest-risk code, and fixtures are the only honest way to test them.

## Out of Scope

- PDF templates, legacy `.doc`, and macro-enabled `.docm`.
- A configuration editor or any post-upload field editing.
- Required fields, conditional fields, computed fields, validation beyond select membership.
- Field kinds beyond text, textarea, and select; multi-select; number, date, checkbox, radio, file, or image answers.
- Draft persistence, autosave, submissions history, or a JSON sidecar of answers.
- Backend storage, accounts, authentication, cross-device share links, collaboration, or email delivery.
- Folders, tags, search, sorting, or pagination in the library.
- Placeholders in text boxes, shapes, footnotes, comments, tracked-change semantics, or field instructions.
- Escaping literal `{{` in templates.
- Document conversions, rendering the document to PDF on the server, or signature workflows.
- Internationalisation beyond centralised English strings, analytics, telemetry, and offline install (PWA).

## Further Notes

- `GLOSSARY.md` defines the vocabulary used above; `docs/adr/0001-inline-field-declarations.md` records why the template owns field declarations.
- Client-only storage is the deliberately accepted constraint: a route only resolves in the browser profile that stored it. Export/import is the only portability mechanism.
- The 25 MB upload cap is a v1 default and should be a single constant, easy to revisit.
- Library research confirmed the chosen split: in-house substitution for both formats, `docx-preview` for DOCX preview, and lazy `odr-core` for ODT preview. Text boxes and shapes were excluded because neither renderer nor writer handles them reliably.
- The riskiest implementation area is the in-house text-node substitution across split runs and spans; the fixture suite in the testing decisions is the mitigation.
