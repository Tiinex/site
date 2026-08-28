# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:44:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Add a restartable command boundary that writes durable running, heartbeat, completion, failure, and explicit-timeout receipts before long child-process work can disappear inside a host execution window.

---

# Restartable Checkpointed Command Runner

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded workflow-survivability child.

## Objective

Persist an exact-operation receipt before spawning a potentially long child process, refresh a heartbeat while it runs, and make exact-operation resume deterministic without imposing a default timeout or changing the child command semantics.

## Done Criteria

- Operation identity is bound to exact resolved cwd, command, and argv.
- Atomic checkpoint state is written as `running` before child execution and heartbeat state is refreshed while the child remains active.
- Completion, failure, and explicitly requested timeout produce durable final receipts with elapsed time and bounded output tails.
- `--resume` reuses an already completed exact-operation checkpoint without replay and permits a new attempt only for the same operation identity.
- A stale command/cwd checkpoint fails closed.
- One real current-carrier orientation and the bounded Tooling iteration gate pass through the new seam.

## Scope

- `tools/run-checkpointed-command.mjs`
- `tools/run-checkpointed-command.test.mjs`
- `tools/run-tooling-iteration-gate.mjs`
- current-only task/preservation artifacts
- no default child timeout
- no Tiinex semantic/runtime change

## Dependencies

- Site task `005 Restartable Validation Chain` provides the prior checkpoint/restart precedent.
- Site task `012 Package Parent Qualified Lineage Reuse` preserves the observed identical-input `>180 s` host execution excursion.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:2Tu5slHCL8hGmuNP8Nm-2xy_YH_jZ3kgOVlQZnh-wXY
