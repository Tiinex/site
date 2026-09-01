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
  - Current Schema: [tiinex.party.role.v1](tiinex.party.role.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a bounded role, capacity, responsibility, or authority-facing position without treating the role as proof that a particular person holds it.

---

# Party Role

- Status: draft schema note

## Summary

Schema for a bounded role, capacity, responsibility, or authority-facing position without treating the role as proof that a particular person holds it.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Party Role Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.party.role.v1`

Rules

- `tiinex.party.role.v1` identifies artifacts whose main job is to preserve party role semantics.
- A party role artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A party role artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Party Specialization

Rules

- Party role artifacts specialize the inherited `Party Body` for artifacts whose `Current -> Current Schema` is `tiinex.party.role.v1`.
- The child body replaces the parent party body sections for `tiinex.party.role.v1` artifacts.
- `Role Body` is the local body contract for this child schema.
- Role Identity specializes Party Identity.
- Role Boundary specializes Party Boundary.
- Authority And Responsibility Boundary specializes Role Or Capacity without proving authority by itself.
- Holder Relationship preserves related-party semantics without becoming identity proof.
- Parent party specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.


### Party Role Body

Required Shape

- first body heading after the continuity envelope
- `## Role Identity` section
- `## Role Boundary` section
- `## Authority And Responsibility Boundary` section
- `## Holder Relationship` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A party role artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Role Identity

Required Fields

- Role Label
- Role Kind

Optional Fields

- Canonical Identifier
- Organization
- Project
- Group

Rules

- `Role Identity` must remain human-readable and bounded.
- `Role Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Role Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Role Boundary

Required Fields

- In Scope
- Out Of Scope

Optional Fields

- Valid From
- Valid Until
- Context

Rules

- `Role Boundary` must remain human-readable and bounded.
- `Role Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Role Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Authority And Responsibility Boundary

Required Fields

- May Do
- Does Not Authorize

Optional Fields

- Required Instrument
- Delegation
- Review Boundary

Rules

- `Authority And Responsibility Boundary` must remain human-readable and bounded.
- `Authority And Responsibility Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Authority And Responsibility Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Holder Relationship

Required Fields

- Holder State

Optional Fields

- Current Holder
- Possible Holder
- Unknown Holder
- Relation Artifact

Rules

- `Holder Relationship` must remain human-readable and bounded.
- `Holder Relationship` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Holder Relationship` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Employment Limits
- Consent Limits

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- project lead
- reviewer
- maintainer
- facilitator
- witness
- safety officer
- resource owner
- on-call role

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-party-role.trace.md`
- `<lineage>-<party-role-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.party.role.v1` when the main artifact value is the declared party role role.
- Do not use `tiinex.party.role.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Role Label
- Role Kind
- In Scope
- Out Of Scope
- May Do
- Does Not Authorize
- Holder State
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Party Role Example

## Role Identity

- Role Label: bounded example for tiinex.party.role.v1
- Role Kind: bounded example for tiinex.party.role.v1

## Role Boundary

- In Scope: bounded example for tiinex.party.role.v1
- Out Of Scope: bounded example for tiinex.party.role.v1

## Authority And Responsibility Boundary

- May Do: bounded example for tiinex.party.role.v1
- Does Not Authorize: bounded example for tiinex.party.role.v1

## Holder Relationship

- Holder State: bounded example for tiinex.party.role.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.party.role.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Role Identity`, `## Role Boundary`, `## Authority And Responsibility Boundary`, `## Holder Relationship`, `## Interpretation Limits`.

## Interpretation Notes

- role is not the person holding it
- role does not prove authority unless authority is separately supported

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.party.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md)
  - Value: m-C4EsPECe8ZZ4rJ_99MlV5ougMsI_gIDtCCDk1MLWY

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 7Uks6PbkiAVbdB0MOVxDnj6wg1-9r-3iVaHLvzVVhMA