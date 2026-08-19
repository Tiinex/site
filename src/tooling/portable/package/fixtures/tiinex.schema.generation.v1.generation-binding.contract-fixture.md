<!-- Contract-only fixture transcribed from Tiinex/docs@053d46ce082d4ec261b82abc44ecca403d61e240. Bare scalar syntax from the non-authoritative Minimal Example is intentionally not imported as validation authority. -->
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

### Generation Body

Required Shape

- first body heading after the continuity envelope
- `## Generation Identity` section
- `## Generation Target` section
- `## Required Inputs` section
- `## Generation Steps` section
- `## Output Boundary` section
- `## Interpretation Limits` section

### Generation Identity

Required Fields

- Generation Handle
- Generation Name
- Generation Kind

Optional Fields

- Generation Version
- Generation Owner
- Generation Mode

### Generation Target

Required Fields

- Target Schema
- Target Output

Optional Fields

- Target Artifact Kind
- Target Section Contracts
- Target Field Contracts
- Target Rule Contracts
- Parent Schema
- Child Schema

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

Rules

- Each first-level entry is one required-input declaration.
- The declaration name is the readable Required Input identity and must be unique within `## Required Inputs`.
- Each input entry owns its own `Input Source Policy`; source policy must not be paired by list position or document-wide field order.

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

Rules

- Each first-level entry is one generation-step declaration.
- The declaration name is the existing readable `Step Handle` identity and must be unique within `## Generation Steps`.
- Step-local fields belong to that declaration; validators must not pair repeated Step Action/Order values by document position.

### Output Boundary

Required Fields

- Output Kind
- Review State

Optional Fields

- Completeness Boundary
- Validation Boundary
- Placeholder Policy
- Mutation Policy
- Save Policy

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Overclaim Risk
- Missing Input Risk
- Review Boundary
