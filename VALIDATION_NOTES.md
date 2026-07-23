# Validation Notes v220

## Root cause hypothesis

v219 reduced the Discovery read-model cost, but many common browser interactions still used `structuredClone(state)`. With Tiinex/docs loaded, that cloned the full workspace and records for view-only changes such as Tree folder toggles, Feed/Tree switches, search, Display options, and Lineage card expansion. The clone also replaced record object identity, making memoization less effective and causing read-model rebuilds.

## Fix

- Added view-only state helpers in `src/app/TiinexApp.jsx` that shallow-copy only the app state and `view` branch.
- Replaced full-state clone usage in view-only handlers.
- Kept lifecycle/source/import operations unchanged because those mutate workspace material intentionally.
- Added a UI shape guard rejecting `structuredClone(state)` in `src/app/TiinexApp.jsx`.

## Validation run

Green:

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
```

Not run to completion in this sandbox:

```bash
npm run build:public
npm run public:check
npm run runtime:smoke
```

Reason: the active sandbox copy did not have a usable local `node_modules/.bin/vite`, and an attempted dependency install failed in the container. The Windows/Linux lockfile dry-run succeeded.

## Manual browser status

Not manually browser-validated here. The checkpoint is intended for the same Tiinex/docs video flow: open Discovery, switch Tree/Feed, expand/collapse folders, scroll, type search, and open Display options without render-thread freezing.
