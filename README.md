# Tiinex Site v180

v180 is a card/source/material-role parity repair checkpoint for the React/Vite refactor. It keeps v176-v178 presentation corrections while making GitHub source work harder to confuse with either idle registration or active materialization.

## v180 batch

- Display options now separates ordering, membership, and semantic filters:
  - `Leaves only`
  - `Mismatches only`
  - schema filter
  - artifact/source class filter
  - supporting docs, workspace candidates, and assets.
- Supporting-doc counts are category-specific instead of showing the workspace total.
- GitHub Add now separates source boundary, discovery surfaces, explicit paths, and issue targets:
  - repo files discovery is a visible checkbox surface, checked by default for the primary load action;
  - issue snapshot discovery is a separate checkbox surface;
  - explicit Markdown paths/URLs can be added without changing modes;
  - `Register only` is a separate no-loading action.
- Materialization progress now reports concrete phases such as resolving the ref, finding Markdown refs, loading `N/M` files, and promoting records.
- A deferred source remains a source control point: `Discover` opens the GitHub form prefilled with that source context.
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
