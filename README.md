# Tiinex Site

Official thin deployment above `@tiinex/app` and `@tiinex/core`.

`src/main.jsx` mounts the public App entrypoint. `tiinex.config.js` owns deployment id, explicit Verse registrations, companion providers, resource readers and optional initial Workspaces. Shared application and semantic implementations are not copied into this repository.

## Current checkpoint

The reusable Viewer source has moved to App. Headless checks and static browser import/syntax checks pass separately; a real dependency-equipped React/Vite build and browser mounting are still required. This is not yet a playable Playthings release.

Run `npm ci`, `npm test`, and `npm run build` once the exact Core/App packages are available. Before publication, install exact npm tarballs in an isolated consumer; do not copy source or use cross-repository source imports.

Playthings's supplied source is a headless foundation without a public React entrypoint. No fake Playthings module is registered. When that entrypoint exists, register `{ id, label, load: () => import('@tiinex/playthings/react') }` in `tiinex.config.js`.

Historic `.topics` artifacts are preserved pending qualified reduction in Round 2. The new `.topics/025-thin-site-deployment-task.trace.md` points to the controlling Business task. The old lockfile is preserved at `docs/migration/pre-split-package-lock.json` as input evidence, not current install authority.


## 2026-09-08 integration frontier

Site now registers the actual `@tiinex/playthings/app` descriptor and lazy React entrypoint. Run `npm run validate` and `python tools/browser-smoke.py` after installing the pinned dependencies. Source-set qualification and npm bootstrap instructions are in Core `docs/NPM-PUBLISH.md`. No local rendered/browser pass is claimed in the attached evidence.
