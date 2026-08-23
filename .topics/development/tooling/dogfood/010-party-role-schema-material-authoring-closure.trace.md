# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 10:49:45
  - Trace: [Sigma Role Portable Schema Authoring Feedback](../../sigma/role/001-2-sigma-role-portable-schema-authoring-feedback.trace.md)
  - Origin:
    - [relative](../../sigma/role/001-2-sigma-role-portable-schema-authoring-feedback.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/61fb68948831c8a601d999264cf1424ef09cd14c/.topics/development/sigma/role/001-2-sigma-role-portable-schema-authoring-feedback.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 11:08:00
  - Authors: Anchor
  - Why: Convert the reproduced Sigma Role-authoring gap into one bounded shared-Tooling leaf, reusing the already-qualified network-independent schema-provider pattern rather than teaching Anchor/Role prose to remember Party Role semantics manually.
  - Summary: Party Role schema material authoring closure
  - Status: open/local

---

# Party Role schema material authoring closure

## Objective

Make exact readable `tiinex.party.role.v1` semantics available through the portable LLM-first schema authoring/validation surface without host-mediated network rescue, Root fallback masquerading as child-schema authority, or a Sigma/Loom-specific hardcode.

## Done Criteria

- From a qualified current Site workspace/package containing the required canonical Party Role material, `schema-guide --schema tiinex.party.role.v1 --task create` can recover the exact readable Role creation contract with `fallbackUsed: false` and without remote fetch.
- The portable surface exposes the required Role sections and fields from canonical material and can structurally validate current Sigma/Loom Role drafts against that contract while preserving the distinction between structural contract validation and exact runtime companion availability.
- Missing Party Role material remains an explicit unavailable/provider-action-required state; wrong identity, stale integrity, or equally qualified conflicting representations remain rejected/ambiguous rather than selected by path or filename convenience.
- The correction reuses or generalizes the established canonical bootstrap/provider/qualification seam from Tooling 009 where appropriate. It must not register every docs schema as Viewer/runtime code merely to make authoring convenient.
- Existing Tooling 009 validation-report schema resolution behavior remains green, including networkless exact material, missing material, wrong/ambiguous material, and provider-enabled paths.
- Existing Handoff material-closure/transport-companion focused tests, browser-import/architecture/static/schema gates, and relevant portable tests remain green or any pre-existing dependency-bound nonpass is explicitly preserved.
- Return contains durable Loom result/evidence and a proper independently groundable recipient-relative Handoff package for Anchor; a changed-only carrier is included only if Q explicitly requests merge transport.

## Scope

Portable readable schema-material resolution, bootstrap/provider qualification, schema-guide/authoring/validation consumption, and focused regression needed for `tiinex.party.role.v1` as a real Role-revision workflow.

Out of scope: changing canonical Party Role semantics; editing Sigma or Loom Role meaning to compensate for Tooling; registering every Tiinex/docs schema in Site runtime; Viewer product integration; Axiom schema-governance changes; Q product acceptance; or weakening exact child-schema/Root fallback boundaries.

## Dependencies

- [Sigma Role Portable Schema Authoring Feedback](../../sigma/role/001-2-sigma-role-portable-schema-authoring-feedback.trace.md) owns the reproduced defect.
- [Tooling 009 result](009-1-cold-start-validation-report-schema-material-closure-result.trace.md) is the nearest proven network-independent exact-schema provider/qualification precedent and should be reused rather than bypassed where its boundary fits.
- Canonical Party Role schema authority is [tiinex.party.role.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md).
- [Current Loom Role](../../loom/role/001-loom-role.trace.md) defines the portable/shared implementation capacity; Axiom owns any semantic insufficiency discovered in canonical schema authority and Anchor retains correction review.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:96oBtSpG2yWwQxRhmx5kpB72twj-TGVG8tHQdE7Q7EA
