# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-05 17:24:05
  - Trace: [020-1-anchor-cold-start-grounding-handoff-trust-discovery.trace.md](020-1-anchor-cold-start-grounding-handoff-trust-discovery.trace.md)
  - Origin:
    - [relative](020-1-anchor-cold-start-grounding-handoff-trust-discovery.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-05 17:24:59
  - Authors: Anchor
  - Why: A qualified Relation capacity exists, but the current source does not authorize Anchor to invent a generic work-causation predicate.
  - Summary: Delegate the domain-neutral work-provenance and grounding semantic boundary without broadening Parent.
  - Status: ready/local

---

# Cold-Start Grounding Work-Provenance Semantics — Anchor To Axiom

## Handoff Parties

- Purpose: reconcile only the canonical semantic boundary required for a cold recipient to discover why technical work exists and how it relates to controlling organizational/project work without broadening artifact Parent.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Major Planning Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Axiom
- To Kind: role
- To Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)

## Transfers

- work-provenance-relation-semantics
  - Transfer Kind: work-and-responsibility
  - Description: determine the smallest domain-neutral canonical relation contract by which an organizational Project/Initiative/Epic/outcome/Task that causes technical work can be traversably connected to the technical work root or work-spawning Handoff while preserving Parent as direct artifact continuity.
  - Controlling Artifact: [Cold-Start Grounding And Handoff Trust Hardening](020-cold-start-grounding-handoff-trust-hardening.task.trace.md)
  - Boundary: semantic disposition only; do not implement Site Tooling, duplicate technical task trees into Business, or invent Tiinex-specific role/repository vocabulary.

- grounding-projection-semantics
  - Transfer Kind: work-and-responsibility
  - Description: state how a cold-start projection may expose controlling organizational/project context and unresolved work provenance without turning the projection into authority or inferring relations from prose, path, repository placement, or names.
  - Controlling Artifact: [Anchor Grounding Discovery](020-1-anchor-cold-start-grounding-handoff-trust-discovery.trace.md)
  - Boundary: grounding may derive only from qualified declared relations/material; unresolved must remain visible.

- participant-input-authority-boundary
  - Transfer Kind: work-and-responsibility
  - Description: determine whether existing Root/Role/Feedback/Decision/Handoff semantics already suffice to say ordinary participant/human input is observation/feedback by default and becomes authoritative only through an explicit qualified transition/decision/acceptance boundary, or whether a minimal canonical clarification is genuinely needed.
  - Boundary: do not hardcode Sigma, human-first role names, or assume every project has the same acceptance topology.

## Required Context

- controlling-task
  - Material: Cold-Start Grounding And Handoff Trust Hardening
  - Material Reference: [Task](020-cold-start-grounding-handoff-trust-hardening.task.trace.md)
  - Purpose: exact Major scope, Done Criteria, genericity requirements, and exclusions.
  - Availability: available

- anchor-discovery
  - Material: Cold-Start Grounding And Handoff Trust — Anchor Discovery
  - Material Reference: [Discovery](020-1-anchor-cold-start-grounding-handoff-trust-discovery.trace.md)
  - Purpose: exact observed semantic/mechanical seam and candidate relation boundary.
  - Availability: available

- business-cold-start-outcome
  - Material: Portable Handoff, Cold-Start And LLM Ingress
  - Material Reference: [Business Task](business::.topics/initiatives/001-2-2-portable-handoff-cold-start-ingress-task.trace.md)
  - Purpose: concrete dogfood example of controlling organizational work that currently lacks first-class technical work-provenance traversal.
  - Availability: available

- relation-schema
  - Material: generic Relation schema
  - Material Reference: [Relation](docs::.topics/.schemas/relation/tiinex.relation.v1.schema.md)
  - Purpose: preserve Parent narrowness and determine whether ordinary typed relation projection or a first-class Relation Artifact is appropriate.
  - Availability: available

- sigma-work-provenance-feedback
  - Material: Sigma cross-repository work-provenance grounding feedback
  - Material Reference: [Feedback](017-2-sigma-cross-repository-work-provenance-grounding-feedback.trace.md)
  - Purpose: preserve the human observation that cold recipients and organizational discovery must be able to understand how spawned work relates to the larger project/org context.
  - Availability: available

## Reference Context

- tooling-project
  - Material: Tiinex Tooling Project
  - Material Reference: [Project](business::.topics/initiatives/001-2-tooling-project.trace.md)
  - Purpose: upper organizational context for the concrete cold-start Business Task.
  - Availability: available

- approved-major-plan
  - Material: Sigma-approved Foundation Major plan
  - Material Reference: [Decision](017-1-sigma-foundation-major-plan-approval-decision.trace.md)
  - Purpose: preserve the Grounding/Handoff Trust Major boundary before lifecycle/reduction/Viewer work.
  - Availability: available

## Retained Responsibilities

- mechanical-grounding-and-handoff-implementation
  - Retained By: Loom / bounded implementation authority
  - Responsibility: work only on semantics-independent Tooling mechanics in its sibling route; do not implement organizational work-provenance semantics before Axiom returns.

- major-coherence-and-integration
  - Retained By: Anchor
  - Responsibility: reconcile Axiom and Loom independently, map any accepted semantic relation into generic Tooling, reforecast the Major, and preserve the full-source landing boundary.

- human-feedback-and-later-acceptance
  - Retained By: Sigma / declared human-carriable role in this project
  - Responsibility: continue as transport/observation by default; no statement is promoted to acceptance unless explicit.

## Exclusions And Dependencies

- no-parent-broadening
  - Kind: excluded-scope
  - Description: do not use Parent as generic Initiative/Epic/project membership or work-causation just to make the graph connected.

- no-business-duplication
  - Kind: excluded-scope
  - Description: do not copy Site/Docs implementation task trees into Business merely to provide downward discovery.

- no-tiinex-predicate
  - Kind: excluded-scope
  - Description: the relation contract must work for unrelated organizations, repositories, project structures, and role names.

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no commit, push, merge, publication, deployment, or release.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Axiom returns a bounded semantic Decision/Discovery plus one full-source non-major Handoff Package to Anchor. The result must state the recommended generic work-provenance relation shape, direction and artifact-placement boundary; whether Relation Artifact materialization is required or optional; how grounding may project the relation and unresolved state; and whether existing participant-input authority semantics suffice or require a canonical clarification. No Site implementation or Major closure is claimed.
- Return To: Anchor
- Return To Reference: [Anchor Major Planning Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: Business becomes Parent of technical work, every artifact needs a direct organizational edge, every project uses Initiative/Epic vocabulary, a relation proves completion/acceptance, or current Tiinex folder/repository placement is semantic authority.
- Must Not Be Used To Claim: that prose Dependencies already constitute typed relations, that work provenance may be guessed when absent, or that grounding projections create canonical authority.
- Authority Limits: Axiom owns only the bounded canonical semantic disposition; Anchor retains architecture/integration; Loom retains mechanics; Sigma retains explicit human judgment/landing when invoked.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-1-anchor-cold-start-grounding-handoff-trust-discovery.trace.md](020-1-anchor-cold-start-grounding-handoff-trust-discovery.trace.md)
  - Value: sm2aSypwhdkX8QGHJH623l4gAcp0v92wT1GSvBhyMl4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: m66LMCriTZ9SwvGMs_ndMUAtw22SlSYBd1PwbxjGIsE