# Validation Notes v218

## Root-cause hypothesis

v217 moved Discovery membership into a read-model and fixed Parent Trace href parsing, but terminal membership still only considered resolved lineage edges. Real Tiinex/docs branch roots can also be parents by path convention, especially folder `001.trace.md` roots and records with descendants under their directory.

That allowed visible parent records in Discovery Leaves only when edge resolution was missing, stale, or represented only by path structure.

## Changes

- Moved Discovery graph membership out of `workspace.materialRole.js` into `workspace.discoveryView.js` so material classification no longer imports lineage resolution.
- Added path-parent membership to the Discovery material index.
- Added same-folder `001.trace.md` branch-root detection for sibling work records.
- Preserved the v217 Trace target truth and self-parent protections.
- Removed stale/dead Discovery option helper logic from `workspace.views.jsx`.
- Added integration coverage for path-only branch roots, same-folder branch roots, terminal work leaves, metadata-only support records, route shells, Feed/Tree membership parity, and Lineage independence.

## Commands run

```sh
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
```

## Manual status

No manual browser-runtime validation was run in this environment. The intended manual check is Discovery + Leaves only on the same source/session restore flow that previously showed Educational/Socials/Memes parents.
