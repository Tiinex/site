# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:38:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Profile portable and package-oriented test files individually to identify real per-test wall-clock outliers without treating failures as timing blockers.

---

# Portable Test Timing Profile

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only this bounded test-profiling child.

## Objective

Measure test files independently, continue profiling after failures, and preserve per-file elapsed time so slow-test hypotheses can be ranked from observed data rather than filenames or broad-suite duration.

## Done Criteria

- A diagnostic test-file profiler records elapsed time and exit code for every requested file and continues across failures.
- A focused injected-executor test proves continuation and failure capture behavior.
- Obvious package/carrier/performance candidates are profiled.
- All current `src/tooling/portable/**/*.test.mjs` files are profiled in bounded batches.
- Timing distribution and current failure list are preserved without repairing unrelated failures.
- No production runtime or test semantics are modified.

## Scope

- `tools/profile-test-files.mjs`
- `tools/profile-test-files.test.mjs`
- current-only artifacts under `.topics/tooling/iteration-efficiency/`
- read-only execution of existing test files
- no test deletion, parallelization, production change, or broad correctness claim

## Dependencies

- Site task `004 Bounded Tooling Iteration Gate`.
- Site task `005 Restartable Validation Chain`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: uvex-Yd3KVrtmu1oRAHn2DTNaQIPgm2qfU6C0jTw_iE