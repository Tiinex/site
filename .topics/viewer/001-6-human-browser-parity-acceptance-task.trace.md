# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:32:00
  - Trace: [Viewer PoC Parity Recovery — Site Implementation](001-viewer-poc-parity-recovery-implementation-task.trace.md)
  - Origin:
    - [relative](001-viewer-poc-parity-recovery-implementation-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:41:00
  - Authors: Anchor; Sigma
  - Why: Reserve Sigma for the final human judgments that machine Tooling/runtime qualification cannot establish instead of using human testing to discover basic semantic defects.
  - Summary: Viewer Human Browser Parity Acceptance
  - Status: draft/local

---

# Viewer Human Browser Parity Acceptance

## Objective

Give Sigma one bounded real-browser acceptance duty after the selected PoC recovery slices are machine-qualified, focused on comprehension, interaction fit, and whether retained/changed PoC value is recognizable and truthful.

## Done Criteria

- Relevant deterministic Tooling/runtime/parity checks are green or their blockers are explicitly separated before the Sigma run begins.
- Sigma receives a normal current Viewer path, not a hidden debugging checklist that teaches expected implementation internals.
- Human review covers first useful orientation, Feed/Tree/Lineage comprehension, artifact/provenance reading, selected retained actions, state/history behavior relevant to the implemented slices, and mobile/desktop fit where material.
- Intentionally changed PoC behavior is presented as changed with reason rather than counted as silent parity.
- Sigma can return PASS, PASS with observations, or FAIL with concrete actual-path observations.
- Anchor reconciles that evidence against the Business Viewer PoC Parity Recovery outcome; this Site task does not self-accept product parity.

## Scope

- Planned human acceptance only. Do not ask Sigma to manually rerun deterministic semantic checks that qualified Tooling can perform.

## Dependencies

- [Viewer Navigation Parity](001-3-navigation-parity-task.trace.md)
- [Viewer Artifact And Action Parity](001-4-artifact-and-action-parity-task.trace.md)
- [Viewer Workspace, Source, Temporal And Export Parity](001-5-workspace-source-temporal-and-export-parity-task.trace.md)
- Machine qualification evidence for the slices actually presented.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Viewer PoC Parity Recovery — Site Implementation](001-viewer-poc-parity-recovery-implementation-task.trace.md)
  - Value: 6buMgvvatcMH-Cij-_v03JoapUlb_Cj8YGLmkSxXUtM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:nf03B8MX4ilmDeCujh9OUKlzr5qkrKqYGMuk5zsT350
