# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-19 00:00:00
  - Summary: Canonical browser-local standalone Task creation transition.

---

# Create standalone Task

## Transition Identity

- Name: Create standalone Task
- Version: 1
- Canonical Identifier: tiinex.site.create-task.v1
- Human Label: Task

## Purpose And Scope

- Purpose: Create one browser-local standalone Task in the selected workspace.
- Semantic Boundary: Standalone local Task creation only; no Parent, relation materialization, remote write, or source provenance is implied.

## Input Roles

- none

## Output Roles

- task
  - Meaning: Standalone Task created by the invocation.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.task.v1
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-task
  - Target Binding: task
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create

### Parent Effects

- none

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: A workspace may create one standalone browser-local Task when exact Task generation and local placement authority are qualified.
- Failure Meaning: Task creation remains unavailable when exact schema, generation, or local placement authority cannot be resolved.
- Unknown Meaning: Unknown or unavailable authority remains unresolved and must not be guessed.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- workspace-draft
  - Meaning: Browser-local workspace selected by this invocation.
  - Required: yes

### Output Placements

- task-placement
  - Output Binding: task
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
  - Value: tiinex.site.bundle:create-task-transition-definition.trace.md:v1
