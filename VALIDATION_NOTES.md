# Validation Notes v215

v215 is a focused Root-milestone Discovery membership repair.

## Scope

- Checkpoint/version moved from `0.2.34-v214` to `0.2.35-v215`.
- Runtime identity moved to `react-v215-discovery-terminal-leaf-membership`.
- `workspace.materialRole` now exposes a Discovery material index that resolves loaded parent edges and distinguishes terminal display leaves from loaded parents.
- Discovery `Leaves only` uses terminal leaf membership.
- Display option counts now report terminal leaves.
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
