# 02: Localized new-form and detected-fields screens

**What to build:** The authoring entry flow is fully localized. A template author can open the New Form panel, add and remove languages, choose the primary language, see local validation, and create the form. After upload or import, the detected-fields screen presents the variant set and option pairing in the interface locale. Template field labels and options remain exactly as authored.

**Blocked by:** 01 — Interface-locale foundation, switcher, app shell, and library

**Status:** done

- [x] The New Form panel copy, buttons, hints, “Template N” and “Document language N” labels, file and locale labels, primary choice, add/remove language, create, and cancel are catalogued in `eu`, `es`, and `en`.
- [x] Local panel validation is localized: missing file, invalid locale, duplicate locale, and no primary language. Service and domain upload errors are deferred to ticket 05.
- [x] Switching the interface language while the panel is open preserves the draft rows, selected files, locale values, and primary choice.
- [x] The naming distinguishes the interface language in the header from the document language tag in the panel; the panel's locale input is explicitly labelled as a document language.
- [x] The detected-fields screen localizes its heading, language-variant list, primary marker, format labels, field-kind badges, option-pairing guidance, open-form and back actions, and the `und` label.
- [x] Template field labels and options are not translated. Detected template text carries the primary document `lang` when known and omits it for `und`.
- [x] Tests in `eu` and `es` cover the panel, detected screen, draft preservation across an interface-language switch, and `lang` correctness. The English tests remain the baseline.
- [x] Typecheck, lint, and tests pass.
