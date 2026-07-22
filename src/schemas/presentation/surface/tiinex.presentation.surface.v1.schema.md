# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/site/blob/c1832f373a91f8210eb202ad6903aef4607fb5b9/src/schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](https://github.com/Tiinex/site/blob/c1832f373a91f8210eb202ad6903aef4607fb5b9/src/schemas/tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.presentation.surface.v1](https://github.com/Tiinex/site/blob/6807b03b39bbdd9859b69168b2910d7273cb2072/src/schemas/presentation/surface/tiinex.presentation.surface.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines implementation-neutral presentation surfaces so artifacts, interaction units, audit reports, and schema modules can describe bounded display/interaction contexts without making a framework or app registry the authority.
  - Summary: Presentation surface schema for bounded surfaces inside or across interfaces.

---

# Presentation Surface

## Summary

Defines a bounded presentation surface where artifact material, interaction units, validation reports, or module capabilities may be shown, asked, filled, selected, inspected, or audited.

A presentation surface is not a React component, CSS class, browser route, whole application interface, or validation result. It is an implementation-neutral description of a bounded place or mode of presentation. A single interface may contain many surfaces, and the same surface may be implemented in a browser app, CLI, LLM workflow, paper checklist, spoken procedure, or other environment.

## Core Semantics

- `interface` = larger user-facing or tool-facing boundary.
- `presentation.surface` = bounded surface inside or across interfaces.
- `interaction.unit` = semantic unit shown, asked, filled, selected, transformed, or audited on a surface.
- `schema.module` = capability bundle that may expose units, surfaces, validators, forms, viewers, and helpers.
- A presentation surface describes where and how meaning may be disclosed or interacted with.
- A presentation surface does not validate content, prove truth, preserve material, or become evidence by itself.
- A presentation surface should remain implementable outside a specific software framework.

## Schema Validation Contract

### Presentation Surface Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.presentation.surface.v1`

Rules

- `tiinex.presentation.surface.v1` identifies artifacts whose main job is to define a bounded implementation-neutral presentation or interaction surface.
- A presentation surface must distinguish surface identity, role, content boundary, interaction capability, disclosure boundary, relationship to interface, and implementation limits.
- A surface may be implemented by a tool, interface, React component, CLI command, LLM workflow, or human procedure, but the implementation is not the semantic authority.
- A surface must not silently become an interface, tool, route, validation result, evidence artifact, or source portal.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Presentation Surface Body

Required Shape

- first body heading after the continuity envelope
- `## Surface Identity` section
- `## Surface Role` section
- `## Interface Relationship` section
- `## Content Boundary` section
- `## Interaction Capability` section
- `## Disclosure Boundary` section
- `## Implementation Limits` section

Optional Sections

- `Interaction Units`
- `Module Bindings`
- `Validation Report Mapping`
- `Accessibility Notes`
- `Portability Notes`
- `Examples`
- `Related Surfaces`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should state what the surface may show or allow and what it must not imply.
- Optional sections must not replace the declared content, disclosure, or implementation limits.

### Surface Identity

Required Fields

- Surface Name
- Surface ID
- Surface Kind
- Stability

Optional Fields

- Owner Module
- Owner Interface
- Related Surface
- Version

Allowed Labels

- card
- detail
- list
- table
- tree
- graph
- map
- timeline
- form
- audit-report
- prompt
- checklist
- command
- spoken
- print
- composite

Rules

- `Surface ID` should be stable enough for schema modules, interaction units, tools, and reports to reference.
- `Surface Kind` describes the presentation boundary, not the framework component.
- `Stability` should distinguish draft, experimental, maintained, deprecated, or replaced.

### Surface Role

Required Fields

- Purpose
- Primary Audience
- Primary Use

Optional Fields

- Not For
- Reader Assumptions
- Tool Assumptions
- Human Instruction

Rules

- `Purpose` should state why the surface exists.
- `Primary Use` should state whether the surface is for scanning, reading, editing, validating, auditing, selecting, navigating, presenting, or another bounded use.
- The role must not be defined only by a software component name.

