# Tiinex Site v182

v182 is a focused Lineage closure checkpoint for the React/Vite refactor. It builds on v181 by moving the work from presentation polish to the lineage/source-material model: relative Parent Trace resolution is now contextual, selected Lineage is traversal-first, and source asset references are discovered as explicit unloaded/blocked material rather than silently disappearing.

## v182 batch

- Relative Parent Trace resolution is now context-aware:
  - filename-relative traces such as `001.trace.md` resolve against the declaring record directory;
  - `../parent.trace.md` resolves relative to the declaring record directory;
  - resolution is constrained by the declaring source identity and configured source root;
  - global basename fallback is not used.
- Ambiguity is safe:
  - same path in multiple unsourced/source-ambiguous records becomes ambiguous;
  - same path in multiple configured sources resolves only inside the declaring source;
  - out-of-root relative targets are boundary-blocked rather than guessed.
- Selected Lineage now uses the same resolved workspace graph and then traverses ancestors from the selected record. The selected traversal is presented first; workspace-wide Lineage remains secondary/collapsed.
- Same-session route/cache continuity has a 325-record guard: source-backed Markdown, selected record state and materialRole must survive hash restoration.
- Source-backed asset references are detected as a contract only. Markdown image/media references are classified as `loaded`, `referenced-unloaded`, `blocked`, or external/unloaded in diagnostics. v182 does not perform general binary asset fetching.
- Issue/discussion snapshots remain explicitly deferred in browser runtime unless fixture-backed. The UI may present the surface, but the adapter result must be honest about the deferred reader.

## Supported local start

Use `npm run dev` after installing dependencies. Opening source `index.html` directly from the filesystem is not a supported runtime because the React/Vite entry needs module bundling.

## Validation

This source zip is intended for source-clean replacement. The supported local loop remains:

```bash
npm install --no-audit --no-fund
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
```

`npm run test` additionally runs Vite build/runtime checks and therefore requires installed React/Vite dependencies.
