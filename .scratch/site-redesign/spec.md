# Site redesign: indigo, minimal header, and compact form rows

Status: ready-for-agent

## Problem Statement

The current interface is built around a green accent that the product owner does not want. The header carries a tagline and a separate Docs link, which makes it busier than necessary. The language switcher is a dropdown with endonyms, while the desired control is a compact `eu | es | en` choice with the selected language in bold.

The form library also shows more than the user needs: a route fragment, an uploaded date, language badges, a redundant language count, and rename as a full action button. The result is noisy and makes the form name compete with metadata and actions.

## Solution

Redesign the shell and library around a deep indigo accent and warm neutral surfaces, with no green in the palette. Reduce the header to the Docform name, a two-item menu (**Forms**, **Docs**), and a compact language switcher shown as `eu | es | en`, with the selected code in bold.

Make each library row compact: form name with a pen icon immediately after it, uploaded date, language badges, and only **Open form**, **Export**, and **Delete** as actions. Rename becomes an inline edit triggered by the pen icon instead of a separate button.

No form data, routes, storage, packages, document behavior, or docs content changes.

## User Stories

1. As a visitor, I want the interface to stop using the green accent, so that the site feels like the product I want to present.
2. As a visitor, I want a deep indigo accent on warm neutral surfaces, so that the interface feels calm and professional.
3. As a visitor, I want the header to contain only the app name, the main menu, and the language switcher, so that there is no decorative copy competing with navigation.
4. As a visitor, I want the tagline removed from the header, so that the header stays compact.
5. As a user, I want a **Forms** menu item, so that I can return to the form library from anywhere.
6. As a user, I want a **Docs** menu item, so that I can open the user guide from anywhere.
7. As a user, I want the current menu item to be visually active, so that I know where I am.
8. As a user, I want **Forms** to stay active while I am on a form route, so that the navigation reflects the current area.
9. As a user, I want **Docs** to be active on the guide page, so that the menu state is clear.
10. As a user, I want the language switcher shown as `eu | es | en`, so that I can change language with one click.
11. As a user, I want the selected language in bold, so that I can see the current interface language immediately.
12. As a keyboard user, I want to tab through the three language choices, so that I can switch language without a mouse.
13. As a screen-reader user, I want the language group labelled as the interface language, so that the codes have context.
14. As a screen-reader user, I want each language button to expose its selected state and language tag, so that I know which one is active.
15. As a user, I want my language choice to persist after a reload, so that the redesign does not change existing behavior.
16. As a user, I want each library row to show only the form name, uploaded date, language badges, and actions, so that I can scan quickly.
17. As a user, I want the route fragment removed from the library row, so that technical detail does not clutter the list.
18. As a user, I want the redundant language count removed, so that the language badges are the single source of language information.
19. As a user, I want **Open form** to remain the primary action, so that opening a form is obvious.
20. As a user, I want **Export** to remain available, so that I can back up a form package.
21. As a user, I want **Delete** to remain a clear destructive action, so that I do not confuse it with export.
22. As a user, I want a pen icon directly after the form name, so that rename is associated with the name rather than the row actions.
23. As a screen-reader user, I want the pen icon to have a proper accessible name and title, so that it is not an unlabelled icon.
24. As a user, I want clicking the pen to turn the name into an inline edit control, so that I can rename without leaving the library.
25. As a user, I want **Save** and **Cancel** while renaming, so that I can commit or discard the change.
26. As a user, I want the rename input to receive focus and the existing validation behavior to remain, so that renaming feels immediate.
27. As a user, I want a form with one undetermined language to show a localized single-language badge, so that the compact row still explains the variant set.
28. As a mobile user, I want the header to wrap without hiding the menu or language switcher, so that the redesign works on small screens.
29. As a mobile user, I want the form row to stack its name, metadata, and actions, so that the compact layout does not overflow.
30. As a keyboard user, I want visible focus styles on menu items, language buttons, the pen, and row actions, so that I can see where focus is.
31. As a user, I want the Docs page to keep following the interface language, so that the header redesign does not break the guide.
32. As a user, I want the Docs page to remain reachable from the **Docs** menu item, so that the separate header link is no longer needed.
33. As a user, I want all menu labels, language labels, rename labels, and action labels to remain localized in Euskara, Español, and English, so that the redesign preserves the multilingual interface.
34. As a user, I want the favicon to use the new accent, so that the browser tab does not keep the old green identity.
35. As a user, I want the focus rings and hover states to use the new palette, so that the redesign is consistent beyond the buttons.
36. As a maintainer, I want form identity, routes, IndexedDB data, form packages, and filled documents unchanged, so that the redesign is purely presentational.
37. As a maintainer, I want no new runtime dependency for the pencil icon, so that the redesign does not grow the bundle for one symbol.
38. As a maintainer, I want unused header/row message keys removed, so that the catalogs stay honest.
39. As a developer, I want the existing App and LibraryPage test seams reused, so that the redesign does not introduce a second page-testing stack.
40. As a user, I want the redeployed site and documentation screenshots to show the new design, so that the published product matches the new identity.

## Implementation Decisions

- **Palette:** replace every green accent token with a deep indigo accent on a warm neutral canvas. The intended tokens are:
  - ink `#1e2329`
  - muted `#66707a`
  - line `#ddd9d1`
  - paper `#ffffff`
  - canvas `#f5f2ec`
  - accent `#3b4f8a`
  - accent strong `#2d3d6b`
  - accent soft `#e7eaf5`
  - danger `#a33a32`
  - danger soft `#f9e9e7`
  - warning soft `#fbf3df`
