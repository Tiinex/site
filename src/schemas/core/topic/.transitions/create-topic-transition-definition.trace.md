# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-19 00:00:00
  - Summary: Canonical browser-local standalone Topic creation transition.

---

# Create standalone Topic

## Transition Identity

- Name: Create standalone Topic
- Version: 1
- Canonical Identifier: tiinex.site.create-topic.v1
- Human Label: Topic

## Purpose And Scope

- Purpose: Create one browser-local standalone Topic in the selected workspace.
- Semantic Boundary: Standalone local Topic creation only; no Parent, relation materialization, remote write, or source provenance is implied.

## Input Roles

- none

## Output Roles

- topic
  - Meaning: Standalone Topic created by the invocation.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-topic
  - Target Binding: topic
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create

### Parent Effects

- none

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: A workspace may create one standalone browser-local Topic when exact Topic generation and local placement authority are qualified.
- Failure Meaning: Topic creation remains unavailable when exact schema, generation, or local placement authority cannot be resolved.
- Unknown Meaning: Unknown or unavailable authority remains unresolved and must not be guessed.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- workspace-draft
  - Meaning: Browser-local workspace selected by this invocation.
  - Required: yes

### Output Placements

- topic-placement
  - Output Binding: topic
  - Destination Binding: workspace-draft
  - Placement Intent: new-materialization
  - Naming Authority: explicit-binding
  - Explicit Override Allowed: no

## Interpretation Limits

- Does Not Prove: remote publication, source provenance, Parent ancestry, or relation semantics.
- Must Not Be Inferred: a source repository, a Parent, a cross-workspace relation, or universal standalone creation for other schemas.

# Continuity Integrity

- bundled-source-identity-v1
  - Towards: self
  - Value: tiinex.site.bundle:create-topic-transition-definition.trace.md:v1
