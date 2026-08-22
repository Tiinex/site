# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:00
  - Trace: [Architect cold-start trust foundation](001-architect-cold-start-trust-foundation.trace.md)
  - Origin:
    - [relative](001-architect-cold-start-trust-foundation.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:04
  - Authors: Architect
  - Why: Decompose the Architect cold-start trust foundation into a bounded work unit that remains visible/recoverable in Tiinex lineage and Work in Progress projections.
  - Summary: Cold-start orientation and bootstrap
  - Status: draft/local

---

# Cold-start orientation and bootstrap

## Objective

Create the smallest reusable orientation layer that lets a competent fresh consumer discover Tiinex authority, Handoff/Task navigation, material state, and available tooling without embedding the current work semantics or depending on Project Instructions.

## Done Criteria

- Bootstrap/orientation explains how to find Role, Handoff, controlling Task, Required versus Reference Context, validation/tooling affordances, and unresolved state while remaining explicitly non-authoritative transport convenience.\n- Work semantics remain in Tiinex artifacts; routing text can stay template-only.\n- A consumer can discover relevant portable tooling rather than requiring memorized command names or ad-hoc reimplementation of Tiinex-specific operations.\n- Orientation works in an empty project with no prior conversation and does not require network when closure material is locally sufficient.\n- Project Instructions may later be measured as an optimization but are not required by the baseline qualification.

## Scope

Reusable orientation only. Do not serialize prompt-engineering personality, current Task instructions, hidden role state, or semantic authority into bootstrap convenience material.

## Dependencies

Recipient-relative transport closure, durable Role/Handoff/Task material, and available portable tooling discovery surfaces.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:xskeHzj_ypVkztswdK6yj0tOa0G5JelzZgmMKhmuZ34