<!-- Tiinex web schema snapshot: local embedded copy bound by adjacent .schema.json. Path is a discovery hint; schema identity and contract remain inside the artifact. -->

# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: Schema for bounded topic-oriented lineage artifacts.

---

# Topic

## Summary

This schema defines artifacts whose main job is to carry one bounded working topic forward. Use `tiinex.topic.v1` when the artifact is mainly preserving or advancing a working topic. Do not use it for schema notes, opaque dumps, generic holding files, or decisions.

## Artifact Creation Contract

Generated topic artifacts should begin with the topic title and include Current Read, Design Direction, and Next Artifacts sections.

## Schema Validation Contract

### Topic Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.topic.v1`

Rules

- `tiinex.topic.v1` identifies artifacts centered on one active topic thread.
- The body should make the current topic legible without requiring special tooling.
- The topic should stay bounded enough that a reader can tell what is being advanced.

### Topic Body

Required Shape

- first body heading after the continuity envelope
- readable prose that advances one bounded topic thread

Optional Sections

- Current Read
- Design Direction
- Risks
- Open Questions
- Next Artifacts
- Next Steps

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<topic-slug>.trace.md`

