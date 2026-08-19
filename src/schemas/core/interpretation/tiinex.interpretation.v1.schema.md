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
  - Current Schema: [tiinex.interpretation.v1](tiinex.interpretation.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for an explicit interpretation of an artifact, finding, signal, material, observation, or bounded target as another role without mutating the original.

---

# Interpretation

- Status: draft schema note

## Summary

Schema for an explicit interpretation of an artifact, finding, signal, material, observation, or bounded target as another role without mutating the original.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Interpretation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.interpretation.v1`

Rules

- `tiinex.interpretation.v1` identifies artifacts whose main job is to preserve interpretation semantics.
- An interpretation artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An interpretation artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Interpretation Body

Required Shape

- first body heading after the continuity envelope
- `## Interpretation Source` section
- `## Interpreted As` section
- `## Interpretation Basis` section
- `## Resulting Artifact Boundary` section
- `## Uncertainty And Review` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An interpretation artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Interpretation Source

Required Fields

- Source Target
- Source Role

Optional Fields

- Finding
- Evidence
- Signal
- Preserved Material
- Relation
- External Target

Rules

- `Interpretation Source` must remain human-readable and bounded.
- `Interpretation Source` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Source` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpreted As

Required Fields

- Target Role
- Interpretation Action

Optional Fields

- Candidate Schema
- Use As Label
- Rejected Role

Rules

- `Interpreted As` must remain human-readable and bounded.
- `Interpreted As` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpreted As` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Basis

Required Fields

- Rationale
- Observed Basis

Optional Fields

- Confidence
- Reviewer
- Context Needed

Rules

- `Interpretation Basis` must remain human-readable and bounded.
- `Interpretation Basis` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Basis` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Resulting Artifact Boundary

Required Fields

- Original Mutation Policy
- Result Boundary

Optional Fields

- Created Artifact
- Deferred Artifact
- No Artifact Created

Rules

- `Resulting Artifact Boundary` must remain human-readable and bounded.
- `Resulting Artifact Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Resulting Artifact Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Uncertainty And Review

Required Fields

- Uncertainty
- Review Need

Optional Fields

- Human Review
- Alternative Interpretations
- Open Questions

Rules

- `Uncertainty And Review` must remain human-readable and bounded.
- `Uncertainty And Review` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Uncertainty And Review` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Permission Limits
- Evidence Limits
- Authority Limits

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- use as feedback
- use as task
- use as evidence
- use as pointer
- use as resource need
- use as event
- use as relation
- reject interpretation
- defer interpretation

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-interpretation.trace.md`
- `<lineage>-<interpretation-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.interpretation.v1` when the main artifact value is the declared interpretation role.
- Do not use `tiinex.interpretation.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Source Target
- Source Role
- Target Role
- Interpretation Action
- Rationale
- Observed Basis
- Original Mutation Policy
- Result Boundary
- Uncertainty
- Review Need
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Use Finding As Feedback Candidate

## Interpretation Source

- Source Target: one discovery finding
- Source Role: found external comment

## Interpreted As

- Target Role: feedback candidate
- Interpretation Action: Use as feedback

## Interpretation Basis

- Rationale: comment is directed at project behavior
- Observed Basis: visible comment text was reviewed

## Resulting Artifact Boundary

- Original Mutation Policy: original finding remains unchanged
- Result Boundary: separate feedback artifact may be created

## Uncertainty And Review

- Uncertainty: source context may be incomplete
- Review Need: human review before treating as accepted feedback

## Interpretation Limits

- Does Not Prove: correctness, acceptance, consent, or task ownership
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Interpretation Source`, `## Interpreted As`, `## Interpretation Basis`, `## Resulting Artifact Boundary`, `## Uncertainty And Review`, `## Interpretation Limits`.

## Interpretation Notes

- interpretation owns explicit Use as semantics
- the original artifact is not mutated by interpretation
- interpretation is not proof that the chosen role is true or complete

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: IMYRR8KdL7Z7gKWmBRBKuTfTdl5y7rO8OElsx-9sdsE