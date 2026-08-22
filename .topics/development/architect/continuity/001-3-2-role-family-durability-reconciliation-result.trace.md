# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:03
  - Trace: [Role family durability](001-3-role-family-durability.trace.md)
  - Origin:
    - [relative](001-3-role-family-durability.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:20:00
  - Authors: Architect
  - Why: Reconcile independently self-described current Architect, Tooling, Dev, and Schemer role boundaries into one cold-start role-family baseline without making Architect the semantic author of the other roles.
  - Summary: Current Tiinex role family is coherent enough for cold-start use with no blocking role drift found.
  - Status: accepted/local

---

# Role Family Durability Reconciliation

## Decision

- State: accepted
- Subject: current reusable collaboration roles for Architect, Tooling, Dev, and Schemer
- Decision: use the current Architect, Tooling, and Dev local Role artifacts plus the exact published Schemer Role as the role-family baseline for cold-start qualification. The independently returned role definitions do not show a blocking authority drift from the established collaboration model.
- Cold-start effect: a fresh worker should recover capacity from the referenced Role first, then obtain current responsibility from Task/Handoff and operating procedure from the applicable Operating Model or method artifacts.

## Basis

- Architect: [Architect Role](001-3-1-architect-role.trace.md) owns cross-role architecture/coherence, bounded review/gating, roadmap/refactor-exit continuity, and successor/cold-start architecture while explicitly excluding canonical schema semantics, Tooling/Dev implementation ownership, and Q product acceptance.
- Tooling: [Tooling Role](../../tooling/continuity/001-tooling-role.trace.md) owns portable/shared local-first compiler, discovery, resolution, validation, conformance, package/material and evidence mechanisms while explicitly excluding canonical schema meaning, Site product ownership, Architect acceptance, and Q acceptance.
- Dev: [Dev Role](../../dev/role/001-current-dev-role.trace.md) owns bounded Tiinex/site implementation, runtime/product-path engineering, diagnostics, regression pressure and source-qualified return while explicitly excluding canonical schema semantics, portable Tooling ownership, cross-role milestone authority, and Q acceptance.
- Schemer: [Schemer self-review disposition](../../handoff/schemer/001-1-current-schemer-role-self-review-disposition.trace.md) independently accepts reuse of the [published Schemer Role](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/development/roles/001-schemer-role.trace.md) without creating a symmetry-only duplicate. Schemer owns semantic/schema recovery, design and reconciliation within transferred scope and explicitly rejects implementation convenience as semantic authority.
- All four roles preserve the same critical holder boundary: Role is reusable collaboration capacity, not Party/model identity, permanent assignment, employment, delegation authority, Handoff acceptance, or universal ownership.

### Role Drift Classification

- Architect: legitimate durable formalization of an already practiced architecture/review/continuity capacity; no new universal authority introduced.
- Tooling: stable role with a legitimate clarification that portable Tooling may consume platform-neutral shared owners outside `src/tooling/portable/**`; portability means no Site/React/browser semantic dependency, not an artificial portable-only import island.
- Dev: stable role with current actual-owner wording around Site/runtime/product/source/workspace behavior; no schema or Tooling authority absorbed.
- Schemer: unchanged reusable capacity; current self-review sharpens pushback wording but finds no material new capacity requiring Role replacement.
- Blocking drift: none found.

## Consequences

- Role-family durability Task is satisfied for the current cold-start baseline.
- Do not copy operating procedures, roadmap state, current Tasks, current holder identity, or transport instructions into Role artifacts merely to make bootstrapping easier; those truths remain separate.
- Future role correction requires durable pressure: a stable missing responsibility, repeated cold-start failure attributable to Role wording, canonical Party Role change, or concrete cross-role authority collision.
- Self-description remains evidence, not unilateral power expansion. Cross-role reconciliation stays reviewable by Architect; semantic contradictions route to Schemer; implementation ownership remains with Tooling/Dev; Q remains product acceptance authority.

## Review Conditions

- Reopen this decision if a cold-start worker repeatedly cannot recover a required stable role boundary from Role + controlling artifacts, if one role begins absorbing another role's authority, or if canonical Party Role semantics materially change.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:qI-jqbmt0bLjqgE0ZfRH32BQW6qOWO2mJ3-RgA927Qc