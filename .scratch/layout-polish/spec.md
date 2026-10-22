# Layout polish: one content column, unified back links, and cleaner page headers

Status: ready-for-agent

## Problem Statement

The app currently uses several different content widths. The header content is full-bleed, the form fills the main 72rem column, and the docs article is capped at 52rem. The result is that the left and right edges move as a user moves between the library, a form, the preview, and the guide.

Back navigation is also inconsistent. Some pages put a back link in an uppercase eyebrow above the title, some put a Back button at the top right, and error or empty states put a Back button below the message. The form page’s language badges sit in the right-hand action area rather than with the form title. On the forms view, the New form and Import package buttons sit in the heading rather than in a toolbar above the forms list, and an upload hint adds copy the user no longer wants.

These inconsistencies make the pages feel like separate layouts rather than one application.

## Solution

Use the current form column as the single content width for the whole app. The header contents, page headings, library toolbar and list, form card, preview, docs article, empty states, and error states all align to the same left and right edges. The header border may remain full-bleed, but the content inside it aligns with the form.

Replace the scattered back treatments with one shared top-left back-link row. It appears before the page heading or article on every page that has a back destination, with consistent top and bottom padding. Back links are text links rather than buttons, and they no longer sit inside action groups or below error messages. The existing destinations and leave-warning behavior remain.

Remove the library upload hint. Move New form and Import package into a toolbar directly above the forms list, leaving the page heading with only the title and subtitle. In the form view, move the language badges out of the right-hand action area and place them directly after the form title, before the optional-fields note.

No form data, routes, storage, packages, document behavior, or copy beyond the removed hint changes.

## User Stories

1. As a visitor, I want the header contents to align with the page content, so that the app does not feel like two different layouts.
2. As a visitor, I want the library, form, preview, docs, and error pages to share the same content width, so that the left and right edges stay stable as I move around.
3. As a visitor, I want the docs article to use the form’s content width, so that the guide belongs to the same visual system as the form.
4. As a visitor, I want the header border to keep its full-width treatment while the contents align to the form column, so that the header still reads as a distinct band.
5. As a visitor, I want page headings and action rows to align with the content below them, so that the page has one clear vertical structure.
6. As a form filler, I want the form card to keep its current width, so that the familiar form layout does not change.
7. As a library user, I want the upload hint “Add one DOCX or ODT template per language, up to 25 MB each. Declare fields with {{Label}}.” removed, so that the library is less noisy.
8. As a library user, I want New form and Import package to sit in a toolbar directly above the forms list, so that the actions are associated with the list they affect.
9. As a library user, I want the New form panel to open below the toolbar and above the list, so that the action and its result stay together.
10. As a library user, I want Import package to remain available from the toolbar, so that the layout change does not remove import.
11. As a library user, I want the library heading to keep the title and subtitle, so that the view still has context.
12. As a library user with no forms, I want the empty state to appear below the toolbar, so that I still understand where new forms will go.
13. As a form filler, I want the language badges to appear immediately after the form title, so that the document languages are associated with the form rather than with page actions.
14. As a form filler, I want the language badges to sit before the optional-fields note, so that the title block reads in a predictable order.
15. As a form filler, I want a single-language form to keep its localized single-language badge, so that the compact badge behavior is preserved.
16. As a form filler, I want the language badges to wrap on narrow screens, so that a multi-language form does not overflow.
17. As a form filler, I want the Back to forms link at the top left of the form, so that leaving the form is predictable.
18. As a form filler, I want the Back to forms leave confirmation to keep working, so that unsaved answers are not lost through the new layout.
19. As a user viewing detected fields, I want the Back to forms link at the top left, so that it matches every other back step.
20. As a user viewing detected fields, I want the Open form action to remain available, so that moving the back link does not remove the primary next step.
21. As a user viewing a preview, I want the Back to form link at the top left, so that returning to the form is consistent.
22. As a user whose preview has no answers or cannot render, I want the back link at the top left above the message, so that recovery is still obvious.
23. As a user on the docs page, I want the Back to forms link at the top left, so that the guide uses the same navigation treatment as the rest of the app.
24. As a user on a form-not-found, unknown-route, or unexpected-error page, I want the back link at the top left, so that error recovery is not a different layout.
25. As a user, I want every back link to have consistent top and bottom spacing, so that it does not feel crammed against the header or the title.
26. As a user, I want the back link to be a text link rather than a secondary button, so that it does not compete with primary page actions.
27. As a user, I want the back link to use a decorative leading arrow, so that its direction is immediately clear without changing the localized label.
28. As a keyboard user, I want the back link to have a visible focus state, so that I can follow it without a mouse.
29. As a screen-reader user, I want the back link to keep its existing localized label, so that its destination is clear.
30. As a mobile user, I want the shared content column to keep comfortable inline padding, so that content does not touch the screen edges.
31. As a mobile user, I want the library toolbar buttons to wrap or fill the available width, so that New form and Import package remain usable.
32. As a mobile user, I want the back-link row and title block to wrap without horizontal scrolling, so that the unified layout works on small screens.
33. As a visitor, I want the docs article to remain a readable card even at the wider shared width, so that the content still has visual separation from the canvas.
34. As a user, I want existing new-form, import, rename, export, delete, fill, and preview behavior to remain unchanged, so that the polish is purely layout and navigation.
35. As a user, I want the refreshed documentation screenshots to show the new shared width, top-left back links, library toolbar, and badge placement, so that the published guide matches the app.
36. As a maintainer, I want one shared content-column treatment instead of page-specific width rules, so that future pages do not invent another width.
37. As a maintainer, I want one shared back-link component instead of page-specific back-link markup, so that the treatment cannot drift again.
38. As a maintainer, I want the unused upload-hint message removed from the typed catalogs, so that the catalogs stay accurate.
39. As a maintainer, I want the library actions to stay in the page flow rather than in the heading, so that the heading remains a heading.
40. As a maintainer, I want the detected, preview, docs, and error-state back links to use the same seam, so that adding another page with a back destination is straightforward.

