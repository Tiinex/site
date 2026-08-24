# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 10:38:00
  - Authors: Anchor
  - Why: Preserve Q's actual-path discovery that current artifact creation can render a declared Parent while sealing only the child itself, leaving no c14n-v2 comparison entry that binds the child snapshot to the Parent snapshot.
  - Summary: Parent-bearing creation currently preserves readable continuity but does not emit the v2 non-self Parent target digest needed for a cryptographically checkable continuity chain; future generation and validation must close this without rewriting published history or inventing Parent authority.
  - Status: draft/local

---

# Parent-target v2 continuity integrity gap feedback

## Observed Signal

- Q observed that current Tooling-authored/creation-path artifacts can declare `Parent` but their `# Continuity Integrity` footer contains only one `sha256-base64url-c14n-v2` entry with `Towards: self`.
- Direct source review confirms `src/schemas/creation.renderer.js` renders the Parent envelope and then emits only the primary self entry before sealing it.
- Direct source review also confirms `src/schemas/creation.representation.js` currently qualifies both root and continuation creation by requiring exactly one total Continuity Integrity method entry, which prevents a continuation from carrying both a Parent-target v2 comparison entry and one primary self entry.
- `src/integrity/integrity.c14nV2.js` currently implements primary self sealing/verification but does not expose the non-self target-self-digest comparison needed to verify a child entry against the resolved Parent's primary v2 self digest.
- A bounded scan of the current carried Site workspace found 159 Markdown artifacts with a Root `Parent` block and zero with a v2 non-self integrity entry. This demonstrates broad representation prevalence in the current workspace but does not prove that all 159 artifacts came from the same generator path; historical and mirrored material are included.

## Canonical Integrity Reading

- The maintained `sha256-base64url-c14n-v2` method defines non-self target-self-digest mode: a non-self v2 entry should resolve the target artifact, validate/read that target's primary v2 self digest, and record the same value in the current artifact.
- The method requires ordinary v2 authoring to compute external target values first, add fixed target/review/signature entries, and compute the primary `Towards: self` seal last so the self seal preserves those sibling footer entries.
- Root's readable `Parent`/`Trace` relation and a self-only child digest are separate truths. A self-only digest proves the child snapshot bytes but does not by itself cryptographically bind that child snapshot to the declared Parent snapshot.

## Feedback Target

- Target: all Tooling/Viewer/portable artifact-creation paths that can author a continuation with `Parent`, plus their exact representation qualification and integrity verification surfaces.

## Required Correction Direction

- A continuation created with a qualified Parent should carry one v2 non-self comparison entry toward the exact resolved Parent representation and one primary v2 `Towards: self` entry, with the Parent target value fixed before the child self seal is computed.
- The Parent-target value should equal the resolved Parent artifact's validated primary v2 self digest. If that digest is missing, ambiguous, stale, or unavailable, creation/qualification must fail closed or remain explicitly unavailable; Tooling must not silently direct-recompute under an undeclared mode.
- Root creation with no Parent should remain valid with one primary self entry and must not invent a Parent target.
- Existing published self-only artifacts must not be rewritten merely to make historical integrity appear stronger than it was. Local/unpublished repair may be considered only where exact source/Parent authority is available and the repair is explicitly disclosed.

## Limits

- This feedback does not claim that every existing self-only Parent-bearing artifact is unreadable or schema-invalid; it identifies that the current representation does not provide the intended cryptographically checkable Parent continuity chain.
- It does not change Parent authority, infer Parent from chronology/dimensions, or authorize direct-target digest recomputation outside the maintained v2 target-self-digest rules.
- It does not decide a broad historical migration. Future-generation correctness and validation must be closed first; any repair/migration of already published material requires separate authority and provenance.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: CObvciq-UdALsda-2lLmv-hRbVdioj3-LtqyJ26TT5E
