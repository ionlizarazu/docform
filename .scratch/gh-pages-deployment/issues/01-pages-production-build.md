# 01: Pages production build with project base, router basename, and 404 fallback

**What to build:** A production build that can be served under the GitHub Pages project path `/docform/`, while local development and the normal build keep working at `/`. The browser router must derive its basename from the build base, and the build must produce a GitHub Pages 404 fallback so deep form routes can load the app.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A dedicated Pages build command uses `/docform/` as the Vite base. The normal dev server and normal build still use `/`.
- [x] The browser router derives its basename from the build base through a small pure helper. The helper is unit-tested for `/`, `/docform/`, and trailing-slash normalization.
- [x] The Pages build writes a 404 fallback copy of the built entry document, and both the entry and fallback reference `/docform/` for scripts, styles, the favicon, and the ODT wasm asset.
- [x] A build-artifact check asserts that the 404 fallback exists and that the Pages entry does not reference root-absolute asset paths.
- [x] Existing typecheck, lint, tests, and the normal build still pass.
- [x] The Pages build can be served manually under `/docform/` and the app's first route renders without missing assets.
