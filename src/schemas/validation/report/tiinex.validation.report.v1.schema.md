# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/5b1b3db377b8bc95ba99d0a9ef1fe441cdab24cb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.validation.report.v1](tiinex.validation.report.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a bounded validation pass or review run that collects validation findings, methods, scope, summary, and remaining limits.

---

# Validation Report

- Status: draft schema note

## Summary

Schema for a bounded validation pass or review run that collects validation findings, methods, scope, summary, and remaining limits.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Validation Report Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.validation.report.v1`

Rules

- `tiinex.validation.report.v1` identifies artifacts whose main job is to preserve validation report semantics.
- A validation report artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A validation report artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Validation Report Body

Required Shape

- first body heading after the continuity envelope
- `## Report Scope` section
- `## Validation Methods` section
- `## Findings Summary` section
- `## Finding List` section
- `## Run Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A validation report artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Report Scope

Required Fields

- Scope
- Targets

Optional Fields

- Project
- Workspace
- Artifact Set
- Time Window

Rules

- `Report Scope` must remain human-readable and bounded.
- `Report Scope` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Report Scope` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Validation Methods

Required Fields

- Methods Used
- Method Boundaries

Optional Fields

- Validation Method Artifacts
- Tool Versions
- Human Review

Rules

- `Validation Methods` must remain human-readable and bounded.
- `Validation Methods` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Validation Methods` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Findings Summary

Required Fields

- Summary
- Overall State

Optional Fields

- Pass Count
- Warning Count
- Fail Count
- Skipped Count
- Unavailable Count

Rules

- `Findings Summary` must remain human-readable and bounded.
- `Findings Summary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Findings Summary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Finding List

Required Fields

- Findings

Optional Fields

- Finding Artifacts
- Grouped Findings
- Suppressed Findings

Rules

- `Finding List` must remain human-readable and bounded.
- `Finding List` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Finding List` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Run Boundary

Required Fields

- Run Context
- What Was Not Checked

Optional Fields

- Environment
- Input Selection
- Incomplete Checks

Rules

- `Run Boundary` must remain human-readable and bounded.
- `Run Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Run Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Hide

Optional Fields

- Open Risks
- Follow-Up Needed

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- schema validation report
- continuity validation report
- checksum report
- human review report
- mixed validation report

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-validation-report.trace.md`
- `<lineage>-<validation-report-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.validation.report.v1` when the main artifact value is the declared validation report role.
- Do not use `tiinex.validation.report.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Scope
- Targets
- Methods Used
- Method Boundaries
- Summary
- Overall State
- Findings
- Run Context
- What Was Not Checked
- Does Not Prove
- Must Not Hide

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Schema Draft Validation Report

## Report Scope

- Scope: selected schema draft files
- Targets: one draft batch

## Validation Methods

- Methods Used: section-shape review and human-readable boundary review
- Method Boundaries: no checksum verification in this draft

## Findings Summary

- Summary: draft is ready for external review
- Overall State: warnings possible until footer tooling runs

## Finding List

- Findings: no blocking findings recorded in this example

## Run Boundary

- Run Context: pre-checksum draft review
- What Was Not Checked: final continuity integrity values

## Interpretation Limits

- Does Not Prove: final merge-readiness or semantic correctness
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Report Scope`, `## Validation Methods`, `## Findings Summary`, `## Finding List`, `## Run Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- validation report aggregates findings without turning them into universal truth
- skipped and unavailable checks should remain visible
- report scope must not silently expand beyond selected targets

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/5b1b3db377b8bc95ba99d0a9ef1fe441cdab24cb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: ek24us3jtUoLRyUcK4FNBX60fvg4UbW1KFrI4nBB3VI