- **No green:** the body gradient, links, primary buttons, badges, focus outlines, table headers, and the favicon all move to the indigo palette. Red remains reserved for destructive actions and errors.
- **Header structure:** the brand remains a link to the library. The tagline and the standalone Docs link are removed. The header contains the brand, a two-item menu, and the language switcher. The menu labels are localized: Forms/Formularios/Formularioak and Docs/Guía/Gida.
- **Header layout:** brand on the left; menu next to it; language switcher pushed to the right. On narrow screens the header wraps, with the menu and language switcher remaining usable. A subtle bottom border separates the header from the page.
- **Menu state:** **Forms** is active on the library and on form routes; **Docs** is active on the guide route. Active items use the accent color and weight, not a new icon or badge.
- **Language switcher:** replace the select with a `role="group"` labelled as the interface language. It contains three buttons in the order `eu`, `es`, `en`. The visible text is the code; the accessible name includes the visible code and the endonym, for example `eu — Euskara`. Each button carries its language tag and `aria-pressed`; the selected button is bold. The separator between codes is visual only. The existing locale detection, persistence, and `setLocale` behavior are reused.
- **No new language behavior:** the language set remains eu/es/en, the persisted preference remains the same, and switching language still does not change document languages or the docs language source.
- **Library row:** remove the route fragment, the route label, and the language-count text. Keep the form-name link, uploaded date, language badges, and the three actions. The row becomes a name line, a metadata line, and an actions group.
- **Rename control:** place a small inline-SVG pencil button immediately after the form name. It has a localized accessible label and title. Clicking it switches the name line to the existing inline rename input with Save and Cancel; the input receives focus. Rename is removed from the action group.
- **Action group:** only **Open form** (primary link), **Export** (secondary), and **Delete** (danger). Delete keeps the existing confirmation and error handling.
- **Responsive layout:** the form row keeps name/metadata on the left and actions on the right on wide screens. On narrow screens they stack, with the action group wrapping below. The pen remains adjacent to the name.
- **Messages:** add a localized **Forms** nav label. Reuse the existing Docs label, rename label, uploaded label, open/export/delete labels, single-language label, and form name label. Remove unused catalog keys for the tagline, route label, and language count after their last consumers are gone.
- **No data changes:** form definitions, routes, IndexedDB records, form packages, filled-document filenames, and document-language behavior are untouched.
- **No new dependency:** the pen is an inline SVG, not an icon package.
- **Docs page:** remains a lazy-loaded route and keeps following the interface locale. Only its navigation entry point changes from a standalone header link to the **Docs** menu item.
- **Visual assets:** recolor the favicon to the indigo palette and refresh the README/documentation screenshots after the redesign.
- **Branch flow:** implement on `develop`; promote to `main` through the existing pull-request flow.

## Testing Decisions

- Good tests assert the redesigned external behavior: header content and navigation, language-button selection, compact rows, and inline rename. They do not assert raw CSS color values; the palette is verified visually with screenshots.
- Reuse the existing App and LibraryPage seams. The header and language switcher are tested through the full app shell; the form row and rename behavior through the library page with its existing service provider.
- Add an app-shell test that asserts the app name, **Forms** and **Docs** menu items, the three language buttons, the absence of the tagline, and the selected language's `aria-pressed` state and language attribute.
- Test menu active state on the library, a form route, and the docs route.
- Test that clicking a language button changes the interface and persists the choice, replacing the old select-based assertions.
- Test a compact row: name, uploaded date, language badges, and Open/Export/Delete actions; assert that the route fragment and language-count text are absent.
- Test the pen icon's accessible name, opening the inline input, saving a name, cancelling, and the existing rename error path.
- Replace every existing test that uses the header `<select>` or its `Interface language` label with the new language-button group. This includes the App switcher, docs language switch, form answer-preservation, and preview tab tests.
- Update the browser smoke to switch languages through the new buttons. Use the accessible names that combine each visible code with its endonym (`eu — Euskara`, `es — Español`, `en — English`), so the smoke works regardless of the current interface language. Keep the selected-state assertion on `aria-pressed`.
- Verify the palette, spacing, header wrapping, and compact row visually through the smoke screenshots. Do not add brittle tests that read computed colors.
- Prior art: the existing App shell tests, LibraryPage tests, docs tests, and real-Chrome smoke. No new testing stack is introduced.

## Out of Scope

- Changing the form definition, form routes, IndexedDB schema, form packages, or filled-document behavior.
- New product features such as search, sorting, bulk actions, favorites, or form duplication.
- Dark mode, theme switching, or a user-selectable accent color.
- A new logo or a full brand identity beyond the app name and recolored favicon.
- Additional interface locales or changing the language order.
- A mobile navigation drawer or hamburger menu; the header wraps instead.
- Renaming semantics beyond moving the trigger to the pen and keeping the existing inline edit.
- Changes to the user-guide Markdown content beyond screenshots or navigation references.
- Translating developer README/ADR/spec documentation.
- New icon libraries or dependencies for the pencil.
- Changing the docs route, its lazy loading, or its locale-selection behavior.

## Further Notes

- The selected language is bold visually and `aria-pressed` semantically. Assistive technology does not need to infer the bold style.
- The visible switcher uses codes because that is the requested design; the accessible names include both the visible code and the endonym so the controls are not cryptic to screen-reader users and satisfy label-in-name.
- The route remains in the URL even though it is no longer shown in the list. Removing it from the row is a presentation change, not a routing change.
- The language badges are the only language metadata in the row; the redundant count is intentionally removed.
- The pencil should remain visible rather than appearing only on hover, so it is discoverable and keyboard reachable.
- Refresh the documentation screenshots after the redesign so the published guide and README do not show the green UI.
- Implement on `develop` and promote through the existing `develop` → `main` pull request; the redesign should not bypass the deployment/CI flow.
