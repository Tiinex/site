# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-17 00:00:00
  - Summary: Canonical browser-local Topic to Task product transition.

---

# Topic to Task

## Transition Identity

- Name: Topic to Task
- Version: 1
- Canonical Identifier: tiinex.site.topic-to-task.v1
- Human Label: Create task

## Purpose And Scope

- Purpose: Create one browser-local Task that directly continues the selected Topic.
- Semantic Boundary: Canonical local Task creation only; no remote write, repository path allocation, relation materialization, or source mutation.

## Input Roles

- source-topic
  - Meaning: Topic used as the direct continuity source.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Acquisition Policy: existing-only

## Output Roles

- task
  - Meaning: Task created by the invocation.
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

- task-continues-topic
  - Output Binding: task
  - Parent Binding: source-topic
  - Effect: set

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: A currently selected canonical Topic may create one local Task when the invocation and materialization plan qualify.
- Failure Meaning: Creation remains unavailable when canonical authority, bindings, Parent recovery, or materialization preflight cannot be qualified.
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

- Does Not Prove: remote publication, repository path allocation, generic relation execution, Condition evaluation, or filesystem materialization.
- Must Not Be Inferred: a repository path, File Naming resolver, source mutation, or legacy continuation semantics.

# Continuity Integrity

- bundled-source-identity-v1
  - Towards: self
  - Value: tiinex.site.bundle:topic-to-task-transition-definition.trace.md:v1
