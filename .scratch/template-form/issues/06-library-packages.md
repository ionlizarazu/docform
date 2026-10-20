# 06: Manage forms and move them between browsers

**What to build:** The library becomes a real home: list forms, rename display names, delete with confirmation, dedupe re-uploads, and export/import a form package that restores the same route on another browser.

**Blocked by:** 01.

**Status:** done

- [x] The library lists forms with display name, route, and upload date.
- [x] Renaming changes only the display name; route and definition are untouched.
- [x] Delete requires confirmation and removes the form's bytes; the route then shows not-found.
- [x] Export produces a versioned `.formpack.json` with the template, definition, and metadata.
- [x] Import validates the manifest and rejects a route that does not match the template hash.
- [x] Importing an existing route returns the existing form without duplicating it.
