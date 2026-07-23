# Validation Notes v212

v212 is a Root action availability and create-like action gating pass.

## Identity

- Checkpoint/version moved from `0.2.31-v211` to `0.2.32-v212`.
- Runtime identity moved to `react-v212-root-action-gating`.

## What changed

- User-visible record actions now distinguish inspect/read actions from create-like actions.
- Continue and Reference/Preserve are hidden unless the resolved schema companion advertises an implemented transition capability.
- Root fallback and unknown child schema records remain readable but do not expose fake creation/transitions.
- Schema companion lineage action tests now assert that Continue/Reference stay unavailable until declared by transition capability.
- Existing draft/transition helper functions are retained for future transition milestone work; this batch only gates presentation and availability.

## Validation run

Expected source-clean checks for this checkpoint:

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
```

Manual browser testing remains deferred until the Root milestone closes.
