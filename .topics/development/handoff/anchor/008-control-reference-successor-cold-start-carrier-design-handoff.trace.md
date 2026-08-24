# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-24 14:55:00
  - Authors: Anchor
  - Why: Rotate the current control/reference conversation before host context pressure while preserving the newest cold-start, Role/participant grounding, repair provenance and Handoff carrier/workspace design findings without competing with the active Axiom semantic-classification route.
  - Summary: Control/reference successor Handoff for the next conversation branch; recover current full Site state, keep the active Axiom route authoritative for publication-semantic classification, and continue falsifying cold-start consumer grounding plus workspace-archive/control-plane design after that return arrives.
  - Status: draft/local

---

# Control/reference successor cold-start and carrier design handoff

## Handoff Parties

- Purpose: cold-start the next control/reference Anchor conversation with the newest durable design and trust findings while leaving active execution with the already-dispatched Axiom route
- From: Anchor
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- control-reference-continuity
  - Transfer Kind: work
  - Description: recover the current control/reference state, inspect future returned packages Q brings into this branch, and preserve/falsify durable findings without silently taking over active project execution
  - Controlling Artifact: [Cold-start consumer grounding, provider capability and carrier ingress feedback](../../architect/continuity/001-37-cold-start-consumer-grounding-provider-capability-and-carrier-ingress-feedback.trace.md)
  - Boundary: branch rotation only; active publication-semantic execution remains with the already-dispatched Axiom Handoff until its return is independently reviewed

## Required Context

- cold-start-grounding
  - Material: current Tiinex-first ingress, Role/participant/interaction grounding, provider capability projection and carrier ingress design feedback
  - Material Reference: [Cold-start consumer grounding, provider capability and carrier ingress feedback](../../architect/continuity/001-37-cold-start-consumer-grounding-provider-capability-and-carrier-ingress-feedback.trace.md)
  - Purpose: preserve the newest design discussion without predecessor chat access
  - Availability: available

- preferred-path-task
  - Material: bounded Tooling task for cold-start preferred-path qualification
  - Material Reference: [Tooling 026 cold-start Tiinex-first ingress and preferred-path qualification](../../tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
  - Purpose: keep the behavioral cold-start gate distinct from package carrier restructuring
  - Availability: available

- carrier-audit-task
  - Material: bounded audit of workspace archive representation, package control-plane minimality and Required Context material duplication
  - Material Reference: [Tooling 027 Handoff package workspace archive and control-plane minimality audit](../../tooling/dogfood/027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md)
  - Purpose: preserve the proposed Tiinex workspace-artifact plus archive direction without prematurely implementing it
  - Availability: available

- repair-workflow
  - Material: revised lineage repair/publication/permalink/human adapter workflow including canonical Repairs provenance and descendant invalidation boundaries
  - Material Reference: [Lineage integrity repair publication permalink and human adapter workflow feedback](../../architect/continuity/001-31-lineage-integrity-repair-publication-permalink-and-human-adapter-workflow-feedback.trace.md)
  - Purpose: retain the repair design constraints that remain relevant after Axiom publication classification
  - Availability: available

- repair-apply-task
  - Material: Tooling 021 repair-application task with representation-preservation and Repairs-provenance constraints
  - Material Reference: [Tooling 021 lineage integrity repair application and representation preservation](../../tooling/dogfood/021-lineage-integrity-repair-application-and-representation-preservation.trace.md)
  - Purpose: prevent a successor from treating checksum refresh as automatic cleanup
  - Availability: available

- active-axiom-route
  - Material: currently active semantic-classification Handoff for repaired-versus-published Parent representation and unpublished Parent Origin truthfulness
  - Material Reference: [Axiom publication lineage mismatch and unpublished Parent semantic classification Handoff](../axiom/011-publication-lineage-mismatch-and-unpublished-parent-semantic-classification-handoff.trace.md)
  - Purpose: identify the active execution route that this control successor must not duplicate while Q waits for Axiom's return
  - Availability: available

## Reference Context

- publication-reconciliation
  - Material: Anchor provider-side reconciliation that separated exact published Parent matches from the seven repaired-versus-published mismatches
  - Material Reference: [Current Site publication provider material reconciliation feedback](../../architect/continuity/001-35-current-site-publication-provider-material-reconciliation-feedback.trace.md)
  - Purpose: retain the evidence boundary Axiom is currently classifying
  - Availability: available

- prior-control-rotation
  - Material: earlier control/reference ownership boundary and cold-start branch preservation
  - Material Reference: [Control/reference successor condensed continuity handoff](007-control-reference-successor-condensed-continuity-handoff.trace.md)
  - Purpose: preserve that control/reference conversation continuity does not itself own active project execution
  - Availability: available

## Retained Responsibilities

- active-publication-semantic-classification
  - Retained By: Axiom
  - Responsibility: classify repaired-versus-published Parent representation and truthful unpublished Parent Origin semantics under the active Axiom 011 Handoff
  - Boundary: this control successor may review the return Q supplies but must not pre-answer or duplicate Axiom's task from convenience

- human-transport-and-actual-path-observation
  - Retained By: Q
  - Responsibility: carry normal Handoff packages and report actual UI/Viewer/transport observations
  - Boundary: Q is not a semantic synchronization bus and should not have to reconstruct hidden LLM context

## Exclusions And Dependencies

- active-route-duplication
  - Kind: excluded-scope
  - Description: do not open competing Axiom/repair/package-format execution merely because this successor has full workspace bytes
  - Responsible Party Or Role: Anchor

- carrier-format-premature-change
  - Kind: excluded-scope
  - Description: do not replace exploded workspaces, `handoff.material`, `tiinex.package` controls or bootstrap placement until Tooling 027 classifies exact responsibilities and compatibility
  - Responsible Party Or Role: Anchor/Loom/Axiom

- cold-start-overclaim
  - Kind: excluded-scope
  - Description: do not claim fresh Role adoption or Tiinex-first preferred-path qualification merely because a model eventually completed a Handoff correctly
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: a fresh successor can recover current control/reference state, remain non-competing while Axiom 011 is active, and continue from returned durable evidence without predecessor chat access
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: nested workspace ZIPs are accepted carrier semantics, `tiinex.package` JSON is redundant, `handoff.material` can be removed, a new Skill schema is warranted, or Tooling 021/026/027 are ready for implementation in one tranche.
- Must Not Be Used To Claim: package filenames/directories create semantic identity, one chat transport implies one human identity, every Handoff is one-shot execution, native CLI use is forbidden, or a cold consumer has adopted its Role merely because its prose sounds Role-appropriate.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:XyR2Kg12oKxfWxXIu0Y-9C0nAoHUpt1f3hQGstXmTtg