# Validation Notes v109

## Status

UC-001 desktop shell is implemented:

- empty Column start
- create local/session workspace
- workspace name required
- no local/session to GitHub provenance guess
- URL hash view-state ownership
- local storage recovery cache
- non-destructive close confirmation
- return to empty state after close

## Co-located tests

- `src/workspaces/workspace.lifecycle.test.mjs`
- `src/workspaces/workspace.persistence.test.mjs`

## Commands run

```bash
node --check all src/tools js/mjs
npm run validate
npm run ui:shape
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
- Add/import local markdown into a created workspace is not yet implemented.
- Map/Atlas/Leaflet remain frozen until Column happy path has proved old use-cases.


## v108 validation

Passed validate, ui:shape, runtime:smoke, usecase:uc001, build:public, public:check, metrics, storage:scan, npm test, and zip integrity.

Manual focus for Q: empty start should now match the old Tiinex.dev blank start much more closely: no workspace shell, no onboarding card, no default button styling leak.

## v109 note

- Restored `.topics/.workspaces/viewer.workspace.md` as root config material outside `.old`.
- Expanded `.workspace.md` parsing for viewer identity, empty stage, discovery, entrypoints, mirrors, transports, and help.
- Added runtime behavior for global multiverse/help/share controls instead of leaving them as visual-only scaffolds.
- Re-centered the empty-stage dock around the Tiinex logo.
