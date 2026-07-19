# Testing Strategy

Tiinex Site testing now separates machine green, visual parity, feature readiness, and demo readiness.

## Machine green

- `npm run validate`
- `npm run ui:shape`
- `npm run usecase:uc001`
- `npm run build:public`
- `npm run public:check`
- `npm run metrics`
- `npm run storage:scan`

## Co-located use-case tests

UC-001 workspace lifecycle tests live next to the code they verify:

- `src/workspaces/workspace.lifecycle.test.mjs`
- `src/workspaces/workspace.persistence.test.mjs`

This keeps behavior copy/paste friendly if the workspace lifecycle is reused in another runtime or CLI tool.

## Visual parity

Screenshots from `.old/` and Q's manual checks remain the visual baseline. UI-shape guards catch structural drift, but they do not claim full visual acceptance.

## Feature readiness

A feature is not ready because a button exists. It must have a real use-case, source-boundary behavior, view-state behavior, and a test or manual checklist that describes what passed.
