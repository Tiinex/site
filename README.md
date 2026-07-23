# Tiinex Site v208

v208 is a runtime-startup and lineage ready-control hotfix on top of v207. It restores the exported build identity expected by the React entrypoint and keeps `Load full lineage` hidden when the currently selected loaded-workspace lineage is already complete.

## v208 batch

- Restores `tiinexBuildIdentity()` from `src/build.identity.js` so `src/main.jsx` can boot the app.
- Extends the checkpoint identity guard so the runtime build identity function is checked, not just mentioned in source text.
- Treats already-complete selected lineage paths as lineage-ready without requiring an explicit `Load full lineage` click.
- Keeps incomplete/partial lineage paths behind `Load full lineage` before search, display options, or Audit are shown.
- Does not change source transport, issue discovery, recursive adapter traversal, transitions, portable tooling, dependency pinning, or public build semantics.

## Supported local start

Use the Vite development server for source work:

```bash
npm install
npm run dev
```

Directly opening `index.html` from the source tree is not the supported local runtime path for the React/Vite app.

## Validation

Run the usual local gates before handoff:

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
```

Manual browser testing is intentionally deferred until the end of this Root-closure milestone unless a runtime failure appears.
