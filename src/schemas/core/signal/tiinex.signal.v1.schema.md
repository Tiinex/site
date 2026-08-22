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
  - Current Schema: [tiinex.signal.v1](tiinex.signal.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Schema for bounded signal artifacts that preserve observed indicators without overclaiming evidence.

---

# Signal

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to preserve a bounded signal:
an observed reaction, weak indicator, external response, status cue, or other
interpretable sign that bears on a lineage without necessarily becoming
evidence, feedback, task, or decision.

It is for lightweight observations that matter enough to keep traceable, but
should not be overstated as proof.

## Schema Validation Contract

### Signal Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.signal.v1`

Rules

- `tiinex.signal.v1` identifies artifacts centered on one bounded observed signal.
- A signal artifact should state what was observed and what it may indicate.
- A signal artifact should not overclaim certainty beyond the observed signal.
- A signal artifact may preserve positive, negative, neutral, ambiguous, or absent signal.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Signal Body

Required Shape

- first body heading after the continuity envelope
- `## Observed Signal` section
- `## Source` section
- `## Interpretation` section
- `## Limits` section

Optional Sections

- Signal Strength
- Linked Artifacts
- Evidence Material
- Follow-Up
- Next Artifacts

Rules

- A signal artifact should begin with a human-readable title.
- `Observed Signal` should describe the signal itself.
- `Source` should name where the signal came from when known.
- `Interpretation` should state what the signal may bear on without turning it into stronger evidence than it is.
- `Limits` should state ambiguity, uncertainty, missing context, or reasons not to overread the signal.
- A signal artifact should contain enough body content that a later reader can identify the signal and its relevance.
- When the signal is based on a screenshot, comment, notification, metric, or external artifact, the body should include a readable reference or description.
- If the artifact mainly preserves supporting material for a specific claim, an evidence schema should own it instead.
- If the artifact contains directed response that should be dispositioned or acted on, a feedback schema should own it instead.

### Signal Semantics

Allowed Shapes

- social reaction
- external response
- status cue
- weak adoption signal
- absence-of-response signal
- ambiguous observation
- metric or count snapshot with limits

Rules

- A signal artifact should make clear whether the signal is direct, indirect, weak, ambiguous, or negative.
- A signal artifact should not hide that a signal is based on partial observation.
- A signal artifact may support later topic, feedback, decision, task, or evidence artifacts, but does not replace them.
- When a signal is time-sensitive or platform-dependent, the artifact should say so.
- When the signal could be explained by multiple causes, the artifact should preserve that ambiguity.

### Signal Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`
- `Current -> Origin`
- parent signal when the signal continues or refines an earlier local artifact

Rules

- Signal artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Parent signal should be used when a signal artifact continues a local signal thread.
- Envelope metadata should support, not replace, body-level observation and limits.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<signal-slug>.trace.md`

Rules

- Signal artifacts should keep the lineage label first.
- The optional slug should describe the observed signal or source.
- Signal artifacts should prefer short human-readable slugs.
- Signal artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.signal.v1` when the artifact is mainly preserving a bounded signal with interpretation limits.
- Do not use `tiinex.signal.v1` for landed decisions, bounded tasks, broad topics, or raw runtime exports.
- Do not use `tiinex.signal.v1` for directed feedback that needs disposition.
- Do not use `tiinex.signal.v1` to make weak observations look like strong evidence.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.signal.v1
  - Created At: 2026-06-14 00:00:00
  - Summary: Weak external signal from a GitHub discussion reaction.

---

# GitHub Reaction Signal

## Observed Signal

- A public comment received one positive reaction.

## Source

- Source: GitHub discussion UI observation

## Interpretation

- The reaction may indicate that the comment was noticed or found useful by at least one reader.

## Limits

- The reaction does not prove project acceptance, maintainer interest, or correctness.
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

- signal is intentionally weaker than evidence and feedback
- signal preserves observations without forcing premature action or certainty
- signal artifacts should help later readers understand why something was noticed without overclaiming what it proves

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

- The current signal create surface uses version `1`.
- `createTitle` should label the create action as `Create Signal`.
- `summaryPrompt` should ask for the signal title.
- `summaryPlaceholder` should guide the user toward the observed signal.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- `## Observed Signal` section
- `## Source` section
- `## Interpretation` section
- `## Limits` section

Rules

- Generated signal artifacts should begin with the signal title as the first body heading.
- `Observed Signal` should state what was observed.
- `Source` should state where the signal came from.
- `Interpretation` should state what the signal may bear on.
- `Limits` should prevent overclaiming the signal.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: IiDpQlRGL1WC5jCykMwSjdzXXHy70_-7z95ATooBfWE