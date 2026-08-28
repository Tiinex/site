# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:03:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Establish a deterministic Site repository workset baseline before deciding whether legacy artifact or docs cleanup belongs on the iteration-efficiency critical path.

---

# Site Grounding Workset Baseline

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only this bounded measurement child.

## Objective

Add a read-only repository inventory tool that measures file count and byte share for current iteration-efficiency artifacts, legacy Site topics, docs, Tooling source, Tooling tools, other source, and remaining material. Use the resulting baseline to decide whether cleanup warrants a later implementation task instead of deleting historical material by intuition.

## Done Criteria

- A deterministic read-only tool reports repository file and byte totals by stable workset category.
- Dependency/build trees are excluded from the measurement.
- A focused tempfile-based test proves classification, counting, byte totals, and exclusion behavior.
- One exact Site baseline is captured with category shares and legacy hotspot decomposition.
- No production runtime, Handoff semantics, qualification behavior, or existing task-001 source is modified.
- Cleanup remains deferred until a later task can connect repository volume to actual discovery/grounding or execution cost.

## Scope

- `tools/measure-tooling-workset.mjs`
- `tools/measure-tooling-workset.test.mjs`
- current-only artifacts under `.topics/tooling/iteration-efficiency/`
- read-only measurements of the carried/modified Site working tree
- no file deletion, docs rewrite, runtime instrumentation, carrier roundtrip, or broad validation suite

## Dependencies

- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.
- Site child task `001 CLI Phase Timing And Early Return` remains frozen for Anchor audit and is not modified by this task.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: dofSI4_V6htpv13c7BGMLQtUgKM3gmluI8AxZYXxD6g