# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 21:36:51
  - Trace: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Origin:
    - [relative](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 21:37:54
  - Authors: Anchor
  - Why: The current generic path proves Topic/Task but exposes unmapped field-oriented and residual creation shapes; mechanics must generalize before schema fan-out.
  - Summary: Loom route to implement shared Decision/Evidence/Handoff factory mechanics, conformance, and Builder-ready schema descriptors without semantic forks.
  - Status: ready/local

---

# Schema Slice Factory Mechanics — Anchor To Loom

## Handoff Parties

- Purpose: qualify and implement the shared schema-factory mechanics required by the Decision/Evidence/Handoff qualification set without introducing per-schema semantic forks, while exposing Builder-ready descriptors for later product use.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- generic-factory-capability-implementation
  - Transfer Kind: work
  - Description: extend the existing schema-source/contract/capability/creation machinery so canonical Docs contracts for Decision, Evidence, and Handoff compile into explicit reusable capabilities and Builder-ready input/structure descriptors instead of requiring schema-specific Markdown writers or Viewer policy.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: implement mechanics derivable from qualified contracts; do not redefine semantic meaning or infer missing authority from filenames, directories, UI, or LLM convention.

- factory-conformance
  - Transfer Kind: work
  - Description: add conformance evidence proving the same generic machinery handles the simple Decision contract, inherited field-oriented Evidence contract, and structured repeated-declaration Handoff contract, and fails closed when a contract shape is not qualified.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: a green test produced by three copied schema implementations is not factory proof.

- schema-builder-readiness
  - Transfer Kind: responsibility
  - Description: expose a stable shared descriptor/projection sufficient for a future Schema Builder to discover inherited section/field ownership, value/shape constraints, creation inputs/bindings, repeated declaration structure, required/optional state, transition/relation references where declared, and validation/capability findings without parsing React components or private Tooling state.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: build the shared seam and proof only; do not build a separate Builder UI or second schema model.

## Required Context

- factory-task
  - Material: controlling factory qualification Task
  - Material Reference: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Purpose: exact qualification set, Done Criteria, Root abstraction rule, Builder-readiness boundary, and no-fan-out gate.
  - Availability: available

- shared-capability-precedent
  - Material: Loom reduction/audit/repair parity implementation evidence
  - Material Reference: [Loom Reduction Audit Repair Parity Implementation Evidence](010-2-1-loom-reduction-audit-repair-parity-implementation-evidence.trace.md)
  - Purpose: preserve the shared-capability pattern where Viewer and portable Tooling project one mechanics owner rather than duplicate policy.
  - Availability: available

- current-action-major
  - Material: Viewer artifact/action parity major
  - Material Reference: [Viewer Artifact + Action Parity Recovery](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Purpose: creation/read/action consumers that the factory must eventually serve without product-private semantics.
  - Availability: available

## Reference Context

- current-site-factory-baseline
  - Material: current `src/schemas` registry, generic artifact module, schema-source compiler, capability registry, creation capability/representation/renderer path, companion contract, and canonical transition product slice
  - Purpose: existing mechanics baseline. Preserve qualified behavior and extend generic seams rather than replacing them with another framework.
  - Availability: available

- current-capability-gap-observations
  - Material: Anchor factory preflight observations from the reconciled candidate
  - Purpose: Decision creation is blocked by one unqualified residual Required Shape item; Evidence required creation fields currently compile as unmapped inputs; Handoff required creation inputs currently compile as unmapped structured fields/sections; Root creation remains intentionally unavailable.
  - Availability: available

- canonical-docs-authority
  - Material: carried/current Docs Root, Decision, Preservation, Evidence, Handoff, Transition Definition, Relation, validation, and schema-governance artifacts
  - Purpose: exact semantic/machine contract source; Site code is an implementation consumer.
  - Availability: available

## Retained Responsibilities

- semantic-disposition
  - Retained By: Axiom
  - Responsibility: classify canonical semantics, companion categories, transition/relation/inheritance boundaries, and scale waves. Loom must return a blocker rather than invent semantics when current authority is genuinely ambiguous.

- viewer-proof
  - Retained By: Kodax
  - Responsibility: after Anchor reconciliation, prove Viewer uses the shared factory correctly for the qualification schemas.

- architecture-and-merge
  - Retained By: Anchor
  - Responsibility: reconcile Axiom/Loom returns, decide whether any implementation needs correction, route Kodax only after shared mechanics are technically qualified, and prevent competing factory logic.

- factory-acceptance
  - Retained By: Sigma
  - Responsibility: accept the pattern only after it is actually consumed correctly; machine conformance alone is insufficient.

## Exclusions And Dependencies

- no-root-concretization
  - Kind: excluded-scope
  - Description: Root remains an abstract shared envelope/fallback. Do not add manual creation or synthetic schema transitions merely to make the factory rectangular.
  - Responsible Party Or Role: Loom

- no-private-schema-writers
  - Kind: excluded-scope
  - Description: do not close Decision/Evidence/Handoff by adding three independent handwritten Markdown generators, duplicated validators, or component-owned form rules.
  - Responsible Party Or Role: Loom

- residual-semantics-fail-closed
  - Kind: unresolved-dependency
  - Description: when a Required Shape or structured creation rule is not mechanically expressible under current qualified generic authority, expose it as unresolved or use a narrowly declared schema-owned residual extension only when canonical authority justifies that extension; do not guess from prose wording.
  - Responsible Party Or Role: Axiom

- no-broad-schema-registration
  - Kind: excluded-scope
  - Description: do not register/complete dozens of additional Docs schemas in this turn. The qualification set must first prove factory reuse.
  - Responsible Party Or Role: Anchor

- reduction-remains-separate
  - Kind: excluded-scope
  - Description: do not combine this factory tranche with destructive Reduction enablement or the remaining external Parent-span work; that safety frontier remains fail-closed and separately tracked.
  - Responsible Party Or Role: Anchor

- no-remote-write
  - Kind: excluded-scope
  - Description: return local/package evidence only; no push, merge, publication, or deployment is authorized.
  - Responsible Party Or Role: Sigma

## Session Role Binding

- Sender Role: Anchor.
- Recipient Role: Loom.
- Holder Binding: the consuming session must explicitly operate in the Loom capacity; route selection or package consumption is not holder proof.
- Re-grounding Rule: cold grounding must preserve Loom as recipient Role and report holder/session binding separately.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns technical Evidence and a carrier showing the shared factory mechanics, exact Decision/Evidence/Handoff capability dispositions, Builder-ready descriptor seam, conformance tests, any Axiom-owned semantic blockers, and measured evidence that no second schema logic path was introduced.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)

## Interpretation Limits

- Does Not Mean: passing factory mechanics accepts the pattern, authorizes broad schema fan-out, makes every schema creatable, or lets Site infer semantics absent from Docs.
- Must Not Be Used To Claim: a generic UI form is semantic authority, Root must expose descendant capabilities, schema-specific residual code is acceptable without explicit canonical justification, or Kodax/Sigma product proof has occurred.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Value: k-972tR9t7s3QQpQ13Id5oG5qHVIqK05f_LEIr_MM5k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: i6VbRdt6EY5QT3UrqAwmNO08GJ9C271-Jewb87gp5Jw