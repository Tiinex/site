# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-08-05 00:00:00
  - Trace: [transition-authoring-contract-v1.md](../../../../docs/architecture/transition-authoring-contract-v1.md)
  - Origin:
    - site-local:docs/architecture/transition-authoring-contract-v1.md
- Current
  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-05 00:00:00
  - Why: Defines the first narrow authoring target for Topic Continue transitions.
  - Summary: Browser-local task artifacts created as canonical draft continuations.

---

# Tiinex Task v1 Schema

## Summary

A Task is a small, actionable Tiinex artifact created as a local/draft continuation from another artifact.

The first supported runtime slice is:

```text
tiinex.topic.v1
→ intent: continue
→ tiinex.task.v1
```

## Core Semantics

- A Task is work to do, not a workspace entrypoint.
- A Task may be created from source-backed material, but the result is browser-local draft material.
- A Task must preserve Parent Trace, Parent Boundary, Current Schema, Created At, Summary, Status, Why, and draft integrity through the root envelope.
- Creating a Task must not mutate the parent artifact.
- Creating a Task must not infer GitHub/source provenance for the draft result.

## Recommended Body Sections

A minimal Task should prefer this order:

- `# <task title>`
- `## Task Draft`
- `## Source Boundary`
- `## Source Excerpt`
- `## Next Step`

The first B1 implementation may produce a thin Task body, but it must stay root-envelope compatible and draft/local.

## Schema Validation Contract

The validator checks that:

- Current Schema is `tiinex.task.v1`.
- A human-readable title exists.
- The body is readable enough to understand the task.
- Missing task-specific sections are warnings while the first authoring slice is still minimal.

## Authoring Contract

This schema is active only for browser-local draft creation in B1.

Source-backed parents remain read-only. A task created from a source-backed parent must use a local/draft source mode and must not inherit the parent source object.

# Continuity Integrity

- [sha256-local-schema-snapshot](validator.md)
  - Towards: self
  - Value: pending-site-local-binding
