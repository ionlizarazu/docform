# Multilingual interface

Status: ready-for-agent

## Problem Statement

The application chrome is English-only. A Basque or Spanish speaker can upload or fill documents in their language but must navigate, validate, and recover from errors in English.

The product already distinguishes document languages through language variants. Adding an interface language raises a second, separate question: what language is the app itself in, and is that the same as the language of the template, the form, or the generated document? Without a clear model, users could mistake an interface-language switch for a document-language switch, and a partial translation would leave errors, dates, counts, and assistive labels in English.

## Solution

Add an **interface locale** to the app, independent of document language variants. The initial interface locales are Basque (`eu`), Spanish (`es`), and English (`en`).

The app detects the browser language on first use, remembers the user's choice, and exposes a clearly labelled “Interface language” switcher in the header. All app chrome, validation, errors, dates, counts, and accessibility labels come from typed catalogs.

Template labels and options, form display names, document-language tabs, and generated documents remain exactly as authored. English is the fallback. No server or account is involved; the preference stays in the browser.

## User Stories

1. As a Basque-speaking user, I want the interface in Basque, so that I can use the app comfortably.
2. As a Spanish-speaking user, I want the interface in Spanish, so that I do not have to work in English.
3. As an English-speaking user, I want the interface in English, so that the current experience remains available.
4. As a first-time visitor, I want the app to start in my browser's language when it is one of the supported languages, so that I do not have to change it manually.
5. As a visitor whose browser language is not supported, I want a predictable English fallback, so that the app is still usable.
6. As a returning user, I want my chosen interface language remembered, so that I do not have to set it on every visit.
7. As a user on a shared device, I want to switch the interface language quickly, so that the next person can use their language.
8. As a form filler, I want to switch the interface language without losing answers I have already typed, so that changing language does not destroy work.
9. As a form filler, I want the template's field labels and options to remain in the document's language, so that my answers still map correctly to the generated documents.
10. As a form filler, I want the document preview tabs to keep showing the document languages, so that I do not confuse them with the interface language.
11. As a form filler, I want changing the interface language not to silently change which document variant is previewed, so that the preview remains predictable.
12. As a screen-reader user, I want the page's `lang` attribute to match the interface language, so that the screen reader pronounces the chrome correctly.
13. As a screen-reader user, I want authored form labels and options marked with their document language, so that they are pronounced correctly even when the interface language differs.
14. As a screen-reader user, I want button labels, `aria-label`s, tab lists, and the preview iframe title translated, so that no assistive text is left in English.
15. As a keyboard user, I want to reach and operate the interface-language switcher with the keyboard, so that I can change language without a mouse.
16. As a user, I want language names shown in their own language — Euskara, Español, English — so that I can find my language even when the current interface is in another one.
17. As a user, I want the switcher labelled as the interface/app language, not just “Language”, so that I do not confuse it with the document language.
18. As a user, I want dates in the library formatted for the interface locale, so that they read naturally.
19. As a user, I want counts such as “2 languages” to use the correct singular or plural form, so that the interface does not sound broken.
20. As a user, I want status labels such as “single”, field-kind badges, and language counts translated, so that no identifier-like English leaks into the interface.
21. As a template author, I want upload and variant-validation errors in my interface language, so that I can fix the template without translating English.
22. As a template author, I want variant errors to name the locale, labels, field kinds, and option counts involved, so that the localized message is still actionable.
23. As a user, I want package import and export errors localized, so that failures are understandable.
24. As a form filler, I want form-load and fill errors localized, so that I know what went wrong.
25. As a user, I want a localized preview-failure message, with technical details optional and collapsed, so that the main message is clear without hiding diagnostics.
26. As a user, I want the unknown-route and unexpected-error pages localized, so that even failure states are in my language.
27. As a user, I want confirmation and unsaved-answer warnings localized, so that I understand the consequence before leaving.
28. As a user, I want no mixed-language UI after switching, so that the interface feels finished.
29. As a mobile user, I want the switcher to remain usable in the header, so that language selection is not desktop-only.
30. As a developer, I want a typed catalog that fails typecheck when a key is missing, so that translations cannot silently fall back to English.
31. As a developer, I want to add a future locale by adding one catalog and one supported-locale entry, so that the architecture is extensible.
32. As a developer, I want the domain and service layers to report stable error codes and values, not localized prose, so that they remain independent of the interface locale.
33. As a maintainer, I want the interface locale kept out of form definitions, routes, packages, and IndexedDB, so that changing my language never changes a form's identity or data.
34. As a maintainer, I want the preference to survive reloads and deep links, so that opening a form route directly uses the chosen language.
35. As a user with storage disabled or unavailable, I want the app to keep working with an in-memory choice, so that privacy settings do not break the page.
36. As a translator, I want one catalog per locale with all interface strings in one place, so that reviews are practical.
37. As a user, I want the app name and the DOCX/ODT format names left unchanged, so that technical names stay recognizable.
38. As a user, I want the interface switcher visible on the library, form, preview, and error pages, so that I can change language wherever I am.

