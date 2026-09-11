# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.relation.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/relation/tiinex.relation.v1.schema.md)
  - Created At: 2026-09-05 19:33:12
  - Trace: [020-3-1-anchor-cold-start-grounding-work-provenance-relation.trace.md](020-3-1-anchor-cold-start-grounding-work-provenance-relation.trace.md)
  - Origin:
    - [relative](020-3-1-anchor-cold-start-grounding-work-provenance-relation.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-05 19:33:12
  - Authors: Anchor
  - Why: The sibling returns now converge and the remaining bounded step is mechanical semantic integration with neutral and Tiinex dogfood proof.
  - Summary: Integrate Axiom's accepted work-provenance and participant-authority semantics into Loom's qualified generic grounding mechanics.
  - Status: ready/local

---

# Grounding Work-Provenance Semantic Integration — Anchor To Loom

## Handoff Parties

- Purpose: integrate the accepted work-provenance and participant-authority semantic boundary into the already-qualified generic grounding/Handoff mechanics without broadening Parent or reintroducing Tiinex-specific assumptions.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Major Planning Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- work-provenance-grounding-projection
  - Transfer Kind: work-and-responsibility
  - Description: implement qualified `Relation Family: work-provenance` discovery in Grounding Capsule/current grounding projections from loaded carried material, preserving the exact relation type, source work anchor, target controlling/originating work artifact, scope, direction, basis, target resolution state, and fail-visible unresolved state.
  - Controlling Artifact: [Cold-Start Grounding And Handoff Trust Hardening](020-cold-start-grounding-handoff-trust-hardening.task.trace.md)
  - Boundary: only qualified typed relation material or another active contract with equivalent typed semantics may produce a qualified edge; do not infer from Parent, Dependencies, Required Context, prose, filenames, repository/workspace names, branches, graph proximity, or chat.

- reverse-work-provenance-discovery
  - Transfer Kind: work-and-responsibility
  - Description: support reverse discovery over the same qualified edge so controlling/originating work can discover spawned execution work without inverse duplicate artifacts or upstream workspace mutation.
  - Boundary: reverse indexing is projection/navigation only and must not become new semantic authority or elect a primary controller when multiple upstream edges exist.

- participant-authority-grounding
  - Transfer Kind: work-and-responsibility
  - Description: improve the capsule/grounding authority projection so participant/Role authority basis is recoverable from qualified declared material where available, while preserving unresolved authority when no basis exists.
  - Boundary: do not encode `human input is feedback` as a universal rule; identity/humanness/conversation position alone grants no authority, and project-specific stronger rules must be grounded from qualified artifacts.

- dogfood-and-neutral-proof
  - Transfer Kind: work-and-responsibility
  - Description: use the carried Site `work-provenance` Relation as the Tiinex dogfood edge and add at least one unrelated neutral fixture/profile proving the generic path does not depend on Tiinex organization, workspace, role, branch, or schema-specific planning names.
  - Boundary: Tiinex fixture/configuration is allowed only as data, never generic runtime semantics.

## Required Context

- controlling-task
  - Material: Cold-Start Grounding And Handoff Trust Hardening
  - Material Reference: [Task](020-cold-start-grounding-handoff-trust-hardening.task.trace.md)
  - Purpose: exact Major scope and Done Criteria.
  - Availability: available

- anchor-reconciliation
  - Material: Major 009 Sibling Return Reconciliation
  - Material Reference: [Decision](020-3-anchor-major-009-sibling-return-reconciliation-decision.trace.md)
  - Purpose: accepted integration boundary between Axiom semantics and Loom mechanics.
  - Availability: available

- axiom-semantics
  - Material: Work-Provenance And Grounding Semantics Decision
  - Material Reference: [Decision](020-1-1-1-axiom-work-provenance-grounding-semantics-decision.trace.md)
  - Purpose: canonical relation, projection, and participant-authority semantics.
  - Availability: available

- loom-mechanics-evidence
  - Material: Loom Grounding Handoff Genericity Mechanics Implementation Evidence
  - Material Reference: [Evidence](020-2-loom-grounding-handoff-genericity-mechanics-implementation-evidence.trace.md)
  - Purpose: current accepted mechanical basis and permanent regression ownership.
  - Availability: available

- dogfood-work-provenance
  - Material: Cold-Start Grounding Work Provenance
  - Material Reference: [Relation](020-3-1-anchor-cold-start-grounding-work-provenance-relation.trace.md)
  - Purpose: exact qualified Tiinex dogfood edge from current Site work to controlling Business work.
  - Availability: available

## Reference Context

- business-cold-start-outcome
  - Material: Portable Handoff, Cold-Start And LLM Ingress
  - Material Reference: [Business Task](business::.topics/initiatives/001-2-2-portable-handoff-cold-start-ingress-task.trace.md)
  - Purpose: upstream dogfood target only; do not duplicate its technical work tree into Business.
  - Availability: available

## Retained Responsibilities

- major-integration-and-closure
  - Retained By: Anchor
  - Responsibility: independently rerun the returned implementation, measure cold-start quality, reconcile residual gaps, and decide later Major closure/landing readiness.

- canonical-semantics
  - Retained By: Axiom / declared semantic authority
  - Responsibility: re-enter only if implementation exposes a genuine contradiction not settled by the accepted Decision.

- human-observation-and-later-landing
  - Retained By: Sigma / declared human-carriable role in this project
  - Responsibility: transport/observation by default; later explicit human landing/acceptance only when invoked.

## Exclusions And Dependencies

- no-parent-broadening
  - Kind: excluded-scope
  - Description: Parent remains direct artifact continuity only.

- no-lifecycle-major
  - Kind: excluded-scope
  - Description: do not start artifacted readiness/lifecycle or destructive Reduction work.

- no-broad-schema-or-viewer-work
  - Kind: excluded-scope
  - Description: no broad schema fan-out, catalog normalization, or Viewer PoC parity implementation.

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no commit, push, deployment, publication, or release.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one non-major full-source Business+Docs+Site Handoff Package with the bounded semantic integration, neutral regressions, Tiinex dogfood proof, focused/type/integration qualification, explicit static-debt state, and any residual Major 009 blockers. Do not claim Major closure or human acceptance.
- Return To: Anchor
- Return To Reference: [Anchor Major Planning Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: work provenance becomes Parent, Business becomes parent of technical work, every project has one controlling upstream, human input is universally feedback, or Tiinex org vocabulary is generic Tooling semantics.
- Must Not Be Used To Claim: inferred organization context from repositories/branches, inferred authority from conversation position, reverse-index projection as source mutation, or Major closure.
- Authority Limits: Loom implements the accepted bounded semantics mechanically; Anchor retains integration/closure, Axiom retains unresolved canonical semantics, and Sigma retains explicit human judgment when invoked.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-3-1-anchor-cold-start-grounding-work-provenance-relation.trace.md](020-3-1-anchor-cold-start-grounding-work-provenance-relation.trace.md)
  - Value: 0glIbG4IM9IbG5IxyuXe1-mzy4R4Wf0Y91pjaQDusfE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 2hwgq5CWF7cHM13Vk-GYn1Lqw2rjh49ZzaKzKwPN92I