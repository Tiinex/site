<!-- Contract-only fixture transcribed from Tiinex/docs@068241174421716b941421e95931ec5a6e95b0da. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.root.v1
  - Trace: parent.trace.md
  - Origin: parent.trace.md
- Current
  - Current Schema: tiinex.schema.contract.v1
  - Created At: 2026-08-16 00:00:00

---

# Schema Contract

## Schema Validation Contract

### Contract Nodes

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Contract Node Type
- Contract Node Label

Optional Fields

- Applies To
- Required
- Optional
- Cardinality
- Value Type
- Condition
- Operator
- Severity
- Message
- Generation Step
- Relation Type
- Parent Binding
- Child Binding
- Example Binding

Allowed Labels

- section
- field
- value
- rule
- generation
- relation
- inheritance
- example
- presentation
- module
- unknown

Rules

- Each first-level entry is one Contract Node declaration.
- The declaration name is the existing `Contract Node Handle` identity and must be unique within `## Contract Nodes`.
- Node-local fields belong to that declaration; repeated Node Type/Label/Applies To values must not be paired by document position.
- Contract node handles are scoped to the target schema contract and may remain stable across revisions while they continue to denote the same semantic node; checksum/fingerprint changes do not automatically supersede the scoped handle.
- Contract node labels should be human-readable.
- Contract nodes should not rely on hidden application registries as semantic authority.
- If a tool cannot understand a contract node type, it should report unknown, unavailable, skipped, or unconfirmed rather than treating it as pass.
