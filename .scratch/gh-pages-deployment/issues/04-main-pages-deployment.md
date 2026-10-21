# 04: Main-branch Pages deployment workflow

**What to build:** Publish the tested Pages artifact from `main` using the official GitHub Pages Actions flow. Pushes to `main` and manual dispatches build, verify the 404 fallback, upload, and deploy the artifact. No `gh-pages` branch and no deployment secret are introduced.

**Blocked by:** 01 — Pages production build with project base, router basename, and 404 fallback

**Status:** done

- [x] The workflow triggers on pushes to `main` and on manual dispatch, and never on pull requests.
- [x] It installs from the lockfile, runs the Pages production build, and verifies the 404 fallback before uploading.
- [x] It uses the official Pages configure/upload/deploy actions with `contents: read`, `pages: write`, and `id-token: write` permissions.
- [x] It deploys to the `github-pages` environment and exposes the published URL from the deployment step.
- [x] Deployments are serialized in a Pages concurrency group without cancelling an in-flight deployment.
- [x] A failed build or artifact check stops before deployment.
- [x] No `gh-pages` branch, personal access token, deploy key, or other secret is used.
