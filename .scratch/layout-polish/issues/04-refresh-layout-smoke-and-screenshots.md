# 04: Refresh layout smoke coverage and documentation screenshots

**What to build:** The real-Chrome smoke verifies the finished layout: shared content widths, top-left back links, the library toolbar above the list, form badges after the title, and the absent upload hint. The documentation screenshots are regenerated so the published README and guide show the new layout rather than the old widths and back-link placements.

**Blocked by:** 02 — Unified top-left back links and form-title badges; 03 — Library toolbar and upload-hint removal

**Status:** done

- [x] The desktop smoke verifies that header content, page headings, form card, library list, preview, and docs article share the same left and right edges within a small tolerance.
- [x] The smoke verifies that the docs article width matches the form card width.
- [x] The smoke verifies the library toolbar appears above the forms list and that the upload hint is absent.
- [x] The smoke verifies the form language badges follow the title and that back links are top-left above the heading or article on form, preview, and docs pages.
- [x] The smoke retains the narrow-viewport check for no horizontal overflow and usable header, toolbar, badges, and back links.
- [x] The documentation image set is regenerated from the new UI, including the English and Basque library, detected-fields, form, DOCX preview, and ODT preview images.
- [x] Every refreshed screenshot shows the shared width, top-left back-link treatment, library toolbar, and form-title badges; none shows the old hint or old back-link placement.
- [x] Documentation image references still resolve, and the docs page still renders all three guides.
- [x] No application behavior changes are introduced by this ticket.
- [x] `npm test`, lint, typecheck, Pages build, and both smoke commands remain green.
