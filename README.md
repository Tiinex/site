# Tiinex Site v219

Checkpoint: `v219`
Version: `0.2.39-v219`
Runtime: `react-v219-discovery-render-stabilization`

## Focus

Discovery render performance stabilization after v218 moved parent detection into the Discovery read-model.

## Changes

- Replaced the v218 O(n²) path-parent scan with an indexed directory membership pass.
- Preserved the Discovery ownership split: material role stays separate from graph/display membership.
- Preserved Trace target truth, self-parent protection, and path/folder parent fallback semantics.
- Added a performance regression guard for 325 source-backed Discovery records.
- Memoized the expensive WorkspaceColumnSurface read-models so scroll/view-state updates do not rebuild Discovery/Audit/Lineage projections unnecessarily.
- Changed scroll persistence to shallow-clone view state instead of structured-cloning the whole workspace.

## Boundaries

No transitions, artifact creation, source transport, recursive adapter traversal, or issue discovery changes.

## Supported local start

```bash
npm install
npm run dev
```

For CI-like checks use `npm run validate` and `npm run typecheck`.
