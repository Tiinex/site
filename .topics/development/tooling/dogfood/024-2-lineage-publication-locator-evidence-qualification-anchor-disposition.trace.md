# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 10:48:00
  - Authors: Anchor
  - Why: Independently disposition Tooling 024 after focused/full regression replay and source review exposed one remaining provenance-binding trust gap between record-local evidence shape and the existing host/provider receipt path.
  - Summary: Accept Tooling 024's read-only lexical-versus-qualified state separation bounded, but keep publication qualification unusable as mutation authority until exact provider evidence is bound to an accepted host/provider receipt rather than caller-fabricable record metadata.
  - Status: accepted-with-retained-blocker/local

---

# Tooling 024 Anchor disposition

## Decision

- State: accepted-bounded-with-correction-before-apply
- Subject: read-only publication locator evidence qualification
- Decision: accept the safer read-only classification and repair-plan gating introduced by Tooling 024. Commit-pinned GitHub blob syntax alone no longer becomes `publicationOrigin.state = qualified`; lexical-only origins remain unresolved, proposed backfills are blocked, mutable/noncanonical blob URLs remain stale, and exact Parent/child integrity classification remains unchanged.
- Retained Blocker: `qualified` publication evidence is still provenance-underbound. `lineage.publicationQualification.js` accepts nested `publishedReference.evidence` / publication-evidence objects directly from supplied records, verifies their asserted target/material/source fields against locally available bytes and locator syntax, and then returns `qualified` without requiring that evidence to originate from the existing accepted host-action receipt / `providerResponses` boundary. A caller that knows the Parent bytes and declared URL can synthesize the accepted nested evidence shape locally, including the SHA-256 and repository/commit/path fields, without any provider read having occurred.

## Basis

- Independent replay passes Tooling 024 focused coverage, the lineage repair-plan foundation regression, prospective Parent-target v2 acceptance, and the complete portable aggregate.
- Source review confirms the important correction: lexical forty-hex GitHub blob shape is now only `locatorState = commit-pinned-github-blob`; a plain top-level `state: qualified` without nested evidence no longer qualifies publication.
- The focused Tooling 024 test's own `withEvidence(...)` helper demonstrates the remaining gap: it constructs the complete accepted `evidence` object locally from the record Markdown and parsed URL, and that locally fabricated object is sufficient to obtain `publicationOrigin.state = qualified` and a `proposed` repair disposition.
- The repository already has a distinct explicit host mediation contract in `acceptPortableHostActionReceipt`: repository reads are normalized into `providerResponses` only through a matching host-action plan/receipt and carry repository/commit/path/source boundaries. Tooling 024 emits `providerRequirement` describing that route but does not consume the accepted receipt/provider response as the qualification authority.
- `npm run validate` remains blocked only by the same supplied-baseline source-size violations in `engine.facade.js` and `operation.catalog.js`; the full portable aggregate including Tooling 024 passes.

## Consequences

- Tooling 024 may be used for read-only inspection, lexical locator classification, provider-requirement projection, and fail-closed repair-plan gating.
- Tooling 021 remains blocked. No repair consumer may treat Tooling 024's current record-local nested evidence shape as independent publication/source authority.
- Tooling 022 remains blocked behind the repair/application boundary and must later consume the corrected publication evidence state, not infer trust from URL shape or record-local assertions.
- The returned current-Site reconciliation remains conservative and safe with no supplied provider receipts: lexical-only commit-pinned origins stay unresolved and the formerly proposed clean backfills stay blocked.
- The unpublished Parent Origin semantic gap and any semantic mismatch dispositions remain separate retained blockers even after provider-receipt binding is corrected.

## Review Conditions

Close this blocker only when the lineage planner can consume an explicit accepted provider/host receipt or equivalently qualified Source response, bind exact repository/commit/path and returned bytes to the declared locator and loaded Parent material, reject locally synthesized record evidence as independent authority, and preserve the existing no-hidden-fetch/no-remote-write boundary.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:gCd1LMyDWh4CNqdcseQ3ZbwnUaWo3I0IC1qXglX1Aqw
