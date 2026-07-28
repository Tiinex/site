# Tiinex Site v287

Checkpoint: `v287`
Version: `0.2.107-v287`
Runtime: `react-v287-render-index-memoization`

## v287 focus

Mobile interaction latency follow-up after v286 + RC12. The remaining lag looks like whole-workspace render work after Tiinex/docs is loaded, not transport, route persistence, or return-settle CSS. This checkpoint keeps the v286 return-settle fix and adds render-index memoization around large workspace views.

## Changed in v287

- Discovery material indexes are reusable across query/filter passes instead of rebuilding lineage/path membership every time.
- `WorkspaceColumnSurface` is memoized so dialog-only state changes do not rerender the full workspace surface.
- Tree path-model building is memoized for stable record/query inputs.
- Discovery cards, asset cards, and workspace candidate cards skip rerendering when their material props are unchanged.
- Progressive render/search/filter truth from v281-v283 is preserved: filtering still runs over the full dataset; only mounted card DOM is bounded.

## Validation

See `VALIDATION_NOTES.md`.

## Supported local start

```bash
npm install
npm run dev
```

Common validation commands:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```
