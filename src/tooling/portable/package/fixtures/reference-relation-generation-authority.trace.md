# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.schema.generation.v1
  - Created At: 2026-08-19 00:00:00
  - Summary: Portable generation authority fixture for one durable Relation draft.

---

# Reference Relation Generation Authority

## Generation Identity

- Generation Handle: reference-relation-draft
- Generation Name: Reference relation draft generation
- Generation Kind: artifact-filled

## Generation Target

- Target Schema: tiinex.relation.v1
- Target Output: full Relation artifact draft

## Required Inputs

- Subject Binding
  - Input Source Policy: imported-input
  - Unknown Handling: mark-unknown

- Predicate Identifier
  - Input Source Policy: imported-input
  - Unknown Handling: mark-unknown

- Predicate Meaning
  - Input Source Policy: imported-input
  - Unknown Handling: mark-unknown

- Object Binding
  - Input Source Policy: imported-input
  - Unknown Handling: mark-unknown

- Directionality
  - Input Source Policy: imported-input
  - Unknown Handling: mark-unknown

## Generation Steps

- create-relation-declaration
  - Step Action: create-section
  - Step Order: 10
  - Uses Section Contract: relation-declaration

- create-relation-target
  - Step Action: create-section
  - Step Order: 20
  - Uses Section Contract: relation-target

- preserve-reference-meaning
  - Step Action: fill-value
  - Step Order: 30
  - Review Needed: yes

- preserve-relation-boundary
  - Step Action: add-limit
  - Step Order: 40
  - Review Needed: yes

## Output Boundary

- Output Kind: filled-draft
- Review State: unreviewed draft
- Mutation Policy: local-draft-only
- Save Policy: caller-owned

## Interpretation Limits

- Does Not Mean: Tooling authorizes Reference execution or invents predicate, Parent, placement, provenance, or relation truth.
- Must Not Be Used To Claim: the Relation draft is validated, reviewed, persisted, published, or semantically authorized beyond the supplied Transition and generation authorities.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: test-fixture-not-canonical
