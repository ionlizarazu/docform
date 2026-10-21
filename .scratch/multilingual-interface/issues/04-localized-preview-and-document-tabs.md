# 04: Localized preview and document-language tabs

**What to build:** The preview experience is fully localized. Document-language tabs remain independent of the interface locale, the preview can be printed or downloaded, and a failed preview shows a localized primary message with optional technical detail.

**Blocked by:** 01 — Interface-locale foundation, switcher, app shell, and library

**Status:** ready-for-agent

- [ ] The preview title, singular and plural notices, print action, single-document and document-set download labels, no-answers state, loading text, and preview-unavailable message are localized in `eu`, `es`, and `en`.
- [ ] The tab list is labelled as document languages in the interface locale. Tabs keep the document locale codes and authored order, and changing the interface locale does not change the active tab.
- [ ] The preview iframe title is localized. Sandboxing, print messaging, and download behavior are unchanged.
- [ ] A preview failure shows the localized generic message. The raw renderer reason appears only in a collapsed, localized “Technical details” disclosure and is not part of the primary message.
- [ ] The preview page uses the localized not-found page from ticket 01.
- [ ] Preview fill-error details are deferred to ticket 07; a localized generic message is shown until then.
- [ ] Tests in `eu` and `es` cover preview chrome, tab independence, technical details, and the absence of automatic tab selection. The English tests remain the baseline.
- [ ] Typecheck, lint, and tests pass.
