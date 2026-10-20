# 08: Preview a filled ODT

**What to build:** ODT forms get the same approximate preview and print path, with the heavy renderer loaded only when an ODT preview is opened.

**Blocked by:** 04, 07.

**Status:** done

- [x] ODT preview dynamically loads the ODT renderer only on demand.
- [x] Rendered content is isolated in a sandboxed iframe.
- [x] Print works from the iframe.
- [x] Renderer failure falls back to download-only with an explanation.
- [x] A browser smoke test covers the DOCX and ODT preview paths.
