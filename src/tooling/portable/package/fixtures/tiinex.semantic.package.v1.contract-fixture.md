<!-- Contract-only pressure fixture transcribed from Tiinex/docs@053d46ce. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.root.v1
  - Trace: root.md
  - Origin: root.md
- Current
  - Current Schema: tiinex.semantic.package.v1
  - Created At: 2026-08-17 00:00:00

---

# Semantic Package Manifest

## Schema Validation Contract

### Semantic Package Body

Required Shape

- `## Package Identity` section
- `## Package Boundary` section
- `## Included Packages` section
- `## External Package Dependencies` section
- `## Schema Resolution Bindings` section
- `## Interpretation Limits` section

### Package Identity

Required Fields

- Package Name
- Purpose

Optional Fields

- Package Handle
- Package Version
- Notes

### Package Boundary

Required Fields

- Boundary Root
- Discovery Policy
- Nested Package Policy

Field Value Constraints

- Boundary Root
  - Allowed Value: manifest-directory
  - Domain Policy: closed
- Discovery Policy
  - Allowed Value: recursive-within-boundary
  - Domain Policy: closed
- Nested Package Policy
  - Allowed Value: explicit-only
  - Domain Policy: closed

### Included Package Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Package Reference

Optional Fields

- Note

Field Value Constraints

- Package Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Included Packages` are repeated named declarations using this shape.
- The literal entry `none` is allowed only as the sole `## Included Packages` entry and is exempt from declaration fields.

### External Package Dependency Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Package Reference

Optional Fields

- Note

Field Value Constraints

- Package Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## External Package Dependencies` are repeated named declarations using this shape.
- The literal entry `none` is allowed only as the sole `## External Package Dependencies` entry and is exempt from declaration fields.

### Schema Resolution Binding Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Schema Reference

Optional Fields

- Package Reference
- Note

Field Value Constraints

- Schema Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Package Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Schema Resolution Bindings` are repeated named declarations using this shape.
- The literal entry `none` is allowed only as the sole `## Schema Resolution Bindings` entry and is exempt from declaration fields.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim
