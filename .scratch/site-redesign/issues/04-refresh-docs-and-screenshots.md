# 04: Refresh documentation and screenshots for the redesign

**What to build:** A reader of the README or the in-app guide sees the redesigned header and compact rows described accurately, with the `eu | es | en` switcher and the Forms/Docs menu. All documentation screenshots are regenerated from the new UI, so no image still shows the green palette or the old language dropdown.

**Blocked by:** 02 — Minimal header with Forms/Docs menu and language buttons; 03 — Compact form rows with rename behind a pen icon

**Status:** done

- [x] The README describes the interface switcher as `eu | es | en` with the selected code in bold, notes that each button exposes its code and endonym as its accessible name, points to the Docs menu rather than a separate header link, and no longer claims a visible language count.
- [x] The English, Spanish, and Basque guides describe the same switcher and menu in their own language, and still explain that interface language is independent of document language.
- [x] The English and Basque library screenshots, plus the detected-fields, form, DOCX preview, and ODT preview screenshots, are regenerated from the redesigned UI.
- [x] Every refreshed screenshot shows the indigo and warm-neutral palette and the new header; none shows the green header, tagline, or language dropdown.
- [x] Documentation image references still resolve, and the in-app Docs page still renders all three guides after the text changes.
- [x] No application behavior changes are introduced by this ticket.
