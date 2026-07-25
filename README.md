# Tiinex Site v240

Checkpoint: `v240`
Version: `0.2.60-v240`
Runtime: `react-v240-issue-comment-record-identity-parity`

## v240 focus

Milestone A issue/comment record identity parity candidate.

Browser testing of v239 showed a misleading split:

```txt
Issue snapshots: 13 loaded
Workspace/feed: 3 source-backed records
```

The PoC kept issue containers, comment containers, and recovered Tiinex artifacts as distinct material paths. The refactor was creating distinct records in the issue materializer, but workspace source canonicalization collapsed issue/comment-derived records back to the issue URL, so later records overwrote earlier ones.

This checkpoint keeps the refactor architecture intact and focuses on the issue snapshot → workspace record seam:

- embedded issue/comment artifacts now use their artifact material path for lifecycle identity;
- plain issue snapshots still use the canonical issue URL;
- comment URL anchors are preserved when the material is comment-scoped;
- `sourceTarget.sourceArtifactPath` is exposed for recovered embedded artifacts;
- duplicate Source Markdown wrapper imports are suppressed without broadening generic `<details>` parsing;
- regression coverage proves multiple comment-embedded artifacts from one issue survive `addWorkspaceSourceRecords` as distinct workspace records.

## What this does not claim

This is not Milestone A closure. It is a record-identity parity candidate intended to make the next browser test decisive.

Still not claimed:

- full lineage traversal parity;
- full discussion support;
- remote writes;
- artifact creation/forms/transitions;
- broad recursive clone or global parent guessing.

Lineage traversal remains the next product-facing parity target after issue/comment material count is browser-verified.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

Run locally after unpacking:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Public build still needs an environment with local Vite installed:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

## Manual browser test focus

```txt
1. Create a clean workspace.
2. Add GitHub source Tiinex/docs.
3. Disable repo files; keep issue snapshots enabled.
4. Load source.
5. Check whether Issue snapshots loaded count and visible/source record count are no longer collapsed to one record per issue.
6. Look for recovered comment artifacts such as Silicon Valley / The American Experiment-like entries.
7. Cycle cache → mirror → proxy only after baseline issue material count is visible.
8. Open Awaiting response lineage only after issue materialization is correct; lineage parity is the next batch.
```
