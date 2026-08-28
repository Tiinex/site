# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:48:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Measure the real carrier-size and manufacture/roundtrip effect of excluding legacy Site `.topics/development` material before any cleanup decision.

---

# Legacy Development Artifact Transport Impact

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this read-only cleanup-decision child.

## Objective

Compare the exact current Site workspace with a temporary copy that differs only by removing `.topics/development`, measuring source workset, emitted carrier size, no-roundtrip manufacture time, and default-roundtrip manufacture time without deleting current-tree material.

## Done Criteria

- Preserve exact file/byte delta for the excluded legacy directory.
- Manufacture both full and pruned temporary workspaces with the same Handoff, package parent, workspace target, and current Tooling runtime.
- Compare emitted carrier byte size and child-process timing with and without default roundtrip.
- Do not interpret transport-size reduction as a runtime speedup unless timing evidence supports it.
- Do not delete legacy material in this measurement task.

## Scope

- current Site workspace as read-only A/B source
- temporary copy excluding only `.topics/development`
- checkpointed manufacture with explicit diagnostic `30 s` timeout
- current-only task/preservation artifacts
- no current-tree cleanup

## Dependencies

- Site task `002 Site Grounding Workset Baseline` identified `.topics/development` as the largest legacy artifact family by volume.
- Site task `013 Restartable Checkpointed Command Runner` supplies durable process receipts for the A/B.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:1GU96WyK5UanA10w4xmtR4h7KPddAyrjEQtKFUPnhpc
