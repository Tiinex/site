# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 09:54:54
  - Authors: Loom
  - Status: completed/local
  - Summary: Add an explicit bounded summary projection for broad inspect/audit output so agents can consume qualification receipts without record- or audit-body-scale generated context.

---

# Bounded Inspect Audit Summary Projection

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded CLI output-projection child.

## Objective

Reduce generated Tooling context independently from artifact cleanup and operation execution cost while preserving full output, exit semantics, qualification findings, and explicit operator control.

## Done Criteria

- `inspect` and `audit` accept explicit `--summary`.
- Default output remains unchanged when `--summary` is absent.
- Summary output includes status, boundary, counts, finding summary, phase timing when requested, and bounded error/warning details.
- Summary output omits record and audit bodies.
- Underlying operation result still determines CLI exit status.
- Bounded iteration gate protects full/default and summary behavior.
- Real current-Site before/after output bytes are preserved.

## Scope

- portable CLI result projection only
- `inspect` and `audit` only in this task
- no change to audit/inspect validation semantics
- no change to artifact bytes, carrier bytes, qualification criteria, or operation ordering
- no claim about external review systems

## Changed Files

- `src/tooling/portable/adapters/cli/cli.run.js`
- `src/tooling/portable/adapters/cli/cli.help.js`
- `src/tooling/portable/adapters/cli/cli.summaryProjection.test.mjs`
- `tools/run-tooling-iteration-gate.mjs`
- this Task and its Preservation companion.

## Dependencies

- Site task `016 Current Tooling Grounding Boundary And Legacy Quarantine`.
- Site task `017 Legacy Development Artifact Physical Cleanup Closure`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Implementation: complete/local.
- Focused summary regression: pass.
- Bounded Tooling iteration gate: pass 9/9.
- Real current-Site inspect and audit summary A/B: complete.
- Full default output remains available explicitly by omitting `--summary`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:t16uEAinP_XuYJt93n9_bqpZfbtMeXEE4ahR-NMEAzo