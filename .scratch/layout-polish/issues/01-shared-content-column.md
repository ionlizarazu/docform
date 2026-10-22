# 01: Shared content column and header alignment

**What to build:** Every page uses the current form column as its single content width. The header contents, page headings, library lists, form card, preview, docs article, empty states, and error states align to the same left and right edges. The header keeps its full-width border, but its contents move into the shared column. The docs article no longer uses a narrower cap. No behavior changes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The current form column is the shared width reference, using the existing 72rem main column and responsive inline padding.
- [ ] Header contents align with the page content while the header border remains full-bleed.
- [ ] Page headings, library toolbar/list areas, form card, preview frame, docs article, empty states, and error states all use the shared column rather than page-specific widths.
- [ ] The docs article loses its narrower cap and keeps its padded card treatment.
- [ ] The form card keeps its current width and the form field layout is unchanged.
- [ ] Narrow layouts keep comfortable inline padding and do not introduce horizontal overflow.
- [ ] At desktop width, header content, page headings, lists, form card, preview, and docs share the same left and right edges within a small tolerance.
- [ ] Existing tests, lint, typecheck, and Pages build still pass; behavior is unchanged.
- [ ] The browser smoke includes a shared-width alignment check; documentation screenshots are refreshed in the final ticket.
