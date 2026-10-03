# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.reduction.v1](https://github.com/Tiinex/docs/blob/8435cd46a3773a38301659da716785dc6465072c/.topics/.schemas/reduction/tiinex.reduction.v1.schema.md)
  - Created At: 2026-09-03 15:56:33
  - Trace: [003-viewer-navigation-parity-reduction.trace.md](003-viewer-navigation-parity-reduction.trace.md)
  - Origin:
    - [relative](003-viewer-navigation-parity-reduction.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 15:56:34
  - Authors: Anchor
  - Why: Progress the next bounded Viewer PoC parity slice after accepted Navigation Parity and post-checkpoint reduction, while forcing product actions to consume existing shared Tiinex creation/read authority rather than Viewer-private semantics.
  - Summary: Recover evidence-honest artifact detail plus canonical Create, Continue, Reference, Use-as, draft review, and validation interaction on the accepted Viewer navigation baseline.
  - Status: ready/local

---

# Viewer Artifact + Action Parity Recovery — Active Major

## Objective

Recover the PoC's useful artifact-detail/provenance comprehension and canonical Create, Continue, Reference, and Use-as interaction on the accepted `refactor` Viewer while preserving the shared Tiinex creation/read contracts and the Navigation Parity semantics accepted in the preceding major.

## Done Criteria

- Artifact detail remains readable through exact schema companions when qualified and safe Root fallback otherwise; the Viewer does not invent schema-owned interpretation.
- Parent, Origin, Relation/reference, evidence state, source state, and byte/integrity state remain visibly distinct and are never collapsed into a stronger provenance or acceptance claim.
- Open/read, selected Lineage, Reference, and Preserve-evidence semantics remain distinct; the UI must not relabel one operation as another for parity appearance.
- Create, Continue, Reference, and Use-as availability is projected from canonical schema capability / creation-contract / Transition authority and fails closed when required authority is unavailable or ambiguous.
- Continue, bounded Reference, Use-as, and standalone Create use the existing canonical creation spine rather than action-specific handwritten Markdown in Viewer code.
- Generated local Markdown/draft state is reviewable before durable local mutation where the product contract requires review; validation findings are visible and actionable rather than hidden behind a success state.
- Unknown or unsupported schema/action combinations remain explicitly blocked; local drafts remain source-free and source artifacts remain unchanged unless a separately qualified operation authorizes mutation.
- Feed/Tree/Lineage selection and return-context behavior accepted in Viewer Navigation Parity remains stable while artifact/action surfaces are added or corrected.
- Focused creation-contract, action, artifact-detail/provenance, transition, and integration regressions are permanent; the normal Foundation acceptance, UI-shape, and typecheck spine remains green.
- A fresh Sigma browser pass exercises artifact detail plus Create, Continue, Reference, and Use-as and either accepts the bounded tranche or records one precise remaining product defect.

## Scope

- Site Viewer/application implementation for artifact detail/provenance projection, action affordances/dialogs, draft/review/validation presentation, and canonical local action execution.
- Existing shared primitives may be integrated from `src/schemas/creation.contracts`, capability registry/Root fallback, canonical Transition preparation/planners, bounded materializers, record actions, artifact parsing/audit/lineage projections, and conformance/acceptance tests.
- The earlier `playthings` branch may be inspected for bounded performance or UI-projection optimizations, but only selectively: no wholesale merge, no branch-head semantic authority, and cached/optimized behavior must be deterministically equivalent to the uncached canonical path.
- Small application refactors are allowed when they reduce duplicated Viewer action logic while preserving behavior and authority boundaries.
- If implementation discovers a genuinely missing shared Tiinex semantic/Tooling primitive, Kodax must stop that slice and return the exact prerequisite to Anchor for Loom routing rather than create a Viewer-private substitute.

## Dependencies

- [Viewer Navigation Parity Reduction](003-viewer-navigation-parity-reduction.trace.md) — accepted navigation behavior and reduced current frontier.
- [PoC Product Contract Inventory](001-1-poc-product-contract-inventory-discovery.trace.md) — interaction/reference baseline only.
- [Viewer PoC Tooling Prerequisite Matrix](001-2-tooling-prerequisite-matrix-discovery.trace.md) — shared-primitive boundary.
- [Planned Viewer Artifact And Action Parity](001-4-artifact-and-action-parity-task.trace.md) — earlier bounded product-contract decomposition retained as reference, not current Parent authority.
- Current parity ledger scenarios `artifact-creation-contracts` and `semantic-action-label-truth`, whose present status is partial and whose manual gates include Create/Continue/Reference/Use-as plus artifact-detail inspection.
- Canonical Kodax organizational Role: `business::.topics/roles/001-6-kodax-role.trace.md`. Tiinex has qualified this migration locally; it must be committed/pushed to Business before the implementation Handoff carrier is manufactured so cold recipient grounding does not depend on the retired Viewer-local Role.

## Role Routing

- Kodax: implement the bounded product/application slice, add focused deterministic proof, preserve Navigation Parity, and return technical Evidence plus a cold-sufficient carrier.
- Loom: only if Kodax demonstrates a missing shared Tooling/mechanics primitive or a contradiction in the canonical creation/read path; Loom is not the default implementer for this product slice.
- Sigma: fresh browser/product acceptance after Anchor technical qualification; judge comprehension, action recognizability, preview/validation trust, and practical interaction quality rather than rerunning machine checks.
- Anchor: retain architecture/progression authority, qualify returned evidence, route any prerequisite, and accept/reject the major.
- Axiom: only if a genuine canonical schema/method semantic contradiction is discovered.

## Exclusions

- No Workspace Open/Merge/source-takeover expansion, Time Portal expansion, ordinary ZIP/Handoff export parity, Extension/Host Bridge work, broad public-trust/release/deploy work, or Foundation exit in this major.
- No schema semantic redesign, new Handoff-package artifact kind, alternate human/LLM authoring interface, hidden cache authority, or Viewer-private provenance/lineage/source authority.
- No broad visual redesign; presentation changes should serve artifact/action comprehension and accepted interaction quality.
- No remote repository mutation is authorized by this Task alone.

## Validation And Acceptance Plan

- Reproduce and extend the existing creation-contract / canonical authoring / durable Reference / standalone Create tests before claiming UI parity.
- Add focused regressions proving action availability derives from canonical capability/creation authority, invalid combinations fail closed, generated draft Markdown validates through the shared spine, and source-backed records are not silently mutated.
- Add UI/integration proof that artifact detail exposes evidence-honest provenance/integrity labels and that Reference remains distinct from Preserve evidence.
- Re-run Foundation acceptance, UI shape, and typecheck before Kodax return and again during Anchor qualification.
- Sigma then exercises the actual browser against representative local and source-backed artifacts with Create, Continue, Reference, Use-as, draft review, validation failure, and return navigation.

## Planning Forecast

- Expected shape: one bounded product implementation major if current creation/read primitives prove sufficient.
- Expected role turns after the Business Kodax Role durability gate: approximately 4–6 — Anchor Handoff, Kodax implementation/evidence/return, Anchor technical qualification, Sigma browser acceptance, Anchor disposition, plus at most one bounded correction turn if a concrete defect appears.
- Discovery completeness: sufficient to initiate the major. Current source already contains canonical creation contracts, Transition/action planners, parity-ledger automated checks, and product integration surfaces; no prerequisite Tooling major is currently identified.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-viewer-navigation-parity-reduction.trace.md](003-viewer-navigation-parity-reduction.trace.md)
  - Value: X0MqiAnbs0fRvIX8VJ4l9u35_6O7EhbQwWbhh7cOCVc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: mKgoDujAWZFxqsNvAln71-LZ2gmTd2urZoTDKEBavys