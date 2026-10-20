# 02: Fill a DOCX text field and download the filled document

**What to build:** A filler opens a form route, types answers into text fields, and downloads a valid filled DOCX with every placeholder replaced. Formatting around the substitution survives, and no template syntax remains.

**Blocked by:** 01.

**Status:** done

- [x] The form page renders the snapshotted fields in definition order with associated labels.
- [x] Text fields accept values and every field remains optional.
- [x] A blank answer substitutes an empty string, leaving no placeholder behind.
- [x] The same field is filled once and substituted at every occurrence.
- [x] Substitution inherits the first text node's formatting and preserves surrounding text.
- [x] The download is named `<original>-filled.docx`, is a valid package, and keeps untouched parts intact.
