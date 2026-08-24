# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 10:49:00
  - Authors: Anchor
  - Why: Preserve the independent Tooling 024 review finding that structured record-local evidence can still self-assert provider publication truth even though lexical URL shape alone was correctly demoted.
  - Summary: Publication qualification must bind exact returned provider material through an accepted host/source receipt boundary; locally synthesizable nested evidence on a record is not independently qualified publication authority.
  - Status: draft/local

---

# Publication provider evidence provenance binding gap feedback

## Observed Signal

- Tooling 024 correctly separates declared locator syntax from publication qualification and removes lexical commit-pinned URL shape as sufficient authority.
- `qualifyPublicationEvidence` currently searches nested evidence fields on the Parent/child records, checks asserted target/material/source values against the declared locator and loaded Parent bytes, and returns `qualified` when those assertions match.
- The operation does not require or consume the repository material carried by the existing accepted host-action receipt / `providerResponses` path before granting that state.
- The focused Tooling 024 regression constructs accepted evidence entirely locally from the Parent Markdown and locator components. No provider read receipt is needed for the qualifying case.

## Interpretation

- Exact target, SHA-256, byte count, repository, commit and path equality are necessary but not sufficient to prove publication if all of those fields are caller-supplied assertions derived from local material.
- The intended trust boundary is not “more detailed caller metadata”; it is an explicit host/provider/source observation whose returned material is then compared with the declared locator and loaded Parent bytes.
- Portable Tooling should remain network-free. The correction is to consume explicit accepted provider evidence, not to perform hidden network verification.

## Desired Correction

- Treat record-local publication evidence as descriptive/untrusted unless it is bound to an independently supplied accepted provider/source receipt available to the same operation.
- Reuse the portable host-action receipt/provider-response boundary where possible: a repository read must have exact repository, resolved commit, path and returned UTF-8 content; the returned content identity must match the loaded Parent material and the declared commit-pinned locator.
- Reject a fully fabricated nested record evidence object as publication qualification authority even when every asserted field matches local bytes and URL syntax.
- Preserve fail-closed provider requirements, lexical locator state, mutable/stale handling, local unpublished truthfulness, mismatch review, no hidden fetch, and no remote writes.

## Disposition

- State: accepted-for-correction
- Follow-Up: bounded Tooling correction before Tooling 021 repair application can consume `publicationOrigin.state = qualified`.
- Acceptance Effect: Tooling 024 remains useful and safe for read-only classification/planning, but its current positive qualification path is not independent publication authority.

## Limits

- This feedback does not assert that existing publication locators are false.
- It does not require cryptographic authentication of GitHub itself inside portable Tooling; it requires a distinct accepted provider observation boundary rather than self-authored record metadata.
- It does not authorize any repair, publication, commit, push, schema mutation, or hidden fetch.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:UJ53b-Q-Ra_WLn9V7iXk-yUV_kmQKIqoMl9TFVEx1EU
