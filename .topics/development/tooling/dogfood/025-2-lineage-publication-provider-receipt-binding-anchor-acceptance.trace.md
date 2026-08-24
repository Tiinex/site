# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 12:04:00
  - Authors: Anchor
  - Why: Independently disposition Tooling 025 after source review, focused/full regression replay, current-Site scan reconciliation, and provider-side exact-target checks exposed the next semantic/representation blockers without reopening the corrected provenance boundary.
  - Summary: Accept Tooling 025 bounded: positive publication qualification now requires accepted repository-read provider material and exact returned-byte equality; repair application remains blocked pending actual receipt material for an intended subset plus semantic disposition of historical repaired-vs-published representation mismatches.
  - Status: accepted/local

---

# Tooling 025 Anchor acceptance

## Decision

- State: accepted-bounded
- Subject: publication provider receipt binding correction
- Decision: accept Tooling 025 as satisfying the retained Tooling 024 provenance-binding correction. Record-local publication evidence can contradict or descriptively constrain a claim but cannot independently create `publicationOrigin.state = qualified`; positive qualification is derived only from accepted repository-read provider material whose repository, resolved forty-hex commit, normalized path and returned UTF-8 bytes match the declared commit-pinned locator and loaded Parent bytes.
- Boundary: this acceptance closes the provider-receipt trust defect only. It does not itself authorize Tooling 021 repair application, origin rewriting, checksum refresh, descendant resealing, publication, Git mutation, or remote writes.

## Independent Validation

- Source review confirms `lineage.publicationProviderReceipts.js` accepts only normalized accepted `repository-read` host/provider observations and ignores direct unaccepted `providerResponses` as publication authority.
- Source review confirms `lineage.publicationQualification.js` re-hashes provider-returned content locally, binds it to exact repository/commit/path, and compares those bytes with the loaded Parent rather than trusting caller-supplied material digests.
- Independent replay passes host receipt binding, lineage repair-plan foundation, Tooling 024 publication-evidence coverage, Tooling 025 provider-receipt coverage, prospective Parent-target v2 acceptance, and the complete portable aggregate.
- `npm run validate` reaches only the two supplied-baseline static source-size failures in `src/tooling/portable/engine.facade.js` and `src/tooling/portable/operation.catalog.js`; no Tooling 025 regression or new static failure was observed.
- Independent pre-acceptance scan over the carried 256 trace records, with no publication provider receipts supplied, remains fail-closed: publication `qualified = 0` and repair `proposed = 0`. Removing the Tooling 025 result and Loom return Handoff reproduces Loom's 254-record snapshot exactly.

## Provider Reconciliation Signal

- Exact provider-side Git blob identity checks at each declared repository/commit/path show that several current commit-pinned declarations do correspond byte-for-byte to their carried Parent material, including eight currently missing-backfill child edges. Those checks scope a plausible future repair subset but are not substitutes for Tooling 025 accepted full-content repository-read receipts.
- One additional exact target belongs to the existing `child-self-mismatch` artifact and therefore remains blocked by its independent self-integrity contradiction even though the declared Parent publication target itself matches.
- Seven v471-v474 child edges declare the same historical Tiinex/site commit `32c7c291101b2a6a72c12241f3107d4a56af81fc`, but the provider Git blob at each declared Parent path is byte-different from the carried Parent. Each carried Parent explicitly records a `Historical canonical representation repair` and names the provider blob as its pre-repair published representation, so the mismatch is durable representation history rather than evidence that Tooling 025 should coerce into qualification.
- The remaining commit-pinned external-parent edge resolves to a Tiinex/docs target but the Parent artifact is not loaded in the carried Site workspace, so Parent identity/material qualification remains unresolved locally.

## Consequences

- Tooling 025 may now be treated as the accepted positive-publication-evidence boundary for later read-only planning and repair gating.
- Tooling 021 remains blocked for current-Site application until an explicit intended repair subset has accepted full provider receipts available to the same lineage operation, every touched artifact has the required repair approval/disposition, and retained semantic/representation contradictions are resolved.
- The eight provider-identity-matching missing-backfill edges are candidates for later receipt collection; they are not yet `qualified` or `proposed` merely because an external Git blob comparison matched.
- The seven historical repaired-vs-published Parent mismatches require Axiom/Anchor semantic classification before any origin or Parent-target mutation can be authorized. Tooling must preserve them as contradictory/review-required when exact provider bytes are supplied.
- The existing child-self mismatch and unresolved external Parent remain separate trust blockers and must not be hidden inside a publication-origin repair tranche.
- Tooling 022 remains blocked behind an accepted repair/application contract and must project repair truth rather than infer publication authority from locators.
- The unpublished Parent Origin requirement gap remains a separate canonical semantic question; Tooling 025 does not decide whether a truthful local/unpublished Parent may omit an immutable archive permalink.

## Review Conditions

Reopen this acceptance only if a later regression permits record-local or direct unaccepted provider assertions to create positive qualification, if exact returned-provider bytes cease to be the comparison authority, or if hidden network/provider access is introduced into portable lineage planning. Semantic decisions about historical repaired representations and unpublished Parent Origin do not invalidate this bounded Tooling acceptance.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:d-BhyWXbMPJeFGwdYTIsYFw8l_6bwgmsMz4_eUY9s80
