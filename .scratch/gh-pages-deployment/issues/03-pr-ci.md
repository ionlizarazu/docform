# 03: PR CI for all pull requests targeting main

**What to build:** A GitHub Actions CI workflow that runs on every pull request targeting `main`, including `develop` → `main`. It installs from the lockfile, runs lint, tests, typecheck, the Pages production build, the 404 artifact check, and the Pages browser smoke. A failing step blocks the PR.

**Blocked by:** 01 — Pages production build with project base, router basename, and 404 fallback; 02 — Pages browser smoke with 404 fallback and deep-link reload

**Status:** ready-for-agent

- [ ] The workflow triggers on pull requests targeting `main`, including PRs whose head branch is `develop`.
- [ ] It uses Node 22, the committed lockfile through `npm ci`, and npm caching.
- [ ] It runs lint, tests, typecheck, the Pages production build, the 404 fallback/artifact assertion, and the Pages browser smoke in that order.
- [ ] Any failing command fails the workflow and the pull request check.
- [ ] The workflow has read-only repository permissions and never deploys.
- [ ] Superseded runs on the same pull request are cancelled by a concurrency group.
- [ ] The workflow exposes one clearly named status check suitable for required-check branch protection.
