# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.party.v1](../tiinex.party.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Trace: [tiinex.party.v1.schema.md](../tiinex.party.v1.schema.md)
  - Origin:
    - [relative](../tiinex.party.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md)
- Current
  - Current Schema: [tiinex.party.organization.v1](tiinex.party.organization.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for an organization, company, institution, department, unit, or formal organizational party without treating the reference as legal proof or representation authority.

---

# Party Organization

- Status: draft schema note

## Summary

Schema for an organization, company, institution, department, unit, or formal organizational party without treating the reference as legal proof or representation authority.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Party Organization Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.party.organization.v1`

Rules

- `tiinex.party.organization.v1` identifies artifacts whose main job is to preserve party organization semantics.
- A party organization artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A party organization artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Party Specialization

Rules

- Party organization artifacts specialize the inherited `Party Body` for artifacts whose `Current -> Current Schema` is `tiinex.party.organization.v1`.
- The child body replaces the parent party body sections for `tiinex.party.organization.v1` artifacts.
- `Organization Body` is the local body contract for this child schema.
- Organization Identity specializes Party Identity.
- Organization Boundary specializes Party Boundary.
- Unit Or Parent Relationship specializes social or organizational relation context without changing Tiinex Parent.
- Representation Boundary preserves role, authority, and interpretation limits.
- Parent party specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.


### Party Organization Body

Required Shape

- first body heading after the continuity envelope
- `## Organization Identity` section
- `## Organization Boundary` section
- `## Unit Or Parent Relationship` section
- `## Representation Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A party organization artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Organization Identity

Required Fields

- Organization Label
- Organization Kind

Optional Fields

- Canonical Identifier
- Public Name
- Jurisdiction Or Region
- Website Or Source

Rules

- `Organization Identity` must remain human-readable and bounded.
- `Organization Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Organization Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Organization Boundary

Required Fields

- In Scope
- Out Of Scope

Optional Fields

- Department
- Unit
- Subsidiary
- Host Institution

Rules

- `Organization Boundary` must remain human-readable and bounded.
- `Organization Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Organization Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Unit Or Parent Relationship

Required Fields

- Relationship State

Optional Fields

- Parent Organization
- Child Unit
- Related Organization
- Relation Artifact

Rules

- `Unit Or Parent Relationship` must remain human-readable and bounded.
- `Unit Or Parent Relationship` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Unit Or Parent Relationship` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Representation Boundary

Required Fields

- Who May Represent
- What Is Not Proven

Optional Fields

- Role Artifact
- Instrument Artifact
- Attestation

Rules

- `Representation Boundary` must remain human-readable and bounded.
- `Representation Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Representation Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Legal Existence Limits
- Authority Limits

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- company
- institution
- department
- team unit
- public authority
- lab
- association
- project organization

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-party-organization.trace.md`
- `<lineage>-<party-organization-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.party.organization.v1` when the main artifact value is the declared party organization role.
- Do not use `tiinex.party.organization.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Organization Label
- Organization Kind
- In Scope
- Out Of Scope
- Relationship State
- Who May Represent
- What Is Not Proven
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Party Organization Example

## Organization Identity

- Organization Label: bounded example for tiinex.party.organization.v1
- Organization Kind: bounded example for tiinex.party.organization.v1

## Organization Boundary

- In Scope: bounded example for tiinex.party.organization.v1
- Out Of Scope: bounded example for tiinex.party.organization.v1

## Unit Or Parent Relationship

- Relationship State: bounded example for tiinex.party.organization.v1

## Representation Boundary

- Who May Represent: bounded example for tiinex.party.organization.v1
- What Is Not Proven: bounded example for tiinex.party.organization.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.party.organization.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Organization Identity`, `## Organization Boundary`, `## Unit Or Parent Relationship`, `## Representation Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- organization reference is not proof of legal existence
- representation and signing authority need separate support

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.party.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md)
  - Value: m-C4EsPECe8ZZ4rJ_99MlV5ougMsI_gIDtCCDk1MLWY

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: c8LRSi6GueatKltEfsNUZ6i4kD3o5xdcUuovbZAe_fE