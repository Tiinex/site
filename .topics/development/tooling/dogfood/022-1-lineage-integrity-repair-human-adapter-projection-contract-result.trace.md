# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 20:30:00
  - Authors: Loom
  - Why: Record the bounded Tooling 022 adapter-neutral human repair projection implementation, deterministic fixtures, package/workspace equivalence, and validation evidence without opening Viewer, VS Code, remote publication, or Tooling 028 work.
  - Summary: Tooling 022 result — shared lineage repair opportunity projection, qualified permalink opportunity, deterministic human/action fixtures, and host authorization boundary
  - Status: draft/local

---

# Tooling 022 result — adapter-neutral lineage repair opportunity and human projection contract

## Objective

Implemented one portable projection over accepted Tooling 020 inspection/repair-plan truth, Tooling 021 local repair application truth, and accepted provider evidence. The projection exposes stable repair-opportunity states, compact human explanations, exact Parent/publication/mutation/cascade/decision data, safe local/export actions, and separate machine evidence for Viewer, VS Code, CLI, and LLM adapters without introducing an adapter-specific integrity algorithm.

## Done Criteria

The shared operation is `lineage-integrity-project`, implemented through `src/tooling/portable/lineage/lineage.integrity.projection.js` and `lineage.integrity.projection.human.js`, surfaced through `lineage.operations.js`, the operation catalog, and `engine.facade.js`. Stable opportunity states are `healthy`, `repair-available`, `review-required`, `blocked`, and `local-result-ready`; each opportunity projects the affected artifact, finding class, severity, trust impact, exact Parent target, publication locator state, proposed header/footer mutation, cascade impact, approval/decision state, safe actions, concise human wording, and a separate machine-evidence object.

Handoff-package and ordinary workspace/source material are normalized onto the same workspace-relative projection identity. Package carriage is explicitly non-authorizing: imported package material may be inspected and planned, but local application remains unavailable until the material is explicitly local-owned. The projection canonicalizes transport-derived record identity so package prefixes do not leak into the shared semantic evidence surface.

Accepted exact provider material can produce a `qualified-permalink-repair` opportunity only when one exact repository/40-hex-commit/path/byte match qualifies the resolved Parent. Candidate derivation is implemented in the provider-evidence layer by `qualifiedPublicationCandidatesForParent`; the projection does not infer publication truth from record-local declarations. The resulting Tooling 021-compatible plan step authorizes only `Parent.Origin.browse+git` plus the required c14n-v2 Parent/self footer changes, remains `proposed`, and still requires explicit local approval plus `qualified-exact-publication` before Tooling 021 can apply it. Local-only/unpublished Parents remain blocked as `publication-locator-unavailable`, with no fabricated candidate locator.

Remote publication is represented only as host capability/authorization state: capability unavailable, authorization required, or authorized host adapter required. The projection itself implements no credential collection, OAuth, commit, push, publication, or remote mutation. Source/body/publication/remote mutation flags remain false; Tooling 028 Parent-bearing creation/footer conformance is explicitly reported as deferred rather than redefined here.

Deterministic adapter fixtures are pinned in `src/tooling/portable/lineage/fixtures/lineage.integrity.repair-projection.v1.examples.json` and regression-checked by `portable.lineageIntegrityRepairHumanProjectionContract.test.mjs` for all seven required scenarios: healthy chain, missing Parent target, mismatch requiring review, qualified permalink repair, unpublished Parent blocker, cascade preview, and repaired-local-result ready for export. The same regression proves package/workspace equivalence at the projection surface, package non-authorization, Tooling 021 application compatibility, and remote capability/authorization separation.

## Scope

Focused validation passes Tooling 020 repair-plan, Tooling 021 repair-application/representation-preservation, Tooling 024 publication-evidence qualification, Tooling 025 provider-receipt binding, the Tooling 022 projection regression, operation-catalog regression, browser import boundary, architecture shape, schema bindings, and TypeScript typecheck. The full `src/tooling/portable/portable.test.mjs` aggregate also passes with Tooling 022 included.

`tools/validate-static.mjs` could not execute in this carried handoff snapshot because `.topics/.schemas/tiinex.workspace.v1.schema.md` is absent from the package; the validator terminates on that missing authority file before evaluating source. This result therefore does not claim a static-validator pass. No missing schema authority was fabricated or fetched to bypass the package boundary.

No Viewer component, VS Code extension, credential flow, current-Site repair, source mutation, remote fetch for implementation evidence, commit, push, publication, or remote repository mutation was performed.

## Dependencies

Controlling task: `.topics/development/tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md`. Controlling transfer: `.topics/development/handoff/loom/022-lineage-repair-opportunity-human-projection-contract-handoff.trace.md`. Tooling 020/021 remain authoritative for repair truth; Tooling 024/025 provider qualification remains authoritative for publication truth. Independent Tooling 022 acceptance remains with Anchor or another fresh reviewer. Viewer/VS Code product implementation remains downstream. Authenticated publication remains an explicitly authorized host concern. Shared Parent-bearing creation/footer conformance remains deferred to Tooling 028.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: puyuckHLgkXbEoLUZjbIgSQ48egj6hXvrtE7DaxxMl0