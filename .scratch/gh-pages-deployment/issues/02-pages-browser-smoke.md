# 02: Pages browser smoke with 404 fallback and deep-link reload

**What to build:** A real-browser smoke of the built Pages artifact that behaves like GitHub Pages. It serves the artifact under `/docform/`, uses a 404 fallback for unknown paths rather than a generic history-API fallback, walks the existing library/upload/fill/download/preview flow, and then opens a form route by full page load to prove the fallback and router basename work.

**Blocked by:** 01 — Pages production build with project base, router basename, and 404 fallback

**Status:** done

- [x] A Pages smoke command serves the built artifact under `/docform/` and resolves unknown paths through the 404 fallback, matching GitHub Pages rather than Vite preview's history fallback.
- [x] The smoke walks the existing bilingual upload, fill, ZIP download, DOCX preview, and ODT preview flow under the Pages base path.
- [x] After creating a form, the smoke navigates to its route by full URL reload. The app loads the form through the 404 fallback rather than showing a GitHub error page.
- [x] The ODT preview wasm loads and renders from the Pages base path.
- [x] The Chrome executable path is configurable through the environment, with the existing system Chrome path as the default.
- [x] The smoke exits nonzero on failure and reports browser console errors; the existing root-path smoke command remains available.
