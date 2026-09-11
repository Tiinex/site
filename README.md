# Tiinex Site

Official thin web deployment of the shared Tiinex application.

Site owns deployment composition and public hosting. Shared Viewer/application code lives in `@tiinex/app`; host-neutral artifact/schema/lineage/Handoff mechanics live in `@tiinex/core`; Verse implementation such as Playthings lives in its own package.

## Runtime boundary

- `src/main.jsx` mounts `@tiinex/app/viewer`.
- `tiinex.config.js` registers deployment-specific Verses, providers/readers and optional initial Workspaces.
- `@tiinex/verse-playthings/app` currently supplies the Playthings descriptor used by this deployment.
- Site must not contain copied App/Core implementation or import another repository's private `src/**` tree.

## Development

```sh
npm ci
npm test
npm run build
```

`npm run validate` runs the Site-owned deployment tests and the production Vite build. `tools/browser-smoke.py` is the dependency-equipped browser gate used by CI after Chromium is installed.

## Authority and history

Tiinex Docs remains canonical schema/semantic authority. Business owns initiative/human-gate context. Site repository placement does not transfer either authority.

The old monolithic Viewer/Tooling `.topics` history is still present while Turn 2 qualifies its destructive Reduction. Current deployment work is rooted at `.topics/025-thin-site-deployment-task.trace.md` and `.topics/026-thin-site-hygiene-historical-reduction-task.trace.md`. Historical semantic files are not deleted until the shared reduction preflight has an exact immutable Git source identity and returns eligible.

## Self-contained local-source browser gate

To test the exact current first-party sources without publishing `@tiinex/*` packages, run the Site-owned composition harness from the Site checkout and point it at the matching carried repositories:

```sh
npm run test:browser:local-source -- --core ../core --app ../app --playthings ../verse-playthings --browser /path/to/chrome-or-chromium
```

The harness validates the first-party package names and exact Site-declared versions, packs Core/App/Playthings without lifecycle scripts, copies Site into a disposable composition directory, rewrites only that temporary Site descriptor to consume the local tarballs, installs the exact declared third-party versions, runs `npm test`, runs the production Vite build, and then runs `tools/browser-smoke.py`. Source-repository manifests, lockfiles, Git state and `node_modules` are not used as install targets. Exact per-phase stdout/stderr plus a machine-readable `result.json` are preserved in the evidence directory printed by the command; add `--evidence-dir <dir>` to choose its location or `--keep-temp` to retain the disposable composition for debugging a failure.

`--site` defaults to the current Site checkout. `--core`, `--app`, and `--playthings` may also be supplied through `TIINEX_CORE_ROOT`, `TIINEX_APP_ROOT`, and `TIINEX_PLAYTHINGS_ROOT`. The browser executable may be passed with `--browser` or `TIINEX_BROWSER_EXECUTABLE`; the Python executable may be selected with `--python` or `TIINEX_PYTHON`. `--offline` is a diagnostic cache-only mode for hosts where public npm access is intentionally unavailable.
