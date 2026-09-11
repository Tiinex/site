# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 15:56:34
  - Trace: [004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Origin:
    - [relative](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 19:25:17
  - Authors: Anchor
  - Why: Humans must be able to create and forward their own Tiinex artifacts with the same semantic capability surface as LLM consumers, without a Viewer-private policy fork.
  - Summary: General Viewer human authoring, Handoff composition, package manufacture/import, and audit/repair surfaces backed by the same shared capabilities used by LLM Tooling.
  - Status: ready/local

---

# Viewer Human Authoring And Handoff Package Parity

## Objective

Make the general Viewer a first-class human authoring and transport surface over the same shared Tiinex capabilities available to LLMs: create/edit local artifacts through canonical shared authoring contracts, compose Handoffs with explicit Required/Reference Context, manufacture qualified Handoff Packages, and open/reconcile incoming packages without introducing Viewer-private semantics or remote-write assumptions.

## Done Criteria

- Viewer exposes shared canonical artifact authoring capabilities rather than hand-building Markdown rules; schema guidance, validation, integrity sealing, continuity boundaries, and findings come from shared Tooling/application primitives.
- Humans can create bounded local artifacts and see validation/audit findings before material is treated as qualified.
- Viewer can compose a Handoff by selecting explicit From/To Role references, controlling artifact, transfers, Required Context, Reference Context, retained responsibilities, dependencies/exclusions, and completion expectation through a human-readable UI backed by the canonical Handoff contract.
- Viewer can manufacture the same recipient-facing Handoff Package semantics as portable Tooling, including same-bytes multi-route carriers when qualified, and shows exact Tooling-derived recipient routing text rather than reconstructing it in UI code.
- Viewer can import/open/reconcile recipient-facing packages through the same package inspection/qualification logic used by shared Tooling; ambiguous workspace identity remains unresolved.
- Human-created local artifacts are preserved through package reconciliation and are not silently overwritten by imported snapshots.
- Audit and repair surfaces consume the same shared finding codes, repair projections/actions, approval gates, changesets, and re-audit receipts used by LLM/tooling consumers.
- Capability parity is explicit: for each human action surface, the corresponding shared operation/capability owner is identifiable; Viewer-only policy forks fail review.
- Creating or packaging local material does not imply GitHub publication, canonical origin, role assignment, acceptance, or remote mutation.
- Drag/drop and global-vs-workspace material intake use explicit scope and shared import semantics; reference-branch techniques may be ported only when general and independently qualified.
- Focused human-authoring/package/audit-repair cases plus Foundation/UI/type/browser-import gates remain green.

## Scope

- General Viewer artifact authoring, Handoff composition, Handoff Package manufacture/import/reconciliation, shared audit/repair actions, and explicit local/remote boundaries.
- Human-readable projection of shared Tooling capability contracts.

Out of scope: automatic GitHub writes; Playthings-specific UI/Verse behavior; redefining canonical schemas in Viewer; bypassing Tooling qualification to make an interaction feel simpler; final release acceptance.

## Dependencies

- [Viewer Artifact And Action Parity](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md).
- [Safe Reduction And Shared Capability Parity](../tooling/010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md), especially Loom's audit/repair and multi-route/actor-grounding return.
- Existing `artifactAuthoringCapability`, package import/reconciliation, workspace lifecycle, and shared portable Tooling operations in Site.
- Later explicit Anchor-to-Kodax implementation Handoff after the shared capability seams are qualified enough to avoid Viewer-private policy.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Value: mKgoDujAWZFxqsNvAln71-LZ2gmTd2urZoTDKEBavys

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: rghTiQmwfXetoel4ol_c4Cpr0Giv9vDOynFdS1zeH7U