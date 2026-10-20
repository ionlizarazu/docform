# 04: ODT ingest and filled download

**What to build:** The same author-to-filler path works for ODT templates: upload, detected fields, fill, and download a valid ODT with substitutions applied to body, tables, headers, and footers.

**Blocked by:** 02.

**Status:** done

- [x] Uploading an ODT detects the format and parses the same declaration grammar.
- [x] Body, table, header, and footer placeholders are found, including placeholders split across spans.
- [x] A filled ODT is a valid package with `mimetype` first and uncompressed.
- [x] Substitution writes into the first text node's formatting and clears the rest of the match.
- [x] Textarea newlines become `<text:line-break/>`.
- [x] DOCX and ODT share the same form-definition and answer behaviour.
