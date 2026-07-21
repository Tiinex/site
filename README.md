# Tiinex Site v173

v173 is a presentation-closure checkpoint for the React/Vite refactor. It keeps the v172 audit support-material truth and restores old-like presentation controls: Discovery mode is Feed/Tree, Lineage is an explicit mode, Audit is reachable as details from the visible trust signal, and assets are hidden from Feed/Tree by default through Display options.

## v173 batch

- Lineage is no longer presented as a tab beside Feed/Tree.
- Audit status is surfaced immediately as a compact Lineage trust strip with ok/mismatch/pending/open signals.
- Display options are workspace-owned presentation controls, not source truth controls.
- Assets are hidden by default in Feed/Tree and remain recoverable/auditable/exportable.
- Supporting Markdown and workspace candidates can be toggled without changing material truth.

## Validation

Run:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

Full public runtime validation additionally requires installed Vite/React dependencies:

```bash
npm install --no-audit --no-fund
npm run test
```

## Supported local start

Use the Vite runtime:

```bash
npm install --no-audit --no-fund
npm run dev
```

Opening source `index.html` directly as a file is not a supported runtime loop because the React entry uses JSX/Vite bundling.
