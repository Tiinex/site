# v348 Controller Debt Review

## Scope

This review follows the v339-v347 recovery series and checks whether the refactor still behaves like a controller monolith after the core PoC-parity repairs.

## Findings fixed in v348

- `src/app/TiinexApp.jsx` still owned the full GitHub source loading transaction: source registration, transport policy, cache reset, progress publication, adapter invocation, ref pinning, materialization command application, import-summary receipt, notice text, and final commit.
- `TiinexApp.jsx` still directly imported source/adapter owners for GitHub and explicit URL material.
- `closeSource` still mixed UI notice text, cache clearing, lifecycle source close, and Local source receipt formatting.
- Architecture checks still expected some old imports in `TiinexApp.jsx`, which would have rewarded keeping source behavior in the controller.

v348 moves those operations into explicit app command/operation boundaries:

- `src/app/githubSourceOperation.js`
- `src/app/urlMaterialCommand.js`
- `src/app/workspaceSourceCloseCommand.js`

The app controller now wires state, dialogs, notices, and commits; feature modules own material/source semantics.

## Evidence

Targeted tests:

```bash
node src/app/githubSourceOperation.test.mjs
node src/app/urlMaterialCommand.test.mjs
node src/app/workspaceSourceCloseCommand.test.mjs
```

Acceptance matrix retained:

```bash
node src/acceptance/recoveryAcceptance.test.mjs
node src/acceptance/knownScenarios.test.mjs
```

General validation retained:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
npm run portable:smoke
npm run usecase:uc001
```

## Non-claims

This checkpoint does not claim public/browser deploy PASS from the sandbox. `npm run build:public` still depends on a real install of the Vite toolchain; the sandbox registry does not resolve the pinned Vite package, so no `.site-publish` bundle was produced here.

## Remaining watch areas

- `TiinexApp.jsx` remains a React wiring file, not a pure shell. That is acceptable for the current recovery checkpoint, but future growth should add or extend command modules rather than adding new usecase logic inline.
- `src/app/tiinexHostedWorkspaceConventions.js` and several adapter/tooling files are large enough to merit owner review before major new features touch them. They are not on the critical import/source/Open-Merge/lineage path fixed in v339-v348.
