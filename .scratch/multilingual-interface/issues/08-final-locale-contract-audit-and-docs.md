# 08: Final locale contract, full-locale audit, smoke, and docs

**What to build:** The app is fully interface-localized in Euskara, Español, and English through one provider. The old flat strings object is gone. Every surface and failure state is audited, the browser smoke flow covers interface switching, and the domain documentation records the interface-locale model.

**Blocked by:** 01 — Interface-locale foundation, switcher, app shell, and library; 02 — Localized new-form and detected-fields screens; 03 — Localized form filling and document-set download; 04 — Localized preview and document-language tabs; 05 — Localized template and variant-validation errors; 06 — Localized package and library-action errors; 07 — Localized form and preview runtime errors

**Status:** done

- [x] The old flat strings object and all direct imports are removed. Every user-facing surface reads from the interface-locale provider and catalogs.
- [x] A full audit in `eu`, `es`, and `en` covers the header, library, new-form panel, detected screen, form page, preview, not-found page, unexpected-error fallback, confirmations, warnings, `aria-label`s, iframe titles, badges, dates, and plurals. No hardcoded user-facing English remains.
- [x] Language attributes are correct: `<html lang>` is the interface locale; template-derived text uses the primary document locale; `und` omits the attribute; endonyms carry their own `lang`; no flags are used.
- [x] The interface switcher is visible and usable on every route, including error states, and never resets form answers.
- [x] Document-language behavior is unchanged: primary variant, field labels and options, document tabs, routes, packages, filenames, and IndexedDB data.
- [x] The browser smoke flow switches through `eu`, `es`, and `en`, verifies representative translated chrome, then runs the bilingual upload, fill, ZIP, and preview flow. It finishes with zero console errors.
- [x] The glossary adds “Interface locale” and distinguishes it from Locale, Language variant, Primary variant, and Variant set. A new ADR records the independence of interface locale and document language, plus the typed-catalog decision. The README describes the switcher, the three initial locales, detection and persistence, and that document content is not translated. Documentation screenshots are refreshed if the UI changed.
- [x] Typecheck, lint, tests, build, and smoke all pass.
- [x] No raw error diagnostic is rendered in a primary message. The collapsed preview “Technical details” disclosure is the only exception.
