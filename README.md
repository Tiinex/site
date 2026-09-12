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

To test the exact current first-party sources without publishing `@tiinex/*` packages, use the Site-owned npm-script front door from the standard Tiinex multi-repository checkout:

```sh
npm run test:browser:local-source
```

On Windows, invoke the harness through this `npm run ...` front door rather than `node tools/local-source-browser-harness.mjs` directly. The npm script supplies `npm_execpath`; the harness executes that exact npm CLI through the already-running Node executable, avoiding the shell-free `spawnSync("npm")` / `npm.cmd` resolution failure that can produce `ENOENT` even when npm works in PowerShell or Command Prompt. No VS Code launch profile is required for this gate.

The harness validates the first-party package names and exact Site-declared versions, packs Core/App/Playthings without lifecycle scripts, copies Site into a disposable composition directory, rewrites only that temporary Site descriptor to consume the local tarballs, installs the exact declared third-party versions, runs `npm test`, runs the production Vite build, and then runs `tools/browser-smoke.py`. Source-repository manifests, lockfiles, Git state and `node_modules` are not used as install targets. Exact per-phase stdout/stderr plus a machine-readable `result.json` are preserved in the evidence directory printed by the command; add `--evidence-dir <dir>` to choose its location or `--keep-temp` to retain the disposable composition for debugging a failure.

`--site` defaults to the current Site checkout. Core, App and Verse Playthings then default to the sibling repositories `../core`, `../app`, and `../verse-playthings`. Explicit `--core`, `--app`, and `--playthings` overrides take precedence over `TIINEX_CORE_ROOT`, `TIINEX_APP_ROOT`, and `TIINEX_PLAYTHINGS_ROOT`; those environment overrides take precedence over the sibling defaults.

The real-browser smoke uses `--browser` / `TIINEX_BROWSER_EXECUTABLE` first when supplied. Otherwise, on Windows it checks a bounded deterministic set of normal Chrome, Edge and Chromium install locations under `Program Files`, `Program Files (x86)`, and `LOCALAPPDATA`, then the corresponding browser names on `PATH`. If none is present, it uses Playwright-managed Chromium only when that executable is already installed. The gate never downloads a browser automatically, and its structured result reports both the chosen browser executable and the resolution source. The Python executable may still be selected with `--python` or `TIINEX_PYTHON` when a host needs an override. `--offline` is a diagnostic cache-only mode for hosts where public npm access is intentionally unavailable.
