# Tiinex Site v222

Checkpoint: `v222`
Version: `0.2.42-v222`
Runtime: `react-v222-workspace-surface-debt-cleanup`

## Focus

Workspace surface split and monolith-debt cleanup before closing the Root milestone. v220 fixed the render lag and v221 consolidated display/filter contracts; v222 continues the cleanup so refactored UI ownership does not collapse back into a few large files.

## Changes

- Split `src/schemas/workspace/workspace.views.jsx` into bounded surface modules for chrome, feed, tree, audit, lineage, record cards, read projection, audit badges, record dialogs, and display options.
- Reduced `workspace.views.jsx` to a thin `WorkspaceColumnSurface` orchestrator.
- Extracted app shell presentation, runtime/default-state contract, viewport paging, GitHub materialization summaries, record UI hydration, and workspace display-count bridging out of `TiinexApp.jsx`.
- Updated UI/static guards so they validate behavior across extracted modules instead of forcing everything back into monolith files.
- Tightened `tools/check-architecture-shape.mjs` with explicit line budgets and ownership guards for the new modules.

## Boundaries

No transitions, artifact creation, source transport, recursive adapter traversal, issue discovery, CSS redesign, or new schema companions changed. Discovery membership behavior from the v217-v220 line is intended to be preserved; this checkpoint is architecture/debt cleanup.

## Supported local start

```bash
npm install
npm run dev
```
