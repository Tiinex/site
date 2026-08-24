# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 10:50:00
  - Authors: Anchor
  - Why: Close the remaining Tooling 024 trust gap by making positive publication qualification depend on exact accepted host/provider material rather than a caller-fabricable nested record evidence object.
  - Summary: Tooling 025 — bind publication qualification to accepted provider/source receipt material while preserving Tooling 024 lexical classification, read-only planning, and no-hidden-fetch boundaries.
  - Status: open/local

---

# Tooling 025 — publication provider receipt binding correction

## Objective

Make `publicationOrigin.state = qualified` require an explicit accepted provider/source observation that returns the exact declared publication target material and binds it to the loaded Parent. Keep record-local locator/evidence metadata descriptive only unless it references evidence actually supplied and accepted through the operation's host/provider input boundary.

## Done Criteria

- Preserve Tooling 024's separate `locatorState`, unresolved lexical-only commit-pinned state, mutable/stale handling, local unpublished handling, mismatch review behavior, repair-plan gating, and Tooling 022 compatibility note unless an additive clarification is required.
- Add an explicit operation input path for accepted provider/source evidence. Prefer the existing portable host-action acceptance / `providerResponses` contract or another already-qualified Source response rather than inventing a parallel trust vocabulary.
- For GitHub commit-pinned blob qualification, require exact agreement among the declared locator and accepted provider material: repository owner/name, resolved forty-hex commit, normalized repository path, returned UTF-8 bytes/content identity, and loaded Parent material identity. Returned provider content must be hashed by Tooling; do not trust a caller-supplied material digest in lieu of returned material.
- A fully caller-fabricated record-local `publishedReference.evidence` / publication-evidence object must remain unresolved and must not create mutation authority, even when it asserts the correct target, SHA-256, byte count, repository, commit and path.
- If a record carries a receipt/evidence reference, resolve it only against explicit accepted evidence supplied to the same operation; a missing, mismatching, rejected, wrong-action, wrong-target, or locally sourced receipt remains unresolved/contradictory as appropriate.
- Keep portable Tooling network-free by default. When accepted provider material is absent, continue returning a host-mediated `providerRequirement`; do not fetch GitHub internally and do not fabricate receipts.
- Preserve no remote write, no source mutation, no repair application, and no automatic mismatch refresh. Tooling 021 remains blocked by this task.
- Add focused regressions for: fabricated nested record evidence rejected; accepted repository-read provider response qualifies; wrong/missing host-action receipt rejected; repository/commit/path mismatch; provider-returned byte mismatch; mutable branch URL; local unpublished Parent; pre-existing mismatch remains review-required; and read-only provider requirement when evidence is absent.
- Re-run Tooling 024, lineage foundation, full portable aggregate, prospective Parent-target v2 acceptance, and directly affected host receipt/binding regressions.
- Reconcile current-Site diagnostic counts with no provider receipts supplied; positive qualified publication/proposed backfill counts must not increase merely because record-local nested evidence exists.

## Scope

Portable lineage publication evidence consumption/provenance binding, accepted host/provider response integration, repair-plan gating, focused regressions, and bounded diagnostic reconciliation.

Out of scope: hidden network access, GitHub authentication, remote writes, repair application, Viewer/VS Code UI, Root/Origin semantic resolution, existing lineage mutation, publication acts, or broad host-tool redesign.

## Dependencies

- [Tooling 024 Anchor disposition](024-2-lineage-publication-locator-evidence-qualification-anchor-disposition.trace.md)
- [Provider evidence provenance binding feedback](../../architect/continuity/001-34-publication-provider-evidence-provenance-binding-gap-feedback.trace.md)
- [Tooling 024 result](024-1-lineage-publication-locator-evidence-qualification-correction-result.trace.md)
- Existing portable host-action receipt normalization in `src/tooling/portable/host/tool.bindings.js` is preferred reusable authority where compatible.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:h5RsqEQ67eWJKEk9F5WGpnNefB0beSsnWsJEGG_gmhU
