# Tiinex Site v215

v215 is a Root-milestone Discovery terminal-leaf membership repair on top of v214. It preserves the v214 source-backed metadata cache restore, but fixes the next drift: `Leaves only` now hides loaded lineage parents in Discovery instead of treating every work/schema artifact as a visible terminal leaf.

## v215 batch

- Discovery `Leaves only` now means terminal loaded lineage leaves: material-role leaf records that are not loaded parents of another record.
- Source-backed metadata-only cache records may still be visible leaves when terminal, so refresh/session restore does not empty Discovery.
- Loaded parents are hidden by `Leaves only`, including source-backed metadata-only parents and canonical schema parent nodes.
- Route-only material-unavailable shells remain hidden.
- Lineage display scope remains unchanged: Leaves-only and Discovery-only membership controls do not affect Lineage.
- No transition/artifact creation, source transport, issue discovery, recursive adapter traversal, or new schema-specific companion work is included.

## Supported local start

```bash
npm install
npm run dev
```

The supported local loop is Vite via `npm run dev`; source `index.html` is not a standalone file:// runtime.

## Validation

Use the normal checkpoint gate:

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
```

For Windows lock portability smoke:

```bash
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
```