## Implementation Decisions

- **Confirmed seam:** one app-level interface-locale provider and `useI18n`-style hook is the only new test seam. Every page and component reads its messages from that hook; tests wrap pages in the same provider with an explicit locale. Error localization is folded into the same module, not a second UI seam.
- **Model:** introduce a closed `InterfaceLocale` union of `eu`, `es`, and `en`, with English as the fallback. Keep the existing document `Locale` concept separate. The initial switcher order is Euskara, Español, English.
- **Catalogs:** use typed message catalogs, one per interface locale. English defines the message shape; Spanish and Basque must satisfy the same type. Static messages are strings; dynamic messages such as counts, labels, dates, and errors are functions. No runtime i18n library or message-format dependency. A missing or extra catalog key fails typecheck.
- **Provider:** an app-level provider initializes the locale synchronously from a saved preference, then from the first supported language in `navigator.languages`, then English. It accepts an explicit initial locale for tests. Changing locale updates context state and does not remount the routed page tree, so form answers survive. The provider sits above the routed page tree and the error boundary so the header switcher remains available if a page crashes.
- **Persistence:** store the preference under a single `localStorage` key such as `docform.interface-locale`; ignore invalid stored values. Reading or writing failures are caught and degrade to an in-memory choice. The preference is not stored in IndexedDB, form definitions, routes, or form packages. Cross-tab live synchronization and URL parameters are not part of this iteration.
- **Switcher:** a labelled select in the app header, visible on all routes including error states. The visible and accessible label says “Interface language” in the current interface language, not just “Language”. Options are endonyms with `lang` attributes; no flags. The current locale is selected, and changing it persists immediately.
- **DOM and accessibility:** update `<html lang>` to the interface locale. For text that comes from templates, set the container's `lang` to the primary document locale when it is a real locale, and omit it for `und`. Translate `aria-label`s, iframe titles, tab-list labels, and status text. The three initial languages are left-to-right.
- **Dates and counts:** format dates with `Intl.DateTimeFormat` using the interface locale. Use `Intl.PluralRules` or equivalent locale-aware logic for counts. Library upload dates, “N languages”, and any pluralized message follow the interface locale.
- **String scope:** all app chrome, empty/loading/error states, form labels that are not template labels (for example “Choose…”), field-kind badges, “single” and language counts, new-form dynamic labels such as “Template 1” and “Locale 2”, confirmations, and warnings are catalogued. Template-derived labels and options, form display names, route hashes, format names DOCX/ODT, locale tags, and the Docform brand are not translated.
- **Document-language independence:** the interface locale does not change the primary variant, field labels or options, or the active document preview tab. The preview defaults to the first filled document exactly as it does now; document-language tabs remain explicit.
- **Naming:** the new-form locale input is a document language tag, labelled so it is distinct from the interface language. The preview tab list is labelled “Document languages” (localized), while the header control is “Interface language”. The glossary terms Locale, Language variant, Variant set, Primary variant, and Interface locale must remain distinct.
- **Error contract:** `TemplateError` and the service's thrown error type gain a stable `detail` sub-reason and structured `params` for the values a localized message needs: locale, primary locale, label, missing and extra labels, field kinds, option counts, maximum size, path, placeholder, modifier, answer, and index. The existing English `message` remains a developer and diagnostic fallback and must never be rendered. Domain and service code do not import the i18n catalogs and do not receive the interface locale.
- **Error rendering:** one central adapter maps an error code, detail, and params to the current catalog. It covers every user-facing error currently built in parsing, variant validation, ingest, fill, rename, import/export, and not-found paths. The library's error heading becomes a generic localized message instead of reusing “This file could not be used.” Unknown errors render a localized generic message and log the raw error to the console. The class-based error boundary's fallback is rendered through a hook-aware child so it receives localized copy.
- **Preview failures:** show the localized generic “preview could not be rendered” message. Put the raw renderer reason in a collapsed, localized “Technical details” disclosure; it may remain English and is not part of the primary message.
- **No data-format changes:** form routes, form package versions, IndexedDB schemas, and filled-document filenames are unchanged. The interface locale is a presentation preference only.
- **Docs:** add “Interface locale” to the glossary, distinguish it from document Locale and Language variant, and record the independence and typed-catalog decision in a new ADR. Update the README with the switcher and the three initial languages.

