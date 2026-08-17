<!-- Minimal generic Transition read pressure fixture; Transition behavior remains canonical elsewhere. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.root.v1
  - Trace: root.md
  - Origin: root.md
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-17 00:00:00

---

# Transition Definition

## Schema Validation Contract

### Transition Body

Required Shape

- `## Transition Identity` section
- `## Input Roles` section
- `## Output Roles` section

### Transition Identity

Required Fields

- Name
- Version
- Canonical Identifier

### Input Role Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning
- Minimum Count
- Maximum Count

Optional Fields

- Target Kind
- Schema Constraint

Rules

- Entries under `## Input Roles` are repeated named declarations using this shape.
- The literal entry `none` is allowed only as the sole `## Input Roles` entry and is exempt from declaration fields.

### Output Role Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning
- Minimum Count
- Maximum Count

Optional Fields

- Target Kind
- Schema Constraint

Rules

- Entries under `## Output Roles` are repeated named declarations using this shape.
- The literal entry `none` is allowed only as the sole `## Output Roles` entry and is exempt from declaration fields.
