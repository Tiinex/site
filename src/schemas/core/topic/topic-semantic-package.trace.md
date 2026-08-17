# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.semantic.package.v1
  - Created At: 2026-08-17 00:00:00
  - Summary: Topic semantic package for schema-local Transition discovery.

---

# Topic Semantic Package

## Package Identity

- Package Name: Topic
- Purpose: Site-local semantic neighborhood for the canonical Topic schema and reverse Transition discoverability.

## Package Boundary

- Boundary Root: manifest-directory
- Discovery Policy: recursive-within-boundary
- Nested Package Policy: explicit-only

## Included Packages

- none

## External Package Dependencies

- Task Package
  - Package Reference: [Task Package](site-local:src/schemas/core/task/task-semantic-package.trace.md)

## Schema Resolution Bindings

- tiinex.topic.v1
  - Schema Reference: [tiinex.topic.v1](tiinex.topic.v1.schema.md)

- tiinex.task.v1
  - Schema Reference: [tiinex.task.v1](site-local:src/schemas/core/task/tiinex.task.v1.schema.md)
  - Package Reference: [Task Package](site-local:src/schemas/core/task/task-semantic-package.trace.md)

## Interpretation Limits

- Does Not Mean: package ownership of Transition semantic truth
- Must Not Be Used To Claim: participation, applicability, executability, authorization, ordering, recommendation, or UI visibility

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: -jiqxBGSSy3U2Zfd83zvl2FajpHUrIMIG-8MmzbM4LQ
