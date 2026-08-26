# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 17:22:00
  - Authors: Anchor
  - Why: Convert Axiom 011 semantic authority into one durable Anchor execution disposition without allowing Tooling to infer semantic harmlessness, fabricate Parent Origin, or treat publication evidence as mutation approval.
  - Summary: Accept Axiom 011's bounded semantic classification and open Tooling 021 for implementation while preserving per-artifact mutation gates and the unresolved never-published Parent-Origin authority gap.
  - Status: accepted/local

---

# Publication lineage mismatch and unpublished Parent Anchor acceptance

This decision converts Axiom 011's returned semantic authority into the bounded implementation gate consumed by Tooling 021 without expanding it into mutation or publication authority.

## Decision

- State: accepted-bounded
- Subject: Axiom 011 publication-lineage mismatch and unpublished Parent semantic classification
- Decision: accept [Axiom's semantic disposition](001-36-1-publication-lineage-mismatch-and-unpublished-parent-semantic-classification-axiom-decision.trace.md) as controlling for Tooling 021. The seven v471-v474 repaired-local versus pre-repair-published Parent cases are representation-only changes with semantic Parent continuity preserved. A later approved local repair may bind the child Parent-target integrity entry to the repaired local Parent representation while preserving the old commit-pinned Parent locator only as historical/pre-repair provenance.
- Unpublished Parent boundary: a never-published Parent-bearing continuation remains canonically blocked under the current carried Root because Parent Origin still requires `browse + git`; Tooling must not fabricate a locator or silently invent a replacement state.
- Execution boundary: Tooling 021 is unblocked for implementation, adversarial tests, receipt design, and dry-run/current-state planning. Actual current-Site mutation remains per-artifact gated by accepted exact provider material/receipt where required, explicit approval/disposition, structure-preservation checks, cascade rules, and the absence of any case-specific blocker.
- Separate cases stay separate: the eight exact-material missing-backfill candidates remain a receipt/approval tranche; `001-13-validator-surface-convergence-and-integrity-repair-strategy.trace.md` remains blocked by child self-integrity; the external Tiinex/docs Parent remains unresolved until exact Parent material is supplied.

## Basis

- The returned Axiom Decision validates cleanly and its c14n-v2 self-integrity verifies under the carried Root/Decision authority.
- The classification preserves the distinction between semantic Parent continuity, exact representation identity, Parent Origin recovery/provenance, and Parent-target integrity binding.
- Tooling 021 already requires a qualified representation-only or other semantic disposition before refreshing mismatching Parent targets and already forbids fabricated publication provenance. Axiom supplies that semantic disposition for the seven historical repaired-Parent mismatches only.
- Tooling 025 remains the provider-receipt authority boundary: old immutable provider bytes can prove historical/pre-repair representation but cannot be coerced into qualification for repaired current bytes.
- No part of Axiom's decision authorizes schema mutation, publication, remote writes, blanket repair, or bypass of per-artifact approval.

## Consequences

- Route [Tooling 021](../../tooling/dogfood/021-lineage-integrity-repair-application-and-representation-preservation.trace.md) to Loom as the next bounded implementation task.
- Loom may implement the repair application engine, topological resealing, representation-diff guard, idempotence, adversarial fixtures, and repair receipts against explicit plans/approvals.
- Loom must fail closed when a live candidate lacks accepted provider evidence, per-artifact approval, exact Parent material, or truthful Parent-Origin authority.
- The seven historical mismatch fixtures may be treated as semantic representation-only cases for implementation/testing, but current-source mutation still requires the Tooling 021 approval/evidence gates.
- The never-published Parent-Origin contract gap remains a separate future canonical authority question and must not be solved inside Tooling 021.
- Anchor retains acceptance/routing authority after Loom returns; Sigma/Q remains human transport and actual-product observation boundary.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: SLmEw_BwOj40pvs_Rg_1BRMBjHRoIf2tnRiHK5ua-fs