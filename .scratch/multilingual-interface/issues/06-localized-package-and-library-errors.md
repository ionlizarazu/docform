# 06: Localized package and library-action errors

**What to build:** Failed package and library actions show localized messages with the relevant package detail. Import, export, list, rename, delete, and library not-found failures use the same error contract as the authoring errors. Raw service messages are never rendered.

**Blocked by:** 01 — Interface-locale foundation, switcher, app shell, and library; 05 — Localized template and variant-validation errors

**Status:** done

- [x] Service errors for package parsing, import, export, list, rename, delete, and library not-found gain stable detail values, required parameters, and localized messages in `eu`, `es`, and `en`.
- [x] Package detail sub-reasons cover not JSON, missing manifest, unsupported version, incomplete manifest, definition mismatch, duplicate labels, variant mismatch, invalid base64, wrong format, hash or route mismatch, and locale-set mismatch.
- [x] The library error heading is generic and localized. Every listed error is localized, and `error.message` is never rendered.
- [x] Import and export success behavior, form routes, package formats, and stored data are unchanged.
- [x] Service tests assert codes, details, and required values. Page tests in `eu` and `es` cover representative package, list, rename, and delete failures and the absence of the English diagnostic.
- [x] The shared adapter and catalog work from ticket 05 is reused rather than duplicated.
- [x] Typecheck, lint, and tests pass.
