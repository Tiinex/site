# Tiinex Site v178

v178 is a source/display parity repair checkpoint for the React/Vite refactor. It keeps v176/v177 semantic corrections while making Display options and GitHub source operations closer to the observed PoC mental model.

## v178 batch

- Display options now separates ordering, membership, and semantic filters:
  - `Leaves only`
  - `Mismatches only`
  - schema filter
  - artifact/source class filter
  - supporting docs, workspace candidates, and assets.
- Supporting-doc counts are category-specific instead of showing the workspace total.
- GitHub Add now presents explicit operation choices instead of explanatory cards:
  - register boundary only
  - explicit files
  - repo files discovery
  - issue snapshots.
- The submit button and receipt text now describe the selected operation, so “registered but not loading” is not confused with “loading now”.
- A deferred source remains a source control point: `Continue` opens the GitHub form prefilled with that source context.
- Source pills expose transport mode and idle/loading state without claiming mirror/proxy behavior that is not active.
- Dialog layout avoids horizontal clipping/scroll at split-screen desktop widths.

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
