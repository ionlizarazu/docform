# 01: Apply the indigo palette and recolor the favicon

**What to build:** A visitor sees the entire app in the approved deep-indigo and warm-neutral palette, with no green accent left in the running UI or browser icon. This is a visual foundation only: form behavior, routes, storage, and copy stay unchanged.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The green accent tokens are replaced by the approved indigo, accent-strong, and accent-soft values, with the warm canvas and updated ink, muted, and line values from the redesign spec.
- [ ] Links, primary buttons, secondary hover states, language badges, focus outlines, the body gradient, table headers, and the favicon all use the new palette rather than green.
- [ ] Destructive actions keep a clearly distinct red treatment.
- [ ] The favicon is recolored to the new accent and is still served correctly by the app and the Pages build.
- [ ] Existing tests, typecheck, lint, and both local and Pages smoke pass without behavior changes.
- [ ] Fresh smoke screenshots show the indigo and warm-neutral UI, and no page in the running app still shows a green accent.
- [ ] Documentation screenshots are not refreshed here; that belongs to the final docs ticket.
