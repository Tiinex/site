# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 10:49:00
  - Trace: [Sigma role materialization](001-sigma-role-materialization.trace.md)
  - Origin:
    - [relative](001-sigma-role-materialization.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 10:49:45
  - Authors: Anchor
  - Why: Preserve the portable Role-authoring capability gap reproduced while materializing Sigma instead of compensating for it with permanent Anchor memory or silently treating Root fallback as exact Role semantics.
  - Summary: Portable schema-guide cannot currently recover exact readable `tiinex.party.role.v1` semantics from the supplied Site workspace and falls back to Root, requiring an explicit host-mediated canonical schema read for exact Role authoring.
  - Status: draft/local

---

# Sigma Role Portable Schema Authoring Feedback

## Observed Signal

- `node tools/tiinex-portable.mjs schema-guide . --schema tiinex.party.role.v1 --task create --detail compact` returned `portable.schema-guide.schema.unavailable` and reported that neither readable schema material nor a registered exact schema module was available.
- The guide resolved through `tiinex.root.v1` fallback with `fullSchemaAvailable: false`, no exact creation fields, and a recommendation to supply readable schema material.
- The exact canonical `tiinex.party.role.v1` schema was then retrieved explicitly from `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d`; it defines the Role Identity, Role Boundary, Authority And Responsibility Boundary, Holder Relationship, and Interpretation Limits contract needed for this task.
- Portable inspection of the resulting Sigma Role preserves the declared child schema but still reports `resolvedCompanionId: tiinex.root.v1`, `schemaCoverage: unknown-schema`, `fallbackUsed: true`, and blocks `claim-exact-read`.

## Source

- Source: current local Tiinex/site workspace used for Anchor review, portable Tooling output from the Sigma role-materialization task, and the exact host-mediated canonical Party Role schema read from Tiinex/docs commit `3988951208eb9a8926e84ab42625d4b42fa00c2d`.

## Interpretation

- Current Tooling fails closed rather than inventing Party Role semantics, which is correct behavior.
- However, a fresh LLM attempting Role creation from current supplied Site material cannot obtain the exact Role authoring contract through the portable surface alone even though that contract is canonical and required for the work.
- This is a shared Tooling/schema-material closure gap, not evidence that `tiinex.party.role.v1` is absent, not a reason to embed Role schema rules in Anchor memory, and not a reason to promote Root fallback to exact child-schema qualification.

## Feedback Target

- Target: portable schema-material resolution / readable schema-guide support for `tiinex.party.role.v1` and similarly required collaboration schemas when Role creation or revision is a declared LLM-first workflow.

## Feedback Received

- Anchor dogfood feedback: exact Sigma Role authoring remained possible only because the host could explicitly retrieve the fixed canonical schema and Anchor could then author against that contract.
- Tooling feedback: the runtime correctly exposed the missing exact capability and blocked an exact-read claim rather than hiding the limitation.

## Evidence Material

- Portable finding: `portable.schema-guide.schema.unavailable`.
- Portable finding: `portable.schema-guide.readable-schema.unavailable`.
- Schema-guide capability: `status: unavailable`, `resolvedThrough: tiinex.root.v1`, `fallbackUsed: true`.
- Role inspection: declared schema `tiinex.party.role.v1`; exact companion unavailable; Root fallback only; `claim-exact-read` blocked.
- Canonical schema authority used for manual closure: `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md`.

## Disposition

- State: correction-required/open
- Follow-Up: Loom/shared Tooling should eventually make exact readable Party Role semantics recipient-relative and discoverable when Role authoring/revision is requested, through qualified carried schema material, provider resolution, cache, or another authority-preserving portable seam. The correction must not hardcode Sigma, copy schema prose into Role definitions, or treat Root fallback as exact child-schema authority.
- Qualification Effect: the Sigma Role artifact can be structurally reviewed against the explicitly fetched canonical schema and self-integrity verified, but this run is not an exact portable Role-authoring dogfood PASS because the shared tooling surface required host/manual semantic closure.

## Limits

- This feedback does not require every Tiinex schema to be registered as Viewer/runtime code.
- It does not authorize canonical Role schema changes or prescribe a specific provider/cache implementation.
- It does not make the Sigma Role a Tooling owner or add Tooling procedure to Sigma semantics.
- It does not invalidate Root fallback as a safe preservation/read surface; it only rejects treating that fallback as exact Party Role authoring qualification.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:nrkZ0IrD9FWshC8gzNLn5Rg-mbEdqRB1VR-259kluHM
