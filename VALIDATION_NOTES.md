# Validation Notes v245

## v245 lineage traversal parent-first

Q's v244 browser pass showed clear progress but one remaining traversal bug: once a correct parent chain was loaded, the visual ancestor traversal could continue through an Origin/provenance hint and blend into another lineage. The fix is deliberately in traversal policy, not in parser or source recovery: Parent Trace is the authoritative ancestor edge; Origin is still retained for diagnostics/recovery but must not branch the visible ancestor chain when a parent edge exists.

Changed in v245:

- `src/lineage/lineage.traverse.js` now uses parent-first ancestor edge selection.
- `src/lineage/lineage.traverse.test.mjs` adds a guard proving that a node with both a resolved Parent Trace and a distinct Origin hint traverses to the parent only, not into the origin lineage.

Previously from v244:

Q's v243 browser pass split the oracle into three cases:

- `Awaiting response` was correct in the refactor and must keep resolving to the explicit Odysseus parent.
- `Feedback: The Stack Remembers continuation` recovered its immediate Evidence parent, but the next edge followed the wrong recovery context instead of the recovered file's own Continuity Context.
- `Brazil` should bind to the loaded `Welcome to the Next Dimension` issue root, but the refactor still reported `target unavailable`.

Root-cause hypothesis repaired in this checkpoint:

- issue/comment records can share one GitHub publication container path, so path equality alone can create false self-reference decisions;
- issue-root artifacts may need title-derived synthetic aliases when their material path is only the GitHub issue container;
- publication parent metadata must be preserved so targeted file recovery can use the explicit parent path instead of resolving relative to a synthetic issue path;
- labelled nested Origin values need parsing as values, not literal `relative:` strings.

Changed files:

- `src/adapters/github/github.issueEmbedded.js`
- `src/app/lineageSourceRecovery.js`
- `src/artifacts/artifact.parse.js`
- `src/lineage/lineage.githubIssueLocal.js`
- `src/lineage/lineage.resolve.js`
- targeted tests in parser, issue snapshot, source recovery, and lineage resolver suites.

Validated locally:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Not verified in this sandbox:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

Reason: local Vite binary/node_modules are not installed in this sandbox.

## Known limits

This is still not Milestone A closure. It is a lineage parent-semantics candidate intended to make Q's next browser pass decisive. No remote writes, global basename guessing, broad issue crawling, or creation/forms/transitions were added.

---

# Validation Notes v243

## v243 lineage issue-local target + view preservation

Q's v242 browser pass showed two remaining problems:

- successful parent recovery, such as The Stack Remembers, could push the UI back to Discovery/Feed because `addWorkspaceSourceRecords()` reset `workspaceVerse` while inserting recovered parent records;
- issue/comment-derived records such as Brazil and No next generation could still show `target unavailable` when their Parent Trace was an issue-local synthetic artifact filename rather than a repo file path or GitHub URL.

v243 repairs those seams without turning lineage traversal into discovery:

- `recoverMissingLineageParentsFromSource()` passes `preserveView: true` when inserting targeted parent-file recovery records;
- `addWorkspaceSourceRecords()` honors `preserveView` and does not reset the active verse/selection for source-recovery inserts;
- `resolveLineage()` now builds an issue-local path index scoped to GitHub repo + issue number and uses it only for simple/dot-relative parent references inside the same issue container;
- no global basename fallback is introduced.

Validated locally:

```bash
node src/lineage/lineage.resolve.test.mjs
node src/workspaces/workspace.lifecycle.test.mjs
node src/app/lineageSourceRecovery.test.mjs
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Not verified in this sandbox:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

Reason: local Vite binary/node_modules are not installed in this sandbox.

---

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
