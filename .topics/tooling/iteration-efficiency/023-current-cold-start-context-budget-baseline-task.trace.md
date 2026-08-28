# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 10:06:19
  - Authors: Loom
  - Status: completed/local
  - Summary: Establish a measured current cold-start/context-budget baseline after legacy quarantine, bounded artifact projections, lineage summaries, and bounded source search.

---

# Current Cold Start Context Budget Baseline

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Measure the model-facing byte budget of the normal current Tooling discovery sequence on the cleaned Site state, separating projection volume from local operation time before further optimization is attempted.

## Done Criteria

- Measure full and bounded output for current `.topics` inspect, audit, search-lineage, and resolve-lineage.
- Measure bounded current-source search output separately.
- Keep all full bodies redirected to host files and project only counts/timing into the working conversation.
- Record combined byte reduction and local process timing.
- Do not infer causality for any external review/classification behavior.

## Scope

- read-only current Site `.topics` material
- current portable CLI bounded/full projections
- current bounded `tooling:search` surface
- current-only task/preservation artifacts
- no runtime/source change in this task

## Dependencies

- Site task `016 Current Tooling Grounding Boundary And Legacy Quarantine`.
- Site task `017 Legacy Development Artifact Physical Cleanup Closure`.
- Site task `018 Bounded Inspect Audit Summary Projection`.
- Site task `020 Bounded Current Tooling Context Search`.
- Site task `022 Bounded Lineage Summary Projection`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Four-operation full projection: 983,597 bytes.
- Four-operation bounded projection: 5,686 bytes.
- Combined projection reduction: 172.99x.
- Full internal CLI time: 282.721 ms.
- Bounded internal CLI time: 285.724 ms.
- Bounded source search: 765 bytes.
- Bounded current workflow including source search: 6,451 bytes.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:7Ih5Xk87TLwjmXY-SBB7BalqUh4Imp5fBURMs9CerMc