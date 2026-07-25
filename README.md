# Tiinex Site v245

Checkpoint: `v245`
Version: `0.2.65-v245`
Runtime: `react-v245-lineage-traversal-parent-first`

## v245 focus

Milestone A candidate focused on parent-first lineage traversal after Q's v244 browser pass. The goal is not UI polish; it is to prevent Origin/provenance hint edges from mixing separate lineages when a resolved Parent Trace exists.

## What changed

- Ancestor traversal now treats resolved Parent Trace edges as authoritative. Origin edges remain in the resolved lineage model as diagnostics/recovery hints, but they are not traversed as ancestors when a parent edge is already present for the same node.
- This protects oracle cases where the refactor had a correct explicit parent chain but then visually blended into another lineage through an Origin hint.

- Embedded GitHub issue/comment artifacts preserve publication parent metadata (`Tiinex Parent Artifact Path`, raw URL, and source URL) as recovery metadata.
- Targeted parent-file recovery may use that explicit publication parent path when the record itself has only a synthetic issue path.
- Simple synthetic issue-local parents such as `issue-root-recovered-*.trace.md` stay issue-local aliases and are not treated as repo-root files.
- Issue-local aliasing now supports loaded issue-root records whose visible/material path is only the GitHub issue container path.
- Lineage self-reference detection now trusts differing stable record ids before falling back to path equality, so multiple issue/comment records sharing one publication container do not collapse into false self-references.
- Labelled nested Parent Origin entries such as `relative: 001.trace.md` parse as the value path, not as a literal `relative:` target.

## Oracle cases from browser feedback

- `Awaiting response` must continue to resolve through its explicit Odysseus parent path.
- `Feedback: The Stack Remembers continuation` should recover `Evidence: The Stack Remembers`, then let the recovered file's own Continuity Context continue toward the Magic/Memes lineage instead of inheriting the issue recovery context.
- `Brazil` should bind to the already-loaded `Welcome to the Next Dimension` issue-root artifact and reach root, rather than staying at `target unavailable`.

## Known limits

- Browser parity still needs Q validation against PoC for Brazil / The Stack Remembers / Awaiting response.
- Public build/check is not verified in this sandbox because Vite/node_modules are not installed here.

## Supported local start

```bash
npm install
npm run dev
```

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
4. Load source and confirm the v243 record count/regressions did not worsen.
5. Open Awaiting response in Lineage: it should still go through Odysseus.
6. Open Feedback: The Stack Remembers continuation in Lineage: it should not jump from Evidence to Odysseus if the recovered Evidence file declares Magic as parent.
7. Open Brazil in Lineage: it should bind to Welcome to the Next Dimension if that issue-root record is loaded.
8. Confirm parent recovery does not push you back to Discovery/Feed.
9. Confirm lineage traversal does not trigger broad issue discovery/proxy crawling.
```

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
