# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-25 09:55:00
  - Authors: Anchor
  - Why: Preserve Sigma's personal inspection rejection of the first live archive-backed carrier-v2 candidate and Anchor's disposition that the implementation drifted from the previously agreed recipient-facing Tiinex-artifact topology.
  - Summary: Sigma rejects the first live v2 carrier because its exposed root still presents the legacy control-plane envelope instead of the agreed flat Tiinex-artifact-and-payload tree; archive-backed Workspace plumbing remains useful but the recipient-facing carrier topology must be corrected before any fresh cold-start use.
  - Status: accepted/local

---

# First live v2 carrier Sigma audit failure feedback

## Observed Signal

- Sigma opened the exact first live v2 candidate and observed a legacy-envelope root: `context/`, `handoff.workspaces/`, `tiinex.bootstrap/`, `tiinex.package/`, plus an opaque generated `handoff-entrypoint-...trace.md` file.
- Sigma explicitly returned a FAIL disposition because this is not the Tiinex-artifact tree previously agreed for the new carrier format.

## Source

- Source: Sigma personal inspection of `tiinex-site-027-5-10-anchor-to-sigma.handoff-package.zip` in the host file/archive UI, followed by direct feedback to Anchor.
- Preservation: bounded textual summary in this artifact; the UI screenshot itself is not embedded here.

## Interpretation

- The archive-backed Workspace plumbing is useful and independently qualified, but the recipient-facing format still wraps that plumbing in the old control-plane envelope.
- This is a carrier completion failure, not a reason to discard the accepted Workspace/archive, integrity, provider, performance, or v1 compatibility work.

## Feedback Target

- Target: [First live archive-backed Handoff carrier v2 personal audit Handoff](../../handoff/sigma/027-5-10-first-live-v2-carrier-personal-audit-handoff.trace.md) and the exact candidate `tiinex-site-027-5-10-anchor-to-sigma.handoff-package.zip` manufactured from Tooling 027-5.
- Target Surface: recipient-visible outer carrier topology and cold-human orientation surface.

## Feedback Received

- Sigma disposition: FAIL.
- Sigma states the candidate is not the Tiinex-artifact tree previously agreed for the new carrier format.
- The intended recipient-facing shape is the flat artifact/payload form where ordinary Tiinex artifacts visibly own orientation, Workspace, Handoff Pointer, bootstrap/payload, and optional cache roles instead of exposing legacy package-control directories.

## Disposition

- State: accepted
- Technical Disposition: correction required before any fresh consumer receives v2 and before v2 can become normal/default.
- Retained Work: keep the accepted archive-backed Workspace mechanics, direct-v2 performance work, Workspace target conformance, representation-neutral readers, roundtrip/tamper work, and v1 behavior unless the topology correction proves a bounded change is required.
- Rejected Surface: do not treat the 027-5 candidate's legacy envelope as the new carrier format merely because its Workspace representation is archive-backed.
- Follow-Up: Tooling 027-5-11 restores the agreed recipient-facing topology and adds an explicit outer-shape regression so this drift cannot pass Anchor again.

## Limits

- Feedback Fidelity: Sigma's verdict and observed root layout are preserved as a bounded summary from the live package inspection.
- Does Not Mean: the archive-backed Workspace implementation is discarded, v1 is rejected, or all package-internal JSON/source files are forbidden.
- Boundary: the prohibition is on exposed recipient-facing package-control topology. JSON and ordinary source files may still exist inside explicitly referenced bootstrap/workspace/cache payload archives.
- Must Not Be Treated As: fresh cold-start qualification, schema mutation authority, publication authority, or permission to invent new semantic package concepts.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Z-oL8F5PCpU465-tVy-1pRuxEXD_hE9M3WhKRw_kd24