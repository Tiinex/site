# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 12:05:00
  - Authors: Anchor
  - Why: Preserve the first independent provider-side reconciliation after Tooling 025 acceptance so exact publication matches, historical repaired-vs-published mismatches, and unavailable Parent material remain distinct before any repair application is opened.
  - Summary: Current Site publication reconciliation finds eight clean missing-backfill edges whose declared Parent target Git blob matches carried Parent bytes, seven v471-v474 edges whose declared target is explicitly the pre-repair published representation rather than the carried repaired Parent, one separate child-self mismatch, and one unresolved external Parent.
  - Status: draft/local

---

# Current Site publication provider material reconciliation feedback

## Observed Signal

- Seventeen current child artifacts declare commit-pinned GitHub Parent Origins.
- Provider-side reads were checked at the exact declared repository, forty-hex commit and path. For loaded Parents, the provider Git blob identity was compared with the Git blob identity computed from the carried Parent bytes.
- These provider checks are independent reconciliation evidence only. They are not Tooling 025 accepted repository-read receipts because the lineage operation was not supplied a normalized full-content host receipt for these records.

## Source

- Exact declared GitHub repository/commit/path locators from the 17 commit-pinned current-Site child records.
- Carried Parent bytes in the received Site workspace, compared by exact Git blob identity to provider-side reads at the declared immutable targets.
- Carried `Repairs -> Historical canonical representation repair` provenance on the seven v471-v474 Parent records.
- Current `src/schemas/tiinex.root.v1.schema.md`, independently matched by Git blob identity to Tiinex/docs commit `3988951208eb9a8926e84ab42625d4b42fa00c2d`.

## Feedback Target

- Current Site lineage publication qualification and future Tooling 021 repair eligibility for the 17 commit-pinned Parent-Origin edges.
- Canonical representation/provenance handling where a carried Parent was historically repaired after the immutable representation named by a child was published.
- Parent-Origin truthfulness where a current Parent is local/unpublished and no immutable archive representation yet exists.

## Feedback Received

- Provider/loaded-byte reconciliation separates the 17 edges rather than producing one repair class: eight missing-backfill edges have exact provider/Parent material equality; one additional exact-provider edge is independently blocked by child self-integrity; seven v471-v474 edges point to explicitly recorded pre-repair published Parent bytes that differ from the carried repaired Parent; one external Parent target exists but its Parent bytes are not loaded in this workspace.
- The seven mismatching carried Parents preserve explicit historical repair provenance naming the provider blob and explaining that canonical envelope/schema-reference/continuity/integrity representation was repaired after publication while body/work-result meaning was retained.
- Current Root authority still requires `browse + git` Parent Origin when Parent exists and does not directly state how a local/unpublished Parent without a truthful immutable archive locator should satisfy that requirement.

## Exact-Material Candidate Set

Eight current missing-backfill child edges point to declared Parent representations whose provider Git blob is byte-identical to the carried Parent:

- `001-12-legacy-docs-to-tiinex-reduction.trace.md` -> macro-roadmap result at `1c2685df59270df347bf3c88709fa70f5015b927`, blob `299b3275d0d476d0bfc7a82039bc9c62ba03173a`.
- `001-2-2-q-poc-refactor-product-feel-feedback.trace.md` and `001-2-3-llm-first-portable-dogfood-refactor-strategy-decision.trace.md` -> the same macro-roadmap result at `61fb68948831c8a601d999264cf1424ef09cd14c`, blob `299b3275d0d476d0bfc7a82039bc9c62ba03173a`.
- `001-9-2-handoff-package-companion-transport-projection-decision.trace.md` -> `001-9-handoff-human-participation-role-discovery.trace.md` at `1bf8c78dba5496ab1955b965b1f2f43b4f4d3430`, blob `1908feec1d2339bca784df2899620d5bf30933f0`.
- `001-9-3-handoff-transport-workspace-artifact-routing-decision.trace.md` and `handoff/loom/001-handoff-package-companion-projection-successor-handoff.trace.md` -> `001-9-2-handoff-package-companion-transport-projection-decision.trace.md` at `85cf6c36e554a7b7fc420b51d45a71a36e23d0c7`, blob `11328896871084da828423744da047da136ff73a`.
- `002-1-v475-canonical-artifact-envelope-reference-integrity-validation.trace.md` -> the v475 closure task at `32c7c291101b2a6a72c12241f3107d4a56af81fc`, blob `4292284e28d9237ead0d8d73d4e1938f3ef91291`.
- `010-party-role-schema-material-authoring-closure.trace.md` -> Sigma portable-schema-authoring feedback at `61fb68948831c8a601d999264cf1424ef09cd14c`, blob `e6a76e7bbda5b0f265511b6c8d6d22a67499174c`.

