# 05: Localized template and variant-validation errors

**What to build:** In any interface locale, a malformed template or a mismatched variant set produces a localized, actionable error. The message names the affected placeholder, locale, labels, field kinds, or option counts. The domain and service layers report stable codes, details, and values; the UI renders the current catalog. The English diagnostic message is never shown.

**Blocked by:** 01 — Interface-locale foundation, switcher, app shell, and library; 02 — Localized new-form and detected-fields screens

**Status:** ready-for-agent

- [ ] Template and parse errors gain localized messages with stable detail sub-reasons and required values: malformed placeholder, unknown modifier, empty label, empty option, conflicting label, unsupported region, no placeholders, invalid format, and too large.
- [ ] Variant and ingest errors gain localized messages with stable detail sub-reasons and required values: no variants, invalid locale, duplicate locale, label or field-kind mismatch, and option-count mismatch.
- [ ] Variant messages include the affected locale, primary locale, labels, field kinds, and option counts as applicable. The localized error remains as actionable as the current English message.
- [ ] The catalog contains these messages in `eu`, `es`, and `en`; the central adapter selects them; the raw English diagnostic is not rendered.
- [ ] The library and new-form error list uses the adapter and a generic localized error heading. A mismatched upload in Spanish or Basque lists the affected labels and counts.
- [ ] Local panel validation from ticket 02 remains localized and is not duplicated.
- [ ] Domain and service tests assert codes, details, and values. Page tests in `eu` and `es` assert representative parse and variant errors and the absence of the English diagnostic.
- [ ] No domain or service module imports the interface catalogs or receives the interface locale.
- [ ] Typecheck, lint, and tests pass.
