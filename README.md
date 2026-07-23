# Tiinex Site v220

Checkpoint: `v220`
Version: `0.2.40-v220`
Runtime: `react-v220-discovery-interaction-clone-debt-repair`

## Focus

Discovery interaction clone debt repair after the v219 browser video still showed interaction stalls while moving between Tree/Feed and expanded folders.

## Changes

- Preserved the v217/v218 Discovery read-model owner and v219 indexed path-parent membership.
- Removed `structuredClone(state)` from view-only interactions in `src/app/TiinexApp.jsx`.
- Added shallow view patch/update helpers so these operations keep workspace and record object identity stable:
  - focus lineage from a card
  - switch Feed/Tree/Lineage verse
  - toggle tree folders
  - type search queries
  - apply Display options
  - expand/collapse Lineage cards
  - run Lineage load/audit reports
  - cycle workspaces
- Updated UI shape guards so future view-only interactions cannot reintroduce full workspace cloning.

## Boundaries

No transitions, artifact creation, source transport, recursive adapter traversal, issue discovery, or new schema companions changed.

## Supported local start

```bash
npm install
npm run dev
```

## Useful validation

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
```
