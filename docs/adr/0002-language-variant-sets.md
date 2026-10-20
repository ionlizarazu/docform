# A form owns an ordered set of language variants

Status: accepted

A form is no longer one template. It is an ordered **variant set**: one template per locale, sharing a single fill and producing one filled document each. The first or explicitly chosen **primary variant** supplies the labels, field order, and select options shown to the filler.

Select options are paired **by position** across variants. The field label and kind must be identical, and every select field must declare the same number of options in every variant. The app shows a read-only pairing table at upload so the author can verify the order; it does not offer an option editor.

We chose positional pairing over canonical option IDs because it preserves the existing "the template declares everything" model and requires no new syntax. The cost is real: the app cannot detect two lists that are the same length but ordered differently, so the author must keep the order aligned; a mismatch in count fails the upload.

The route for a multi-variant form is a hash of the ordered variant list and the primary locale. A single template uploaded with the legacy `und` locale keeps the original content-hash route, so existing forms and version 1 packages continue to work. Form packages use a version 2 manifest that carries every variant.

Adding or removing a language variant creates a new route; it never mutates an existing form. Canonical option IDs and an upload-time mapping editor were considered and deferred: the first adds syntax, the second reintroduces the configuration surface the product deliberately avoids.
