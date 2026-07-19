# Validation Notes v113

## Status

UC-001 desktop shell is implemented with route-grounded behavior:

- empty Column start
- create local/session workspace
- workspace name required
- no local/session to GitHub provenance guess
- URL hash view-state ownership
- local storage cache mirror for hash-owned state
- clean URL ignores stale localStorage cache
- browser back/forward restores route states
- centered Tiinex logo returns to clean home route
- local note action dialog
- lifecycle-owned local note record insertion
- non-destructive close confirmation
- return to empty state after close

## Co-located tests

- `src/schemas/origins.test.mjs`
- `src/workspaces/workspace.config.test.mjs`
- `src/workspaces/workspace.lifecycle.test.mjs`
- `src/workspaces/workspace.persistence.test.mjs`
- `src/workspaces/workspace.route.test.mjs`

## Commands run

```bash
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
npm run metrics
npm run storage:scan
npm test
```

## Known limitations

- UC-001 mobile ergonomics still needs manual verification and likely a dedicated follow-up pass.
- Full local Markdown file import/parser into a created workspace is not yet implemented; v113 only adds manual local note records. Continuation/merge remain hidden from the primary path until their use-cases are grounded.
- Map/Atlas/Leaflet remain frozen until Column happy path has proved old use-cases.

## v113 note

- Added `src/workspaces/workspace.route.js` so route shape is explicit and portable.
- Changed clean startup so stale localStorage does not reopen a workspace without `#state=`.
- Added push/replace history modes so create/close/verse changes can participate in browser back/forward.
- Moved Create to the left of the centered logo; logo is now a home route control.
- Added schema-origin support for Tiinex/docs plus viewer/fork extension schemas.


## v113 validation focus

Validated fitted global dock semantics, video-reviewed action clarity, lifecycle-owned local note insertion, styled created-workspace empty state, hidden deferred source-bound actions, and conditional workspace pager guards.
