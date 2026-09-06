# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-05 11:20:00
  - Trace: [003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md](003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md)
  - Origin:
    - [relative](003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-05 11:24:00
  - Authors: Anchor; Sigma
  - Why: Land Sigma acceptance outcome and prevent the next Anchor from reapplying the rejected Site snapshot while preserving the rejected lineage for selective recovery.
  - Summary: Reject the prior tiles/runtime acceptance carrier because it regressed Playthings through a stale/divergent Site snapshot; preserve the post-revert Site workspace as the continuation baseline.
  - Status: ready/local

---

# Reject Stale-Snapshot Playthings Acceptance And Preserve Reverted Source

The previous tiles/runtime acceptance candidate is rejected as a transport-regression checkpoint; the post-revert Site workspace becomes the only implementation baseline for continuation.

## Decision

- State: accepted
- Subject: Playthings acceptance and continuation baseline after the 2026-09-05 stale-snapshot regression
- Decision: Sigma does not accept the prior Anchor-to-Sigma tiles/runtime carrier. The carrier loaded a materially older/divergent Site workspace and regressed the current Playthings experience, so the end-user checkpoint is NOT PASS. The post-revert Site workspace supplied by Sigma is the source/runtime baseline. Recovered 002 lineage remains historical evidence only. Useful `.playthings.tiles.png` ideas may be reimplemented selectively against the reverted baseline, but rejected source/runtime bytes must not be restored wholesale.

## Basis

- Sigma's attached browser recording shows the acceptance attempt followed by workspace reset/revert rather than a PASS.
- Exact source-tree comparison shows the rejected carrier was not a narrow tiles delta: within `src/experiments/playthings`, 19 files exist only in the current post-revert baseline, 20 only in the rejected carrier, and 18 common files differ.
- The current baseline contains later Playthings capabilities absent from the rejected carrier, including artifact finding, in-world lineage/location dialogs, asynchronous Verse loading/worker preparation, living/schema classification, navigation/placement, role handling, and world occupancy.
- The rejected carrier uniquely contains the tiles resolver/runtime assets, which means those changes were layered onto a stale/divergent Site baseline rather than onto the current application.
- Rejection of the carrier does not erase the work. The 002 Tiinex artifacts are retained so a fresh Anchor can inspect the approach without confusing it with current source truth.

## Consequences

- New Playthings work starts from the post-revert Site workspace and its current 001-17 runtime/source behavior.
- The prior `002-3-1-1-anchor-to-sigma-playthings-tiles-runtime-review-handoff.trace.md` is superseded as an acceptance candidate and must not be used to restore its Site workspace wholesale.
- A fresh Anchor may salvage concepts, tests, metadata contracts, or small deltas from the rejected 002 branch only after diffing them against current source and preserving current behavior.
- Any future tiles/companion integration must pass browser end-user acceptance on the current baseline before Sigma acceptance is claimed.
- Missing lineage caused by the revert must be treated as known recovery loss, not as evidence that the missing work never occurred.
- The current hand-crafted Sigma recovery carrier is treated as a byte source for the reverted workspaces, not as a qualified route; the next carrier must be remanufactured and cold-start qualified through Tiinex Tooling.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md](003-playthings-stale-snapshot-regression-recovery-and-fresh-anchor-transfer-task.trace.md)
  - Value: vz-8T5SCJvdSibubsUTGWksVXOZlk0vfX6KK92NIlS8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: VODGgIN-Qe6A--WlT9lfszbbpq4VIKTfhFqV739m6vs