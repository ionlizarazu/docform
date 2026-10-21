# GitHub Pages deployment and main-branch CI

Status: ready-for-agent

## Problem Statement

Docform only exists on a developer machine. A filler cannot open a public URL, and a form route cannot be shared or bookmarked. Running the app from a local dev server also does not prove that the production build works under a project-site base path, that deep form routes survive a reload, or that the ODT preview wasm loads from the published location.

The repository also has no integration branch or pull-request checks. Work is pushed directly to `main`, and a broken test, lint error, or production build can reach the branch that is supposed to be publishable.

## Solution

Publish Docform as a GitHub Pages project site at `https://ionlizarazu.github.io/docform/`, deployed from `main` with the official GitHub Pages Actions artifact flow. The production build uses `/docform/` as its base path, the router derives its basename from that base, and a GitHub Pages `404.html` fallback lets deep form routes load the app instead of a GitHub error page.

Use `develop` as the integration branch. Every pull request targeting `main` runs lint, tests, typecheck, the Pages production build, and a browser smoke of the built Pages artifact. A merge to `main` deploys that artifact. No long-lived `gh-pages` branch is created.

## User Stories

1. As a filler, I want to open Docform at a public HTTPS URL, so that I can use it without running a local server.
2. As a filler, I want to open a form route directly from a shared link, so that I can fill the form without first visiting the library.
3. As a filler, I want a deep form route to survive a page reload, so that refreshing does not produce a GitHub error page.
4. As a filler, I want browser back and forward navigation to work on the published site, so that normal navigation behaves as it does locally.
5. As a filler, I want to upload, fill, preview, and download documents on the published site, so that deployment does not remove product behavior.
6. As a filler, I want the ODT preview wasm to load from the project path, so that previews still render after deployment.
7. As a filler, I want the favicon and static assets to load from the project path, so that the published site has no broken resources.
8. As a filler, I want the interface-language switcher to work on the published site, so that deployment does not break the locale feature.
9. As a filler, I want the app to remember forms on the published origin, so that returning to the Pages URL finds the forms I created there.
10. As a template author, I want upload and variant validation to work on the published site, so that I can create forms there.
11. As a user, I want an unknown path on the published site to show Docform's own not-found page, so that navigation failures stay inside the app.
12. As a mobile user, I want the deployed site to work at the project URL, so that I can use it on a phone.
13. As a maintainer, I want every push to `main` to deploy the production artifact, so that `main` is the release branch.
14. As a maintainer, I want a manual deployment trigger, so that I can redeploy without an empty commit.
15. As a maintainer, I want deployments to be serialized, so that two merges cannot publish over each other out of order.
16. As a maintainer, I want the deployed artifact to be exactly the tested production build, so that the live site matches CI.
17. As a maintainer, I want a failed build to stop before publishing, so that a broken site is not deployed.
18. As a maintainer, I want `develop` to be the integration branch, so that feature work does not accumulate directly on `main`.
19. As a maintainer, I want to promote `develop` to `main` through a pull request, so that releases have a review point.
20. As a reviewer, I want lint, tests, typecheck, and the production build to run on every pull request targeting `main`, so that `develop` to `main` is gated by the same checks as every other PR.
21. As a reviewer, I want a clear CI status check, so that branch protection can require it before merge.
22. As a reviewer, I want the Pages build and its 404 fallback validated, so that deployment-specific breakage is caught before merge.
23. As a reviewer, I want a browser smoke of the built Pages artifact, so that base-path and deep-link bugs are caught in CI.
24. As a reviewer, I want CI to use the committed lockfile, so that local and CI dependency trees match.
25. As a developer, I want local development to keep using the root path, so that `npm run dev` and existing tests do not change.
26. As a developer, I want a dedicated Pages build command, so that the `/docform/` base path is not accidentally used for local builds.
27. As a developer, I want the router basename derived from the build base, so that routes work both locally and on Pages without a second hard-coded value.
28. As a developer, I want the Pages build to generate the 404 fallback, so that deep links are a build guarantee rather than a manual step.
29. As a developer, I want a Pages smoke that serves the artifact under `/docform/` with a 404 fallback, so that the test matches GitHub Pages rather than a generic SPA server.
30. As a developer, I want the browser path to Chrome to be configurable, so that CI and local runs can use their own installation.
31. As a developer, I want the CI to use the same Node major version as local development, so that builds are reproducible.
32. As a maintainer, I want the deployment URL, branch model, and one-time GitHub settings documented, so that the setup can be repeated.
33. As a maintainer, I want no `gh-pages` branch, so that the repository has one source of truth in `main`.
34. As a maintainer, I want no deployment secret, so that publishing uses GitHub's own Pages identity and permissions.
35. As a maintainer, I want the Pages environment URL to be visible from the deployment run, so that I can open the site from Actions.
36. As a maintainer, I want direct pushes to `main` blocked and the CI check required, so that every production change has passed the checks.
37. As a maintainer, I want the project-site path documented as repository-specific, so that a future rename or custom domain is a conscious change.
38. As a user, I want the published site to use HTTPS, so that the browser can use the same modern APIs as local development.

## Implementation Decisions

