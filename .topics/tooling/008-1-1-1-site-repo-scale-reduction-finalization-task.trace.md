# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 17:59:22
  - Trace: [008-1-1-anchor-to-sigma-kodax-business-role-durability-handoff.trace.md](008-1-1-anchor-to-sigma-kodax-business-role-durability-handoff.trace.md)
  - Origin:
    - [relative](008-1-1-anchor-to-sigma-kodax-business-role-durability-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 18:07:43
  - Authors: Anchor
  - Why: Turn the completed Business durability gate into a correct current Site reduction frontier rather than leaving the old human repository task as the next act target.
  - Summary: Current Anchor task to finish the repo-scale Site reduction with per-leaf immutable expansion boundaries now that Kodax is durably canonical in Business.
  - Status: ready/local

---

# Repo-Scale Site Reduction Finalization

## Objective

Finish the repo-scale Site reduction under the landed Reduction Placement + Expansion Contract now that the canonical Kodax Role is durably present in Business. Produce a small current Site graph whose removed historical branches remain explicitly observable and explodable through pinned immutable leaf references rather than conversation memory.

## Done Criteria

- Treat `Tiinex/site` commit `ba6e587f35d9a915dae1cac3a96b28df3d654c08` as the immutable pre-reduction Site checkpoint unless a newer human-authorized checkpoint is explicitly supplied.
- Treat `Tiinex/business` commit `7df3a33e5e9c418dbe14a4cee53c45caba66aad6` as the durable canonical Kodax-role checkpoint; the exact Role exists at `.topics/roles/001-6-kodax-role.trace.md` with Git blob `48fee5a2cf405a88c9ca63105d04d4d1d38c7532`.
- Inventory current Site semantic leaves and classify each as current/unresolved, completed/accepted, superseded, transport-only, abandoned, fixture-required, or otherwise explicitly justified.
- For every lineage actually removed from current Site state, create a qualified `tiinex.reduction.v1` artifact at the nearest qualified surviving semantic ancestor or a truthful current carry-forward anchor when the historical ancestor cannot qualify without rewriting history.
- Every reduction exposes each reduced leaf through a commit-pinned immutable permalink, names the surviving/collapse-to boundary, states why the leaf is reduced, and provides enough expansion metadata for Viewer/Node Graph surfaces to reconstruct the removed Parent span from immutable Git without making it current material again.
- Active, unresolved, or semantically necessary fixture leaves are retained or truthfully reissued rather than silently marked complete.
- The historical Viewer-local Kodax Role may be reduced only as superseded by the canonical Business Role pinned at `7df3a33e...`.
- The reduced candidate passes relevant Tiinex qualification, Foundation/UI/type regression checks, and a fresh canonical Handoff cold-ground proving current work does not depend on deleted local ancestry.
- When repository replacement/deletion/commit/push is ready, Anchor manufactures one canonical Anchor-to-Sigma operational Handoff package containing the required Site material and instructions. No loose-file action interface.
- Viewer Artifact + Action Parity is preserved/reissued as the next product frontier, but implementation is not routed to Kodax until the reduced Site state is durably committed and cold-qualified.

## Scope

- Repo-scale Site lineage reduction and expansion/recovery semantics.
- Reconciliation of the already-landed initial Tooling reduction/carry-forward artifacts with the broader Site reduction.
- Correct treatment of the old Viewer Navigation lineage, Viewer-local Kodax origin, Tooling historical branches, current Viewer frontier, and unresolved author-repair human gate.
- Qualification and cold-proof of the reduction candidate.
- Preparation of the later Sigma operational Handoff for human repository mutation.

Out of scope: new Viewer feature implementation, public release/deployment, rewriting historical artifact bytes merely to satisfy current integrity representation, changing canonical Reduction schema semantics without routing a real semantic contradiction to Axiom, or direct remote mutation by Anchor.

## Dependencies

- [Reduction Placement And Expansion Contract](008-reduction-placement-and-expansion-contract-decision.trace.md).
- [Kodax Business Durability Handoff](008-1-1-anchor-to-sigma-kodax-business-role-durability-handoff.trace.md), whose human action is now independently remote-verified as complete.
- Business durability checkpoint: `https://github.com/Tiinex/business/commit/7df3a33e5e9c418dbe14a4cee53c45caba66aad6`.
- Site pre-reduction checkpoint: `https://github.com/Tiinex/site/commit/ba6e587f35d9a915dae1cac3a96b28df3d654c08`.
- [Current Tooling Carry-Forward](009-tooling-first-foundation-ergonomics-current-carry-forward-task.trace.md).
- [Tooling Historical Lineage Reduction](009-1-tooling-historical-lineage-reduction.trace.md).
- [Author Repair Human Gate](009-2-schema-invalid-author-repair-human-acceptance-carry-forward-task.trace.md).
- [Viewer Artifact + Action Parity](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md).

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [008-1-1-anchor-to-sigma-kodax-business-role-durability-handoff.trace.md](008-1-1-anchor-to-sigma-kodax-business-role-durability-handoff.trace.md)
  - Value: xSvb8SzXKogvC1ZgZUUJkVJyrGL82z_Ly6Nh3CixbWM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: RqRMdAjRph1OjmAiTf6Vz8m4x0_fdS5uJDgoI9-AYTg