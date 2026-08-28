# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 10:43:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Add opt-in in-process CLI phase timing and prove an early workspace-bearing Loom return before broad validation.

---

# CLI Phase Timing And Early Return

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only the bounded implementation child.

## Objective

Add an opt-in portable CLI timing surface that distinguishes input preparation, operation execution, and output/materialization time, then return the exact changed Site Workspace before broad tests or paused carrier refactors expand the turn.

## Done Criteria

- `--phase-timing` adds monotonic in-process phase timing to a CLI JSON result.
- Timing explicitly excludes host review/queue latency and other work outside the CLI process.
- Existing CLI output remains unchanged when the flag is absent.
- A focused CLI test covers the timing surface and passes.
- Loom returns the exact changed Site Workspace plus measured evidence and remaining continuation before broad validation.

## Scope

- `src/tooling/portable/adapters/cli/cli.run.js`
- `src/tooling/portable/adapters/cli/cli.help.js`
- focused CLI test coverage only
- current-only artifacts under `.topics/tooling/iteration-efficiency/`
- no artifact-first carrier completion, legacy reader work, archive parser work, broad suite, or classifier probing in this tranche

## Dependencies

- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.
- Business child task `002-6-3-1 Reviewed-Turn Survivability And Benign Review Friction`.
- Exact carried Site baseline: 13,222,309-byte archive, SHA-256 `b582d5c23acc25e7eb1bf9a07ca33101486cdf9d7ae9f5056f2798430fff8302`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ka1q4IZs60RgZQTb6OakBOUuTcc-EaD0v8sHTfc-muQ