# 07: Preview and print a filled DOCX

**What to build:** Before downloading, a filler can open an approximate preview of the filled DOCX and print it, with a graceful download-only fallback when rendering fails.

**Blocked by:** 02.

**Status:** done

- [x] The preview route renders the filled DOCX through a `PreviewRenderer` port.
- [x] The preview carries a visible "approximate preview" notice.
- [x] Printing uses the rendered content with a scoped print stylesheet.
- [x] A renderer failure or timeout shows a download-only notice and never blocks the download.
- [x] The UI never imports the renderer until preview is requested.
