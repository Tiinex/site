# Tiinex Site v285

Checkpoint: `v285`
Version: `0.2.105-v285`
Runtime: `react-v285-deferred-view-route-persistence`

## v285 focus

Mobile interaction latency follow-up after v284. Large Tiinex/docs workspaces made simple mobile actions feel delayed because view-only interactions synchronously persisted large route/session state into URL hash + local storage.

## Changed in v285

- View-only commits update React state immediately but defer route/hash/session persistence to idle time.
- Workspace/material/source commits still persist synchronously for recoverability.
- Share and beforeunload flush pending deferred route state.
- Added `window.TiinexStatePersistenceReport()` diagnostics.
- Added `src/app/statePersistenceScheduler.js` as the owner for deferred route persistence.

## Validation

See `VALIDATION_NOTES.md`.

## Supported local start

```bash
npm install
npm run dev
```

Common validation commands:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```
