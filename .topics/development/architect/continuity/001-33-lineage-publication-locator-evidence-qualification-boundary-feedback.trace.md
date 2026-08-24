# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 09:43:00
  - Authors: Anchor
  - Why: Preserve an independent Tooling 020 review finding before repair application is unblocked: a syntactically commit-pinned GitHub blob locator is currently promoted to `qualified` publication state without separately carried provider/source evidence that the locator resolves to the exact Parent material.
  - Summary: Tooling 020's read-only planner correctly avoids mutation, but publication-locator qualification must distinguish immutable declared locator syntax from independently qualified publication/source evidence before repair application may consume it.
  - Status: draft/local

---

# Lineage publication locator evidence qualification boundary feedback

## Observed Signal

- `src/tooling/portable/lineage/lineage.integrity.plan.js` currently classifies any locator matching a forty-hex GitHub `blob/<commit>/...` shape as `publicationOrigin.state = qualified`.
- Explicit `record.publishedReference` evidence with exact target equality and state `qualified` is also accepted and is a stronger evidence path.
- The read-only planner does not fetch GitHub and does not prove that a merely lexical commit-pinned locator exists, contains the exact Parent representation, or was discovered from a qualified Source/provider receipt.
- The bounded current-Site scan consequently reports clean backfill proposals whose publication qualification can depend on persisted locator syntax alone.

## Source

- Source: independent Anchor source review of Tooling 020 in the Loom 014 returned full Site workspace on 2026-08-24.

## Feedback Target

- Target: the publication-locator qualification state consumed by read-only lineage integrity planning and any future repair-application precondition.

## Feedback Received

- Current code promotes forty-hex GitHub blob locator syntax to `qualified` without separately carried provider/source evidence binding that locator to the exact Parent material.
- Q's design boundary requires publication/permalink repair to remain truthful and evidence-backed rather than inferred from a plausible URL shape.

## Interpretation

- Commit-pinned syntax is useful evidence that a locator is intended to be immutable, but immutability shape is not by itself proof of publication availability or exact material identity.
- This does not make Tooling 020 unsafe as a read-only diagnostic because it performs no mutation or remote write.
- It becomes safety-critical before Tooling 021 may use the state as authority for permalink/header mutation or backfill approval.
- The portable core should consume explicit host/provider/source qualification evidence rather than performing hidden network verification or assuming publication from syntax.

## Desired Boundary

- Separate at least `declared immutable locator` from `qualified publication locator` in machine state.
- A syntactically commit-pinned GitHub blob without independent exact evidence must remain unresolved/unverified for mutation authority.
- Exact qualified provider/source evidence may promote the locator only when target identity matches the declared Parent and the evidence binds the expected Parent bytes/identity under the relevant Source contract.
- Viewer/VS Code may later request host-mediated GitHub discovery/verification and feed the resulting receipt back into the same portable operation.
- Never fabricate a permalink for unpublished material and never downgrade a mismatch flag merely because a new locator can be constructed.

## Disposition

- State: accepted-for-correction
- Follow-Up: bounded Tooling correction before Tooling 021 repair application is unblocked.
- Acceptance Effect: Tooling 020's read-only inspection/cascade/planning foundation may be accepted bounded, but `publicationOrigin.state = qualified` from lexical commit-pinned URL shape alone must not be used as mutation authority.

## Limits

- This feedback does not assert that existing commit-pinned links are false.
- It does not require network access inside portable Tooling.
- It does not block read-only planning, exact Parent self-digest verification, or cascade-impact computation.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: HVk51qFDy1c3x_UG38bG6qRwHQzmPBuw1zTVhhj2_J0