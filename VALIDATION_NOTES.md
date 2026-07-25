# Validation Notes v242

## Root cause / scope

v241 repaired the first lineage parent-recovery seam: exact file parents could be loaded through targeted source-boundary recovery, and browser testing showed Discovery/feed growing when those parents were recovered. Q's test also showed a remaining selective failure: some issue/comment-derived artifacts still ended in `target unavailable` even though their parent target was a GitHub issue or issue-comment publication item already represented in the loaded workspace.

The root cause was target identity, not lineage UI. The resolver indexed file paths and Source Path values, but it did not index GitHub publication-item provenance (`sourceTarget.inputTarget`, `recoveredFromUrl`, `snapshot.sourceUrl`, issue/comment canonical URLs). URL path canonicalization also loses hash identity, so issue comment references could collapse to the parent issue instead of resolving to the loaded comment artifact.

v242 repairs that seam while keeping discovery and traversal separate.

## Changes

- `src/lineage/lineage.resolve.js`
  - adds provenance-target indexing for loaded issue/comment artifacts;
  - indexes `sourceTarget.inputTarget`, `recoveredFromUrl`, `snapshot.sourceUrl`, `snapshot.target.canonicalUrl`, and related source URLs;
  - preserves GitHub `#issuecomment-*` identity during resolution;
  - resolves GitHub issue/comment URL parent targets against loaded provenance before file-path lookup.

- `src/app/lineageSourceRecovery.js`
  - refuses to convert GitHub issue/issue-comment URLs into repo file refs;
  - keeps targeted parent-file recovery for real raw/blob/file paths only.

- Tests updated:
  - `src/lineage/lineage.resolve.test.mjs` covers loaded GitHub issue and issue-comment provenance parent resolution;
  - `src/app/lineageSourceRecovery.test.mjs` covers that GitHub issue/comment URLs are not treated as fetchable repo files.

## Validation run here

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

All passed.

## Not verified here

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

This sandbox source tree does not include `node_modules/.bin/vite`, so public build/check still need Q's local Windows dev environment after `npm install`/`npm ci`.

## Known limits

- This checkpoint targets lineage target resolution, not final lineage scroll/visual polish.
- GitHub API 403/rate limits remain an expected anonymous-browser limitation, not automatically a regression.
- Recovery is exact source-boundary file recovery plus loaded provenance binding only; it must not global-search basename or broad-scan repositories.
- GitHub issue/comment URL parents resolve only when the corresponding issue/comment artifact is already loaded in workspace state.
- Mirror/proxy must not silently fall through to direct during explicit issue transport tests.
- Discussions remain deferred.

## Next batch

If browser testing confirms previously partial issue/comment lineage now binds to loaded publication parents, the next batch should move to lineage UX parity: viewport + buffer loading behavior, “Load full lineage” visibility, and leaf-filter correctness based on actual graph relations.
