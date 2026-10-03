# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 11:20:15
  - Trace: [011-9-1-1-1-axiom-to-anchor-schema-native-inheritance-override-return-handoff.trace.md](011-9-1-1-1-axiom-to-anchor-schema-native-inheritance-override-return-handoff.trace.md)
  - Origin:
    - [relative](011-9-1-1-1-axiom-to-anchor-schema-native-inheritance-override-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 11:31:00
  - Authors: Anchor
  - Why: Axiom accepted a Root-owned inline Inheritance Overrides category so Docs can stay schema-only by default without losing deterministic Evidence-over-Preservation semantics or future Schema Builder readiness.
  - Summary: Implement Axiom's schema-native inline inheritance override generically, retire the loose Evidence companion from forward factory authority, and requalify the clean four-schema factory/Viewer slice.
  - Status: ready/local

---

# Inline Inheritance Override Factory Hygiene Implementation

## Objective

Implement Axiom's accepted schema-native inheritance override representation in the shared schema factory so the Evidence-over-Preservation proving case no longer depends on a loose inheritance companion artifact in Docs or a Site binding list.

The implementation must keep Docs schema-only by default, preserve the already-qualified Evidence merge meaning, and expose one generic descriptor surface suitable for Tooling, Viewer, and a future Schema Builder.

## Done Criteria

- Root contract parsing recognizes the exact machine category `Inheritance Overrides` as defined by Axiom, with `Named Declaration` entries and required fields `Merge Operation`, `Parent Schema`, `Parent Node`, and `Child Node` plus optional `Reason` and `Effective Result`.
- Inline operation support is limited to exact `override`; unsupported operations fail closed rather than becoming child-wins or another implicit merge policy.
- Parent/child node addresses resolve exactly once against an actual ancestor relationship; malformed, missing, ambiguous, duplicate, non-ancestor, or competing declarations fail visible.
- A qualified override deactivates only the exact addressed parent contribution, activates the addressed child contribution, and retains contributor/declaration provenance.
- For exact Required Shape body overrides, the generic compiler applies Axiom's structural ordinary-group deactivation rule without schema-ID branches or prose inference.
- Evidence declares the accepted inline override in its schema-local authority and compiles to the same active/inactive contribution set previously proven with the standalone companion.
- Remove the forward factory dependency on `tiinex.evidence.v1-preservation-body.inheritance.trace.md` and the Evidence `inheritanceCompanions` binding; no loose companion is required for schema compilation.
- Standalone `tiinex.schema.inheritance.v1` remains supported only as an intentional first-class inheritance record and cannot silently alter schema-local compilation authority.
- The canonical inheritance schema wording is refined narrowly to distinguish standalone record creation from inline schema-compilation authority, without broad redesign.
- Shared descriptor output exposes inline override declarations and active/inactive provenance so a future Schema Builder reads/writes the same canonical primitive rather than private Viewer metadata.
- Existing Decision, Evidence, Handoff, Validation Finding factory conformance and Viewer proof remain green, including Evidence's clean validation after removal of the non-canonical Preservation artifact-Parent warning.
- Root remains abstract; transition/relation/presentation authority remains separate; no companion family is promoted into Docs by this work.

## Scope

- Shared schema parser/compiler/descriptor implementation.
- Local Docs schema candidate changes required by Axiom's decision: Root contract syntax, Evidence inline declaration, narrow inheritance-schema clarification.
- Removal of forward factory companion dependency and related conformance migration.
- Builder-readiness projection only insofar as the shared descriptor must expose the canonical primitive.

## Dependencies

- [Schema-Native Inheritance Override Representation Decision](011-9-1-1-axiom-schema-native-inheritance-override-representation-decision.trace.md)
- [Schema-Native Inheritance Override And Docs Hygiene](011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md)
- [Factory Qualification Reconciliation](011-8-anchor-schema-slice-factory-qualification-reconciliation-decision.trace.md)

## Exclusions

- No remote repository mutation, push, merge, publication, deployment, or connector write.
- No broad schema fan-out beyond the proving schemas.
- No schema-ID-specific Evidence branch.
- No free-prose regex inference, filename/directory adjacency authority, or source-order winner selection.
- No requirement that `.relations`, `.playthings.png`, generated examples, visualizations, or any other companion family move into Docs.
- No destructive historical reduction or deletion outside the bounded forward candidate migration.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-9-1-1-1-axiom-to-anchor-schema-native-inheritance-override-return-handoff.trace.md](011-9-1-1-1-axiom-to-anchor-schema-native-inheritance-override-return-handoff.trace.md)
  - Value: VFrHC4pSAsOnic_fcBmjGDkNKK6B5HOoFFzJaav846M

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3WVAYOBQYMBhYQ1Mm2LPexUFqIFIEwQepLaFyhFjQCE