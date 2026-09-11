# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 17:22:48
  - Trace: [001-1-viewer-poc-replacement-reconciliation-kodax-to-anchor-return.trace.md](handoffs/001-1-viewer-poc-replacement-reconciliation-kodax-to-anchor-return.trace.md)
  - Origin:
    - [relative](handoffs/001-1-viewer-poc-replacement-reconciliation-kodax-to-anchor-return.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 19:59:39
  - Authors: Anchor
  - Why: Kodax reconciliation showed that current qualification debt is dominated by stale post-extraction assumptions; fixing that first makes the next Viewer decisions trustworthy.
  - Summary: Repair extraction-era qualification ownership drift so the Viewer baseline reflects current architecture before broader product work.
  - Status: ready/local

---

# Viewer Major 003 — Qualification Ownership Repair And Current Baseline

## Objective

Turn the Viewer reconciliation result into a mechanically truthful current baseline by repairing the extraction-era qualification ownership drift before broader Viewer product work continues.

## Done Criteria

- Reproduce and classify the five current App integration qualification failures identified by the prior Kodax reconciliation against the exact carried Site/App/Core/provider/Verse source set.
- Repair only stale post-extraction ownership/checkpoint assumptions that belong to the delegated Site/App-facing implementation slice; do not paper over a missing shared primitive or unfinished Native Verse extraction.
- Refresh the qualification map so current failures represent current architecture rather than historical repository placement.
- Preserve all seven retained Viewer PoC product-contract groups and keep all unresolved/manual parity claims truthfully partial/UNKNOWN.
- Return the smallest exact next owner/blocker for Native Verse extraction and current browser/manual qualification after the mechanical baseline is clean.

## Scope

This is the first implementation tranche from the prior Viewer PoC replacement reconciliation. It is not a full PoC-retirement major, not a broad Viewer redesign, and not current Sigma acceptance.

## Dependencies

- Current Site Viewer repository-local orchestration frontier.
- Prior Kodax Viewer PoC replacement reconciliation Evidence and return Handoff.
- Exact current App/Core/provider/Verse source snapshots.

## Acceptance Boundary

Machine-green qualification means the ownership/checkpoint baseline is truthful; it does not promote any manual scenario to parity and does not authorize PoC retirement.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-viewer-poc-replacement-reconciliation-kodax-to-anchor-return.trace.md](handoffs/001-1-viewer-poc-replacement-reconciliation-kodax-to-anchor-return.trace.md)
  - Value: 6T_vePY5Vx5sQ-ENm83GKpv7heOZBonRgkBKhMO5lJU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: IsqxVnDZvFLGM4ka_UsgxLzJWQVz0ciiMG2Ww49XfNk