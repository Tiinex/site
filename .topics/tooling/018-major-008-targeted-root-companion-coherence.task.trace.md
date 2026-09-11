# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.decision.v1](../../src/schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-05 11:35:37
  - Trace: [016-6-anchor-common-author-continuation-schema-authority-repair-acceptance-decision.trace.md](016-6-anchor-common-author-continuation-schema-authority-repair-acceptance-decision.trace.md)
  - Origin:
    - [relative](016-6-anchor-common-author-continuation-schema-authority-repair-acceptance-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-05 11:36:47
  - Authors: Anchor
  - Why: Major 008 landing-readiness requires current Root semantics to be coherent across carried Docs authority and Site Tooling consumption.
  - Summary: Synchronize the semantically stale Site canonical-core Root companion to the current carried Axiom-qualified Docs Root without broad catalog work.
  - Status: ready/local

---

# Major 008 Targeted Root Companion Coherence

## Objective

Reconcile the one current carried Docs↔Site schema mismatch that is semantically material to Major 008: `tiinex.root.v1` in Site still carries the earlier accepted-local canonical-core Root bytes while the carried Docs Root contains later Axiom-qualified Parent-recovery and human-first shared-semantic-surface corrections. Make Site/portable Tooling consume the exact current carried canonical Root authority without broad schema-catalog fanout or reinterpretation.

## Observed State

- Current carried Docs Root raw SHA-256: `4ec6d17ef55f51c2305ede8e2f22c8c4a9324c478489114adb86a33664d4d156`.
- Current carried Site Root companion raw SHA-256: `3b26c2f9a3e884c10cd6382fce52716f79af0b082648c1db8adeda2dc4ef4fcd`.
- The Site manifest declares Root as `originTrustRole: canonical-core`, currently pinned to the older accepted-local Docs representation.
- The carried Docs Root contains accepted Axiom semantic corrections for truthful Parent recovery locality/transport closure and the human-first non-contradictory shared semantic surface. This is not an Anchor-authored new semantic proposal.
- Of the 25 current Site schema Markdown companions, 20 are byte-identical to their carried Docs schema ID counterpart; five differ. Four of those other differences are not part of this task: Evidence differs only in self-integrity bytes; Presentation Surface and Schema Module primarily differ in representation locators/integrity; Workspace is explicitly `viewer-extension`. Their generic policy belongs to the later catalog/companion coherence Major rather than this targeted Root repair.

## Done Criteria

- Site `tiinex.root.v1` readable schema companion consumes the exact current carried Docs Root semantic bytes appropriate to the canonical-core mirror relationship, preserving truthful Site-local representation where the established companion pipeline requires it rather than inventing new semantics.
- Regenerate/update all Root-derived binding/source/checksum/runtime projection material required by the existing Site companion contract so schema binding and runtime projection gates remain internally coherent.
- Preserve Root's current canonical semantics exactly; no new Root wording or semantic adjudication is allowed.
- Do not modify `tiinex.workspace.v1`, Presentation Surface, Schema Module, Evidence, Relation path placement, Workspace Representation path placement, or any unrelated schema companion merely to improve catalog symmetry.
- Do not introduce a general auto-sync mechanism, broad catalog scaling, current-source drift policy, or path-normalization migration here; those remain later planned work.
- Re-run Root/schema binding and runtime projection focused tests, typecheck/architecture where affected, integration, and full Foundation validation.
- Report exact changed source files and introduced static debt.
- Return one non-major full-source package to Anchor containing the already-carried Business Anchor major-planning Role continuation and task-016 accepted Site state unchanged except for this bounded Root companion reconciliation.

## Scope

- Site `src/schemas/tiinex.root.v1.*` companion family and the minimum manifest/source/runtime derivatives required by the existing companion contract.
- Existing schema binding/projection validation only as required for the exact Root update.

## Dependencies

- Canonical carried Docs Root and its Axiom Parent-recovery plus human-first/domain-neutral clarification authority.
- Anchor task-016 acceptance decision and independently green current Site baseline.
- Business `001-1-1-anchor-major-planning-role.trace.md` is an Anchor-owned carried change and must be preserved, not reinterpreted.

## Exclusions

- No canonical Docs semantic edits.
- No other schema-family sync.
- No catalog path migration.
- No generic provider redesign.
- No lifecycle/reduction work.
- No Viewer/Playthings work.
- No remote mutation, commit, push, merge, publication, deployment, release, or Major advancement.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [016-6-anchor-common-author-continuation-schema-authority-repair-acceptance-decision.trace.md](016-6-anchor-common-author-continuation-schema-authority-repair-acceptance-decision.trace.md)
  - Value: 3kkBk0DvmpVdNjhc_0I-VYSfct3fi-L5uw8-v29TD4c

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gfnsPKsnfNZYscm3q2W_yT31YG40rVUQNrbaUpUUsOw