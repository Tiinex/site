# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.semantic.package.v1
  - Created At: 2026-08-17 00:00:00
  - Summary: Task semantic package for schema-local Transition discovery.

---

# Task Semantic Package

## Package Identity

- Package Name: Task
- Purpose: Site-local semantic neighborhood for the canonical Task schema and Task-oriented Transition discovery.

## Package Boundary

- Boundary Root: manifest-directory
- Discovery Policy: recursive-within-boundary
- Nested Package Policy: explicit-only

## Included Packages

- none

## External Package Dependencies

- Topic Package
  - Package Reference: [Topic Package](site-local:src/schemas/core/topic/topic-semantic-package.trace.md)

## Schema Resolution Bindings

- tiinex.task.v1
  - Schema Reference: [tiinex.task.v1](tiinex.task.v1.schema.md)

- tiinex.topic.v1
  - Schema Reference: [tiinex.topic.v1](site-local:src/schemas/core/topic/tiinex.topic.v1.schema.md)
  - Package Reference: [Topic Package](site-local:src/schemas/core/topic/topic-semantic-package.trace.md)

## Interpretation Limits

- Does Not Mean: package ownership of Transition semantic truth
- Must Not Be Used To Claim: participation, applicability, executability, authorization, ordering, recommendation, or UI visibility

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: PYvnlHGXumYIq4MjMuN6jGn-scMH99WGKBd7XvxdsqY
