# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:27:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Add a restartable timed wrapper around the existing full validation chain without changing its command order or correctness authority.

---

# Restartable Validation Chain

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only this bounded execution-survivability child.

## Objective

Wrap the exact current `npm run validate` command chain with per-step timing and durable local checkpoint state so interrupted long validation can resume after the last completed command rather than replaying the chain from step one. Preserve exact command order and leave the existing `validate` script unchanged.

## Done Criteria

- `validate:restartable` runs the exact current `validate` chain through a separate runner.
- Checkpoint state records chain identity, last completed step, failed step, and last result.
- `--resume` rejects stale checkpoints when the package script changes.
- A focused injected-executor test proves pass, failure, checkpoint, and no-replay resume behavior.
- JSON mode remains machine-readable even when child commands emit output.
- A real validation-prefix run proves checkpoint behavior against the existing baseline browser-boundary failure.
- Existing `npm run validate` remains unchanged and authoritative for final validation semantics.

## Scope

- `tools/run-validation-chain.mjs`
- `tools/run-validation-chain.test.mjs`
- `package.json` adds `validate:restartable` only
- current-only artifacts under `.topics/tooling/iteration-efficiency/`
- no command reordering, parallelization, test deletion, or baseline failure repair

## Dependencies

- Site task `004 Bounded Tooling Iteration Gate` for the inner-loop/final-gate distinction.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: EvJqvX-JNln_zCFkrJOwiKWSyp37p2sghPeMS6DZNjs