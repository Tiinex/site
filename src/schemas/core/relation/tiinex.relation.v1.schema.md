# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2f5c1eea03aad31a0209f0484e17d2cc37d92dab/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.relation.v1](tiinex.relation.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for typed non-parent relations between artifacts, targets, inputs, contributors, or domain entities.

---

# Relation

- Status: maintained schema note

## Summary

This schema defines typed relationship artifacts for Tiinex references that are
not direct artifact-continuity parents. Ordinary artifacts and schemas may also
declare or project typed relation edges without creating a Relation Artifact.

It exists to keep `Parent` narrow while still allowing descendant schemas and
runtime surfaces to express domain relationships such as contributors, inputs,
subjects, verifiers, samples, datasets, dependencies, or candidate sources.

## Schema Validation Contract

### Relation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.relation.v1`

Rules

- `tiinex.relation.v1` identifies artifacts whose main job is to declare one or more typed non-parent relationships.
- A typed relation does not require a standalone Relation Artifact merely to exist; ordinary artifacts or schema contracts may declare or project typed edges when another artifact owns the main semantics.
- Use a Relation Artifact when the relation instance itself has independent semantic content, provenance, state, interpretation limits, or lifecycle worth preserving as an artifact.
- A relation artifact must not reinterpret `Parent` as a generic graph edge.
- A relation artifact may describe domain, runtime, validation, evidence, biological, legal, or data relationships without making those targets direct continuity parents.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Relation Body

Required Shape

- first body heading after the continuity envelope
- `## Relation Declaration` section
- `## Relation Target` section
- `## Relation Boundary` section

Optional Sections

- Relation Source
- Evidence Basis
- Interpretation Limits
- Related Artifacts
- Domain Mapping
- References

Rules

- A relation artifact should begin with a human-readable title.
- `Relation Declaration` must name the relation type and direction in readable form.
- `Relation Target` must identify the related artifact, external target, or bounded target descriptor.
- `Relation Boundary` must state that the relation is not a Tiinex `Parent` unless it is separately declared in the continuity envelope.
- Domain-specific descendants may add stricter local relation fields and vocabularies.

### Relation Declaration

Required Fields

- Relation Type
- Relation Direction
- Relation Scope

Optional Fields

- Relation Family
- Relation Strength
- Confidence
- Domain Vocabulary
- Valid From
- Valid Until

Rules

- `Relation Type` should be specific enough that a later reader can distinguish contributor, input, target, subject, verifier, dependency, sample source, or other local semantics.
- `Relation Direction` should state how the current artifact relates to the target.
- `Relation Scope` should state whether the relation is artifact-level, body-level, claim-level, runtime-level, domain-level, or another bounded scope.
- A relation declaration must not use vague labels such as `related` when a more specific relation type is known.
- A relation declaration may preserve uncertainty through `Confidence` or `Interpretation Limits` instead of inventing certainty.

### Relation Target

Allowed Shapes

- markdown link to a Tiinex artifact
- relative path to a Tiinex artifact
- external URL
- external descriptor
- evidence artifact reference
- payload reference
- bounded textual target description

Rules

- A relation target should be as durable and recoverable as the available context allows.
- A relation target may be non-traversable when the related material is external, private, missing, or intentionally described rather than linked.
- When a relation target is a Tiinex artifact, a commit-pinned `browse + git` target should be preferred when available for durable recovery.
- Multiple relation targets are allowed only when the body keeps each target and its relation type distinguishable.
- When multiple relation targets are present, each target must be associated with a distinguishable `Relation Type`, `Relation Direction`, and `Relation Scope`, either through separate grouped entries or explicit target-local fields.

### Relation Boundary

Rules

- `Parent` remains direct artifact-continuity ancestry.
- A relation target is not a parent merely because it influenced, contributed to, verified, described, sampled, or constrained the current artifact.
- Multi-input domain reality should be modeled through relation semantics, not through multiple `Parent` entries.
- Descendant schemas must not weaken the inherited root rule that `Parent` describes ancestry only.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-relation.trace.md`
- `<lineage>-<relation-slug>.trace.md`

Rules

- Relation artifacts should keep the lineage label first.
- The optional slug should identify the relation or target family rather than a low-signal implementation detail.
- Relation artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.relation.v1` when the main artifact value is an explicit typed non-parent relation.
- Do not create a Relation Artifact as a mandatory intermediate node for every meaningful graph edge.
- When another artifact owns the main semantics, that artifact may project a typed relation directly if its active contract preserves the predicate/target meaning.
- Do not use `tiinex.relation.v1` to replace evidence, decision, feedback, task, topic, pointer, or runtime schemas when those schemas own the main artifact role.
- Do not use `tiinex.relation.v1` for direct continuity ancestry; use the root `Parent` envelope when direct continuity is being declared.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.relation.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Biological contributor relation for a genetic analysis artifact.

---

# Biological Contributor Relation

## Relation Declaration

- Relation Type: biological contributor
- Relation Direction: current analysis -> contributor artifact
- Relation Scope: domain-level genetic interpretation
- Confidence: partial

## Relation Target

- Target: maternal-sample-artifact.trace.md

## Relation Boundary

- This target is a biological contributor, not the Tiinex continuity parent of this artifact.
```

A multi-target relation should keep target-local semantics distinguishable:

```md
# Genetic Contributor Relation Bundle

## Relation Declaration

- Relation Type: biological contributor
- Relation Direction: current analysis -> contributor artifacts
- Relation Scope: domain-level genetic interpretation
- Confidence: partial

## Relation Target

- Target: maternal-sample-artifact.trace.md
  - Relation Type: maternal biological contributor
  - Relation Direction: current analysis -> maternal contributor artifact
  - Relation Scope: domain-level genetic interpretation
- Target: paternal-sample-artifact.trace.md
  - Relation Type: paternal biological contributor
  - Relation Direction: current analysis -> paternal contributor artifact
  - Relation Scope: domain-level genetic interpretation

## Relation Boundary

- These targets are biological contributors, not Tiinex continuity parents of this artifact.
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- relation artifacts preserve non-parent relationships without weakening root continuity
- relation targets may be many, but `Parent` remains singular when present
- domain schemas should prefer extending relation semantics over inventing local parent-like fields
- `subject` may be modeled as a relation type unless a later dedicated subject schema becomes necessary
- this support/governance schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2f5c1eea03aad31a0209f0484e17d2cc37d92dab/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: 3pgzWX3ICCeChCyP6dLAc6VCYBpVBHy7BtbVU-QU8PA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Xvbb4_ekLH_HFWU34MXmYLCIY_BYjpPIqynbSblTcNs