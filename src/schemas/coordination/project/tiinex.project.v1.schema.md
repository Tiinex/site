# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.project.v1](tiinex.project.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a bounded coordinated effort over time with purpose, scope, parties, resources, tasks, events, milestones, decisions, risks, and outcomes without making one project methodology the base concept.

---

# Project

- Status: draft schema note

## Summary

Schema for a bounded coordinated effort over time with purpose, scope, parties, resources, tasks, events, milestones, decisions, risks, and outcomes without making one project methodology the base concept.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Project Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.project.v1`

Rules

- `tiinex.project.v1` identifies artifacts whose main job is to preserve project semantics.
- A project artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A project artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Project Body

Required Shape

- first body heading after the continuity envelope
- `## Project Identity` section
- `## Project Purpose And Scope` section
- `## Parties And Resources` section
- `## Coordination State` section
- `## Milestones And Outcomes` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A project artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Project Identity

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Project Identity` must remain human-readable and bounded.
- `Project Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Project Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Project Purpose And Scope

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Project Purpose And Scope` must remain human-readable and bounded.
- `Project Purpose And Scope` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Project Purpose And Scope` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Parties And Resources

Required Fields

- Relevant Parties
- Relevant Resources

Optional Fields

- Roles
- Teams
- Organizations
- Facilities
- Tools
- Sources

Rules

- `Parties And Resources` must remain human-readable and bounded.
- `Parties And Resources` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Parties And Resources` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Coordination State

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Coordination State` must remain human-readable and bounded.
- `Coordination State` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Coordination State` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Milestones And Outcomes

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Milestones And Outcomes` must remain human-readable and bounded.
- `Milestones And Outcomes` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Milestones And Outcomes` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Open Questions
- Review Needed

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- coordinated effort
- internal project
- public project
- research project
- field project
- documentation project
- implementation project

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-project.trace.md`
- `<lineage>-<project-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.project.v1` when the main artifact value is the declared project role.
- Do not use `tiinex.project.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Description
- Boundary
- Relevant Parties
- Relevant Resources
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Project Example

## Project Identity

- Description: bounded example for tiinex.project.v1
- Boundary: bounded example for tiinex.project.v1

## Project Purpose And Scope

- Description: bounded example for tiinex.project.v1
- Boundary: bounded example for tiinex.project.v1

## Parties And Resources

- Relevant Parties: example project party or role
- Relevant Resources: example resource or bounded descriptor

## Coordination State

- Description: bounded example for tiinex.project.v1
- Boundary: bounded example for tiinex.project.v1

## Milestones And Outcomes

- Description: bounded example for tiinex.project.v1
- Boundary: bounded example for tiinex.project.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.project.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Project Identity`, `## Project Purpose And Scope`, `## Parties And Resources`, `## Coordination State`, `## Milestones And Outcomes`, `## Interpretation Limits`.

## Interpretation Notes

- project is coordinated work over time, not a project methodology
- project is not merely a large task or task board

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Uwp3zgWt3BFj_bOupL2Fhn2GM1kQ5_KaoAFJKA-xGbw