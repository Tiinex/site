# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:52:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Profile every command in the current 245-step validation chain in bounded ranges to establish real full-suite timing and identify outliers.

---

# Full Validation Chain Timing Profile

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only this bounded validation-profiling child.

## Objective

Profile each exact command from the current `validate` script independently in bounded numeric ranges, continuing across failures for timing only, so full-suite wall-clock and true slow-command outliers are known before any orchestration or test optimization.

## Done Criteria

- A read-only profiler executes bounded ranges from the exact current validation script and records per-command elapsed/exit status.
- A focused injected-executor test proves range selection and continue-across-failure behavior.
- All 245 current validation commands are profiled exactly once across bounded batches.
- Aggregate total, percentiles, group totals, slowest commands, and failure steps are preserved.
- Profiling is explicitly non-authoritative for correctness; failures remain failures and existing `validate` semantics are unchanged.

## Scope

- `tools/profile-validation-chain.mjs`
- `tools/profile-validation-chain.test.mjs`
- current-only artifacts under `.topics/tooling/iteration-efficiency/`
- read-only execution of the exact current package `validate` commands
- no command deletion, reordering, parallelization, or failure repair

## Dependencies

- Site task `005 Restartable Validation Chain` supplies exact chain parsing semantics.
- Site task `006 Portable Test Timing Profile` supplies the narrower portable baseline.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: j5gd-WzvN6y3NKg5FlRBiZO_vSqAhcTT1MVEefUENms