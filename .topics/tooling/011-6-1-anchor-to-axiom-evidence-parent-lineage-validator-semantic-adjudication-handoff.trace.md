# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 09:56:21
  - Trace: [011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
  - Origin:
    - [relative](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 09:56:27
  - Authors: Anchor
  - Why: The four-schema Viewer proof is technically green, but Evidence still degrades through a validator warning that may conflate schema inheritance with artifact Parent continuity.
  - Summary: Transfer the Evidence preservation-parent validator semantic conflict to Axiom for exact adjudication before Sigma factory acceptance.
  - Status: ready/local

---

# Anchor → Axiom Evidence Parent-Lineage Validator Semantic Adjudication Handoff

## Handoff Parties

- Purpose: adjudicate the Evidence preservation-parent validator conflict exposed by the qualified four-schema factory proof and return exact semantic authority for Loom implementation.
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Axiom
- To Kind: role
- To Reference: [Axiom](business::.topics/roles/001-2-axiom-role.trace.md)

## Transfers

- evidence-parent-validator-adjudication
  - Transfer Kind: work-and-responsibility
  - Description: determine whether `evidence.preservation.parent.unresolved` is canonical Evidence validation semantics or stale/private implementation policy, preserving the distinction between schema inheritance and artifact Parent continuity.
  - Controlling Artifact: [Evidence Parent-Lineage Validator Semantic Adjudication](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
  - Boundary: semantic adjudication only; do not implement Site code or broaden factory scope.

## Required Context

- controlling-task
  - Material: Evidence Parent-Lineage Validator Semantic Adjudication task.
  - Purpose: exact question, done criteria, and exclusions for this bounded semantic turn.
  - Availability: available
  - Material Reference: [Adjudication Task](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)

- kodax-viewer-proof
  - Material: Kodax Schema Factory Viewer Proof Implementation Evidence.
  - Purpose: exact observed factory behavior, including standalone Evidence creation and validation boundary.
  - Availability: available
  - Material Reference: [Kodax Viewer Proof](011-5-1-2-kodax-schema-factory-viewer-proof-implementation-evidence.trace.md)

- prior-axiom-repair
  - Material: Axiom Schema Factory Canonical Repair Disposition.
  - Purpose: preserve already-qualified Evidence-over-Preservation structural inheritance semantics and avoid reopening unrelated factory decisions.
  - Availability: available
  - Material Reference: [Axiom Factory Repair](011-3-1-axiom-schema-factory-canonical-repair-disposition-decision.trace.md)

## Reference Context

- carried-docs-authority
  - Material: carried Docs workspace containing Root, Preservation, Evidence, and the explicit Evidence inheritance candidate used by Loom/Kodax.
  - Purpose: inspect exact schema authority rather than infer from Site validator wording.
  - Availability: available

- site-validator
  - Material: `src/schemas/core/evidence/tiinex.evidence.v1.validate.js` in the carried Site workspace.
  - Purpose: inspect the exact warning condition under adjudication; implementation text is evidence, not semantic authority.
  - Availability: available

## Retained Responsibilities

- implementation
  - Retained By: Loom
  - Responsibility: implement the adjudicated semantic result through shared validation mechanics without private Viewer policy.

- factory-reconciliation
  - Retained By: Anchor
  - Responsibility: rerun factory conformance and decide whether the tranche is ready for Sigma acceptance.

- factory-acceptance
  - Retained By: Sigma
  - Responsibility: accept or reject the factory pattern after semantic and technical reconciliation.

## Exclusions And Dependencies

- no-artifact-parent-inference
  - Kind: excluded-scope
  - Description: do not infer or require an artifact Parent edge merely from Evidence schema inheritance unless canonical authority explicitly requires that exact continuity relation.

- no-site-specialcase
  - Kind: excluded-scope
  - Description: do not authorize a schema-ID-specific workaround that bypasses shared validation semantics.

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no remote write, publication, merge, or deploy is part of this semantic turn.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one precise Decision classifying the current warning and defining the exact validation/continuity boundary for Loom and Anchor.
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Axiom acceptance is Site implementation, Sigma factory acceptance, or broad schema scaling authorization.
- Must Not Be Used To Claim: that schema inheritance creates artifact lineage, that every Evidence artifact must have a Preservation Parent without explicit authority, or that preservation obligations may be dropped.
- Authority Limits: Axiom owns the semantic adjudication; Loom owns shared implementation; Anchor owns reconciliation; Sigma owns factory acceptance.
- Transport Limits: carrier/workspace placement is transport only and does not create semantic authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
  - Value: Woyc40LHRgUO-yxOexdiM0nfHwGoTuHl7W0k0A_dIJc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7Z92l9O7zrob7yO8vQWzbw5m73C01irEjcxb6lhUdpk