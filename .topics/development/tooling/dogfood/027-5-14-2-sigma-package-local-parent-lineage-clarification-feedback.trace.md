# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-25 17:02:00
  - Authors: Anchor
  - Why: Preserve Sigma's clarification that recipient-v2 numeric pathing and package-local Parent continuity intentionally project the same Handoff-package tree, correcting Anchor's over-broad interpretation in 027-5-14-1 without rewriting the earlier sealed feedback artifact.
  - Summary: Sigma clarified that filenames are not generic Tiinex semantic authority, but this Handoff.package generator deliberately mints one package-local Parent tree and mirrors that exact tree in numeric pathing; therefore the 027-5-14 PoC result where every generated Markdown artifact appeared as a lineage root was a real carrier defect.
  - Status: accepted/correction-required/local

---

# Sigma package-local Parent-lineage clarification feedback

## Observed Signal

- The 027-5-14 physical ZIP rendered every generated Markdown artifact as an independent lineage root in Sigma's old Site PoC because those generated artifacts declared no `Parent`.
- Sigma clarified that the carrier itself owns a package-local Parent tree and intentionally mirrors that same tree in numeric pathing.
- Therefore the missing Parent edges are a carrier-generation defect, not merely a presentation choice or parser limitation.

## Interpretation

- Numeric pathing remains a navigation projection rather than generic Tiinex semantic authority.
- In this specific carrier, declared package-local Parent continuity is the authority and numeric pathing is deliberately generated from the same parent graph; the two must agree.
- ZIP companions share their owning Markdown node's package-local dimension but do not independently carry a Markdown envelope.

## Feedback Target

- Target: the Parent-boundary interpretation recorded in `027-5-14-1-sigma-generated-artifact-envelope-and-start-order-audit-feedback.trace.md` and the recipient-v2 generated carrier topology that followed it.
- Affected Surface: package-local generated Markdown nodes, numeric pathing, Parent traces, Parent-target c14n-v2 integrity, leaf-to-root traversal, and cold-reader Explorer ordering.

## Feedback Received

- Sigma clarified that numeric filenames do not independently establish Tiinex Parent authority in general.
- For this Handoff.package mechanism, however, the generator owns both the package-local continuity tree and its numeric path projection. Those two representations should therefore match exactly.
- The package-local root is `001`; first-level nodes such as READ, bootstrap, and each Workspace node are children of `001`; a selected Handoff Pointer under a Workspace is a child of that Workspace node; deeper cache/material nodes follow their numeric parent dimension.
- A ZIP companion shares the numeric node/dimension of its owning Markdown artifact. The ZIP cannot carry a Markdown continuity envelope itself, but it participates in that node through the owning artifact.
- Random access is an acceptance property: opening any generated Markdown leaf should allow Parent traversal back through the declared package-local lineage to exactly the `001` package root.
- The earlier 027-5-14 observation that the old Site PoC showed every generated artifact as a lineage root is therefore evidence of a carrier defect, not merely an expected consequence of keeping filenames non-authoritative.

## Source

- Source: Sigma clarification in the Anchor dialogue after reviewing the 027-5-14 physical ZIP, Explorer ordering, old Site PoC lineage behavior, and maintained Tiinex Parent-bearing schema representation.
- Prior Feedback Artifact: [027-5-14-1 Sigma generated artifact envelope and Start-order audit feedback](027-5-14-1-sigma-generated-artifact-envelope-and-start-order-audit-feedback.trace.md)
- Fidelity Limit: this artifact preserves the clarified semantic rule and its immediate consequences; screenshots and conversational wording remain source evidence rather than being duplicated verbatim.

## Disposition

- State: accepted and operative for recipient-v2 correction.
- Superseded Interpretation: the 027-5-14-1 statement that numeric pathing and semantic Parent should remain distinct in this carrier is too broad and is superseded by this clarification.
- Preserved Interpretation: filenames/path position are not generic Tiinex identity or independent Parent authority.
- Corrected Rule: recipient-v2 package-local Parent continuity is authoritative in the generated Markdown envelope; numeric pathing is a deliberate deterministic projection of that same tree and must agree with it.
- Required Correction: generated child artifacts declare truthful package-local Parent traces; each non-self Parent target is integrity-bound to the actual parent artifact; inspector traversal verifies every generated Markdown leaf reaches the exact package root; physical sort places `001-1-READ-BEFORE-PROCEEDING` before later numbered material.

## Follow-Up

- Correct the generator rather than hand-editing a specimen.
- Preserve exact durable source Workspace bytes inside the Workspace archive; do not rewrite historical Parent/Origin on already-existing source artifacts merely to fit package-local navigation.
- Represent the visible Workspace surface as a newly generated package-local Workspace node whose Parent belongs to the disposable carrier, while the exact durable Workspace artifact remains unchanged inside its archive representation.
- Re-run the old-PoC-equivalent leaf-to-root behavior as a permanent recipient-v2 acceptance gate.

## Limits

- Does Not Mean: Tiinex filenames generally create semantic Parent; all directory nesting must become Parent; package membership rewrites durable source lineage; ZIP bytes independently carry a Markdown Parent envelope; or an unpublished package-local Parent has a fabricated remote publication origin.
- Must Preserve: truthful provenance, exact carried source bytes, Root/child schema contracts, c14n-v2 self integrity, Parent-target integrity, current/default v1 isolation, and the distinction between navigation projection and semantic authority.
- Historical Boundary: `027-5-14-1` remains immutable evidence of the earlier audit and Anchor's then-current interpretation; this artifact corrects that interpretation rather than silently rewriting it.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: r5MqOKayZFUg_d_p43X2vCQE8faB4S0jI18KbBKGdRY