<!-- Tiinex web schema snapshot: local embedded copy bound by adjacent .schema.json. Path is a discovery hint; schema identity and contract remain inside the artifact. -->

# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.presentation.surface.v1](tiinex.presentation.surface.v1.schema.md)
  - Summary: Presentation surface schema for bounded surfaces inside or across interfaces.

---

# Presentation Surface

## Summary

A presentation surface is a bounded place or mode where artifact material, interaction units, validation reports, or module capabilities may be shown, asked, filled, selected, inspected, or audited. It is not a React component, CSS class, browser route, whole application interface, or validation result.

## Schema Validation Contract

### Presentation Surface Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.presentation.surface.v1`

Rules

- `tiinex.presentation.surface.v1` identifies artifacts whose main job is to define a bounded implementation-neutral presentation or interaction surface.
- A presentation surface must distinguish surface identity, role, content boundary, interaction capability, disclosure boundary, relationship to interface, and implementation limits.
- A surface must not silently become an interface, tool, route, validation result, evidence artifact, or source portal.

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

### Surface Identity

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