## Testing Decisions

- Good tests assert user-visible behavior under a fixed interface locale, not the internal shape of the catalog. They should not require every translated sentence to be duplicated in test code.
- Keep the existing high test seams: page-level tests with the services provider, and service-level tests for ingest, fill, and package behavior. Add the interface-locale provider to the page test wrapper with an explicit locale; do not create a mock i18n layer.
- Unit-test locale resolution as a pure decision: a valid saved value wins; otherwise use the first supported base language in `navigator.languages`; unsupported, empty, or invalid values fall back to English. Include `eu-ES`, `es-ES`, `en-US`, and a mixed unsupported-first list.
- Unit-test number/plural and date formatting for fixed inputs in all three locales, using `Intl` expectations and avoiding brittle hard-coded month names where ICU data can vary.
- Unit-test the central error adapter for representative codes from every family: parsing, variant validation, package, and runtime. Include a code with missing/extra labels, a code with option counts, and an unknown error. Assert that localized text is returned and the English diagnostic `message` is not rendered.
- Add page tests for the library, new-form panel, form page, detected screen, preview, not-found page, and error fallback in `es` and `eu`. Assert representative controls, headings, `aria-label`s, and the `<html lang>` value. Keep English tests as the baseline.
- Test that switching interface language while answers are dirty preserves the answers, and that changing language does not change the preview's active document tab.
- Test that form text coming from templates carries the primary document `lang`, and that `und` omits it.
- Test persistence: change the locale, unmount and remount, and confirm the saved choice is used. Test that a throwing `localStorage` does not prevent rendering.
- Extend the browser smoke flow to switch the interface to `eu` and `es`, assert representative translated chrome, then return to `en` for the existing bilingual upload, fill, ZIP, and preview flow. This keeps document-language behavior covered without duplicating the whole flow per interface locale.
- Prior art: the existing page-level tests for the library, form, and preview; the existing service tests for upload, fill, and package errors; the existing smoke flow for the real-browser path. Catalog completeness is enforced by typecheck rather than a runtime key-comparison test.
- Add a test that a `variant-mismatch` error in a non-English locale mentions the affected labels, proving the structured error params survived the handoff from the domain to the UI.

## Out of Scope

- Translating template content, field labels, field options, form display names, uploaded filenames, or generated documents.
- Automatically selecting a document preview tab based on the interface locale.
- Translating form package data or storing the interface preference in a form package or IndexedDB.
- Languages beyond `eu`, `es`, and `en` in this iteration; the architecture should make adding them straightforward.
- Right-to-left layout and languages that require it.
- A `?lang=` query parameter, language-prefixed routes, or shareable language-specific links.
- Live cross-tab language synchronization.
- Translating browser-native UI such as the file picker, print dialog, or the OK and Cancel buttons of a native confirm dialog. The app-provided message is localized; the surrounding native UI follows the browser.
- Localizing the static `<meta name="description">`, manifest metadata, or service-worker notifications.
- A full ICU MessageFormat pipeline, external translation-management service, or runtime translation loading.
- User accounts, cloud sync, or server-side rendering.

## Further Notes

- The confirmed product seam is independence: the interface locale changes chrome, validation, and accessibility only. Document language variants remain a separate concern.
- Basque copy should be standard Euskara Batua, not a copy of Spanish; Spanish should be neutral; English is the source and fallback. Native-speaker review of the `eu` and `es` catalogs is expected before release.
- Do not use flags for languages. Endonyms plus `lang` attributes are more accurate and inclusive.
- The switcher wording matters: “Interface language” avoids confusion with the document-language tabs. The new-form locale field and the preview tab list need similarly explicit copy.
- Adding a locale later should mean adding one catalog, adding it to the supported list and switcher order, and adding representative tests; no page or component changes.
- The three-language set is intentionally small; the typed catalog and `Intl` helpers are the extension point.