### Interface Relationship

Required Fields

- Interface Relationship
- Interface Boundary

Optional Fields

- Parent Interface
- Containing Interface
- Cross-Interface Use
- Tool Interface
- Human Procedure

Allowed Labels

- inside-interface
- across-interfaces
- interface-independent
- tool-facing
- human-procedure
- not-applicable

Rules

- `Interface Relationship` must clarify how the surface differs from or relates to `tiinex.interface.v1`.
- A presentation surface may live inside an interface, be reused across interfaces, or be interface-independent.
- A surface must not duplicate interface-level authority unless an interface artifact explicitly owns that boundary.

### Content Boundary

Required Fields

- May Contain
- Must Not Contain

Optional Fields

- Required Units
- Optional Units
- Hidden Units
- Truncation Policy
- Ordering Policy
- Redaction Policy

Rules

- `May Contain` should state the kinds of material the surface may present.
- `Must Not Contain` should state material or claims the surface must not present or imply.
- If content is summarized, truncated, filtered, or hidden, that boundary should be explicit.

### Interaction Capability

Required Fields

- Supported Interactions
- User Invocation
- Write Capability
- Side Effects

Optional Fields

- Confirmation Required
- Edit Boundary
- Navigation Boundary
- Audit Boundary
- Source Access Boundary

Allowed Labels

- none
- draft-only
- in-memory-only
- artifact-write
- source-write
- external-write
- unknown

Rules

- `Supported Interactions` should state what a person or tool can do on the surface.
- `User Invocation` should state how actions are invoked and whether confirmation is needed.
- Write capability and side effects must be explicit.
- A surface should not perform hidden source access, persistence, routing, or validation mutation without an owning tool/interface/action artifact.

### Disclosure Boundary

Required Fields

- What Is Disclosed
- What Is Hidden Or Deferred
- Expansion Path

Optional Fields

- Disclosure Level
- Redaction Behavior
- Privacy Boundary
- Interpretation Warning

Rules

- A surface must state disclosure limits when it summarizes, hides, redacts, truncates, or defers material.
- Hidden or deferred material must not be interpreted as absent unless a method or artifact supports that claim.
- Expansion paths should point to detail, audit, source, portal, validation report, or related artifacts when available.

### Implementation Limits

Required Fields

- Does Not Provide
- Must Not Be Used To Claim

Optional Fields

- Framework Assumptions
- Runtime Assumptions
- Accessibility Limits
- Security Boundary
- Known Failure Modes

Rules

- Implementation limits must state what the surface does not provide.
- A surface must not claim validation, truth, preservation, identity, consent, authorship, or source completeness unless those claims are supported elsewhere.

## Recommended Optional Sections

### Interaction Units

Allowed Labels

- Required Units
- Optional Units
- Derived Units
- Unit Ordering
- Unit Grouping
- Missing Unit Behavior

Rules

- Interaction units should be referenced by stable unit ids when available.
- Missing units should be disclosed or degraded rather than silently invented.

### Module Bindings

Allowed Labels

- Module ID
- Capability Name
- Fallback Module
- Unknown Module Behavior

Rules

- Module bindings should reference schema modules when the surface is provided by a capability bundle.
- A surface may exist independently of a module, but unknown module behavior should be explicit when module binding is expected.

### Validation Report Mapping

Allowed Labels

- Report Surface Role
- Finding Display
- Method Display
- Unknown Method Display
- Unavailable Method Display
- Result Disclosure

Rules

