# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:10:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Measure the actual portable input materialization workset for Site and the current Handoff carrier without changing loader semantics.

---

# Portable Input Workset Measurement

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only this bounded measurement child.

## Objective

Measure what the existing `loadNodePortableInput()` boundary actually materializes for a directory or Handoff ZIP, including resident text/binary bytes, locator-only material, source modes, kinds, findings, and internal elapsed time. Use the measurement to distinguish repository volume from portable input preparation cost.

## Done Criteria

- A read-only diagnostic reuses the production portable input loader without modifying its semantics.
- A focused tempfile-based test covers text, binary-resident, locator-only, exclusions, byte accounting, and finding accounting.
- The current Site tree and current Anchor-to-Loom carrier are measured.
- Measurements are compared with task 001 CLI phase timing where directly comparable.
- No production runtime, loader implementation, task-001 source, Handoff semantics, or legacy material is changed.

## Scope

- `tools/measure-portable-input-workset.mjs`
- `tools/measure-portable-input-workset.test.mjs`
- current-only artifacts under `.topics/tooling/iteration-efficiency/`
- read-only invocation of `src/tooling/portable/input/node.input.js`
- no optimization or cleanup in this task

## Dependencies

- Site task `001 CLI Phase Timing And Early Return` supplies the comparable input-preparation timing surface.
- Site task `002 Site Grounding Workset Baseline` supplies repository-presence context.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gqysEwuT9wE_fZNiHlhWSa-cKbzA3EPMR2WbC0qmU-0