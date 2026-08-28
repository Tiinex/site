# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 12:34:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Make validation profiling bounded and restartable so timing work leaves durable progress instead of one opaque all-or-nothing host call.

---

# Restartable Bounded Validation Profiling

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Add opt-in checkpointed batching to the validation profiler while preserving its non-authoritative continuation-over-failure timing semantics and unchanged default behavior.

## Done Criteria

- Add `--batch-size`, `--checkpoint`, and `--resume` profiler options.
- Persist chain identity, start/cursor position, cumulative profiled steps, cumulative elapsed time, cumulative failure count, and failure-step list.
- Write the current-step cursor before each child command so host interruption loses at most the in-flight step.
- Continue profiling after nonzero child exits while recording them as timing failures.
- Reject resume when the exact validation-chain identity changes.
- Return completed resume with zero child execution.
- Report `nextFromStep`, `remainingSteps`, and checkpoint completion explicitly.
- Keep the existing uncheckpointed range-profiler API/CLI behavior available.
- Add first-class Site invocation and bounded fast-gate regression.

## Scope

- `tools/profile-validation-chain.mjs`
- `tools/profile-validation-chain.test.mjs`
- `tools/run-tooling-iteration-gate.mjs`
- `package.json` first-class Tooling script
- current-only task/preservation artifacts
- no change to `npm run validate` correctness semantics

## Dependencies

- Site task `005 Restartable Validation Chain`.
- Site task `027 Current Validation Regression Profile`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Focused profiler checkpoint/resume regression: PASS.
- Bounded Tooling iteration gate: PASS, 14/14 steps, 1,897.572 ms.
- Real validation dogfood batch 1: steps 1-5, 188.303 ms, 1 failure, next step 6.
- Real validation dogfood resume batch 2: steps 6-10, 394.398 ms, 3 failures, next step 11.
- Durable checkpoint after batch 2: 10 cumulative profiled steps, 4 cumulative failures, failure steps `[4,6,7,8]`, current step 11.
- Completed-checkpoint and stale-chain behavior are covered by focused regression.
- First-class invocation: `npm run tooling:profile-validation -- --batch-size <N> --checkpoint <file> [--resume]`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:rx3LgGj9uBV63IZKcWS0_VZHTidySB7HrfeBCVlvc54
