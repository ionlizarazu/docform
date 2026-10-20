# Docform

A client-only React app that turns a DOCX or ODT document containing `{{placeholders}}` into a fillable form and returns a filled document. Nothing leaves the browser.

![The form library](docs/screenshots/library.png)

## What it does

1. A template author uploads a `.docx` or `.odt` file.
2. The app detects every placeholder, snapshots a form definition, stores everything in IndexedDB, and returns a stable route keyed by the file's SHA-256.
3. A filler opens the route, completes the form, optionally previews and prints it, and downloads a filled document in the original format.
4. The library lists forms stored in this browser, with rename, delete, and export/import of a portable `.formpack.json`.

The same bytes always resolve to the same route, and the form definition never changes under an existing route. An edited template is a new route.

![Detected fields](docs/screenshots/detected-fields.png)

## Placeholder grammar

```text
{{Label}}                       text field
{{Label|textarea}}              textarea field
{{Label[One;;Two;;Three]}}      select field
```

- `;;` separates options. Inside an option, a single `;`, a `,`, and a `|` are literal characters.
- Labels are trimmed, internal whitespace is collapsed, and identity is case-sensitive.
- Repeating the same declaration collapses to one field; declaring the same label differently is an error.
- All fields are optional. A blank answer substitutes an empty string.
- Only `text`, `textarea`, and `select` exist. An unknown modifier such as `|number` is rejected.

Placeholders are supported in the document body, tables, headers, and footers. Placeholders in text boxes, shapes, footnotes, comments, or annotations are rejected at upload.

![The generated form](docs/screenshots/form.png)

## Run

```bash
npm install
npm run dev
```

Build and verify:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run smoke` drives a real Chrome through upload, fill, download, DOCX preview, and ODT preview using the system Chrome at `/usr/bin/google-chrome`. It writes screenshots and a filled fixture to `/tmp/opencode/docform-smoke`.

## Storage and privacy

- Templates, form definitions, and display names live in IndexedDB under `template-form-docs`.
- There is no server, no account, no analytics, and no runtime network call for form data.
- A route only resolves in the browser profile that stored it. Clearing site data removes it.
- Export a `.formpack.json` to back up or move a form. Importing the same package twice is idempotent.

## Architecture

- `src/domain/` — declaration grammar, DOCX/ODT text-node substitution, package detection, hashing.
- `src/app/TemplateForms.ts` — the application service the UI consumes: ingest, list, get, rename, remove, fill, export/import.
- `src/storage/` — the IndexedDB store.
- `src/preview/` — a `PreviewRenderer` port with lazy `docx-preview` and `@opendocument/odr-core` adapters.
- `src/pages/` — library, form, preview, and not-found pages.

Substitution is implemented in-house on JSZip plus XML text-node editing, so the custom grammar stays authoritative and split runs/spans are handled directly. `docx-preview` and `odr-core` are used only for the approximate preview.

Preview HTML is isolated in an opaque-origin iframe (`sandbox="allow-scripts"` with no same-origin access). Document scripts and inline event handlers are stripped; the only injected script is a print bridge driven by `postMessage`.

![DOCX preview](docs/screenshots/docx-preview.png)
![ODT preview](docs/screenshots/odt-preview.png)

## Limits

- DOCX and ODT only. No PDF, `.doc`, or macro-enabled `.docm`.
- No configuration editor: the template declares its own fields.
- All fields are optional; there are no required, conditional, or computed fields.
- Preview is approximate. The downloaded document is authoritative.
- Forms are local to one browser profile; there are no share links, accounts, or collaboration.

## Design docs

- Spec: [`.scratch/template-form/spec.md`](.scratch/template-form/spec.md)
- Glossary: [`GLOSSARY.md`](GLOSSARY.md)
- ADR: [`docs/adr/0001-inline-field-declarations.md`](docs/adr/0001-inline-field-declarations.md)
