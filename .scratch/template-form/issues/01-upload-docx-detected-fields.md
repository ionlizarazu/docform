# 01: Upload a DOCX and render its detected fields

**What to build:** A template author can upload a DOCX, have its placeholders parsed into a form definition, and land on a stable read-only route that lists the detected fields. This is the foundation tracer bullet: app shell, package detection, declaration parser, snapshot, storage, and route.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] The app shell has a library page, a form route at `/f/<route>`, and a not-found page.
- [x] Uploading a DOCX detects the format from package contents, not the filename.
- [x] `{{Label}}`, `{{Label|textarea}}`, and `{{Label[o1;;o2]}}` declarations are parsed into ordered fields.
- [x] Repeated identical declarations collapse into one field; conflicting declarations fail the upload.
- [x] Malformed declarations return a structured error list and store nothing.
- [x] The route is the SHA-256 of the uploaded bytes; byte-identical re-upload reuses it.
- [x] The form definition is snapshotted at upload and served from storage, never re-parsed per visit.
- [x] The detected-fields screen is read-only and shows label, kind, and options.
