# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-05 11:20:00
  - Trace: [003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md](003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md)
  - Origin:
    - [relative](003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-05 11:22:00
  - Authors: Anchor; Sigma
  - Why: Preserve the exact regression/revert evidence and lineage-loss boundary before handing Playthings to a fresh Anchor.
  - Summary: Sigma end-user acceptance rejects the previous tiles/runtime carrier because it transported a stale/divergent Site snapshot; the post-revert Site workspace is the continuation baseline.
  - Status: ready/local

---

# Sigma Playthings End-User Regression Rejection And Revert Evidence

## Supported Claim Or Question

- Supported Claim Or Question: Whether the previous Playthings tiles/runtime Handoff can receive Sigma end-user acceptance and what source baseline a fresh Anchor must use after Sigma reverted the resulting regression.
- Evidence Role: Challenges acceptance of the prior tiles/runtime carrier and preserves the exact post-revert recovery boundary. It supports the conclusion that the failure was transport/source regression, not merely a cosmetic disagreement with one tile image.

## Provenance

- Known Source: Sigma's 2026-09-05 local browser/Viewer recording, the Sigma-supplied post-revert Site recovery carrier, the prior Anchor-to-Sigma tiles carrier, and byte-level comparison of their carried Playthings source trees.
- Preservation Basis: The exact MP4 is copied into the current Site workspace under `reference/playthings/acceptance/2026-09-05/`; the current post-revert workspace is preserved as the Site snapshot; the rejected 002 Tiinex lineage artifacts are copied byte-for-byte from the rejected carrier into `.topics/viewer/` without copying its rejected runtime/source files.
- Provenance Limits: The recording is a screen capture rather than a browser performance trace and does not identify every individual source commit. The Sigma-supplied recovery carrier was hand-crafted and did not itself expose a qualified Handoff route; it is used here as exact workspace-byte input, not as proof of its own route topology. Recent 002 lineage had been removed by revert and is therefore recovered from the prior rejected carrier rather than from the post-revert workspace.

## Evidence Material

- Material: The preserved MP4 is `reference/playthings/acceptance/2026-09-05/sigma-playthings-stale-snapshot-regression-and-revert.mp4`, 610.24 seconds at 1918×1198 H.264/AAC, SHA-256 `71c534481f98005dc643d9b03980576a8ecbb436d95719ed38b4628f22d0b5cc`. It shows package/Viewer inspection, the Playthings world after loading the previous carrier, then Sigma closing/resetting the workspace and reverting the local Site state. The post-revert recovery carrier SHA-256 is `b2e7d4aeecd02e9cd16686728174b36f810dde8f627c6291b32d4c787a771e76`; its Site snapshot is the current source baseline. The rejected tiles carrier SHA-256 is `063b054e3da6879ad575d9de598f52a58c9374de8f324551c1309ae5a2c34d55`. Comparing only `src/experiments/playthings` shows the current post-revert baseline has 68 files while the rejected carrier has 69; 19 files exist only in the current baseline, 20 only in the rejected carrier, 18 common files differ, and only 31 common files are byte-identical. Current-only files include `PlaythingsArtifactFinder.jsx`, `PlaythingsLineageDialog.jsx`, `PlaythingsLocationDialog.jsx`, `PlaythingsVerseLoader.jsx`, `playthings.artifactKind.js`, `playthings.find.js`, `playthings.lineage.js`, `playthings.living.js`, `playthings.navigation.js`, `playthings.placement.js`, `playthings.prepare.js`, `playthings.role.js`, `playthings.worker.js`, and `playthings.worldOccupancy.js`. The rejected carrier uniquely contains the new tiles code/assets (`playthings.tiles.js`, `playthings.tiles.case.mjs`, `root.playthings.tiles.png`, `plaything_tiles_v1.py`) but is simultaneously missing many later Playthings runtime capabilities present in the post-revert baseline. Exact recovered historical lineage ending at `.topics/viewer/002-3-1-1-anchor-to-sigma-playthings-tiles-runtime-review-handoff.trace.md` is preserved so the rejected work remains inspectable rather than erased.
- Material Kind: screen recording, exact workspace snapshots, SHA-256 receipts, source-tree comparison, and recovered Tiinex lineage artifacts

## Preservation And Fidelity

- Preservation State: The recording and recovered lineage are embedded in the final Site workspace carried to the next Anchor. The post-revert Site, Business, and Docs workspaces are carried as complete workspace snapshots in the new Handoff package.
- Fidelity Notes: The MP4 bytes are unchanged from Sigma's upload. Recovered 002 lineage files are byte-for-byte copies from the prior rejected carrier. The source comparison is computed from exact carried workspace bytes and intentionally excludes repository history that is not present in the ZIP snapshots.
- Known Losses: The revert removed the rejected branch's runtime/source changes from the current Site baseline. Those source bytes remain available only in the older rejected carrier and are deliberately not reintroduced. Some chat-only reasoning and any untransported intermediate lineage may be absent. The recording does not capture all internal browser state or exact timing of every visual transition.

## Interpretation Limits

- Does Not Prove: This evidence does not prove that the `.playthings.tiles.png` companion concept is wrong, that every line of the rejected tiles implementation is unusable, or that the current post-revert Playthings state is final/production-approved. It proves the prior acceptance candidate cannot PASS because its carrier regressed the current application baseline.
- Must Not Be Treated As: permission to restore the rejected Site snapshot wholesale, acceptance of the prior tiles/runtime Handoff, semantic authority derived from graphics, or proof that missing post-revert lineage never existed.
- Not Yet Used As: production acceptance, release qualification, final art-direction approval, or authority to delete the rejected lineage.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md](003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md)
  - Value: vz-8T5SCJvdSibubsUTGWksVXOZlk0vfX6KK92NIlS8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: yaGXFqfBoIJtTJOsIpWwt-Z1c3zQz-b6BkoU0qLv6DY