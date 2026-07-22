# Tiinex Site v177

v177 is a discovery presentation checkpoint for the React/Vite refactor. It keeps v176 semantic action/label truth while making the main Discovery loop more useful before the next manual test pass.

## v177 batch

- Discovery now prioritizes Tiinex/work leaves before support/schema Markdown.
- Supporting docs are hidden from Feed/Tree by default but preserved in state, audit, route, and export boundaries.
- Display options now exposes `Leaves first`, supporting docs, workspace candidates, and assets as presentation-only controls.
- Tree folder expansion is persisted in route/view state instead of being a transient DOM/search effect.
- GitHub materialization now has an observable accepted/loading receipt before records appear in bulk.
- Source pills expose the finite discovery state and provide a small `Load` continuation control for deferred sources.
- Lineage is selected-first: the chosen artifact summary is shown before workspace-wide diagnostics, which are collapsed when a selection exists.
- The logo artwork is optically re-centered without changing the button size or touching image files.


## Supported local start

Use `npm run dev` after installing dependencies. Opening source `index.html` directly from the filesystem is not a supported runtime because the React/Vite entry needs module bundling.

## Validation

This source zip is intended for source-clean replacement. The supported local loop remains:

```bash
npm install --no-audit --no-fund
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
```

`npm run test` additionally runs Vite build/runtime checks and therefore requires installed React/Vite dependencies.
