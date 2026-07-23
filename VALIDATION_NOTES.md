# Validation Notes v217

v217 is a focused Discovery read-model debt cleanup.

## Changes

- Checkpoint/version moved from `0.2.36-v216` to `0.2.37-v217`.
- Runtime identity moved to `react-v217-trace-discovery-read-model`.
- Parser contract changed for Parent `Trace`: Markdown link `href` is the resolution target; label is preserved separately as `traceLabel`.
- Lineage resolver now rejects self-parent edges.
- Source-backed metadata-only support records keep supporting/schema-definition material roles.
- Discovery membership is centralized in `src/workspaces/workspace.discoveryView.js`.

## Validation run

Run from source-clean zip:

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

## Manual browser status

Manual browser validation remains deferred to the end of the Root milestone unless Q asks for a targeted check. The main targeted scenario for this checkpoint is:

- Discovery mode + Leaves only on.
- `Educational Root` and branch parents are hidden when they have loaded children.
- Terminal work children remain visible.
- Metadata-only adapter/interface/tool support records are hidden.
- Tree and Feed use the same membership decision.
- Lineage still shows the full parent/root chain.
