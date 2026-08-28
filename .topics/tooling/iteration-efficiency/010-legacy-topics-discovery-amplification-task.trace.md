# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:30:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Measure how legacy Site development artifacts amplify broad artifact inspect/audit projections independently from local CPU cost.

---

# Legacy Topics Discovery Amplification

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only this bounded legacy-discovery measurement child.

## Objective

Compare real broad artifact operations against current `.topics` versus a temporary byte-identical copy with only legacy `.topics/development` removed, so cleanup decisions are based on measured projection amplification rather than repository age alone.

## Done Criteria

- Current `.topics` and a temporary development-filtered copy are measured with the same `audit` operation.
- The same A/B pair is measured with `inspect` to distinguish audit-specific behavior from general discovery amplification.
- Runtime, record/audit counts, output bytes, and findings are preserved.
- Original Site bytes remain unchanged by the measurement.
- No cleanup is authorized by this task alone; dependency discovery is required before deletion.

## Scope

- `.topics/development` as the only filtered legacy subtree
- read-only `audit` and `inspect` A/B measurements
- temporary filtered copy outside the Site workspace
- no production source changes
- no deletion from the Site workspace

## Dependencies

- Site task `002 Site Grounding Workset Baseline` identifies `.topics/development` as the dominant legacy artifact volume.
- Site task `003 Portable Input Workset Measurement` shows raw portable file materialization is not itself minute-scale.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: FqKZhlxcMAhjivK4L5BvhuE8ISfeJqFb6uOMT9Vrw3s