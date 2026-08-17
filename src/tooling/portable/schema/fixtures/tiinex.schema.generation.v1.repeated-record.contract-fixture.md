<!-- Contract-only fixture transcribed from Tiinex/docs@068241174421716b941421e95931ec5a6e95b0da. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.schema.contract.v1
  - Trace: parent.trace.md
  - Origin: parent.trace.md
- Current
  - Current Schema: tiinex.schema.generation.v1
  - Created At: 2026-08-16 00:00:00

---

# Schema Generation

## Schema Validation Contract

### Required Inputs

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Input Source Policy

Optional Fields

- Optional Input
- Derived Input
- Defaultable Input
- User Prompt
- Adapter Source
- LLM Assistance Allowed
- Unknown Handling

Allowed Labels

- human-input
- adapter-input
- imported-input
- derived-input
- defaulted-input
- llm-suggested-input
- unknown

Rules

- Each first-level entry is one required-input declaration.
- The declaration name is the readable Required Input identity and must be unique within `## Required Inputs`.
- Each input entry owns its own `Input Source Policy`; source policy must not be paired by list position or document-wide field order.
- Input source policy must distinguish human input, adapter input, imported input, derived input, defaulted input, and LLM-suggested input.
- LLM-suggested input must remain suggested unless reviewed or verified.

### Generation Steps

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Step Action

Optional Fields

- Step Order
- Uses Section Contract
- Uses Field Contract
- Uses Rule Contract
- Uses Value Contract
- Condition
- On Missing Input
- Review Needed

Allowed Labels

- create-section
- create-field
- fill-value
- derive-value
- ask-user
- mark-unknown
- add-limit
- link-related-artifact
- review
- unknown

Rules

- Each first-level entry is one generation-step declaration.
- The declaration name is the existing readable `Step Handle` identity and must be unique within `## Generation Steps`.
- Step-local fields belong to that declaration; validators must not pair repeated Step Action/Order values by document position.
- Step order should be explicit when deterministic generation requires it.
- Missing input handling must be explicit for required fields.
- Generation steps must not silently create evidence, claims, validations, or preservation artifacts.
