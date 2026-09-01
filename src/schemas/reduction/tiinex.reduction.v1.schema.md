# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.reduction.v1](tiinex.reduction.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Schema for observable reduction artifacts that preserve carry-forward state, loss, and uncertainty.

---

# Reduction

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to preserve a bounded
carry-forward state produced from fuller source material, while making the
reduction itself observable.

It is for context reduction, lineage reduction, summary consolidation, or other
semantic narrowing where later work needs to know what survived, what was lost
or degraded, what remains uncertain, and what now carries forward.

## Schema Validation Contract

### Reduction Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.reduction.v1`

Rules

- `tiinex.reduction.v1` identifies artifacts centered on an observable reduction event.
- A reduction artifact should explain the fuller source or context being reduced.
- A reduction artifact should expose the carry-forward state that later work is expected to rely on.
- A reduction artifact should expose loss, degradation, uncertainty, or fidelity limits when those are present.
- A reduction artifact may be human-authored, AI-assisted, runtime-produced, or mixed.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Reduction Body

Required Shape

- first body heading after the continuity envelope
- `## Source Context` section
- `## Carry-Forward State` section
- `## Loss And Uncertainty` section
- `## Validation` section

Optional Sections

- Reduction Method
- Retained Signals
- Dropped Signals
- Degraded Signals
- Human Review
- Evidence Basis
- Linked Artifacts
- Next Artifacts

Rules

- A reduction artifact should begin with a human-readable title.
- `Source Context` should identify the material, lineage range, conversation, runtime state, evidence bundle, or other fuller context being reduced.
- `Carry-Forward State` should state the bounded state that later work may rely on.
- `Loss And Uncertainty` should state what was omitted, compressed, degraded, or left uncertain.
- `Validation` should state how the reduction was checked, accepted, corrected, or limited.
- The body should make the reduction readable without requiring access to the entire source context.
- When a source artifact, transcript, evidence slice, or runtime export grounds the reduction, the artifact should prefer explicit readable target references.
- Follow-up sections must not replace the carry-forward state itself.
- If the artifact is mainly preserving raw supporting material, an evidence or runtime schema should own it instead.
- If the artifact mainly lands a governing choice rather than a reduced carry-forward state, a decision schema should own it instead.

### Reduction Semantics

Allowed Shapes

- human-authored consolidation
- AI-proposed carry-forward summary
- reviewed compaction checkpoint
- lineage reduction
- source-to-summary reduction
- runtime context compaction report

Rules

- A reduction artifact should make clear whether the reduction was proposed, accepted, corrected, rejected, or merely recorded.
- A reduction artifact should make clear whether the original source remains recoverable.
- A reduction artifact should not present omitted or uncertain material as retained fact.
- A reduction artifact should not hide material impact behind a generic summary.
- When the reduction is created because of context pressure, compaction, or portability needs, the artifact should say so explicitly.
- When human review is absent, the artifact should not imply human acceptance.

### Reduction Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`
- `Current -> Origin`
- parent signal when the reduction continues, narrows, or summarizes an earlier artifact

Rules

- Reduction artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Parent signal should be used when a reduction continues or narrows an earlier local artifact.
- Envelope metadata should support, not replace, body-level source, carry-forward, and loss surfaces.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<reduction-slug>.trace.md`

Rules

- Reduction artifacts should keep the lineage label first.
- The optional slug should describe the reduced scope or carry-forward purpose.
- Reduction artifacts should prefer short human-readable slugs.
- Reduction artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.reduction.v1` when the artifact's main job is to make a reduction observable and carry a bounded state forward.
- Do not use `tiinex.reduction.v1` for broad topic discussion without a concrete carry-forward state.
- Do not use `tiinex.reduction.v1` for raw transcripts, memory dumps, or opaque runtime exports.
- Do not use `tiinex.reduction.v1` merely because an artifact is short.
- Reduction is a provenance event when later work may depend on what survived the narrowing.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.reduction.v1
  - Created At: 2026-06-14 00:00:00
  - Summary: Reduction checkpoint for observable context compaction.

---

# Context Reduction Checkpoint

## Source Context

- Source: discussion thread and prior working notes about context compaction

## Carry-Forward State

- Hidden context reduction is treated as a drift boundary.
- Minimum observable reduction should expose what survived, what was lost, and what assumptions carry forward.

## Loss And Uncertainty

- Full transcript details are not reproduced here.
- Runtime behavior still requires validation against a concrete implementation.

## Validation

- Human reviewed and accepted this carry-forward state for the next leaf.
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

- reduction is not the same as summarization only; the important signal is what is allowed to carry forward
- reduction should make loss and uncertainty visible rather than hiding them behind a fluent summary
- full source material may live elsewhere as transcript, evidence, runtime export, or other recoverable source
- reduction should stay usable even when the underlying source is large or expensive to inspect

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

- The current reduction create surface uses version `1`.
- `createTitle` should label the create action as `Create Reduction`.
- `summaryPrompt` should ask for the reduction title.
- `summaryPlaceholder` should guide the user toward the context or source being reduced.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- `## Source Context` section
- `## Carry-Forward State` section
- `## Loss And Uncertainty` section
- `## Validation` section

Rules

- Generated reduction artifacts should begin with the reduction title as the first body heading.
- `Source Context` should identify what is being reduced.
- `Carry-Forward State` should state what later work may rely on.
- `Loss And Uncertainty` should state omissions, degradation, or uncertainty.
- `Validation` should state human review, runtime validation, source checks, or explicit limits.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: pbLraIsPRv4uFdGKSd2WlLHd4vgEqOR2V_PdLDKc_S0

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: EexVaBJiTCvu5dBl1qXNWcOSPnjD1mlUWKJKALrkUEI