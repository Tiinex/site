<!-- Tiinex web schema snapshot: local embedded copy bound by adjacent .schema.json. Path is a discovery hint; schema identity and contract remain inside the artifact. -->

# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Root schema for Tiinex lineage artifacts with repair-note support.

---

# Root

## Summary

Defines the minimum shared contract for Tiinex lineage artifacts.

Root requires schema identity, creation time, continuity position, and integrity footer. Descendant schema contracts are additive unless they explicitly define an override. Validators must read `Schema Validation Contract` as the validation surface and must preserve unknown envelope fields by default.

## Schema Validation Contract

### Machine Authority Surfaces

Validation Authority

- Schema Validation Contract

Generation Authority

- Artifact Creation Contract

Integrity Authority

- Continuity Integrity

Rules

- Validators must read `Schema Validation Contract` as the validation surface.
- Validators must not infer extra required fields from non-authoritative prose sections.
- `Artifact Creation Contract` defines generation when present.
- Descendant schema contracts are additive unless they explicitly define an override.

### Unknown Handling

Applies To

- contract category labels
- envelope fields
- extension declarations

Rules

- Declared but unsupported contract category labels are `preserve` and may also be `warning`.
- Undeclared contract category labels are `error` when full schema lineage is available.
- Undeclared contract category labels are `warning` when full schema lineage is unavailable.
- Unknown envelope fields are `preserve` by default.

