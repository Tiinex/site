# Tiinex Site v272

Checkpoint: `v272`
Version: `0.2.92-v272`
Runtime: `react-v272-governance-badge-visibility`

## v272 focus

Follow-up to v271 after browser video: make governance boundary state visible even when a bounded mirror materialization cannot prove the repository root files.

## Changed in v272

- GitHub sources with no persisted governance boundary now render an explicit `policy ?` source-rail badge instead of silently omitting governance state.
- Detected boundaries from `LINEAGE_POLICY`, `LINEAGE_LICENSE`, `LICENSE`, `POLICY`, and `NOTICE` still win when available.
- The fallback badge is advisory/unknown only. It does not fetch extra GitHub API/root material and does not claim a license was found.
- Mirror remains the primary practical transport for large public repo material; shared browser Git proxy remains manual/explicit.

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
