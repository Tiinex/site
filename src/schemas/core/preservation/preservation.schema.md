<!-- Tiinex web schema snapshot: local embedded copy bound by adjacent .schema.json. Path is a discovery hint; schema identity and contract remain inside the artifact. -->

# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](tiinex.preservation.v1.schema.md)
  - Summary: Schema for material captured, copied, archived, photographed, transcribed, exported, taken into custody, or otherwise made available for later judgment.

---

# Preservation

## Summary

Preservation artifacts state preserved material, preservation act, provenance, fidelity and loss, custody or storage boundary, and interpretation limits. Preservation is not truth, consent, authority, or evidence by itself.

## Schema Validation Contract

### Preservation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.preservation.v1`

Rules

- `tiinex.preservation.v1` identifies artifacts whose main job is to preserve preservation semantics.
- A preservation artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A preservation artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.

### Preservation Body

Required Shape

- first body heading after the continuity envelope
- `## Preserved Material` section
- `## Preservation Act` section
- `## Provenance` section
- `## Fidelity And Loss` section
- `## Custody Or Storage Boundary` section
- `## Interpretation Limits` section

### Interpretation Boundaries

Rules

- Use `tiinex.preservation.v1` when the main artifact value is the declared preservation role.
- Do not use `tiinex.preservation.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.

