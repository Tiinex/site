# Validation Notes v285

## v285 deferred view route persistence

Root hypothesis from the mobile video:

- Small/local workspaces respond quickly.
- After Tiinex/docs is loaded, ordinary mobile interactions have ~1s latency.
- That points to main-thread work tied to large workspace state, not only DOM element count.
- The likely expensive path is synchronous route/hash/session persistence on view-only interactions.

Changed in v285:

- `commitViewPatch` / `commitViewUpdate` now defer route/hash/session writes.
- React state updates still happen immediately, so buttons/search/view changes respond without waiting for JSON encode + history.replaceState.
- Source/material/workspace lifecycle commits still write synchronously.
- Share URL and beforeunload flush pending deferred state.
- Added `window.TiinexStatePersistenceReport()` diagnostics.
- Added `src/app/statePersistenceScheduler.test.mjs`.

Validated locally in the sandbox:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Follow-up validation still needed outside the sandbox:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

Manual browser checks requested:

1. Load local-only workspace and confirm interactions still feel instant.
2. Load Tiinex/docs with repo files and issues.
3. In mobile viewport, tap Feed/Tree/Lineage, search, expand tree folders, and open record dialogs.
4. Interaction latency should be lower than v284.
5. Run `window.TiinexStatePersistenceReport()` and verify view actions increment deferred writes before idle flush.
6. Copy Share URL after a view action and verify the pending route state is flushed before copy.
