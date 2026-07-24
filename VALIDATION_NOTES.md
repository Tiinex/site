# Validation Notes v222

## Root cause hypothesis

The render lag was fixed in v220, but the workspace/app refactor still had monolith risk. `workspace.views.jsx` and `TiinexApp.jsx` were carrying too many unrelated responsibilities, so future Discovery/Lineage/Display changes could accidentally overwrite each other and recreate the regression loop.

## Fix

- Split workspace rendering by surface area:
  - `workspace.chrome.views.jsx`
  - `workspace.discovery.views.jsx`
  - `workspace.tree.views.jsx`
  - `workspace.audit.views.jsx`
  - `workspace.lineage.views.jsx`
  - `workspace.cards.views.jsx`
  - `workspace.read.views.jsx`
  - `workspace.auditBadge.views.jsx`
  - `workspace.recordDialogs.views.jsx`
  - `workspace.displayOptions.views.jsx`
  - `workspace.viewFormatting.js`
- Kept `workspace.views.jsx` as a thin orchestrator rather than a UI monolith.
- Split app-level runtime/presentation/helper responsibilities out of `TiinexApp.jsx`:
  - `src/app/appShell.views.jsx`
  - `src/app/runtimeState.js`
  - `src/app/viewport.js`
  - `src/app/githubMaterializationSummary.js`
  - `src/app/workspaceDisplayCounts.js`
  - `src/app/recordUi.js`
  - `src/app/viewState.js`
- Updated UI/static guards to search module groups, not just the former monolith files.
- Added tighter architecture budgets so the same debt shape is harder to reintroduce.

## Validation run

Green:

```bash
npm run validate
npm run ui:shape
npm run architecture:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
```

## Manual browser status

Not manually browser-validated here. The user confirmed v220 removed the render lag; v222 is intended to preserve that behavior while reducing monolith/regression risk.

## Remaining architecture debt before Root closure

- CSS is still large and should be cleaned after Root semantics are stable, not in this checkpoint.
- `TiinexApp.jsx` is smaller but still owns source/workspace command orchestration; source transport closure should split that later.
- Root milestone closure still needs a final manual pass over Discovery Feed/Tree, Leaves only, Display options, Lineage independence, and Add/source dialogs.
