# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.signal.v1](../signal/tiinex.signal.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.signal.v1.schema.md](../signal/tiinex.signal.v1.schema.md)
  - Origin:
    - [relative](../signal/tiinex.signal.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](tiinex.feedback.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Schema for directed feedback artifacts with target, received feedback, disposition, and limits.

---

# Feedback

- Status: maintained schema note

## Summary

This schema narrows signal into directed feedback: a response from a person,
system, reviewer, community, runtime, or other source that addresses a target
artifact, claim, proposal, work product, or behavior and may require
disposition.

It is for feedback that should remain traceable as feedback, not merely as a
weak signal or preserved evidence.

## Schema Validation Contract

### Feedback Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.feedback.v1`

Rules

- `tiinex.feedback.v1` identifies artifacts centered on directed feedback.
- A feedback artifact should state the feedback target.
- A feedback artifact should preserve or summarize the received feedback.
- A feedback artifact should expose disposition, response, or follow-up status when known.
- Feedback may be human-authored, machine-generated, reviewer-provided, community-provided, or system-provided.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Feedback Body

Required Shape

- first body heading after the continuity envelope
- `## Feedback Target` section
- `## Feedback Received` section
- `## Disposition` section
- `## Limits` section

Optional Sections

- Source
- Evidence Material
- Response
- Follow-Up
- Linked Artifacts
- Next Artifacts

Rules

- A feedback artifact should begin with a human-readable title.
- `Feedback Target` should identify the artifact, claim, proposal, work product, runtime behavior, or lineage surface being responded to.
- `Feedback Received` should preserve the feedback itself or a bounded summary with fidelity limits.
- `Disposition` should state whether the feedback is accepted, rejected, deferred, unclear, already addressed, or pending.
- `Limits` should state scope, fidelity, uncertainty, or reasons not to overread the feedback.
- If the feedback source is known, the artifact should expose it through `Source`, `Feedback Received`, or provenance text.
- Feedback artifacts should distinguish between what the source said and what the artifact author infers.
- If the artifact mainly preserves raw supporting material for a claim without disposition, an evidence schema may be better.
- If the artifact mainly records a landed governing outcome, a decision schema may be better.

### Feedback Semantics

Allowed Shapes

- reviewer feedback
- maintainer feedback
- community response
- user feedback
- runtime or validator feedback
- correction request
- acceptance or rejection response
- actionable critique

Rules

- A feedback artifact should make clear whether feedback is actionable, informational, ambiguous, or out of scope.
- A feedback artifact should not silently convert feedback into a decision.
- A feedback artifact may point to a later task, decision, reduction, or evidence artifact when follow-up is needed.
- When feedback is transformed, summarized, translated, or excerpted, the artifact should expose the fidelity limit.
- When feedback includes security, privacy, or trust implications, the artifact should not bury that signal in generic prose.

### Feedback Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`
- `Current -> Origin`
- parent signal when the feedback continues, responds to, or refines an earlier local artifact

Rules

- Feedback artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Parent signal should be used when feedback continues or refines a local feedback thread.
- Envelope metadata should support, not replace, body-level target, received feedback, and disposition.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<feedback-slug>.trace.md`

Rules

- Feedback artifacts should keep the lineage label first.
- The optional slug should describe the feedback source, target, or response.
- Feedback artifacts should prefer short human-readable slugs.
- Feedback artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.feedback.v1` when the artifact is mainly preserving directed feedback and its disposition.
- Do not use `tiinex.feedback.v1` for weak observations that do not respond to a target.
- Do not use `tiinex.feedback.v1` as a generic evidence bundle.
- Do not use `tiinex.feedback.v1` for a final decision unless the artifact also lands what now governs; in that case a decision artifact may be needed.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.feedback.v1
  - Created At: 2026-06-14 00:00:00
  - Summary: Feedback on an observable reduction proposal.

---

# Observable Reduction Feedback

## Feedback Target

- Target: 001-1-1 observable reduction proposal

## Feedback Received

- Reviewer said the minimum visible reduction summary is useful, but should not require adopting the full Tiinex format.

## Disposition

- State: accepted
- Follow-Up: keep minimum surface non-invasive

## Limits

- Feedback is summarized rather than quoted in full.
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

- feedback is stronger than a signal because it responds to a target and may require disposition
- feedback is not automatically a decision, although it may lead to one
- feedback artifacts should preserve what was received and how it is being handled

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

- The current feedback create surface uses version `1`.
- `createTitle` should label the create action as `Create Feedback`.
- `summaryPrompt` should ask for the feedback title.
- `summaryPlaceholder` should guide the user toward the feedback target or source.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- `## Feedback Target` section
- `## Feedback Received` section
- `## Disposition` section
- `## Limits` section

Rules

- Generated feedback artifacts should begin with the feedback title as the first body heading.
- `Feedback Target` should identify what the feedback responds to.
- `Feedback Received` should preserve or summarize the feedback.
- `Disposition` should state how the feedback is being handled.
- `Limits` should state fidelity or interpretation limits.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.signal.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: IPQ0I6h0ehoWCg21tYSzrxAimyP0dI3PwxvaRYR5-Qw