A ninth provider/Parent exact match belongs to `001-13-validator-surface-convergence-and-integrity-repair-strategy.trace.md`, but that child is already classified `child-self-mismatch`; publication equality does not remove its independent integrity blocker.

## Historical Repaired-Versus-Published Mismatch Set

Seven v471-v474 edges declare Tiinex/site commit `32c7c291101b2a6a72c12241f3107d4a56af81fc`, but the provider bytes at the declared Parent path differ from the carried Parent bytes:

- v474 closure Parent: provider blob `3fe5e9d11a1a144e912a9d814dda111302e91c82`; carried Parent blob `df88c659a2abc2bb8059f1d56364ec9831bdddff`.
- v473 result Parent: provider `33e32e6553fbe5cc09653b6d65b97167c454460f`; carried `6c325eeecd794037562f1b91e1bd55d670cd3f85`.
- v473 closure Parent: provider `6e7e54c75d4a4547befe45ed9ec3870d621e660e`; carried `8695070c1ec962337c3698184842706f4e1871ed`.
- v472 result Parent: provider `df35458394c2a94040d63a0c699148ada631affe`; carried `1d00e87c967c2b4e7479002ee5c7e02f2ca47c24`.
- v472 closure Parent: provider `278084616a5b00fae1b0765cad80c605c6bf25bf`; carried `b57d72aa52cef529dd87c3780de14d68eb1f3e4c`.
- v471 result Parent: provider `154ff4b0c5020ca8c56cc97f7455b4f377afe671`; carried `fba701c3fe5b6a6ec3a292d06f1234947f70060e`.
- v471 task Parent: provider `9c69c769a62a6990b3cd94ea0d39a79388a0770e`; carried `d2b53e4596673e2ebbd7d73af102a5131eee4b22`.

Every carried Parent in this seven-edge set explicitly records `Repairs -> Historical canonical representation repair`, names the same provider blob as its `pre-repair published representation`, and states that v475-v478 later replaced false-PASS envelope/schema-reference/continuity/integrity representation while preserving original body/work-result meaning and historical Current Created At. The provider mismatch therefore agrees with the carried repair provenance instead of contradicting it.

## Canonical Requirement Signal

- The carried `src/schemas/tiinex.root.v1.schema.md` bytes match the exact Tiinex/docs representation at commit `3988951208eb9a8926e84ab42625d4b42fa00c2d` by Git blob identity `1398960010b919d266a7451f59bbfc9c211c0e4b`.
- That Root contract says Parent `Origin` is required when Parent exists, requires a `browse + git` entry, calls it the portable archive permalink, and says it should be commit-pinned when available.
- The same Root separately says relative/local schema-reference locators are valid for local/unpublished schema material and must not be replaced with fabricated published immutable locators. That schema-reference rule does not directly resolve the Parent-Origin requirement, leaving the previously recorded local/unpublished Parent tension real rather than safely inferable.

## Interpretation

- The eight exact-material missing-backfill edges are the strongest candidate subset for later Tooling 021 work, but exact full provider receipts still must be materialized through the accepted Tooling 025 boundary before the planner may classify them `qualified` or propose mutation.
- The seven v471-v474 mismatches are not candidates for automatic checksum refresh or blind Parent-Origin replacement. The loaded Parent and the immutable locator refer to two different representations of historically related material, and the carried records already say that difference was an intentional canonical representation repair.
- Axiom must classify whether a child that continues from the repaired local Parent may truthfully retain an Origin to only the pre-repair published representation, must wait for/publish a new immutable repaired representation, may carry both with an explicit representation distinction, or requires another canonical construction. Tooling must not decide that semantic question from byte equality alone.
- The external Tiinex/docs Parent for `008-site-tooling-v481-recipient-relative-handoff-material-closure-planner-foundation.trace.md` exists at the declared commit/path, but the Parent record is not loaded in the Site workspace, so local Parent-target verification remains unresolved until exact Parent material is supplied.

## Disposition

- State: semantic-classification-and-receipt-materialization-required
- Follow-Up: send the historical repaired-vs-published and unpublished Parent-Origin questions to Axiom while Anchor separately retains responsibility for obtaining accepted full provider receipts for any later clean repair subset.
- Repair Effect: no current-Site mutation is authorized by this reconciliation.

## Limits

- Git blob identity comparison is used here only to establish whether two byte sequences are equal/different; it is not substituted for the Tooling 025 provider receipt contract.
- This feedback does not choose which historical representation is canonical for a child's Parent relation.
- It does not authorize Root/schema mutation, repair application, checksum refresh, origin insertion/rewrite, descendant resealing, publication, commit, push, or remote writes.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:sdwvEOD-z7zANGHnZRmkWV82CBdZqnNecQLSKKTjPCs
