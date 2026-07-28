# Validation Notes v287

## Root hypothesis

After v286 disabled the broad `tx-return-settle` path, mobile/device-viewport interactions could still feel delayed once Tiinex/docs had loaded hundreds of records. The likely remaining owner is render-path work over the full workspace: discovery membership/material indexes, tree model building, and rerendering the workspace surface/cards when only dialogs or selected-record state changes.

## Changed

- `buildWorkspaceDiscoveryView` now accepts a stable `materialIndex` and reuses it when it belongs to the same records array.
- `buildDiscoveryMaterialIndex` exposes its source records so reuse is verifiable and safe.
- `WorkspaceColumnSurface` is wrapped in `React.memo` with a comparator that ignores callback identity churn and dialog-only parent rerenders.
- `WorkspaceTreeState` memoizes `buildWorkspacePathTree` and the expanded-folder set.
- `RecordCard`, `AssetCard`, and `WorkspaceCandidateCard` are memoized with material-prop comparators.
- Added a discovery-view regression guard that reuses a material index across query/filter changes.

## Validation run in sandbox

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

## Not verified in sandbox

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

`npm run build:public` still exits status 1 without useful output in this sandbox.

## Manual test target

1. Load Tiinex/docs with repo files and issues.
2. Use mobile/device viewport.
3. Interact with Feed, Tree, search, display filters, dialogs, and record actions.
4. Confirm search/filter still works against records outside the mounted render window.
5. Confirm tab-return behavior stays at least as good as v286.
