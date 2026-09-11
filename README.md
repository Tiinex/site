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
