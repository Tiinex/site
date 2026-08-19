# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-19 00:00:00
  - Summary: Canonical browser-local Evidence to Interpretation Use-as transition.

---

# Evidence to Interpretation

## Transition Identity

- Name: Evidence to Interpretation
- Version: 1
- Canonical Identifier: tiinex.site.evidence-to-interpretation.v1
- Human Label: Use as

## Purpose And Scope

- Purpose: Create one browser-local Interpretation that explicitly uses the selected Evidence as a bounded interpretation source.
- Semantic Boundary: Durable Use-as interpretation only; the selected Evidence remains unchanged and the result does not prove that the interpreted role is true.

## Input Roles

- source-evidence
  - Meaning: Existing Evidence used as the bounded interpretation source.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.evidence.v1
  - Acquisition Policy: existing-only

## Output Roles

- interpretation
  - Meaning: Interpretation created by the invocation.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.interpretation.v1
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-interpretation
  - Target Binding: interpretation
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create

### Parent Effects

- interpretation-continues-source
  - Output Binding: interpretation
  - Parent Binding: source-evidence
  - Effect: set

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: A currently selected canonical Evidence artifact may create one local Interpretation when exact schema, binding, Parent, generation, and placement authority qualify.
- Failure Meaning: Use-as remains unavailable when the current participant is not qualified Evidence or when canonical generation/materialization authority cannot be resolved.
- Unknown Meaning: Unknown or unavailable authority remains unresolved and must not be guessed.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- workspace-draft
  - Meaning: Browser-local workspace selected by this invocation.
  - Required: yes

### Output Placements

- interpretation-placement
  - Output Binding: interpretation
  - Destination Binding: workspace-draft
  - Placement Intent: new-materialization
  - Naming Authority: explicit-binding
  - Explicit Override Allowed: no

## Interpretation Limits

- Does Not Prove: that the selected target role is correct, complete, accepted, authorized, or remotely published.
- Must Not Be Inferred: source mutation, universal Use-as applicability, source provenance for the created local artifact, or generic Reference semantics.

# Continuity Integrity

- bundled-source-identity-v1
  - Towards: self
  - Value: tiinex.site.bundle:evidence-to-interpretation-transition-definition.trace.md:v1
