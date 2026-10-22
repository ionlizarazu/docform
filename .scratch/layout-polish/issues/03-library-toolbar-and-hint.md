# 03: Library toolbar and upload-hint removal

**What to build:** The forms view drops the upload hint and moves New form and Import package into a left-aligned toolbar directly above the forms list. The page heading keeps only the title and subtitle. The New form panel opens below the toolbar, and import, the empty state, and the list continue to work.

**Blocked by:** 01 — Shared content column and header alignment

**Status:** done

- [x] The upload hint “Add one DOCX or ODT template per language, up to 25 MB each. Declare fields with {{Label}}.” is removed from the forms view.
- [x] The unused upload-hint message is removed from the message type and all three catalogs.
- [x] New form and Import package move out of the library heading into a toolbar in that order, directly above the forms list.
- [x] The toolbar sits before the New form panel, errors, empty state, and form list.
- [x] The New form panel opens below the toolbar and above the list.
- [x] Import package still opens the file picker and imports a package as before.
- [x] The library heading keeps the title and subtitle only.
- [x] The empty state and populated list remain below the toolbar, and the toolbar wraps or fills the available width on narrow screens.
- [x] Tests cover the absent hint, toolbar order, toolbar-before-list placement, New form toggle, import path, and unchanged rename/export/delete behavior.
- [x] No form data, route, storage, package, or document behavior changes.
- [x] The final smoke and screenshot refresh remain in the final ticket.
