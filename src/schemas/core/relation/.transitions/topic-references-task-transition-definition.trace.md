# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-19 00:00:00
  - Summary: Canonical browser-local Topic to Task durable Reference transition.

---

# Topic references Task

## Transition Identity

- Name: Topic references Task
- Version: 1
- Canonical Identifier: tiinex.site.topic-references-task.v1
- Human Label: Reference

## Purpose And Scope

- Purpose: Create one browser-local Relation artifact recording a durable typed non-parent reference from the selected Topic to one distinct Task.
- Semantic Boundary: Bounded Topic subject to Task target Reference only; neither participant is mutated, Parent is not assigned, and the relation does not prove truth, evidence, authority, or dependency.

## Input Roles

- reference-subject
  - Meaning: Existing Topic that is the subject of this bounded Reference.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Acquisition Policy: existing-only

- reference-target
  - Meaning: Existing distinct Task selected as the referenced object.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.task.v1
  - Acquisition Policy: existing-only

## Output Roles

- relation-output
  - Meaning: Durable Relation artifact created to preserve the bounded Reference meaning.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.relation.v1
  - Generation Binding: [Reference Relation Generation](site-local:src/schemas/core/relation/.generation/reference-relation-generation-authority.trace.md)

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-reference-relation
  - Target Binding: relation-output
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create

### Parent Effects

- none

## Relation Effects

- topic-references-task
  - Effect: declare
  - Subject Binding: reference-subject
  - Predicate Identifier: topic-references-task
  - Predicate Meaning: Topic records a durable non-parent reference to the selected Task.
  - Object Binding: reference-target
  - Directionality: directed
  - Member Mapping: pairwise
  - Mapping Meaning: The single selected Topic is related to the single selected Task.

## Applicability And Conditions

- Applicability Meaning: A currently selected canonical Topic may create one local Reference Relation when a distinct canonical Task target and exact generation authority are qualified.
- Failure Meaning: Reference remains unavailable when subject, target, generation authority, durable participant identity, or local placement cannot be qualified exactly.
- Unknown Meaning: Unknown or unavailable participant or generation authority remains unresolved and must not be guessed.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- workspace-draft
  - Meaning: Browser-local workspace selected by this invocation.
  - Required: yes

### Output Placements

- relation-placement
  - Output Binding: relation-output
  - Destination Binding: workspace-draft
  - Placement Intent: new-materialization
  - Naming Authority: explicit-binding
  - Explicit Override Allowed: no

## Interpretation Limits

- Does Not Prove: that the Reference target is true, evidence, authoritative, required, dependent, or a continuity ancestor.
- Must Not Be Inferred: Parent ancestry, source provenance for the local Relation artifact, participant mutation, universal Reference applicability, or a global predicate named reference.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: RgZl2wpzDxDOun00yEjl_mDzByMGpR04WS5684u-z5Y

- bundled-source-identity-v1
  - Towards: self
  - Value: tiinex.site.bundle:topic-references-task-transition-definition.trace.md:v1
