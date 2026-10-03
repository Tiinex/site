# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 10:45:22
  - Trace: [011-8-1-anchor-to-sigma-schema-slice-factory-acceptance-handoff.trace.md](011-8-1-anchor-to-sigma-schema-slice-factory-acceptance-handoff.trace.md)
  - Origin:
    - [relative](011-8-1-anchor-to-sigma-schema-slice-factory-acceptance-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 11:11:22
  - Authors: Anchor
  - Why: Sigma observed that the loose preservation-body inheritance trace would bloat the Docs schema catalog and normalize companions that may not be desired.
  - Summary: Adjudicate a schema-native explicit inheritance override so Docs stays schema-only by default and the factory remains future Schema Builder-ready.
  - Status: ready/local

---

# Schema-Native Inheritance Override And Docs Hygiene

## Objective

Replace the current loose Evidence inheritance companion-file pattern with the smallest canonical schema-native authority that keeps Docs schema-only by default while preserving deterministic Evidence-over-Preservation structural override semantics for shared Tooling, Viewer, and a future Schema Builder.

The current factory is semantically correct but the representation is not acceptable as a scaling default: `tiinex.evidence.v1-preservation-body.inheritance.trace.md` behaves as a concrete `tiinex.schema.inheritance.v1` artifact and was carried beside schema definitions. That pattern would bloat Docs and implicitly assume every useful schema composition deserves a companion artifact. We need the same explicit fail-closed merge authority without requiring loose companion instances in the schema catalog.

## Done Criteria

- Axiom chooses the minimum canonical representation for one child schema to explicitly override one inherited structural contribution without creating a separate companion artifact beside the schema.
- The representation remains machine-readable and fail-closed; Tooling must not infer override semantics from free prose, schema identity, filename, directory adjacency, or child-wins order.
- Evidence can express exactly: inherit Preservation semantics, but replace only `Schema Validation Contract / Preservation Body / Required Shape` and the structural ordinary groups made inactive by that body specialization with the Evidence body structure.
- Non-structural Preservation semantics and contributor provenance remain inherited and inspectable.
- The chosen representation is suitable for a future Schema Builder to author/read through the same canonical schema contract rather than private Viewer metadata.
- Docs remains schema-only by default: no generic requirement to store generated/helper/visual/experimental companions alongside schema definitions.
- Companion families remain opt-in and must not be assumed desired merely because Tooling can generate them; future `.relations` migration or other companion placement remains a separate evidence-based decision.
- Root remains abstract; transition authority stays separate; no new schema-specific runtime rule is introduced.
- Axiom returns one bounded Decision spelling the exact canonical syntax/authority and migration disposition for the existing Evidence companion pattern.

## Scope

- Canonical schema semantics for representing parent-child contract override inside or directly as part of schema authority.
- Existing `tiinex.schema.inheritance.v1` semantics may be reused, refined, embedded, or superseded for this narrow representation only if Axiom can do so without creating competing authority.
- Evidence-over-Preservation is the proving case; the representation must be generic enough for later schema reuse and Schema Builder consumption.

## Dependencies

- [Schema Factory Canonical Repair Disposition](011-3-1-axiom-schema-factory-canonical-repair-disposition-decision.trace.md)
- [Factory Qualification Reconciliation](011-8-anchor-schema-slice-factory-qualification-reconciliation-decision.trace.md)
- [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)

## Exclusions

- No remote repository mutation, push, merge, publication, or deployment.
- No broad schema fan-out.
- No Viewer-specific semantic workaround.
- No prose-regex inference.
- No assumption that `.relations`, `.playthings.png`, generated examples, visualizations, or any other companion family belongs in Docs merely because it can exist.
- Do not delete or reduce historical artifacts; this task only decides the forward canonical representation and migration disposition for the current local factory candidate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-8-1-anchor-to-sigma-schema-slice-factory-acceptance-handoff.trace.md](011-8-1-anchor-to-sigma-schema-slice-factory-acceptance-handoff.trace.md)
  - Value: TC9s9bO18gs_MUCzYhUU40Q8RTd8_8lHFLDPnPcBXiM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: TCfXCrRF0FY4G30EPxlJLYMklsYahlPhCpvL1oumZf0