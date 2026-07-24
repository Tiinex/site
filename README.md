# Tiinex Site v232

Checkpoint: `v232`
Version: `0.2.52-v232`
Runtime: `react-v232-issue-discovery-stability`

## Focus

Milestone A issue-discovery stability after v231 browser feedback. v231 recovered embedded Tiinex artifacts from GitHub issues/comments, but browser testing showed two closure blockers: continuation discovery surfaces could be unchecked after F5/hash restore, and issue materialization could freeze-lag while progress/URL state was written too often during large source operations.

## Changes

- Preserved selected GitHub discovery surfaces through route/hash state and continuation defaults.
- Added a small app-level GitHub progress throttle helper so source materialization does not write hash/localStorage for every progress tick.
- Yielded after closing the Add dialog and before/inside issue snapshot processing so progress can become visible before bounded issue work continues.
- Reduced default issue snapshot breadth for browser UX: bounded issue discovery defaults to 12 issues and 6 comments per issue unless explicitly overridden.
- Kept source counts cumulative when a later issue pass adds records to an already-loaded source.
- Added guards/tests for route-preserved requested surfaces, continuation issue defaults, progress throttling ownership, and browser-yielding issue materialization.

## Milestone A non-goals

- Artifact creation, transitions, forms, schema-builder UI, remote writes, and full discussion-reader parity remain outside this checkpoint.
- Discussion URLs still degrade honestly rather than pretending to load.
- Full PoC issue/comment recovery remains broader than this stabilization slice.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

Use the standard source validation chain plus local public build checks:

```bash
npm run validate
npm run ui:shape
npm run architecture:shape
npm run typecheck
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run build:public
npm run public:check
```
