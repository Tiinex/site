# Validation Notes v235

## Root cause hypothesis

The v234 source rail exposed a transport badge, but it did not recover the old PoC's most useful transport affordance: the badge should identify the current transport tier and provide a controlled manual step to the next tier. The visible `proxy`/transport state should be a source-transport control, not just receipt text.

## Fix

- Added explicit GitHub transport tier helpers in `src/sources/github/github.transport.js`.
- Added exact one-tier transport refresh support via `transportOrderExact`.
- Added `src/app/sourceTransportRefresh.js` as the owner for constructing a saved-source retry input from the current source plan.
- Updated `SourceStrip` to render a PoC-like active transport badge with failed-state styling and a `Click: try <next tier>` title.
- Updated app materialization to pass an exact selected tier when the badge triggers a retry.
- Persisted transport outcome/plan fields through source lifecycle and route shells.

## Guard coverage

- `github.transport.test.mjs` proves explicit `proxy` refresh does not fall through to `direct`.
- UI shape guard checks active-tier styling, failed-state styling, and next-tier title.
- Architecture guard keeps badge refresh input outside `TiinexApp.jsx` and requires exact transport refresh support.

## Known limits

- Mirror/proxy availability still depends on configured readers.
- Discussions remain degraded/deferred.
- Public build must be verified in an environment with Vite installed.
