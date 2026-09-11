# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.decision.v1](../../src/schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-05 19:33:11
  - Trace: [020-3-anchor-major-009-sibling-return-reconciliation-decision.trace.md](020-3-anchor-major-009-sibling-return-reconciliation-decision.trace.md)
  - Origin:
    - [relative](020-3-anchor-major-009-sibling-return-reconciliation-decision.trace.md)
- Current
  - Current Schema: [tiinex.relation.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/relation/tiinex.relation.v1.schema.md)
  - Created At: 2026-09-05 19:33:12
  - Authors: Anchor
  - Why: A cold recipient must be able to discover why this Site work exists without broadening Parent or inferring organization from repository placement.
  - Summary: Declare the qualified work-provenance edge from current Site grounding work to its controlling Business cold-start ingress work.
  - Status: ready/local

---

# Cold-Start Grounding Work Provenance

## Relation Declaration

- Relation Type: advances
- Relation Direction: current Site cold-start grounding work -> controlling Business cold-start ingress work
- Relation Scope: work-level provenance
- Relation Family: work-provenance

## Relation Source

- Source: [Cold-Start Grounding And Handoff Trust Hardening](020-cold-start-grounding-handoff-trust-hardening.task.trace.md)
- Source Meaning: current bounded Site execution-work anchor whose organizational origin must be recoverable by a cold recipient.

## Relation Target

- Target: [Portable Handoff, Cold-Start And LLM Ingress](business::.topics/initiatives/001-2-2-portable-handoff-cold-start-ingress-task.trace.md)
- Target Meaning: qualified Business work artifact that controls the organizational cold-start/ingress outcome advanced by this Site Major.

## Relation Boundary

- This is a typed work-provenance relation, not the Tiinex continuity Parent of the Relation Artifact or the Site Task.
- The relation does not prove delegation, responsibility transfer, priority, acceptance, completion, validation, or success.
- Reverse discovery from the Business target to this Site work is a projection of this same qualified edge and does not require an inverse Business artifact.
- Repository names, workspace IDs, paths, branches, graph proximity, or conversational narration must not be used as substitutes for this declared relation.

## Evidence Basis

- Axiom's accepted Work-Provenance And Grounding Semantics Decision defines the `work-provenance` family, exact-predicate preservation, source-to-upstream direction, reverse discovery, and fail-visible unresolved boundary.
- The original Anchor-to-Axiom Handoff identifies this Business Task as the concrete controlling organizational work for the current Tiinex dogfood case.

## Interpretation Limits

- `advances` is the exact predicate for this concrete edge only; generic Tooling must preserve it rather than universalize it.
- This relation is Tiinex dogfood data, not a requirement that unrelated organizations use Business/Site, Initiative/Epic vocabulary, or the same work topology.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-3-anchor-major-009-sibling-return-reconciliation-decision.trace.md](020-3-anchor-major-009-sibling-return-reconciliation-decision.trace.md)
  - Value: U_2dGlYmTIej7zt96ThWDutPgKFEu76kMPskGMKQWgM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0glIbG4IM9IbG5IxyuXe1-mzy4R4Wf0Y91pjaQDusfE