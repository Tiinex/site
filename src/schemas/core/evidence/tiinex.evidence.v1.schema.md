<!-- Tiinex web schema snapshot: local embedded copy bound by adjacent .schema.json. Path is a discovery hint; schema identity and contract remain inside the artifact. -->

# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.preservation.v1](../preservation/tiinex.preservation.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](tiinex.evidence.v1.schema.md)
  - Summary: Schema for preserved material used to support, illuminate, test, or challenge a claim or question, inheriting preservation boundaries.

---

# Evidence

## Summary

Evidence is preserved material placed in relation to a supported claim, question, decision input, review, or interpretation while keeping interpretation limits visible. Evidence does not make the supported claim true by itself.

## Schema Validation Contract

### Evidence Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.evidence.v1`

Rules

- `tiinex.evidence.v1` identifies artifacts centered on preserved supporting material used for a claim, question, review, or interpretation.
- Evidence artifacts inherit `tiinex.preservation.v1` semantics for preserved material, provenance, fidelity, custody or storage boundary, and interpretation limits.
- Evidence artifacts must not silently become truth, attestation, validation, consent, decision, relation, or authority artifacts.

### Parent Preservation Specialization

Rules

- Evidence narrows preservation by adding a supported claim, question, or issue.
- Evidence uses preserved material; it does not create preservation merely by linking, seeing, fetching, or temporarily holding material.

### Evidence Body

Required Shape

- first body heading after the continuity envelope
- `## Supported Claim Or Question` section
- `## Provenance` section
- `## Evidence Material` section
- `## Preservation And Fidelity` section
- `## Interpretation Limits` section

