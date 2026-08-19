# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.schema.contract.v1](../tiinex.schema.contract.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.schema.contract.v1.schema.md](../tiinex.schema.contract.v1.schema.md)
  - Origin:
    - [relative](../tiinex.schema.contract.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/1669696ea4f498adf8924476c9f3bc8313993689/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.generation.v1](tiinex.schema.generation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines generation contract nodes so schema builders can ask for required inputs, create artifact skeletons, fill defaults, and preserve unknowns without inventing semantics.
  - Summary: Schema generation contract for reliable artifact creation and authoring flows.

---


# Schema Generation

## Summary

Defines a contract for generating a schema-guided artifact or artifact skeleton.

A schema generation contract describes what inputs are needed, what sections and fields should be produced, what defaults may be used, what unknowns must be preserved, and what text is only placeholder guidance. It supports form builders, schema builders, CLI tools, LLM-assisted authoring, and human checklists without making the schema software-bound.

Schema generation does not prove the generated artifact is true, complete, valid, or semantically wise. It only describes a bounded creation process.

## Core Semantics

- Schema generation = bounded creation guidance for artifact skeletons or filled artifacts.
- Generation should distinguish required human input, default values, derived values, adapter-provided values, and unknown placeholders.
- Generation should not invent provenance, targets, evidence, validation, or claims.
- A generated artifact should remain reviewable by humans and validators.
- Generation rules should point to section, field, value, rule, relation, and inheritance contracts where possible.

## Schema Validation Contract

### Generation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.generation.v1`

Rules

- `tiinex.schema.generation.v1` identifies a contract node for creating schema-guided artifact content or skeletons.
- Generation artifacts must preserve target schema, input requirements, generation steps, output boundary, unknown handling, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Generation Body

Required Shape

- first body heading after the continuity envelope
- `## Generation Identity` section
- `## Generation Target` section
- `## Required Inputs` section
- `## Generation Steps` section
- `## Output Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Prompt Surface`
- `Defaulting`
- `Derived Values`
- `Placeholder Policy`
- `Review Policy`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Generation steps should be ordered when order matters.
- Generated defaults must not pretend to be observed, verified, or human-provided.
- Unknown required inputs must be preserved as unknown or requested, not silently omitted.

### Generation Identity

Required Fields

- Generation Handle
- Generation Name
- Generation Kind

Optional Fields

- Generation Version
- Generation Owner
- Generation Mode

Allowed Labels

- artifact-skeleton
- artifact-filled
- schema-skeleton
- form-flow
- prompt-flow
- repair-flow
- migration-flow
- unknown

Rules

- Generation kind should state whether the contract creates a skeleton, a filled artifact, a form flow, a prompt flow, a repair, or a migration.

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

Rules

- Target schema must identify what kind of artifact is generated.
- Target output should state whether the output is a full artifact, partial artifact, section, field set, or repair suggestion.

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

Allowed Labels

- skeleton
- draft
- filled-draft
- repair-suggestion
- migration-suggestion
- reviewed
- unknown

Rules

- Output kind must state whether the generated content is a skeleton, draft, suggestion, or reviewed artifact.
- Review state must not be overstated.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Overclaim Risk
- Missing Input Risk
- Review Boundary

Rules

- Generated content does not prove its own correctness.
- A generated artifact should still be validated by the relevant schema and reviewed when semantics matter.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a generation contract when artifact creation should be repeatable, form-buildable, promptable, or repairable without repeatedly interpreting schema prose.
- Do not create a generation contract when creation is entirely manual and no reusable input or step contract exists.

### Creation Inputs

Required Fields

- Generation Handle
- Target Schema
- Target Output
- Required Inputs
- Generation Steps
- Output Boundary
- Interpretation Limits

Optional Fields

- Defaults
- Derived Values
- Prompt Surface
- Examples

Rules

- Required inputs should map to field or section contracts when possible.
- Generation steps should be small and ordered.

### Generation Rules

Rules

- Build the skeleton before filling optional values.
- Ask or mark unknown before inventing required provenance.
- Preserve source, method, state, and interpretation limits where the target schema requires them.
- Run validation after generation when a validator exists.

## Validation-Friendly Shape

- Generation Handle, target schema, input source policy, step handles, and output kind should be extractable as field values.
- Unknown input handling should be explicit.
- Generated examples should identify whether they are skeletons, drafts, or reviewed artifacts.

## Minimal Example

```text
# Schema Generation: Annotation skeleton

## Generation Identity

Generation Handle: annotation-skeleton
Generation Name: Annotation skeleton generation
Generation Kind: artifact-skeleton

## Generation Target

Target Schema: tiinex.annotation.v1
Target Output: full artifact skeleton

## Required Inputs

- Target Identifier
  - Input Source Policy: human-input
- Annotation Kind
  - Input Source Policy: human-input
- Annotation Value
  - Input Source Policy: human-input

## Generation Steps

- create-annotation-target-section
  - Step Action: create-section
  - Step Order: 10
  - Uses Section Contract: annotation-target

- fill-target-identifier
  - Step Action: ask-user
  - Step Order: 20
  - Uses Field Contract: target-identifier
  - On Missing Input: mark-unknown

## Output Boundary

Output Kind: skeleton
Review State: unreviewed draft

## Interpretation Limits

Does Not Mean: the annotation value is correct
Must Not Be Used To Claim: target or value has been validated
```

## Relationship to Other Schemas

- `schema.section`, `schema.field`, and `schema.value` provide generation building blocks.
- `schema.rule` may produce repair flows.
- `interaction.unit` may expose generation inputs as UI or human interaction units.
- `validation.report` may record post-generation validation.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/1669696ea4f498adf8924476c9f3bc8313993689/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: N3HHx97V1jljnruVv5EpxBnQqgJiUUtul7yXWfSuJJ8

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: IYfPs40EcSSOOeogvE6zvhdDcbUTf-p5En3dh-PM4NE