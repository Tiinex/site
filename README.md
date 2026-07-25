# Tiinex Site v242

Checkpoint: `v242`
Version: `0.2.62-v242`
Runtime: `react-v242-lineage-target-resolution-parity`

## v242 focus

Milestone A lineage target-resolution parity candidate.

Browser testing of v241 showed real progress: targeted parent recovery can load declared parent artifacts, Lineage can expand beyond one node for some paths, and Discovery/feed grows when recovered parents enter workspace state. The remaining mismatch was selective: some issue/comment-derived artifacts still ended in `target unavailable` even when their parent was a GitHub issue/comment publication item that was already loaded in the workspace.

This checkpoint repairs that seam without turning Lineage into discovery:

- lineage resolution now indexes source/provenance targets such as `sourceTarget.inputTarget`, `recoveredFromUrl`, `snapshot.sourceUrl`, and GitHub issue/comment canonical URLs;
- GitHub issue comment URL hashes are preserved as identity, so `#issuecomment-*` targets can resolve to loaded comment artifacts instead of collapsing to the issue URL;
- GitHub issue or issue-comment URLs are not treated as repo file refs by targeted parent-file recovery;
- relative file parents still use exact source-boundary file recovery, while social publication-item parents resolve only if the corresponding issue/comment artifact is already loaded.

## What this does not claim

This is not Milestone A closure. It is a targeted lineage target-resolution candidate intended to make the next browser test decisive.

Still not claimed:

- final lineage infinite-scroll/viewport polish;
- broad issue/discussion crawling during lineage traversal;
- remote writes;
- artifact creation/forms/transitions;
- global basename guessing.

Lineage recovery remains targeted: loaded provenance can bind loaded issue/comment artifacts, and exact file Parent Trace can be fetched from the source boundary. It must not become issue discovery, proxy crawling, broad repo scan, or guessed basename recovery.

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
4. Load source and confirm the v240/v241 recovered records are still present.
5. Open a record that worked in v241, e.g. Evidence: The Stack Remembers, and confirm it still expands.
6. Open previously partial records such as No next generation / Brazil / Awaiting response.
7. Switch to Lineage mode.
8. Confirm loaded issue/comment publication parents resolve when they are already in workspace state.
9. Confirm exact file parents still recover and Discovery/feed grows when recovered parents are loaded.
10. Confirm lineage traversal does not trigger broad issue discovery/proxy crawling.
```
