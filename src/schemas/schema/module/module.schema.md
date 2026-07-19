<!-- Tiinex web schema snapshot: local embedded copy bound by adjacent .schema.json. Path is a discovery hint; schema identity and contract remain inside the artifact. -->

# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.module.v1](tiinex.schema.module.v1.schema.md)
  - Summary: Schema module bundle schema for human-first capability declarations around Tiinex schema families and schema chains.

---

# Schema Module

## Summary

A schema module is a provenance-bearing declaration of which schema semantics a person, tool, or environment knows how to interpret and which capabilities it can provide. It is not a Node module, React package, plugin binary, hidden registry entry, validator method, or validation result.

## Schema Validation Contract

### Schema Module Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.module.v1`

Rules

- `tiinex.schema.module.v1` identifies artifacts whose main job is to define a capability bundle for interpreting, validating, creating, viewing, or interacting with one or more schemas.
- A schema module must distinguish module identity, schema coverage, dependency chain, capabilities, validator implementations, fallback behavior, and implementation limits.
- A schema module is not itself a code module, plugin binary, schema definition, validation method, validation report, or user interface.

### Schema Module Body

Required Shape

- first body heading after the continuity envelope
- `## Module Identity` section
- `## Schema Coverage` section
- `## Dependency Chain` section
- `## Capability Map` section
- `## Fallback Behavior` section
- `## Implementation Limits` section

### Fallback Behavior

Rules

- Fallback behavior must state what still works and what is not known.
- A root module fallback may validate and display root/envelope semantics, but it must not silently claim child-schema-specific validity.
- Unknown schemas or missing child modules should be visible to users and reports.

