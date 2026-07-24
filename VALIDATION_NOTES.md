# Validation Notes v233

## Root cause hypothesis

Browser feedback on v232 showed a remaining issue-discovery closure risk: the user could reopen the GitHub source dialog after refresh and see issue discovery unchecked, then an issue-list request could succeed while the UI reported fatal materialization failure.

The likely root causes were:

1. `workspace.persistence.js` hydrated route state from the same-session cache by taking cached `sources` wholesale when they existed. That allowed a stale cached source to override the newer route shell that carried `issueDiscovery` and `requestedSurfaces.issueSnapshots.requested`.
2. The issue-surface reader was still allowed to throw through `materializeGithubSource`. A single issue-surface exception should degrade the `issueSnapshots` surface, not invalidate the registered source boundary or report the whole source as fatal.

## Fix

- `mergeWorkspaceRouteShell()` now merges sources by id, starting with cached source material and overlaying route source shells. Route-selected source surfaces win over stale cache values while cached material still hydrates records/assets.
- `materializeGithubSource()` now contains issue-surface exceptions as a non-fatal `github.issue.surface.exception` warning owned by the `issueSnapshots` surface.
- The source plan and surface diagnostics remain requested/attempted/unavailable instead of throwing away the source operation.
- v232's progress throttling, issue-yielding, bounded defaults, and cumulative source counts remain intact.

## Validation run in sandbox

Confirmed green before packaging:

```bash
npm run validate
```

Additional validation still expected locally by Q because the sandbox lacks a reliable local Vite runtime:

```bash
npm run build:public
npm run public:check
```

## Manual browser checks

1. Open an existing source, select issue discovery, refresh with F5, and confirm Issue snapshot discovery stays selected.
2. Load GitHub repo files + issue snapshots and confirm the Add dialog closes promptly and progress appears instead of freezing in-dialog.
3. If issue snapshot loading degrades, confirm the source boundary remains registered and the receipt/warning is issue-surface scoped rather than fatal.
4. Confirm issue-backed embedded Tiinex artifacts still recover lineage when available.
5. Confirm plain GitHub issues remain read-only Evidence snapshots.
6. Regression-check Discovery, Tree, Lineage, Audit, Display options, Export ZIP, and header.