## Implementation Decisions

- **Shared content column:** use the current form column as the single reference width: the existing 72rem main column with its responsive inline padding. The header contents and every page’s content align to that column. The form card remains the visual reference and keeps its current width.
- **Header alignment:** the header keeps its full-width bottom border and vertical padding, but its contents move into the shared column so the brand, menu, and language switcher align with the page below.
- **Docs width:** remove the docs article’s narrower 52rem cap. The article uses 100% of the shared content column and keeps its card background, border, padding, and radius.
- **Shared back-link row:** introduce one presentational back-link treatment used by every page with a back destination. It renders above the page heading or article, at the top left of the content column, with consistent top and bottom padding. It is a text link with a decorative leading arrow, not a secondary button.
- **Back-link placement:** use the shared row on the normal form page, detected-fields page, preview page, preview failure and no-answers states, form load failure, docs page, form/route not-found page, and unexpected-error page. The library page has no back link.
- **Back destinations:** keep the existing destinations and localized labels: back to forms for the library-oriented pages, and back to the form for preview states. Keep the unsaved-answers confirmation on the form page’s back link.
- **Remove old back treatments:** remove back links from the uppercase eyebrow, from right-hand action groups, and from below error or empty-state copy. The detected page keeps Open form as a page action; only the back link moves.
- **Spacing ownership:** the back-link row owns its top and bottom spacing. Pages with a back row do not add a second page-heading top pad above it. The library, which has no back row, keeps its normal heading spacing.
- **Remove the upload hint:** remove the visible library hint and remove its message key from the message type and all three catalogs. Do not replace it with new copy. The New form panel’s own explanatory hint remains.
- **Library toolbar:** move New form and Import package out of the library heading into a left-aligned toolbar directly above the forms list, in that order. The heading keeps the title and subtitle only.
- **Library flow:** the New form panel opens below the toolbar and above the list. The import input and button behavior stay unchanged. Errors and the empty state continue to appear below the toolbar, with the list or empty state after them as appropriate.
- **Form title block:** keep the page heading container, but place the language badges immediately after the form title and before the optional-fields note. Remove the badges from the heading’s right-hand action area. The badges remain left-aligned, wrap, and retain the localized single-language treatment.
- **Detected page:** keep the language-variant section and the Open form action where they are. Only the back link moves to the shared top-left row.
- **Preview page:** keep Print and Download in the page action area. The back link moves to the shared row in every preview state.
- **Error and empty states:** keep their messages and actions; only the back step moves to the shared row. The not-found and unexpected-error pages use the back row above their headings.
- **Responsive behavior:** the shared column uses the existing responsive inline padding. The library toolbar and form badges wrap. The back-link row, title block, and content remain free of horizontal overflow at the smoke’s narrow viewport.
- **No behavior changes:** form data, routes, IndexedDB records, form packages, generated documents, import/create/rename/export/delete/fill/preview behavior, and validation stay unchanged.
- **Screenshot refresh:** refresh the library, form, detected-fields, preview, and docs screenshots after the layout changes. The docs article width, top-left back links, library toolbar, and form badge placement should be visible from the images.
- **No new dependency:** the arrow is decorative CSS or markup, not an icon package.

