# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.party.v1](tiinex.party.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a bounded party or actor reference such as a person, role, organization, group, institution, team, community, or other social/organizational participant.

---

# Party

- Status: draft schema note

## Summary

Schema for a bounded party or actor reference such as a person, role, organization, group, institution, team, community, or other social/organizational participant.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Party Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.party.v1`

Rules

- `tiinex.party.v1` identifies artifacts whose main job is to preserve party semantics.
- A party artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A party artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Party Body

Required Shape

- first body heading after the continuity envelope
- `## Party Identity` section
- `## Party Boundary` section
- `## Role Or Capacity` section
- `## Reference And Privacy Boundary` section
- `## Use With Other Schemas` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A party artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Party Identity

Required Fields

- Party Label
- Party Kind

Optional Fields

- Canonical Identifier
- Alias
- Public Name
- Private Descriptor

Rules

- `Party Identity` must remain human-readable and bounded.
- `Party Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Party Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Party Boundary

Required Fields

- In Scope
- Out Of Scope

Optional Fields

- Organization Boundary
- Group Boundary
- Role Boundary
- Temporal Boundary

Rules

- `Party Boundary` must remain human-readable and bounded.
- `Party Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Party Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Role Or Capacity

Required Fields

- Capacity
- Capacity Context

Optional Fields

- Role
- Authority Claim
- Responsibility
- Stakeholder Context

Rules

- `Role Or Capacity` must remain human-readable and bounded.
- `Role Or Capacity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Role Or Capacity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Reference And Privacy Boundary

Required Fields

- Reference Safety
- Disclosure Boundary

Optional Fields

- Contact Boundary
- Personal Data Boundary
- Sensitive Context

Rules

- `Reference And Privacy Boundary` must remain human-readable and bounded.
- `Reference And Privacy Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Reference And Privacy Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Use With Other Schemas

Required Fields

- Usable As
- Must Reference Separately

Optional Fields

- Project Use
- Event Use
- Invitation Use
- Availability Use
- Attestation Use

Rules

- `Use With Other Schemas` must remain human-readable and bounded.
- `Use With Other Schemas` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Use With Other Schemas` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Identity Limits
- Authority Limits
- Consent Limits

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- person
- role
- organization
- department
- team
- group
- community
- institution
- authority
- anonymous or bounded descriptor

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-party.trace.md`
- `<lineage>-<party-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.party.v1` when the main artifact value is the declared party role.
- Do not use `tiinex.party.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Party Label
- Party Kind
- In Scope
- Out Of Scope
- Capacity
- Capacity Context
- Reference Safety
- Disclosure Boundary
- Usable As
- Must Reference Separately
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Project Review Party

## Party Identity

- Party Label: project reviewer role
- Party Kind: role

## Party Boundary

- In Scope: reviewer role for one project review
- Out Of Scope: employment status or organization-wide authority

## Role Or Capacity

- Capacity: review participant
- Capacity Context: project review meeting

## Reference And Privacy Boundary

- Reference Safety: role-level reference only
- Disclosure Boundary: no personal identity disclosed

## Use With Other Schemas

- Usable As: meeting participant, invitation target, attesting party candidate
- Must Reference Separately: authority, consent, or employment proof

## Interpretation Limits

- Does Not Prove: identity, attendance, authority, or consent
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Party Identity`, `## Party Boundary`, `## Role Or Capacity`, `## Reference And Privacy Boundary`, `## Use With Other Schemas`, `## Interpretation Limits`.

## Interpretation Notes

- party is not identity proof
- party may be used where projects, events, invitations, attestations, and relations need a bounded actor reference
- membership, employment, authority, consent, and representation need separate support when they matter

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: y69b2mVaf-1TZ8Y1x62tMngm02RH5HBMOkvi9qyGkO8