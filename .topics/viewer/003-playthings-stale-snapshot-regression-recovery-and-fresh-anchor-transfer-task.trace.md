# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 16:41:00
  - Trace: [001-17-1-1-anchor-to-anchor-playthings-root-gate-schema-causality-road-grades-and-responsive-entry-handoff.trace.md](../.topics/viewer/001-17-1-1-anchor-to-anchor-playthings-root-gate-schema-causality-road-grades-and-responsive-entry-handoff.trace.md)
  - Origin:
    - [relative](../.topics/viewer/001-17-1-1-anchor-to-anchor-playthings-root-gate-schema-causality-road-grades-and-responsive-entry-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-05 11:20:00
  - Authors: Anchor; Sigma
  - Summary: Playthings stale-snapshot regression recovery and fresh-Anchor transfer
  - Status: draft/local

---

# Playthings stale-snapshot regression recovery and fresh-Anchor transfer

## Objective

Re-anchor Playthings from the post-revert Site workspace that Sigma preserved after the previous tiles Handoff loaded a stale Site snapshot and regressed the end-user Playthings experience. Preserve the rejected 002 lineage as historical context, keep the reverted current source as runtime truth, and prepare a clean transfer to a fresh Anchor without silently reapplying rejected source bytes.

## Done Criteria

- Sigma end-user acceptance for the prior tiles/runtime carrier is recorded as NOT PASS because loading that carrier regressed Playthings to an older Site/source state.
- The exact 10m10s Sigma recording is preserved under `reference/playthings/acceptance/2026-09-05/` with SHA-256 `71c534481f98005dc643d9b03980576a8ecbb436d95719ed38b4628f22d0b5cc`.
- The current post-revert Site workspace supplied by Sigma is the source/runtime baseline for continuation.
- Exact recent `002` lineage artifacts from the rejected tiles carrier are restored as historical lineage only; their old runtime/source files are not restored.
- The recovered regression branch remains visibly distinct from the current good 001-17 Playthings line; rejection does not erase history and does not promote stale source back into runtime truth.
- A durable rejection/revert Evidence and Decision explain the transport-level regression and the recovery boundary.
- A new Anchor-to-Anchor Handoff tells the fresh Anchor to continue from the reverted source, selectively reimplement useful companion/tiles concepts against that source, and require browser acceptance before any later package is treated as accepted.
- The resulting Handoff package is manufactured through Tiinex Tooling and cold-start qualifies with the exact route.

## Scope

Recovery, lineage repair, acceptance-boundary clarification, and fresh Anchor transfer. Do not attempt to make the rejected tiles implementation PASS in this slice. Do not merge source/runtime files from the rejected tiles carrier into the reverted Site workspace. Do not infer that the tiles companion concept itself is permanently rejected; the observed blocker is the stale-workspace transport/regression boundary. The current post-revert Site source remains authoritative for implementation continuation.

## Dependencies

- Current post-revert Site workspace from Sigma's hand-crafted recovery carrier `tiinex-site-playthings-002-anchor-to-anchor.handoff-package.zip` (SHA-256 `b2e7d4aeecd02e9cd16686728174b36f810dde8f627c6291b32d4c787a771e76`).
- Prior rejected tiles review carrier `tiinex-site-001-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma.handoff-package.zip` (SHA-256 `063b054e3da6879ad575d9de598f52a58c9374de8f324551c1309ae5a2c34d55`).
- Current good Playthings lineage through `001-17-1-1-anchor-to-anchor-playthings-root-gate-schema-causality-road-grades-and-responsive-entry-handoff.trace.md`.
- Recovered historical 002 lineage ending at `002-3-1-1-anchor-to-sigma-playthings-tiles-runtime-review-handoff.trace.md`.
- Sigma acceptance recording `reference/playthings/acceptance/2026-09-05/sigma-playthings-stale-snapshot-regression-and-revert.mp4`.
- Canonical Anchor role in Business and Tiinex portable Tooling for exact validation/package manufacture.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-17-1-1-anchor-to-anchor-playthings-root-gate-schema-causality-road-grades-and-responsive-entry-handoff.trace.md](../.topics/viewer/001-17-1-1-anchor-to-anchor-playthings-root-gate-schema-causality-road-grades-and-responsive-entry-handoff.trace.md)
  - Value: EgTkZemUurODnOXaoP9M6Xk0UJmsDApHGe6rst7FfMU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: vz-8T5SCJvdSibubsUTGWksVXOZlk0vfX6KK92NIlS8
