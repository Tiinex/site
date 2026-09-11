# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 09:56:21
  - Trace: [011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
  - Origin:
    - [relative](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 10:07:54
  - Authors: Anchor
  - Why: Axiom classified the unconditional missing-Preservation-Parent warning as non-canonical schema-inheritance/artifact-lineage conflation.
  - Summary: Implement Axiom's accepted Evidence Parent-lineage validator disposition and re-qualify the bounded four-schema factory proof.
  - Status: ready/local

---

# Evidence Parent-Lineage Validator Reconciliation

## Objective

Implement Axiom's accepted semantic disposition for `evidence.preservation.parent.unresolved` and re-qualify the bounded schema factory Viewer proof without conflating Evidence schema inheritance with artifact `Parent` continuity.

Remove the unconditional Evidence warning that fires solely because no artifact-level Parent is declared. Preserve all existing Evidence preservation/provenance/fidelity obligations, Root Parent validation for explicitly declared Parents, and explicit-reference validation where canonical authority already exists.

## Done Criteria

- The unconditional `evidence.preservation.parent.unresolved` path is removed or retired so standalone `tiinex.evidence.v1` artifacts do not receive a missing-Preservation-Parent warning merely for having no artifact Parent.
- No replacement rule requires `Parent Schema: tiinex.preservation.v1`, fabricates a Preservation artifact, derives Parent from schema inheritance, or treats package/Viewer context as ancestry.
- Required Evidence preservation/provenance/fidelity validation remains unchanged and fail-closed where canonical authority requires it.
- Declared artifact Parent structure/resolution continues to be owned by shared Root continuity validation.
- Explicit Preservation Artifact / External Payload / other declared references may only produce findings through already-owned reference/provenance contracts; absence of such optional references is not itself a warning.
- The bounded Viewer factory proof reruns across Decision, Evidence, Handoff, and Validation Finding through the same shared factory machinery.
- Intended Evidence proof state is zero validation errors and no preservation-parent warning when no truthful artifact Parent is declared.
- Typecheck, UI/architecture shape, focused factory/tooling tests, static-debt gate, and full Foundation validation remain green.
- Return qualified implementation Evidence plus a Loom-to-Anchor Handoff package.

## Scope

- Site Evidence validator path responsible for `evidence.preservation.parent.unresolved` and directly associated finding/i18n registration if no longer used.
- Existing shared schema factory, Viewer proof, generic validation runtime, and permanent regression coverage needed to prove the semantic correction.
- Axiom Decision `011-6-2-axiom-evidence-parent-lineage-validator-disposition-decision.trace.md` is controlling semantic authority for this slice.

## Dependencies

- [Evidence Preservation Parent Validator Disposition](011-6-2-axiom-evidence-parent-lineage-validator-disposition-decision.trace.md)
- [Evidence Parent-Lineage Validator Semantic Adjudication](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
- [Kodax Schema Factory Viewer Proof Implementation Evidence](011-5-1-2-kodax-schema-factory-viewer-proof-implementation-evidence.trace.md)
- [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)

## Exclusions

- No schema prose guessing or new semantic policy in Site.
- No broad schema fan-out.
- No Sigma factory acceptance claim; Anchor reconciles first.
- No remote repository mutation, push, merge, publish, or deploy.
- No Playthings merge or domain-semantic import.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
  - Value: Woyc40LHRgUO-yxOexdiM0nfHwGoTuHl7W0k0A_dIJc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: aHC8-ie--mar_DaNxvg-qobmvQIywefP77Ab34IiSt0