## Testing Decisions

- Good tests assert external behavior: where the back link appears relative to the heading, where the library actions sit relative to the list, the absence of the hint, the badge order, and the alignment of the shared content column. They should not assert raw CSS class names or exact font/color values.
- Reuse the existing App and page-level test seams. The shared back-link and content-column components are presentational; test them through the real pages rather than adding a separate component-testing stack.
- Library tests cover the removed hint, the toolbar order, the toolbar appearing before the form list or empty state, opening the New form panel below the toolbar, and keeping import, rename, export, and delete behavior.
- Form tests cover the language badges appearing after the title and before the optional-fields note, the badges no longer appearing in the heading action area, the single-language badge, and the form back link’s leave confirmation.
- Back-link tests cover every page that has a back destination: the link appears before the heading or article, uses the expected localized label and href, is not inside the page action group, and appears in preview failure/no-answers, form load failure, not-found, unexpected-error, and docs states.
- Detected-fields tests confirm the back link is top-left and the Open form action remains available.
- Preview tests confirm the back link moves to the shared row while the document-language tabs, Print, and Download remain unchanged.
- Browser smoke verifies the shared column at desktop width: the header content, page heading, form card, library list, preview, and docs article align to the same left and right edges within a small tolerance. It also verifies the docs article width equals the form card width.
- Browser smoke verifies the library toolbar sits above the list, the upload hint is absent, the form badges follow the title, a back link is top-left above the title on form/preview/docs, and the narrow viewport has no horizontal overflow.
- Browser smoke screenshots cover the updated library, form, detected-fields, preview, and docs layouts. The previous smoke’s narrow-layout check remains in place.
- Prior art: the existing library, form, preview, docs, error-state, and real-Chrome smoke tests. No new service or storage seam is introduced.

## Out of Scope

- Changing the form definition, routes, IndexedDB schema, form packages, generated documents, or validation.
- Changing the palette, header menu, language switcher, compact form-row content, or pen rename behavior delivered by the previous redesign.
- New copy beyond removing the upload hint. The existing back labels remain.
- Reworking the form field layout, field ordering, or form actions.
- Changing the docs Markdown content; only the rendered width and screenshots change.
- Adding mobile navigation, a drawer, or a new responsive breakpoint system.
- Dark mode or theme work.
- Moving Print, Download, Open form, or other primary actions beyond the back-link relocation.
- Adding new document languages or changing the variant model.

## Further Notes

- “Docs list” in the request is interpreted as the existing **forms list** on the library page, because the forms view has no docs list.
- The form column is the width reference. The header border may stay full-bleed, but the header contents should line up with the form card and page content.
- The docs article becomes wider by design. It remains a padded card, and the user has chosen this over the previous narrower reading measure.
- The back link is a navigation step, not a page action. It should read as a link above the page content, not as a button competing with Open form, Print, Download, or Save.
- The library toolbar is attached to the forms list, not to the page heading. The New form panel belongs between the toolbar and the list.
- The form badges belong with the title block. They should not appear in the top-right action area.
- Refresh all affected documentation images after the layout lands so the published README and guide do not show the previous widths or back-link placement.
