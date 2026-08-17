<!-- Contract-only fixture transcribed from Tiinex/docs@068241174421716b941421e95931ec5a6e95b0da. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.schema.contract.v1
  - Trace: parent.trace.md
  - Origin: parent.trace.md
- Current
  - Current Schema: tiinex.schema.inheritance.v1
  - Created At: 2026-08-16 00:00:00

---

# Schema Inheritance

## Schema Validation Contract

### Merge Rules

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Merge Operation
- Applies To

Optional Fields

- Parent Node
- Child Node
- Reason
- Condition
- Effective Result

Allowed Labels

- inherit
- add
- refine
- override
- deprecate
- forbid
- rename
- migrate
- unknown

Rules

- Each first-level entry is one merge-rule declaration.
- The declaration name must be unique within `## Merge Rules` and must be a readable local description composed from the rule's existing semantic material, such as merge operation plus applies-to scope; it is not a global identifier.
- Merge operation and applies-to remain explicit nested fields and must not be inferred from declaration position.
- Merge operation must be explicit.
- `override` must identify the parent node being overridden.
- `refine` should preserve parent intent while narrowing or clarifying it.
- `add` must not remove inherited obligations.
