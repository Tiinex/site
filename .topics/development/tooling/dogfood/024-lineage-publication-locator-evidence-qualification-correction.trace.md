# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 09:47:00
  - Authors: Anchor
  - Why: Prevent Tooling 021 from turning a syntactically immutable-looking Parent Origin into repair authority without independent evidence that the publication locator is real and binds the exact Parent material.
  - Summary: Tooling 024 — separate declared commit-pinned locator shape from independently qualified publication/source evidence in lineage integrity planning before repair application can consume permalink state.
  - Status: open/local

---

# Tooling 024 — lineage publication locator evidence qualification correction

## Objective

Tighten Tooling 020 publication-locator classification so commit-pinned GitHub blob syntax is useful declared-locator evidence but is not independently sufficient for `qualified` publication state or mutation authority. The portable operation must consume explicit exact provider/source/host qualification evidence when available and otherwise remain unresolved while still performing all local integrity checks.

## Done Criteria

- Preserve exact declared Parent Trace/Origin and Parent bytes as the semantic/integrity inputs; do not infer or rewrite Parent identity.
- Separate machine states for a syntactically commit-pinned/immutable-looking locator and an independently qualified publication locator. Exact vocabulary may vary, but mutation authority must not collapse them.
- Remove the current fallback that promotes any `https://github.com/<owner>/<repo>/blob/<40hex>/...` locator to `qualified` solely from lexical shape.
- Accept explicit qualified publication/source evidence only when its exact target equals the declared locator and its evidence binds the expected Parent identity/material according to the available Source/provider contract. A plain caller-supplied `state: qualified` flag without the operation's accepted evidence shape must not become a hidden trust escape hatch.
- Keep portable Tooling network-free by default. When verification requires GitHub/source access, return a host-mediated provider/action requirement or unresolved state; do not perform hidden fetches or fabricate receipts.
- Preserve truthful unpublished/local-only Parent handling and the existing unresolved Root Parent Origin semantic gap.
- Ensure repair-plan proposals requiring a publication locator remain blocked until exact publication qualification exists. Recompute current-Site diagnostic counts and explain any proposal-count changes from Tooling 020.
- Add focused tests for: lexical commit-pinned locator without provider evidence; exact qualified provider/source evidence; locator/evidence target mismatch; provider bytes/identity mismatch where representable; mutable branch URL; local unpublished Parent; and pre-existing mismatch that remains review-required regardless of locator verification.
- Preserve Tooling 020 read-only/no-mutation/no-refresh/cascade semantics and operation schema compatibility where possible. If a state shape must change, surface an explicit compatibility note for Tooling 022 consumers.
- Keep Tooling 021 blocked; this task does not apply repairs, update permalinks, commit, push, publish, or authorize remote writes.

## Scope

Read-only publication-locator evidence qualification inside lineage integrity planning, host/provider request boundary, repair-plan gating, focused tests, and bounded scan reconciliation.

Out of scope: Root/Origin schema resolution, lineage mutation, checksum repair application, Viewer/VS Code UI, GitHub authentication, commits/pushes, or remote publication.

## Dependencies

- [Tooling 020 Anchor disposition](020-2-lineage-integrity-repair-plan-foundation-anchor-disposition.trace.md)
- [Publication-locator evidence boundary feedback](../../architect/continuity/001-33-lineage-publication-locator-evidence-qualification-boundary-feedback.trace.md)
- [Unpublished Parent Origin semantic gap](../../architect/continuity/001-31-1-unpublished-parent-origin-truthfulness-and-canonical-requirement-gap.trace.md)

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: IP-gV3yDseWuG_tNSKHu6zVgMPZqDBLk1P6_cxn6zZ0