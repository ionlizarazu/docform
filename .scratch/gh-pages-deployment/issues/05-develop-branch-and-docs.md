# 05: Develop integration branch and deployment documentation

**What to build:** Create `develop` from the current `main` as the integration branch, and document the release flow: feature work into `develop`, `develop` to `main` by pull request, and `main` deploys. The documentation covers the required CI check, the one-time Pages source setting, the published URL, the Pages build and smoke commands, and origin-specific browser data. It must not claim repository settings are enabled before ticket 06 verifies them.

**Blocked by:** 03 — PR CI for all pull requests targeting main; 04 — Main-branch Pages deployment workflow

**Status:** done

- [x] `develop` exists on the remote, created from the current `main`, and contains the deployment documentation ready for the ticket 06 verification PR.
- [x] The deployment documentation explains `develop` → `main`, the main-branch deployment, and the role of the required CI check.
- [x] It documents the one-time Pages source setting and the published project URL as setup steps, without claiming they are already enabled.
- [x] It documents the Pages production build, artifact check, Pages browser smoke, and normal local commands.
- [x] It explains that GitHub Pages is a different origin from localhost, so existing forms and browser preferences do not transfer; form packages are the supported move path.
- [x] It records that the `/docform/` base is repository-specific and must change together with the router basename if the repository is renamed or a custom domain is added.
- [x] It explicitly states that no `gh-pages` branch is used.
- [x] The documented local build and smoke commands are verified, and the repository remains clean.
