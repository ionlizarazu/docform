# 01: Interface-locale foundation, switcher, app shell, and library

**What to build:** A user can switch the app shell and form library between Euskara, Español, and English. The app resolves a first-visit locale from the browser, remembers the choice, updates `<html lang>`, and formats dates and language counts for the interface locale. Document language variants and form data are untouched. The existing flat strings object stays as the fallback form for surfaces not yet migrated; ticket 08 removes it.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The interface locale is a closed set of `eu`, `es`, and `en`; resolution order is a valid saved choice, then the first supported base language in the browser's language list, then English.
- [ ] A labelled “Interface language” select in the header offers the endonyms Euskara, Español, and English with `lang` attributes and no flags. Changing it updates the interface without a reload.
- [ ] The choice persists in browser-local storage; invalid stored values are ignored; storage read or write failures fall back to an in-memory choice and do not crash the app.
- [ ] `<html lang>` follows the interface locale.
- [ ] The header and tagline, library heading and subtitle, empty state, form rows, actions, confirmation prompts, loading text, not-found page, and unexpected-error fallback are localized in all three locales.
- [ ] Library dates use `Intl.DateTimeFormat` for the interface locale; “N languages” uses correct singular/plural forms; the `und` badge has a localized “single” label.
- [ ] A central error adapter can render a localized generic fallback; detailed error codes are added in tickets 05–07.
- [ ] Switching the interface language while the library is open preserves the page state and does not change any form route, stored form, or document language variant.
- [ ] Tests cover locale resolution, persistence, storage failure, switcher behavior, `<html lang>`, and representative library chrome in all three locales.
- [ ] Typecheck, lint, and tests pass.
