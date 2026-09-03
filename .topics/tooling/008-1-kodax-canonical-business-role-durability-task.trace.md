# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-03 17:37:45
  - Trace: [008-reduction-placement-and-expansion-contract-decision.trace.md](008-reduction-placement-and-expansion-contract-decision.trace.md)
  - Origin:
    - [relative](008-reduction-placement-and-expansion-contract-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 17:59:13
  - Authors: Anchor
  - Why: Keep cross-repository role migration truthful: Business must be durably committed and pinned before Site can claim supersession.
  - Summary: Human durability gate that lands the qualified Kodax Role in canonical Tiinex/business before Site reduction may retire the Viewer-local role.
  - Status: ready/local

---

# Kodax Canonical Business Role Durability

## Objective

Make the already-qualified Kodax implementation Role durably present under the canonical `Tiinex/business` Roles lineage before Site reduction removes the historical Viewer-local Kodax Role or claims a durable supersession target.

## Done Criteria

- Sigma receives one canonical Tiinex Handoff package containing the exact qualified Kodax Role candidate and enough Business lineage context to review its intended placement.
- The exact carried Kodax Role is placed at `.topics/roles/001-6-kodax-role.trace.md` in `Tiinex/business` under the existing canonical Roles parent without semantic rewriting.
- Sigma commits and pushes the Business-only change through the human repository authority.
- Sigma returns the exact immutable Business commit SHA to Anchor, together with any blocker or deviation.
- Anchor verifies that pushed SHA before any Site Reduction claims the Viewer-local Kodax Role is superseded by canonical Business authority.

## Scope

- Human repository landing and durability proof for the canonical Kodax Role only.
- Business is committed before Site reduction finalization.
- No Site deletion/reduction, Viewer implementation, release/deployment, role redesign, or remote mutation by Anchor is authorized by this Task.

## Dependencies

- Canonical organizational parent: `business::.topics/roles/001-roles.trace.md`.
- Qualified local candidate: `business-candidate::.topics/roles/001-6-kodax-role.trace.md` as carried by the operational Handoff package.
- Process rule: [Reduction Placement And Expansion Contract](008-reduction-placement-and-expansion-contract-decision.trace.md).

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [008-reduction-placement-and-expansion-contract-decision.trace.md](008-reduction-placement-and-expansion-contract-decision.trace.md)
  - Value: Oj5DZL9ELL9iZfrJi9pQbYS6jRRrGgOe2_vtLYhBeVo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PsmfBFpF18g9iZ2bEBjo0xI07NVgXyHEcsipnoSGiNs