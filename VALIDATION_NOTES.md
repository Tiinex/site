# Validation Notes v272

## v272 governance badge visibility

Browser evidence from the v271 test video showed the main transport behavior working:

- mirror loaded `333` source-backed records for `Tiinex/docs`
- issue snapshot mirror paths returned `200 OK`
- explicit proxy no longer defaulted during initial mirror load
- explicit proxy could load issue snapshots while the repo-file git proxy run was cancelled/aborted

Remaining visible gap:

- the source rail did not show any governance badge, even though v271 introduced governance-boundary metadata.

Changed in v272:

- `SourceGovernanceBadge` now renders `policy ?` for GitHub sources when no boundary object has been persisted yet.
- This makes unchecked governance visible instead of silently absent.
- It does not add network requests, root probes, or policy/license claims.

Validated locally in the sandbox:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Follow-up validation still needed outside the sandbox:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```
