# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/site/blob/6ac71a3a3d3be0d3fc73450dc3c1d45a0a4ed94a/src/schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](https://github.com/Tiinex/site/blob/6ac71a3a3d3be0d3fc73450dc3c1d45a0a4ed94a/src/schemas/tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/site/blob/6ac71a3a3d3be0d3fc73450dc3c1d45a0a4ed94a/src/schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.module.v1](https://github.com/Tiinex/site/blob/6ac71a3a3d3be0d3fc73450dc3c1d45a0a4ed94a/src/schemas/schema/module/tiinex.schema.module.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines a portable schema capability bundle so tools and people can declare schema-related validators, interaction units, viewers, forms, helpers, and implementation limits without hiding them in application code.
  - Summary: Schema module bundle schema for human-first capability declarations around Tiinex schema families and schema chains.

---

# Schema Module

## Summary

Defines a human-readable bundle of capabilities associated with a Tiinex schema, schema family, or schema chain.

A schema module is not a Node module, React package, plugin binary, hidden registry entry, validator method, or validation result. It is a provenance-bearing declaration of which schema semantics a person, tool, or environment knows how to interpret and which capabilities it can provide around those semantics.

A module may list validation method implementations, interaction units, viewer capabilities, form capabilities, helper actions, presentation surfaces, portability notes, and fallback behavior. Implementations in JavaScript, React, Python, CLI tools, paper processes, or LLM workflows may all implement the same schema module contract differently.

## Core Semantics

- A schema module describes implemented or intended capabilities around a schema, schema family, or schema chain.
- A schema module may depend on parent modules, reusable validation methods, tools, interfaces, adapters, portals, or interaction units.
- The root schema module can act as fallback for artifacts whose specific schema module is unavailable.
- A schema module does not change the schema it references.
- A schema module does not validate an artifact by existing.
- A schema module may expose validator implementations, but `validation.method` owns method semantics.
- A schema module may report that a validator was run or unavailable only through validation findings or validation reports; `validation.report` owns run/result semantics.
- A schema module must keep semantic capability declarations separate from framework-specific implementation details.

## Schema Validation Contract

### Schema Module Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.module.v1`

Rules

- `tiinex.schema.module.v1` identifies artifacts whose main job is to define a capability bundle for interpreting, validating, creating, viewing, or interacting with one or more schemas.
- A schema module must distinguish module identity, schema coverage, dependency chain, capabilities, validator implementations, fallback behavior, and implementation limits.
- A schema module may be implemented by software, a human process, or a mixed workflow, but it must remain readable without knowing a specific software stack.
- A schema module is not itself a code module, plugin binary, schema definition, validation method, validation report, or user interface.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Schema Module Body

Required Shape

- first body heading after the continuity envelope
- `## Module Identity` section
- `## Schema Coverage` section
- `## Dependency Chain` section
- `## Capability Map` section
- `## Fallback Behavior` section
- `## Implementation Limits` section

Optional Sections

- `Validator Implementations`
- `Interaction Units`
- `Viewer Capabilities`
- `Form Capabilities`
- `Action Capabilities`
- `Presentation Capabilities`
- `Runtime Bindings`
- `Portability Notes`
- `Examples`
- `Related Modules`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should make it clear what the module can support and what it cannot support.
- Optional capability sections must not imply validation success, evidence status, truth, preservation, authorship, or consent by themselves.

### Module Identity

Required Fields

- Module Name
- Module ID
- Module Version
- Module Status

Optional Fields

- Module Family
- Maintainer
- Supersedes
- Related Module

Rules

- `Module ID` should be stable enough for tools and reports to reference.
- `Module Version` should change when capability interpretation, fallback behavior, validator scope, or implementation limits change.
- `Module Status` should distinguish draft, experimental, maintained, deprecated, replaced, unavailable, or local-only modules.

### Schema Coverage

Required Fields

- Primary Schema
- Applies To

Optional Fields

- Parent Schemas
- Child Schemas
- Schema Family
- Coverage Level
- Exclusions

Rules

