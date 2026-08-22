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
  - Created At: 2026-08-22 18:46:05
  - Authors: Architect
  - Why: Decompose the Architect cold-start trust foundation into a bounded work unit that remains visible/recoverable in Tiinex lineage and Work in Progress projections.
  - Summary: Cold-start validation method
  - Status: draft/local

---

# Cold-start validation method

## Objective

Define a durable, repeatable qualification protocol that can distinguish warm familiarity from a true zero-coaching Role cold-start and produce reviewable evidence rather than a one-off demo claim.

## Done Criteria

- The method records Project Instructions present/absent, prior conversation/project context, manual coaching, routing message, supplied package/workspaces, model/runtime/tool availability, and relevant revisions of Role/bootstrap/Handoff/tooling.\n- Success criteria cover role recovery, current-gate recovery, macro-roadmap/refactor-exit recovery where Architect is tested, authority-dimension discipline, semantic navigation, scope discipline, uncertainty preservation, tooling discovery/adoption/retention, durable result/evidence, and terminal transport.\n- Failures are preserved as Validation Report/Evidence/Feedback rather than rescued through unrecorded coaching.\n- Qualification levels distinguish at least one-pass qualification from repeatability, regression qualification, robustness across suitable runtimes/models, and any later trusted status.\n- Existing tiinex.validation.method.v1 / tiinex.validation.report.v1 are reused if sufficient; schema mutation is routed to Schemer only if concrete pressure proves a gap.

## Scope

Qualification protocol only. Do not predeclare a Role trusted, require Tiinex tooling for generic editing where it adds no semantic value, or punish transparent fail-closed uncertainty.

## Dependencies

Current Validation Method/Report authority, Role/bootstrap revisions, and a transport closure capable of truthfully stating supplied material.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:zgQLoAy3WdhfmVGbEtioyEJhV9giE-WduEWQ6QQEJts