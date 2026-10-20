# 05: Reject risky uploads and explain failures

**What to build:** Invalid or dangerous inputs fail loudly with actionable messages, and a filler never hits a blank screen for an unknown route or loses answers without warning.

**Blocked by:** 01, 03, 04.

**Status:** done

- [x] `.doc`, `.docm`, PDF, renamed archives, and files over 25 MB are rejected with a clear message.
- [x] Templates with zero placeholders, unknown modifiers, empty options, empty labels, or conflicting labels are rejected.
- [x] Placeholders in unsupported regions (text boxes, shapes, footnotes, comments, annotations) are rejected with a location hint.
- [x] A rejected upload stores nothing and leaves the library unchanged.
- [x] An unknown form route explains that forms are stored locally and links to the library.
- [x] Leaving a dirty form warns before unload.
