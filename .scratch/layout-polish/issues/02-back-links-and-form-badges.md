# 02: Unified top-left back links and form-title badges

**What to build:** Every page with a back destination uses one shared top-left back-link row with consistent top and bottom padding. The back link is a text link with a decorative leading arrow, not a secondary button. In the form view, the language badges move directly after the form title and before the optional-fields note.

**Blocked by:** 01 — Shared content column and header alignment

**Status:** done

- [x] One shared back-link treatment renders before the page heading or article, at the top left of the shared column, with consistent top and bottom spacing.
- [x] The normal form page uses the shared back link and preserves the unsaved-answers confirmation.
- [x] The detected-fields page uses the shared back link top-left; the Open form action remains available.
- [x] The normal preview page, preview failure state, and preview no-answers state use the shared back link top-left, while document tabs, Print, and Download remain unchanged.
- [x] Form load failure, form/route not-found, unexpected-error, and docs pages use the shared back link top-left.
- [x] Old back links are removed from uppercase eyebrows, right-hand action groups, and below-message positions.
- [x] The back link uses the existing localized labels and hrefs, has a visible focus state, and does not compete visually with primary actions.
- [x] In the form view, language badges appear after the form title and before the optional-fields note, are left-aligned, wrap on narrow screens, and keep the localized single-language badge.
- [x] Language badges no longer appear in the form heading’s right-hand action area.
- [x] Tests cover back-link placement, labels, hrefs, error-state coverage, the form leave warning, and the form badge order.
- [x] No form data, route, storage, package, or document behavior changes.
- [x] The final smoke and screenshot refresh remain in the final ticket.
