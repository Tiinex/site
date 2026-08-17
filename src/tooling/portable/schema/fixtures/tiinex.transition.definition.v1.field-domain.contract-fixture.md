<!-- Contract-only pressure fixture transcribed from the field-domain authority surface in Tiinex/docs@0194368549bbf3da4817bc47c2c6eb13b1791fee. Not a canonical snapshot. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.root.v1
  - Trace: root.trace.md
  - Origin: root.trace.md
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-16 00:00:00

---

# Transition Definition Field-Domain Contract Fixture

## Schema Validation Contract

### Input Role Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning
- Minimum Count
- Maximum Count

Optional Fields

- Acquisition Policy
- Target Kind
- Schema Constraint

Field Value Constraints

- Acquisition Policy
  - Allowed Value: existing-only
  - Allowed Value: existing-or-create
  - Allowed Value: create-only
  - Allowed Value: invocation-provided
  - Allowed Value: derived
  - Allowed Value: unknown
  - Domain Policy: closed

Rules

- Entries under `## Input Roles` are repeated named declarations using this shape.

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
- Generation Binding

Field Value Constraints

- Generation Binding
  - Allowed Value: target-schema
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Output Roles` are repeated named declarations using this shape.

### Target Kind Semantics

Applies To

- Input Role Declaration
- Output Role Declaration

Field Value Constraints

- Target Kind
  - Allowed Value: artifact
  - Allowed Value: non-artifact
  - Allowed Value: unknown
  - Domain Policy: closed

### Lifecycle Effect Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Target Binding
- Effect

Optional Fields

- Logical Continuity
- Required Materialization Operation
- Preserve Why
- Member Mapping

Field Value Constraints

- Effect
  - Allowed Value: create-new
  - Allowed Value: revise-current
  - Allowed Value: preserve
  - Allowed Value: supersede
  - Allowed Value: retire
  - Allowed Value: domain-consume
  - Allowed Value: remove-materialization
  - Allowed Value: custom
  - Allowed Value: unknown
  - Domain Policy: closed

- Logical Continuity
  - Allowed Value: new-subject
  - Allowed Value: preserve-subject
  - Allowed Value: no-subject-effect
  - Allowed Value: unknown
  - Domain Policy: closed

- Required Materialization Operation
  - Allowed Value: create
  - Allowed Value: revise
  - Allowed Value: delete
  - Allowed Value: move
  - Allowed Value: tombstone
  - Allowed Value: restore
  - Domain Policy: extension-authorized

- Preserve Why
  - Allowed Value: yes
  - Allowed Value: no
  - Allowed Value: unknown
  - Domain Policy: closed

Rules

- Entries under `### Lifecycle Effects` are repeated lifecycle declarations using this shape.

### Parent Effect Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Target Binding
- Effect

Optional Fields

- Member Mapping

Field Value Constraints

- Effect
  - Allowed Value: set
  - Allowed Value: preserve
  - Allowed Value: clear
  - Allowed Value: replace
  - Allowed Value: unknown
  - Domain Policy: closed

- Member Mapping
  - Allowed Value: single
  - Allowed Value: broadcast
  - Allowed Value: pairwise
  - Allowed Value: by-key
  - Allowed Value: explicit-at-invocation
  - Allowed Value: custom
  - Allowed Value: unknown
  - Domain Policy: closed

Rules

- Entries under `### Parent Effects` are repeated Parent Effect declarations using this shape.

### Relation Effect Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Effect
- Subject Binding
- Predicate Identifier
- Predicate Meaning
- Object Binding
- Directionality

Optional Fields

- Member Mapping

Field Value Constraints

- Effect
  - Allowed Value: declare
  - Allowed Value: remove
  - Allowed Value: preserve
  - Allowed Value: unknown
  - Domain Policy: closed

- Directionality
  - Allowed Value: directed
  - Allowed Value: undirected
  - Allowed Value: bidirectional
  - Domain Policy: closed

Rules

- Entries under `## Relation Effects` are repeated named declarations using this shape.

### Member Mapping Semantics

Applies To

- Lifecycle Effect Declaration
- Parent Effect Declaration
- Relation Effect Declaration

Field Value Constraints

- Member Mapping
  - Allowed Value: single
  - Allowed Value: broadcast
  - Allowed Value: pairwise
  - Allowed Value: all-to-all
  - Allowed Value: by-key
  - Allowed Value: explicit-at-invocation
  - Allowed Value: custom
  - Allowed Value: unknown
  - Domain Policy: closed

### Destination Binding Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning
- Required

Optional Fields

- Destination Kind

Field Value Constraints

- Required
  - Allowed Value: yes
  - Allowed Value: no
  - Allowed Value: unknown
  - Domain Policy: closed

Rules

- Entries under `### Destination Bindings` are named reusable destination slots using this shape.

### Output Placement Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Output Binding
- Placement Intent

Optional Fields

- Naming Authority
- Explicit Override Allowed

Field Value Constraints

- Placement Intent
  - Allowed Value: preserve-current
  - Allowed Value: new-materialization
  - Allowed Value: no-materialization
  - Allowed Value: unknown
  - Domain Policy: closed

- Naming Authority
  - Allowed Value: target-schema
  - Allowed Value: explicit-binding
  - Allowed Value: external-authority
  - Allowed Value: unknown
  - Domain Policy: closed

- Explicit Override Allowed
  - Allowed Value: yes
  - Allowed Value: no
  - Allowed Value: unknown
  - Domain Policy: closed

Rules

- Entries under `### Output Placements` are repeated Output Placement declarations using this shape.
