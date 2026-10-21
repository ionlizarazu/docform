# 07: Localized form and preview runtime errors

**What to build:** Failed form loads, fills, and preview fills show localized messages in every interface locale. This includes invalid answers, missing variant templates, option-count problems, invalid stored formats, and missing forms. Technical renderer details stay secondary and collapsed.

**Blocked by:** 01 — Interface-locale foundation, switcher, app shell, and library; 03 — Localized form filling and document-set download; 04 — Localized preview and document-language tabs; 06 — Localized package and library-action errors

**Status:** ready-for-agent

- [ ] Service runtime errors for form load, form fill, invalid answer, missing variant template, option-count mismatch, invalid stored format, and form not-found gain stable detail values, required parameters, and localized messages in `eu`, `es`, and `en`.
- [ ] The form page uses the adapter for load and fill failures. Headings and details are localized, and the raw service message is not rendered.
- [ ] The preview page uses the adapter for fill failures. Preview rendering failures keep the localized generic message and the technical-details disclosure from ticket 04.
- [ ] A missing form uses the localized not-found page. No raw English service message appears on the page.
- [ ] Service tests assert codes, details, and required values. Page tests with a rejecting forms API in `eu` and `es` assert localized load and fill errors and the absence of the English diagnostic.
- [ ] Success paths, answers, downloads, routes, packages, and stored data are unchanged.
- [ ] Typecheck, lint, and tests pass.
