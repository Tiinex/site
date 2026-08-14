# M1 v367 acceptance-fail model correction

Status: post-acceptance correction after formal M1 FAIL on v366. No Q retest is requested. M2 remains closed.

## Evidence that forced the correction

The v366 acceptance video exposed three product-contract failures that automated checks had not prevented. One was worse: the record Open test explicitly protected the wrong behavior.

### 1. Workspace Artifact Open / Merge

`.old/app.js` routes workspace-card Open through `openViewerConfigMarkdown(... replaceNonDraftWorkspaces: !merge)` and `workspaceOpenReplaceGuard()`. That guard closes previous workspaces without local-state content while preserving unpublished/local durable work.

v366 instead kept the source/origin workspace visible and its tests asserted that it must remain. v367 reverses that oracle.

Contract:

```text
Open
→ selected workspace artifact becomes the active workspace set
→ previous non-draft/source-only workspace closes
→ durable unpublished local work may survive
→ origin context can remain referenced for lineage/recovery without staying open

Merge
→ current workspace remains
→ incoming workspace/context is intentionally added/merged
```

Owners:

- `src/workspaces/workspace.openSemantics.js`
- `src/app/workspaceRecordActions.js`
- `src/workspaces/workspace.candidates.js`

Regression evidence:

- `src/workspaces/workspace.openSemantics.test.mjs`
- `src/app/workspaceRecordActions.test.mjs`
- `src/workspaces/workspace.candidates.scope.test.mjs`
- `src/workspaces/workspace.candidates.entrypoints.test.mjs`

### 2. Hosted/default startup is a workspace set

`.old/app.js::parseWorkspaceEntrypoints()` walks all `###` groups under `## Workspace Entrypoints`, skips only entries with `Open On Apply` false, builds `state.sources` in declared order, and uses active index/focus separately.

The refactor had reduced config startup to one selected discovery/entrypoint source. That allowed the first useful workspace state to differ from PoC even when config resolution was technically green.

v367 startup therefore maps the complete openable entrypoint set and creates/materializes each configured workspace in declared order. Single-source mapping remains available for bounded manual/advanced app-config intake; it is no longer the startup-parity oracle.

Owners:

- `src/app/tiinexAppConfigPlan.js`
- `src/app/tiinexAppStartupSource.js`
- `src/app/startupWorkspaceCommand.js`
- `src/app/defaultWorkspaceStartCommand.js`
- `src/app/initialWorkspaceBootstrapOperation.js`

Regression evidence:

- `src/app/tiinexAppConfigSource.test.mjs`
- `src/app/startupWorkspaceCommand.test.mjs`
- `src/app/defaultWorkspaceStart.test.mjs`
- `src/app/initialWorkspaceBootstrapOperation.test.mjs`

### 3. Add hierarchy is product UX, not bootstrap plumbing

PoC `renderSourceModal()` exposes these primary choices:

```text
Manual files
Manual folder
GitHub source
Explicit URLs
Drag and drop
```

v366 placed `Tiinex app config` and `Paste trace` alongside them and surfaced implementation language such as config convention/boundary.

v367 preserves both advanced capabilities but moves them behind `Advanced imports`. No M4 authoring capability is pulled into M1.

Regression evidence:

- `src/schemas/workspace/workspace.addParity.test.mjs`

## Process gate

This checkpoint does not erase the failed acceptance result.

```text
v366 Q acceptance = FAIL
v367 = model correction after that failure
M1 = still failed/open for reevaluation
Q additional M1 test = NO by default
M2 = CLOSED
```

Architect should inspect the corrected oracles and implementation against `.old/`. A new human acceptance gate requires explicit milestone/process reevaluation, not “one more test”.
