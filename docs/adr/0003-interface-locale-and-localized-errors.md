# Interface locale is independent of document language

Status: accepted

Docform now has two language concepts. A **document language** belongs to a template and its language variant; it governs the labels, options, and filled document. An **interface locale** belongs to the browser and governs the app chrome, validation, dates, counts, and assistive labels. The initial interface locales are Basque, Spanish, and English.

We keep them independent. Changing the interface locale never changes the primary variant, the template labels or options, the document-language tabs, or the generated documents. The filler sees authored template content in its document language while the surrounding controls use the interface locale. The header control is labelled “Interface language” so it cannot be mistaken for the document-language tabs.

The interface locale resolves from a saved browser preference first, then the first supported base language in the browser's language list, then English. The preference lives in browser-local storage only. It is not part of a form definition, route, package, or IndexedDB record. Changing it does not create a new form.

Catalogs are typed in-house, one per locale. English defines the message shape; Spanish and Basque must satisfy the same type, so a missing key fails typecheck. Dynamic messages are functions; static messages are strings. We did not add a runtime i18n library because the product has three locales, no server, and no runtime-loaded translations. `Intl.DateTimeFormat` and `Intl.PluralRules` (or equivalent) handle dates and counts.

Errors cross the domain/UI boundary as stable codes plus a detail sub-reason and structured values such as locale, label, missing labels, field kinds, and option counts. The catalog turns those into the current interface locale. The existing English `message` stays as a developer diagnostic and is never rendered. This keeps the domain and service layers independent of the interface locale. Technical preview reasons are shown only inside a collapsed “Technical details” disclosure.

Template content is never translated by the interface locale. A future canonical option-ID or mapping-editor decision would revise ADR 0002, not this one. A future locale is added by adding a catalog and a supported-locale entry, not by changing pages.

## Update 2026-10-22

The visual control is now the compact code group `eu | es | en`, with the selected code in bold. The group retains the accessible label “Interface language”, and each button exposes its visible code together with its endonym, for example `eu — Euskara`, so the visible label remains part of the accessible name. The document-language tabs remain separately labelled and are unaffected by this interface-switcher change.
