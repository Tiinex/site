# Validation Notes v216

v216 is a focused Root-milestone Discovery membership repair.

## Scope

- Checkpoint/version moved from `0.2.35-v215` to `0.2.36-v216`.
- Runtime identity moved to `react-v216-discovery-work-leaf-membership`.
- Discovery `Leaves only` now requires both:
  - work-leaf eligibility, and
  - terminal loaded-lineage membership.
- Schema/type-definition artifacts, including canonical `.schema.md` records, are no longer Discovery leaves even when they are terminal schema nodes.
- Source-backed metadata-only `.trace.md` work leaves can still remain visible after refresh/session restore.
- Lineage scope remains independent from Discovery membership controls.

## Validation performed

Planned source-clean checks:

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

## Manual validation deferred

Manual browser checks are still deferred until the Root milestone test pass, except for user-supplied regression videos/screenshots that guide hotfixes.
