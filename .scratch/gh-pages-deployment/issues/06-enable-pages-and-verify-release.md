# 06: Enable Pages, require CI on main, and verify the release path

**What to build:** Finish the live repository setup and prove the release path. Set GitHub Pages to deploy from GitHub Actions, require the CI status check on `main`, and block direct pushes. Open a verification pull request from `develop` to `main`, confirm the checks run, merge it, confirm the deployment, and load a deep form route on the published URL.

**Blocked by:** 03 — PR CI for all pull requests targeting main; 04 — Main-branch Pages deployment workflow; 05 — Develop integration branch and deployment documentation

**Status:** ready-for-human

This ticket requires GitHub repository administration and a real pull request; it is not agent-grabbable. The other tickets are agent-safe.

- [ ] The repository's Pages source is set to GitHub Actions.
- [ ] `main` requires the `verify` status check from the `CI` workflow before merge and blocks direct pushes.
- [ ] A verification pull request from `develop` to `main` runs lint, tests, typecheck, the Pages build, the 404 artifact check, and the Pages browser smoke.
- [ ] The required check is visible on the pull request and must pass before merge.
- [ ] Merging the verification pull request triggers a successful Pages deployment and exposes the published URL.
- [ ] The published URL loads the library, and a deep form route survives a full page reload without showing a GitHub 404 page.
- [ ] The published site completes the upload, fill, download, and ODT preview flow, including the project-path wasm.
- [ ] The results, workflow run links, and published URL are recorded in the ticket comments.
