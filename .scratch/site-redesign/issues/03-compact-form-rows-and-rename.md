# 03: Compact form rows with rename behind a pen icon

**What to build:** A visitor sees each library row reduced to the form name, uploaded date, language badges, and the Open form, Export, and Delete actions. A pen icon immediately after the name opens the existing inline rename editor. The route fragment and language count disappear, while form identity, storage, export, delete, and routing stay unchanged.

**Blocked by:** 01 — Apply the indigo palette and recolor the favicon

**Status:** done

- [x] Each row shows the form name, uploaded date, and language badges. It does not show a route fragment, route label, or language-count text.
- [x] The only row actions are Open form, Export, and Delete. Open still navigates to the form; Export and Delete keep their behavior and the Delete confirmation.
- [x] A pen icon button sits immediately after the form name. It uses an inline SVG, has a localized accessible name and title, is always visible, and is keyboard reachable with a visible focus state.
- [x] Clicking the pen switches the name line to the inline rename input, focuses it, and exposes Save and Cancel.
- [x] Saving still calls the existing rename path and updates the row; Cancel restores the original name; rename failures still surface through the existing library error area.
- [x] The route-label and language-count message keys are removed from the message type and all three catalogs, along with their catalog test. The single-language badge remains.
- [x] The row keeps the name and metadata on the left and actions on the right on wide screens, and stacks cleanly on narrow screens with the pen still adjacent to the name.
- [x] Library tests cover the compact metadata, the absence of route and count text, the three-action set, the pen's accessible name, opening the editor, saving, cancelling, and the existing error path.
- [x] Existing smoke still opens the compact row's Open form link; no route, storage, or document behavior changes.
