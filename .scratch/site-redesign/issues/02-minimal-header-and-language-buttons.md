# 02: Minimal header with Forms/Docs menu and language buttons

**What to build:** A visitor sees a compact header containing only the Docform name, a localized Forms/Docs menu, and an `eu | es | en` language switcher. The tagline and standalone Docs link are removed. The selected language is bold and semantically selected, and changing it updates the whole interface while preserving the existing persistence behavior.

**Blocked by:** 01 — Apply the indigo palette and recolor the favicon

**Status:** ready-for-agent

- [ ] The header contains the app name, Forms, Docs, and the language switcher; the tagline and separate Docs link are gone.
- [ ] Forms returns to the library; Docs opens the guide; both labels are localized in Euskara, Español, and English.
- [ ] Forms is active on the library and form routes, including preview; Docs is active on the guide route. Active state works under the `/docform/` Pages basename and on narrow screens.
- [ ] The language switcher is a group of three buttons in the order eu, es, en. The visible text is the code; the selected code is bold.
- [ ] Each language button exposes its language tag, `aria-pressed` selected state, and a stable endonym accessible name (Euskara, Español, English). The group is labelled as the interface language.
- [ ] Selecting a language updates the interface chrome, dates, errors, and docs without changing document-language variants; the choice still persists and survives storage failures.
- [ ] The old select control and its styles are gone. The tagline key is removed from the message type and all three catalogs; a localized Forms nav key is added to all three.
- [ ] App-shell tests cover header contents, no tagline, menu active states, button selection, `lang`, `aria-pressed`, persistence, and storage-write failure.
- [ ] Existing answer-preservation, preview-tab, and guide-language tests are migrated from the select to the language buttons and remain green.
- [ ] The browser smoke switches through all three languages using the stable endonym accessible names and verifies the selected state and document `lang`.
- [ ] The guide remains lazy-loaded and reachable through Docs, and the header wraps without hiding controls.
