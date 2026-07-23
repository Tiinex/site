# Tiinex Site v217

v217 is a Discovery debt-cleanup checkpoint on top of v216. It fixes Parent Trace target truth, guards self-parent edges, stabilizes metadata-only support/source-shell roles, and introduces a single Discovery read-model owner for Feed/Tree membership.

## v217 batch

- Parent `Trace` Markdown links now use the link `href` as the resolution target while preserving the label separately for presentation.
- Self-parent resolution is rejected as a lineage finding and is not used to build terminal Discovery membership.
- Metadata-only source-backed support material such as adapters/interfaces/tools/origins stays supporting instead of becoming leaves during session/cache restore.
- `src/workspaces/workspace.discoveryView.js` owns Discovery membership, hidden reasons, Feed records, Display counts, and the record set given to Tree.
- The integration fixture covers `Educational Root` → branch → terminal child, metadata-only adapter support, Feed/Tree parity, and Lineage independence.

## Out of scope

- No transition/artifact creation work.
- No recursive adapter traversal.
- No issue discovery.
- No source transport behavior changes.
- No new schema-specific companions.


## Supported local start

Use the Vite development server:

```bash
npm install
npm run dev
```

Direct `file://` startup from source `index.html` is not supported by the React/Vite runtime.