- `Primary Schema` should name the schema the module is primarily associated with.
- `Applies To` should state whether the module applies to all artifacts, one schema, a schema family, a chain, or a bounded artifact set.
- If coverage is partial, the limits must be stated.

### Dependency Chain

Required Fields

- Depends On
- Inherits From

Optional Fields

- Optional Dependencies
- Reusable Methods
- Required Tools
- Required Interfaces
- Required Portals
- Missing Dependency Behavior

Allowed Labels

- none
- not-applicable
- root
- module id
- schema id
- validation method id
- tool id
- interface id
- portal id

Rules

- Root-level modules may use `none`, `not-applicable`, or `root` when no parent module exists beyond the root envelope semantics.
- Child modules should declare parent or fallback modules explicitly.
- Missing dependencies should produce degraded, skipped, unavailable, or fallback behavior rather than hidden failure.

### Capability Map

Required Fields

- Capabilities
- Capability Boundaries

Optional Fields

- Validators
- Interaction Units
- Viewers
- Forms
- Actions
- Helpers
- Presentation Surfaces
- Importers
- Exporters
- Portals
- Source Access Modes

Rules

- Capabilities should be listed in human-readable terms.
- A capability must not imply a stronger semantic claim than its referenced schema, method, or tool supports.
- Capability names should be stable enough for reports, UIs, LLMs, or external implementations to reference.
- Source access capabilities may be declared by a module, but portal and adapter artifacts still own the source-resolution and access-boundary semantics.

### Fallback Behavior

Required Fields

- When Used
- Fallback Result

Optional Fields

- Parent Fallback
- Missing Child Module Behavior
- Unknown Schema Behavior
- Unknown Method Behavior
- User Disclosure

Rules

- Fallback behavior must state what still works and what is not known.
- A root module fallback may validate and display root/envelope semantics, but it must not silently claim child-schema-specific validity.
- Unknown schemas or missing child modules should be visible to users and reports.

### Implementation Limits

Required Fields

- Does Not Provide
- Must Not Be Used To Claim

Optional Fields

- Runtime Assumptions
- Framework Assumptions
- Tool Assumptions
- Security Boundary
- Privacy Boundary
- Known Failure Modes

Rules

- Implementation limits must state what the module cannot do.
- A module must not hide framework, runtime, network, API, authentication, or persistence assumptions when those assumptions affect interpretation.

## Recommended Optional Sections

### Validator Implementations

Allowed Labels

- Method ID
- Provided By
- Applies To
- Positive Scope
- Negative Scope
- Required Inputs
- Output Shape
- Failure Modes
- Unknown Method Behavior
- Unavailable Method Behavior

Rules

- Validator implementations should reference validation method identities when available.
- A validator implementation is not the validation method itself unless it is also represented as a validation method artifact.
- `validation.method` owns method semantics.
- `validation.report` and validation findings own run/result semantics.
- Output should be suitable for validation finding or validation report artifacts.

### Interaction Units

Allowed Labels

- Unit IDs
- Unit Source
- Unit Coverage
- Required Units
- Optional Units
- Derived Units

Rules

- Interaction units should remain implementation-neutral.
- A module may provide local/generated units, but portable units should be artifact-backed when they need to travel across environments.

### Viewer Capabilities

Allowed Labels

- Supported Surfaces
- Summary Fields
- Detail Fields
- Disclosure Controls
- Unknown Field Behavior

Rules

- Viewer capability describes how semantics may be displayed, not proof that the displayed material is valid or complete.

### Form Capabilities

Allowed Labels

- Supported Units
- Required Inputs
- Optional Inputs
- Draft Behavior
- Unknown Input Behavior

Rules

- Form capability describes how artifacts may be created or edited, not proof that resulting artifacts are valid unless validation methods are run and reported.

### Presentation Capabilities

Allowed Labels

- Supported Surfaces
- Surface Boundaries
- Compact Surfaces
- Detail Surfaces
- Audit Surfaces

Rules

