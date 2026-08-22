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
  - Current Schema: [tiinex.decision.v1](tiinex.decision.v1.schema.md)
  - Created At: 2026-06-05 01:00:00
  - Summary: Schema for landed decision artifacts that state what now governs.

---

# Decision

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to record a landed decision in
a way that later readers, traces, and tools can treat as operative.

It is for artifacts where the main value is no longer broad exploration or
execution planning, but what has now been decided and what follows from that.

## Schema Validation Contract

### Decision Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.decision.v1`

Rules

- `tiinex.decision.v1` identifies artifacts centered on a landed or explicitly stated decision state.
- The body should make the operative decision legible without requiring special tooling.
- A decision artifact should tell a later reader what now governs, not just what was discussed.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Decision Body

Required Shape

- first body heading after the continuity envelope
- readable prose or lists that state the decision and what it applies to

Optional Sections

- Basis
- Consequences
- Review Conditions
- Immediate Next Questions
- Alternatives Considered
- Supersession

Rules

- A decision artifact should begin with a human-readable title.
- A decision artifact should contain enough body content that a later reader can identify the decision itself.
- The body should make the subject or affected scope readable rather than leaving the reader to infer it from sparse metadata.
- Follow-up sections must not replace the decision statement itself.
- If the artifact is still mostly open-ended reasoning, another schema should own it instead.

### Decision Semantics

Allowed Shapes

- accepted decision
- rejected decision
- deferred decision
- superseded decision
- provisional decision with explicit review conditions

Rules

- A decision artifact should make the current decision state explicit.
- A decision artifact should make clear what was decided, rejected, deferred, or superseded.
- If the decision is provisional, reversible, or pending later review, the artifact should say so explicitly.
- If the decision authorizes later work or execution, the artifact should say that operative effect explicitly.
- Decision artifacts should optimize for the landed outcome rather than replaying every branch of prior discussion.

### Decision Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`

Rules

- Decision artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Decision artifacts should declare parent signal when they continue, refine, or supersede an earlier local artifact.
- Decision artifacts should avoid turning envelope metadata into the only decision-bearing surface.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<decision-slug>.trace.md`

Rules

- Decision artifacts should keep the lineage label first.
- The optional slug should describe the landed decision or affected scope.
- Decision artifacts should prefer short human-readable slugs.
- Decision artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.decision.v1` when the artifact is mainly preserving a landed or explicitly stated decision state.
- Do not use `tiinex.decision.v1` for broad exploration without a stated outcome.
- Do not use `tiinex.decision.v1` for generic task execution or passive evidence capture.
- If the artifact's main job is to preserve supporting material, another schema should own it.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-06-05 00:00:00
  - Summary: Decision to keep lineage repair audit and repair as separate surfaces.

---

# Audit And Repair Separation Decision

## Decision

- State: accepted
- Subject: schema-lineage repair workflow shape
- Decision: audit and repair remain separate surfaces for the current version

## Basis

- one blended surface would make it harder to tell whether the tool is diagnosing or mutating

## Consequences

- future planning should preserve explicit operator review before repair
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- a decision artifact should optimize for what now governs rather than for replaying all surrounding discussion
- `Current -> Why` can help explain rationale, but it should not replace the body-level decision signal
- if the artifact remains mostly open reasoning, a topic schema may be a better fit
- if the artifact is mostly about work to be done after the decision, a task schema may be a better fit for that follow-on work

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder

Rules

- The current decision create surface uses version `1`.
- `createTitle` should label the create action as `Create Decision`.
- `summaryPrompt` should ask for the decision title.
- `summaryPlaceholder` should guide the user toward the landed outcome.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- summary sentence placeholder below the title
- `## Decision` section
- `## Basis` section
- `## Consequences` section

Rules

- Generated decision artifacts should begin with the decision title as the first body heading.
- The generated body should include one orienting sentence before the first named section.
- `Decision` should state the operative outcome and decision state.
- `Basis` should explain why that outcome was chosen.
- `Consequences` should state what now follows from the decision.
- `Review Conditions` and `Immediate Next Questions` may be added when the generated artifact needs them.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: BlXrn7NlflHc7UzQ4j98mD4Yj9qOyoNwxaRw-PQO-ps