# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/78a3673444666f1145be4feca6e7eb1476a44281/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.validation.finding.v1](tiinex.validation.finding.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for one concrete validation observation against a bounded target using a declared method or check boundary.

---

# Validation Finding

- Status: draft schema note

## Summary

Schema for one concrete validation observation against a bounded target using a declared method or check boundary.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Validation Finding Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.validation.finding.v1`

Rules

- `tiinex.validation.finding.v1` identifies artifacts whose main job is to preserve validation finding semantics.
- A validation finding artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A validation finding artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Validation Finding Body

Required Shape

- first body heading after the continuity envelope
- `## Validation Target` section
- `## Validation Method` section
- `## Observed Result` section
- `## Finding Boundary` section
- `## Suggested Response` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A validation finding artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Validation Target

Required Fields

- Target
- Target Kind

Optional Fields

- Artifact
- Payload
- Schema
- Method
- Line Or Section

Rules

- `Validation Target` must remain human-readable and bounded.
- `Validation Target` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Validation Target` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Validation Method

Required Fields

- Method
- Method Scope

Optional Fields

- Validation Method Artifact
- Tool
- Human Review Method

Rules

- `Validation Method` must remain human-readable and bounded.
- `Validation Method` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Validation Method` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Observed Result

Required Fields

- Status
- Observation

Optional Fields

- Pass
- Warning
- Fail
- Skipped
- Unavailable
- Inconclusive
- Finding Code
- Severity

Rules

- `Observed Result` must remain human-readable and bounded.
- `Observed Result` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Observed Result` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Finding Boundary

Required Fields

- What Was Checked
- What Was Not Checked

Optional Fields

- Required Context
- Known Limitation
- False Positive Risk
- False Negative Risk

Rules

- `Finding Boundary` must remain human-readable and bounded.
- `Finding Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Finding Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Suggested Response

Required Fields

- Recommended Response

Optional Fields

- Repair Suggestion
- Human Review
- Ignore Rationale
- Follow-Up Artifact

Rules

- `Suggested Response` must remain human-readable and bounded.
- `Suggested Response` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Suggested Response` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Trust Boundary
- Open Questions

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- pass
- warning
- fail
- skipped
- unavailable
- inconclusive
- blocked
- needs human review

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-validation-finding.trace.md`
- `<lineage>-<validation-finding-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.validation.finding.v1` when the main artifact value is the declared validation finding role.
- Do not use `tiinex.validation.finding.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Target
- Target Kind
- Method
- Method Scope
- Status
- Observation
- What Was Checked
- What Was Not Checked
- Recommended Response
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Continuity Footer Warning

## Validation Target

- Target: one trace artifact
- Target Kind: markdown artifact

## Validation Method

- Method: continuity footer check
- Method Scope: footer presence and method recognition

## Observed Result

- Status: warning
- Observation: legacy method used

## Finding Boundary

- What Was Checked: footer method label
- What Was Not Checked: truth, authorship, consent, or claim correctness

## Suggested Response

- Recommended Response: upgrade footer when tooling is ready

## Interpretation Limits

- Does Not Prove: artifact content is true or false
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Validation Target`, `## Validation Method`, `## Observed Result`, `## Finding Boundary`, `## Suggested Response`, `## Interpretation Limits`.

## Interpretation Notes

- validation finding records a bounded check result
- the method scope controls what the finding can and cannot mean
- a finding may suggest repair but is not the repair itself

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/78a3673444666f1145be4feca6e7eb1476a44281/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: SaEuCTN9eOJFDouyHzUn8i9rRnSbtj_1uXOz4w1W29Y