- A validation-report surface may display validation results, but validation report artifacts own result semantics.
- Surfaces must not convert unknown, unavailable, skipped, or unconfirmed results into pass/fail without method support.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.presentation.surface.v1` artifact when a bounded implementation-neutral presentation or interaction surface must be shared, reviewed, generated, or reused.
- Do not create this artifact for a whole interface boundary, concrete framework component, CSS/layout style by itself, source portal, validation method, validation report, or route/history state.
- A presentation surface should remain a bounded surface inside or across interfaces, not a duplicate of the broader interface schema.

### Required Inputs

Required Fields

- Surface Name
- Surface Id
- Surface Kind
- Stability
- Purpose
- Primary Audience
- Primary Use
- Interface Relationship
- Interface Boundary
- May-Contain Boundary
- Must-Not-Contain Boundary
- Supported Interactions
- User Invocation Boundary
- Write Capability
- Side Effects
- Disclosure Boundary
- Implementation Limits

Optional Fields

- Interaction Units
- Conditional Behavior
- Schema Modules
- Validation Report Mapping
- Form Mapping
- Viewer Mapping
- Accessibility Notes
- Related Interface

Rules

- Interface is the larger user- or tool-facing boundary; presentation surface is a bounded surface within or across interfaces.
- Interaction units are semantic units that may be shown, asked, filled, audited, or presented on the surface.
- Write capability and side effects must be explicit.
- Framework, route, DOM, CSS, and component details must not become semantic authority unless a separate schema owns that technical boundary.

### Generation Rules

Rules

- Name the surface and assign a stable surface id.
- State the surface kind without using framework names as authority.
- State how the surface relates to interface boundaries.
- Define what the surface may contain and must not contain.
- Define supported interactions, write capability, and side effects.
- Define disclosure boundaries and expansion paths.
- Add interaction-unit, module, or validation-report mappings only when they clarify portable behavior.
- State implementation limits and claims the surface must not support.

### Suggested Sequence

Rules

- Identify the bounded presentation or interaction surface.
- State its audience, use, and interface relationship.
- Declare what it may contain and must not contain.
- Declare supported interactions, write boundaries, and side effects.
- Link interaction units, conditions, modules, or validation reports without absorbing their semantics.
- Declare implementation limits.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Creation guidance should be derived from the same required sections, fields, labels, and rules whenever possible.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Artifact Card Surface

## Surface Identity

Surface Name: Artifact Card
Surface ID: tiinex.surface.artifact-card.v1
Surface Kind: card
Stability: draft
Owner Module: tiinex.module.root.v1

## Surface Role

Purpose: Show a compact summary of one artifact and its most important provenance signals.
Primary Audience: human reader or tool selecting artifacts
Primary Use: scan, compare, select, navigate
Not For: full validation, complete artifact reading, evidence promotion

## Interface Relationship

Interface Relationship: inside-interface
Interface Boundary: may appear inside a web app, CLI list, LLM summary, printed checklist, or other artifact selection interface
Containing Interface: optional; interface artifact owns the whole user-facing boundary when present

## Content Boundary

May Contain: artifact title, current schema, parent summary, source badges, audit status summary, important interaction units
Must Not Contain: hidden claims that the artifact is valid, true, preserved, or evidence
Truncation Policy: compact summary only; detail surface required for full reading

## Interaction Capability

Supported Interactions: open detail, open lineage, run audit, copy reference
User Invocation: user click, keyboard action, CLI selection, spoken confirmation, or LLM-selected action with confirmation
Write Capability: none
Side Effects: navigation or in-memory report only unless another action is invoked

## Disclosure Boundary

What Is Disclosed: summary and key provenance signals
What Is Hidden Or Deferred: full body, full validation findings, full integrity details
Expansion Path: open detail or audit report

## Implementation Limits

Does Not Provide: full validation, full reading, preservation, evidence promotion
Must Not Be Used To Claim: that hidden material is absent or that summarized material is complete
```

## Relationship to Other Schemas

- `interface` describes a larger user-facing or tool-facing boundary that may contain many surfaces.
- `presentation.surface` describes a bounded surface inside or across interfaces.
- `interaction.unit` describes semantic units shown, asked, filled, selected, transformed, or audited on a surface.
- `schema.module` may declare surface capabilities for a schema or schema family.
- `tool` may describe a concrete tool that implements a surface.
- `validation.report` may be shown through an audit-report surface but owns the validation result semantics.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: TARGET_PLACEHOLDER

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 5hGk_VqPOynqB1ucSsyZbZQxd8-g_gqhUQpsZJcJrVo