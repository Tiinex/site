# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 12:19:30
  - Authors: Loom
  - Status: completed/local
  - Summary: Make multi-step Loom closure work restartable through exact ordered command plans without weakening any underlying audit, manufacture, or qualification operation.

---

# Restartable Closure Plan Orchestration

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Provide a bounded checkpointed-plan runner so interruption during an ordered closure sequence can resume at the first unfinished step rather than replaying already completed Tooling work.

## Done Criteria

- Represent the plan as ordered exact command plus argument arrays rather than shell command strings.
- Derive a stable plan identity from normalized working directory and exact ordered steps.
- Reject stale checkpoints when plan identity changes.
- Preserve a durable plan checkpoint and one checkpoint per executed step.
- Resume a failed or interrupted plan without replaying already completed steps.
- Return immediately from a fully completed checkpoint with zero child-process execution.
- Keep child stdout/stderr bounded through the existing checkpointed-command boundary.
- Provide a first-class Site CLI entrypoint and focused regression coverage.
- Include the focused regression in the bounded Tooling iteration gate.
- Do not replace or weaken the audit, manufacture, roundtrip, or returned-carrier qualification commands represented by a plan.

## Scope

- `tools/run-checkpointed-plan.mjs`
- `tools/run-checkpointed-plan.test.mjs`
- `tools/run-tooling-iteration-gate.mjs`
- `package.json` first-class Tooling entrypoint
- current-only task/preservation artifacts
- no change to Handoff qualification semantics
- no implicit/global execution cache

## Dependencies

- Site task `005 Restartable Validation Chain`.
- Site task `013 Restartable Checkpointed Command Runner`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Focused unit and CLI regression: PASS.
- Real child-process CLI plan executes two ordered steps and completed `--resume` executes zero additional steps.
- Failed synthetic step resumes from that exact step while preserving the preceding completed checkpoint.
- Changed step set is rejected as `checkpointed-plan.checkpoint.stale`.
- Bounded Tooling iteration gate: PASS, 13/13 steps, 1,920.179 ms measured in the closure run.
- First-class invocation: `npm run tooling:closure-plan -- --plan <plan.json> --checkpoint-dir <dir> [--resume]`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:jQ195h3JKGpzlROFbvvxoKbdzz72xWnHP3VgK_7mfX8
