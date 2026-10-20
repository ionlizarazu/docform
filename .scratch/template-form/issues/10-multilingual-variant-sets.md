# 10: Multilingual variant sets

**What to build:** One form can own an ordered set of language variants. The author uploads one template per locale, chooses a primary, and the filler fills once and receives one filled document per variant. Select options are paired by position across variants.

**Blocked by:** 01, 02, 03, 04, 05, 06, 07, 08, 09.

**Status:** done

- [x] Upload one template per locale with a locale tag and exactly one primary variant.
- [x] Reject invalid locales, duplicate locales, mismatched labels or kinds, and select option-count mismatches.
- [x] Pair select options by position and show a read-only pairing table at upload.
- [x] Fill once; substitute the primary option into the matching position of every variant.
- [x] Download one ZIP containing `<name>-<locale>-filled.<ext>` per variant.
- [x] Preview each variant through a locale tab.
- [x] Use a deterministic route for the ordered variant set, preserving legacy single-template routes.
- [x] Export a version 2 form package; import both version 2 and version 1 packages.
