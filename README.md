# Tiinex Site v218

Checkpoint: `v218`
Version: `0.2.38-v218`
Runtime: `react-v218-discovery-path-parent-read-model`

## Scope

Discovery read-model debt cleanup after the v216/v217 Leaves only regressions.

The main change is that Discovery terminal membership is no longer based only on resolved Parent Trace edges. It also recognizes branch-root/path-parent records:

- `001.trace.md` records with work children in the same folder are parents.
- work records with descendants under their folder are parents.
- Feed and Tree both receive the same filtered Discovery read-model.
- Lineage remains independent and still shows parent/root chains.

## Non-goals

- No transition/artifact-creation behavior changed.
- No recursive adapter traversal added.
- No issue discovery/source transport change.
- No new schema companions added.


## Supported local start

```bash
npm install
npm run dev
```

The supported local loop is Vite via `npm run dev`; source `index.html` is not a standalone file:// runtime.

## Validation

See `VALIDATION_NOTES.md`.
