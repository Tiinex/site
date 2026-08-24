# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.signal.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/signal/tiinex.signal.v1.schema.md)
  - Created At: 2026-08-23 20:37:00
  - Authors: Anchor
  - Why: Preserve Q's Site+Docs Viewer observation that current Role labels are not yet materialized/projection-resolved as first-class Role artifacts even though the rename mapping is already durable and used by Handoffs.
  - Summary: Viewer `party.role` filtering still foregrounds historical Dev/Schemer-style Role artifacts, while current Anchor/Loom/Axiom/Kodax identity is reconstructed through transition and Handoff material; this is a Role-materialization/resolution gap rather than a reason to rename history in place.
  - Status: observed/local

---

# Current Role materialization and resolution gap signal

## Observed Signal

- In Tiinex/site Viewer lineage mode filtered to `party.role`, Q observed `Dev Role` as the visible Role artifact while nearby current work uses `Kodax` as the current label.
- In Tiinex/docs Viewer lineage mode filtered to `party.role`, Q observed the historical/provisional `Schemer Role` as the visible Role artifact while current semantic Handoffs address `Axiom`.
- The accepted Role identity transition already defines `Architect -> Anchor`, `Tooling -> Loom`, `Schemer -> Axiom`, and `Dev -> Kodax`, and explicitly says future fresh-role migration should materialize qualified successor Role artifacts rather than edit old Role artifacts in place.
- Current fresh Handoffs can still function because they carry the new recipient label plus exact predecessor Role/transition grounding, but this requires identity reconstruction outside the Role artifact lineage itself.

## Source

- Q actual-path Viewer observation in current Tiinex/site and Tiinex/docs workspaces on 2026-08-23.
- [Role family identity transition decision](001-8-1-role-family-identity-transition-decision.trace.md) for the accepted current-name mapping and predecessor boundary.
- Fresh Axiom cold-start evidence showing `To: Axiom` can be grounded through Role-transition material and the published Schemer predecessor without prior conversation state.

## Interpretation

- Historical Role artifacts are truthful historical identities and should remain immutable except through normal artifact continuity; search/replace renaming would erase provenance.
- The current system lacks a clean first-class resolution surface where a consumer can ask for the current qualified Role identity and obtain an exact current Role artifact rather than combining a new label, a transition decision and an older Role artifact.
- A plausible future model is qualified successor Role artifacts under the new labels, with Viewer/Tooling foregrounding the current accepted successor while preserving predecessor traversal and alias/discovery from historical names.
- Leaf status alone must not be treated as universal currentness because parallel/experimental Role descendants may exist. Currentness/qualification needs explicit semantic support.
- Handoffs should ideally resolve recipient Role identity to an exact current Role artifact when such an artifact exists, while independently selecting the workspace(s)/Sources needed for that bounded task.

## Limits

- This signal does not establish that Role succession is canonical `Parent`, define a new currentness relation, authorize creation of new Role artifacts, or move shared Role authority into `Tiinex/business`.
- `Tiinex/business` may later prove to be a natural organization-shared semantic home for Roles/capacities, but repository convenience is not authority and requires separate semantic/home classification.
- Role identity, work workspace, source authority and current session readiness remain separate dimensions. A Role working mostly in Docs is not a Docs Role merely because many of its tasks use that workspace.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:KnG1W-ObJJO_TVjfKcixB-UE5k53avTCXQXqDxTpJF0
