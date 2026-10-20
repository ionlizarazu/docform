# Field declarations live in the template; there is no configuration editor

Status: accepted

The app derives every field's kind, label, and select options from its placeholder in the DOCX/ODT template, so authors declare fields by editing the document rather than through a configuration UI. We chose this over a post-upload editor because it keeps a form definition fully reproducible from the template and removes a whole surface of persisted configuration that would need versioning. The cost is real: no help text, no custom labels, no required fields, no reordering, and any change requires editing and re-uploading the template, which produces a new route.
