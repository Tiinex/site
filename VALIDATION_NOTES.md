# Validation Notes v219

## Root cause hypothesis

v218 put the right ownership boundary in place, but `discoverPathParentEntries()` scanned every work-eligible record against every other work-eligible record and repeatedly normalized paths/keys. In the Tiinex/docs browser flow that read-model was rebuilt on render/scroll persistence, so the UI thread could freeze repeatedly.

A second contributing issue was scroll persistence using `structuredClone(state)`, which cloned the entire workspace and destroyed object identity for memoization.

## Fix

- Build a descriptor/index for Discovery records once per read-model build.
- Resolve path parents by directory indexes and ancestor directories instead of nested record scans.
- Preserve workspace object identity during scroll persistence by shallow-cloning only the `view.scrollPositions` branch.
- Memoize Discovery/Audit/Lineage/material-summary projections in `WorkspaceColumnSurface`.

## Guard

`src/workspaces/workspace.discoveryView.test.mjs` includes a 325-record render-safety guard. The v218 synthetic case was roughly seconds-level; v219 stays well under the 1000 ms threshold in Node.
