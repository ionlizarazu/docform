# 03: Localized form filling and document-set download

**What to build:** A filler can use the entire form page in Euskara, Español, or English. They fill once, preview, and download the single document or the document set. Answers survive an interface-language switch. Template field labels and options stay in the document's language.

**Blocked by:** 01 — Interface-locale foundation, switcher, app shell, and library

**Status:** done

- [x] The form page localizes its headings, “all fields are optional”, “Choose…”, single-document and document-set download labels, preview action, locale badges, `und` label, loading text, and not-found state in `eu`, `es`, and `en`.
- [x] The unsaved-answer leave warning is localized; the existing confirm and leave behavior is unchanged.
- [x] Switching the interface language while answers are dirty preserves every answer and the dirty state.
- [x] Template field labels and options are not translated. Their container and labels carry the primary document `lang` when it is a real locale, and omit it for `und`.
- [x] Download filenames, form routes, stored forms, and document package behavior are unchanged.
- [x] The page's own failure headings are localized. Raw service error detail is deferred to ticket 07.
- [x] Tests in `eu` and `es` cover field rendering, answer preservation across a language switch, download and preview actions, `lang`, and the not-found state. The English tests remain the baseline.
- [x] Typecheck, lint, and tests pass.