- **Hosting model:** GitHub Pages project site at `https://ionlizarazu.github.io/docform/`, deployed from `main` using GitHub's Pages artifact actions. Do not create or publish from a `gh-pages` branch. The site uses the repository name as its path segment.
- **Production base path:** a dedicated Pages build command uses `/docform/` as the Vite base. The normal local build and dev server keep `/`, so existing paths, tests, and the local smoke workflow are unchanged.
- **Router basename:** the browser router derives its basename from the build base. A small pure helper normalizes the base by removing its trailing slash and falling back to `/` at the root. This is the only new application seam.
- **Deep links:** the Pages build writes a 404 fallback copy of the built entry document. GitHub Pages serves that document for unknown project paths; the app boots at the original URL and the router handles the form route. This preserves the current `BrowserRouter` URLs and avoids a switch to hash routing.
- **Assets:** the Pages build relies on Vite's base handling for scripts, styles, the favicon, and the ODT wasm URL. The built entry and the 404 fallback must reference the project path, not root-absolute paths.
- **CI workflow:** runs on every pull request targeting `main`, including `develop` to `main`. It uses Node 22, `npm ci`, lint, tests, typecheck, the Pages production build, and the Pages browser smoke. It has read-only repository permissions and cancels superseded runs.
- **Deployment workflow:** runs on pushes to `main` and on manual dispatch. It builds the Pages artifact, verifies the 404 fallback exists, configures Pages, uploads the artifact, and deploys it to the `github-pages` environment. It has Pages write and OIDC permissions, and a Pages concurrency group that does not cancel an in-flight deployment.
- **Branch model:** `develop` is the integration branch; feature work merges into `develop`; `develop` is promoted to `main` by pull request. `main` is the deployable branch. Create `develop` from the current `main`.
- **Branch protection:** the CI workflow provides the status check. Requiring that check on `main`, and blocking direct pushes, is a one-time GitHub repository setting rather than a repository file. Document it as part of the setup.
- **Pages source:** the repository must be set to deploy from GitHub Actions once. This is also a one-time repository setting; the workflow itself cannot enable it.
- **Pages smoke:** extend the existing browser smoke harness with a Pages mode. It builds or consumes the Pages artifact, serves it under `/docform/` with a GitHub-Pages-style 404 fallback, and walks the existing library, upload, fill, download, and preview flow. It then opens a form route by full page load to prove the fallback and router basename. It reads a configurable Chrome path.
- **No data migration:** GitHub Pages is a different browser origin from localhost. Existing local forms, IndexedDB records, and browser preferences do not move to the Pages origin. The README must state this explicitly.
- **Documentation:** document the published URL, the `develop` to `main` flow, the required CI check, the one-time Pages source setting, the Pages build and smoke commands, and the repository-specific `/docform/` path.
- **No app data changes:** deployment does not change the form definition, form route identity, form package format, IndexedDB schema, or filled-document filenames.
- **No secrets:** the deployment uses the GitHub Actions identity and Pages permissions. No personal access token or deploy key is stored.

## Testing Decisions

- Good tests assert the published behavior: the app loads under the project path, a deep form route survives a full reload, assets load from that path, and the existing form flow still works. They do not assert the internal shape of the workflow YAML.
- The only new unit seam is the pure router-basename helper: root base, project base, and trailing-slash normalization. Existing page and service seams are reused.
- The Pages build is checked as an artifact: the 404 fallback exists, and the built entry references the project asset path rather than the root. This can be a small build assertion before upload.
- The highest-value test is a browser smoke of the built artifact under `/docform/` with a 404 fallback. It reuses the existing smoke flow, then performs a full-page navigation to a form route. It must use a server that serves the 404 fallback, not a generic history-API fallback, so the test actually matches GitHub Pages.
- CI runs lint, tests, typecheck, the Pages build, the artifact assertion, and the Pages browser smoke on every PR targeting `main`. The existing local smoke command remains available.
- The browser smoke uses the system Chrome path by default and accepts an override for CI images or unusual local installations.
- Prior art: the existing page-level UI tests, the service-level form tests, and the existing real-Chrome smoke. The Pages smoke extends that harness rather than introducing a second browser stack.
- The deployment workflow's first real run, plus a direct deep-link load on the published URL, is the final verification. Workflow YAML is not unit-tested; the build artifact and smoke are the executable checks.
- Branch protection and the Pages source setting are verified manually after the first workflow run.

## Out of Scope

- A `gh-pages` branch or a second published source of truth.
- A custom domain, `CNAME`, root-site deployment, or changing the repository name. The project-site path is `/docform/`.
- Pull-request preview deployments.
- CDN configuration, custom response headers, cache policy tuning, or edge functions.
- A service worker, offline mode, or installable PWA behavior.
- Automated branch-protection or Pages-source configuration through the API.
- Deployment approvals, protected environments beyond `github-pages`, or multiple environments such as staging.
- Self-hosted runners or caching the browser download beyond the existing system Chrome.
- Switching from `BrowserRouter` to `HashRouter`.
- Migrating local IndexedDB forms to the Pages origin.
- Analytics, error reporting, or uptime monitoring.
- Visual regression testing of the published site.
- Automated rollback or release versioning.

## Further Notes

- The published URL is expected to be `https://ionlizarazu.github.io/docform/`. If the repository is renamed or a custom domain is added, the base path and router basename must be revisited together.
- One-time repository setup: set Pages source to GitHub Actions; require the CI status check on `main`; block direct pushes to `main`.
- Create `develop` from the current `main` before starting feature work. `develop` to `main` is a pull request; `main` merges deploy automatically.
- Local forms and preferences are origin-specific. A form created on `localhost` is not present at the Pages URL, and vice versa. Export/import via a form package is the supported way to move a form.
- The 404 fallback is the deployment-specific part most likely to break. The Pages smoke must load a deep route through the fallback, not rely on Vite preview's history fallback.
- If the GitHub-hosted runner's Chrome path changes, the smoke's configurable browser path is the only adjustment needed.
- The project-site base is intentionally repository-specific; this spec does not attempt to make the deployment portable to an arbitrary repository name.