- Presentation capabilities should reference `presentation.surface` artifacts when portability or cross-environment implementation matters.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.schema.module.v1` artifact when a portable capability bundle around a schema, schema family, or schema chain must be declared and reviewed.
- Do not create this artifact for a software package manifest by itself, a React package, a component declaration, a validation method definition, a validation report, a concrete UI screen, or a schema family definition by itself.
- A schema module may expose validator implementations, interaction units, presentation surfaces, viewers, forms, helpers, and fallback behavior, but it does not own schema semantics, validation method semantics, or validation report results.

### Required Inputs

Required Fields

- Module Name
- Module Id
- Module Version
- Module Status
- Primary Schema
- Applies-To Boundary
- Dependency Chain
- Capability List
- Capability Boundaries
- Fallback Behavior
- Implementation Limits

Optional Fields

- Source Access Modes
- Validator Implementations
- Interaction Units
- Presentation Surfaces
- Form Capabilities
- Viewer Capabilities
- Helper Capabilities
- Related Validation Methods
- Related Validation Reports

Rules

- Dependency fields may use `none`, `root`, `not-applicable`, or explicit dependency references when appropriate.
- Validator implementations must identify the validation method semantics they implement when such methods exist.
- `validation.method` owns method semantics; `validation.report` owns run and result semantics.
- Source access modes are capabilities, not truth, evidence, preservation, or validation claims.

### Generation Rules

Rules

- Name the module and assign a stable module id.
- State which schema, schema family, or schema chain it covers.
- Declare dependencies and fallback modules explicitly.
- List capabilities in human-readable terms.
- Declare validator implementations as implementations of validation methods, not as method semantics.
- Declare interaction units and presentation surfaces when they are portable or artifact-backed.
- State fallback behavior for unknown schemas, missing child modules, and unavailable methods.
- State implementation limits and framework/runtime assumptions.

### Suggested Sequence

Rules

- Identify the schema boundary the module covers.
- Declare module identity, version, status, and dependencies.
- Declare capabilities and their limits.
- Declare validator implementation boundaries separately from validation method semantics.
- Declare interaction and presentation capabilities when they are intended to travel outside one app implementation.
- Declare fallback and unavailable behavior.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Creation guidance should be derived from the same required sections, fields, labels, and rules whenever possible.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Tiinex Root Schema Module

## Module Identity

Module Name: Tiinex Root Module
Module ID: tiinex.module.root.v1
Module Version: 1
Module Status: draft

## Schema Coverage

Primary Schema: tiinex.root.v1
Applies To: all Tiinex artifacts with a root continuity envelope
Coverage Level: root-envelope only

## Dependency Chain

Depends On: none
Inherits From: root
Missing Dependency Behavior: root fallback only

## Capability Map

Capabilities: parse root envelope, show fallback artifact detail, run root-envelope validator, expose root interaction units, produce validation report entries
Capability Boundaries: does not validate child schema bodies
Validators: root-envelope-shape
Interaction Units: root.current.schema, root.parent.trace, root.integrity.footer
Viewers: fallback-card, fallback-detail
Forms: fallback-section-form

## Fallback Behavior

When Used: current schema module is unknown, unavailable, or unsupported
Fallback Result: show and audit root/envelope semantics only
Unknown Schema Behavior: disclose unsupported current schema and skip child-specific validators
Unknown Method Behavior: report unavailable or unknown method

## Implementation Limits

Does Not Provide: child schema body validity, truth verification, authorship verification, consent verification, evidence promotion, preservation
Must Not Be Used To Claim: that the artifact is valid under its child schema or that its content is true
```

## Relationship to Other Schemas

- `schema.family` describes schema family semantics; `schema.module` describes capability bundles around schemas or families.
- `interaction.unit` describes portable units the module may expose.
- `presentation.surface` describes bounded surfaces the module may expose.
- `validation.method` defines method semantics; module validator implementations may implement those methods.
- `validation.report` records the result of running module-provided validators.
- `tool` and `interface` may describe concrete tools or user-facing surfaces that implement a module.
- `portal` may provide source-state context for module capabilities that resolve external material.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/site/blob/6ac71a3a3d3be0d3fc73450dc3c1d45a0a4ed94a/src/schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: -Vq3rkoLpv6dalUiQbzVsyxAaxrb3LmOpjhmiCErdm0