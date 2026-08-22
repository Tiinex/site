# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](tiinex.preservation.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for material that has been captured, copied, archived, photographed, transcribed, exported, taken into custody, or otherwise made available for later judgment.

---

# Preservation

- Status: draft schema note

## Summary

Schema for material that has been captured, copied, archived, photographed, transcribed, exported, taken into custody, or otherwise made available for later judgment.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Preservation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.preservation.v1`

Rules

- `tiinex.preservation.v1` identifies artifacts whose main job is to preserve preservation semantics.
- A preservation artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A preservation artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Preservation Body

Required Shape

- first body heading after the continuity envelope
- `## Preserved Material` section
- `## Preservation Act` section
- `## Provenance` section
- `## Fidelity And Loss` section
- `## Custody Or Storage Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A preservation artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Preserved Material

Required Fields

- Material Description
- Material Kind

Optional Fields

- Material Reference
- External Payload
- Represented Subject
- Source

Rules

- `Preserved Material` must remain human-readable and bounded.
- `Preserved Material` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Preserved Material` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Preservation Act

Required Fields

- Preservation Method
- Preservation Time Or State

Optional Fields

- Actor
- Tool
- Adapter
- Capture Conditions

Rules

- `Preservation Act` must remain human-readable and bounded.
- `Preservation Act` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Preservation Act` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Provenance

Required Fields

- Known Source
- Provenance Limits

Optional Fields

- Origin
- Source Artifact
- Access Artifact
- Relation

Rules

- `Provenance` must remain human-readable and bounded.
- `Provenance` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Provenance` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Fidelity And Loss

Required Fields

- Fidelity Notes
- Known Losses

Optional Fields

- Transformation
- Redaction
- Excerpting
- Uncertainty

Rules

- `Fidelity And Loss` must remain human-readable and bounded.
- `Fidelity And Loss` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Fidelity And Loss` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Custody Or Storage Boundary

Required Fields

- Storage Or Custody State
- Reuse Boundary

Optional Fields

- Retention
- Privacy Boundary
- Safety Boundary
- Permission Boundary

Rules

- `Custody Or Storage Boundary` must remain human-readable and bounded.
- `Custody Or Storage Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Custody Or Storage Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Not Yet Used As

Optional Fields

- Possible Evidence Use
- Possible Review Use
- Open Questions

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- photo capture
- scan
- transcript
- export
- archive copy
- custody record
- snapshot
- sample preservation
- attachment reference
- external payload reference

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-preservation.trace.md`
- `<lineage>-<preservation-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.preservation.v1` when the main artifact value is the declared preservation role.
- Do not use `tiinex.preservation.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Material Description
- Material Kind
- Preservation Method
- Preservation Time Or State
- Known Source
- Provenance Limits
- Fidelity Notes
- Known Losses
- Storage Or Custody State
- Reuse Boundary
- Does Not Prove
- Not Yet Used As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Field Note Photo Preservation

## Preserved Material

- Material Description: photograph of one selected field notebook page
- Material Kind: photo capture of handwritten note

## Preservation Act

- Preservation Method: explicit photo capture
- Preservation Time Or State: captured during field review

## Provenance

- Known Source: selected field notebook page
- Provenance Limits: surrounding notebook context not preserved

## Fidelity And Loss

- Fidelity Notes: image readable in most areas
- Known Losses: uncertain handwriting and page-edge crop

## Custody Or Storage Boundary

- Storage Or Custody State: local preserved attachment candidate
- Reuse Boundary: use with privacy and custody review

## Interpretation Limits

- Does Not Prove: truth of note contents
- Not Yet Used As: evidence until a claim-bearing evidence artifact owns that role
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Preserved Material`, `## Preservation Act`, `## Provenance`, `## Fidelity And Loss`, `## Custody Or Storage Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- preservation may happen before evidence use
- preservation is not truth, consent, or authority
- evidence is a claim-bearing downstream use of preserved material

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: -q95qSqFk3AJ0jyU4dsOsRkY5KVWIbsa7ubzqxa3hhE