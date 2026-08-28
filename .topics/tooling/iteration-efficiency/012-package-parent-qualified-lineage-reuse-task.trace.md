# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:39:43
  - Authors: Loom
  - Status: completed/local
  - Summary: Reuse already-qualified package-parent lineage within one CLI manufacture operation to remove one redundant parent-carrier inspection while retaining an exact digest of the outer parent ZIP.

---

# Package Parent Qualified Lineage Reuse

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded package-parent orchestration optimization child.

## Objective

Avoid reopening and reinspecting package-parent carrier internals after the CLI has already produced a qualified parent lineage in the same synchronous manufacture operation, while still binding the exact outer parent ZIP bytes independently.

## Done Criteria

- `carrierLineageFromCliParent()` may accept an already-qualified parent lineage and uses it only when its dimension is valid.
- Exact outer parent ZIP SHA-256 and filename binding remain independently computed from the supplied parent bytes.
- Existing fallback behavior remains available when no qualified lineage is supplied.
- Focused lineage and CLI tests remain green and one real parented manufacture remains `ready`.
- Exact hash-multiplicity evidence shows one redundant parent-inspection pass removed; wall-clock is reported conservatively if host variance prevents a stable timing claim.

## Scope

- `src/tooling/portable/handoff/carrierLineage.js`
- `src/tooling/portable/adapters/cli/cli.handoff-manufacture.js`
- `src/tooling/portable/handoff/carrierLineage.test.mjs`
- current-only task/preservation artifacts
- no global cache and no reuse across independent CLI operations

## Dependencies

- Site task `010 Recipient Hash Multiplicity Profile` identifies package-parent reinspection as a repeated call path.
- Site task `011 Recipient Inspection Digest Witness Reuse` establishes the same-operation exact-witness principle.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:Wdsp4o4lbt5TKt263po3TrHxFhb_Kx0uheAEEELDeTE
