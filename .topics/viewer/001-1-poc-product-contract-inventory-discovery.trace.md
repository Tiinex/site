# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:32:00
  - Trace: [Viewer PoC Parity Recovery — Site Implementation](001-viewer-poc-parity-recovery-implementation-task.trace.md)
  - Origin:
    - [relative](001-viewer-poc-parity-recovery-implementation-task.trace.md)
- Current
  - Current Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-02 02:34:00
  - Authors: Anchor
  - Why: Recover the technical product baseline from the actual PoC branches before Viewer implementation uses the refactor ledger as supporting evidence.
  - Summary: PoC Product Contract Inventory
  - Status: draft/local

---

# PoC Product Contract Inventory

## Discovery Intent

- Intent: establish a technical product-contract inventory from actual PoC source behavior and separate that baseline from current refactor self-audit state.
- Starting Question: what user-visible/product loops must be reconciled before `refactor` can truthfully claim PoC parity?

## Discovery Field

- Field: `Tiinex/site` `master`, `poc-monolith`, active `refactor`, current parity ledger, and existing Business Viewer discoveries.
- In Scope: startup/intake, Workspace behavior, source behavior, artifact reading, Feed/Tree/Lineage, authoring actions, persistence/recovery, Time Portal, audit/diagnostics, export/publication, and presentation truth.
- Out Of Scope: implementing those loops, introducing Atlas, or treating every old implementation detail as a permanent requirement.
- Freshness Boundary: public branches checked 2026-09-02; recheck branch heads before final parity disposition.

## Discovery Outcome

- `master` is PoC evidence at observed head `6691491f0450f115ecf806342afec86b3c6a4df4`.
- `poc-monolith` is PoC evidence at observed head `b10abe25e2da65e4f91e1bae68a4da41ea10fa3f`; the observed branch is one commit ahead of `master`, with the comparison changing only `.gitignore` to include `.old` handling.
- `refactor` is the current active implementation target at observed head `5d472b1b1f3a926db1b4034b01961be10d7af1e6`.
- The current refactor parity ledger contains 25 scenarios and reports all 25 as `partial`; this is an implementation self-audit state, not evidence that there are exactly 25 PoC requirements or that all 25 are broken.
- The four explicit M1 recovery contracts are local archive intake, bootstrap/config ownership, canonical Workspace artifact/Open-Merge behavior, and verified source-over-import takeover.
- Remaining ledger coverage groups around path/tree and declared lineage, Root fallback reading, Continue/Reference and broader authoring, GitHub/source discovery, reload/local durability, audit/recoverability, publication/re-ingest, export/package file maps, schema capability registry, storage/source diagnostics, Time Portal, route shell boundaries, surface/presentation truth, semantic action labels, and conformance fixtures.
- Direct PoC product reading additionally reinforces these user loops as one coherent baseline: first useful workspace startup; add/drop/import material; distinct Feed/Tree/Lineage projections; stable return context; progressive artifact detail; Continue/Reference/Use-as creation actions; Display options/filtering; local recovery/refresh; historical review through Time Portal; and export/publication affordances.
- Exact visual styling, historical internal module boundaries, request implementation, and incidental monolith structure are not automatically parity requirements.

## Product Contract Groups

1. **Ingress and Workspace** — startup, local/archive/paste intake, canonical Workspace Open/Merge, source takeover/conflicts.
2. **Read and Navigate** — artifact/schema reading, Feed, Tree, Lineage, Parent/Trace/Origin visibility, search/filter/return context.
3. **Act and Author** — Create, Continue, bounded Reference, Use-as, generated artifact review and validation.
4. **Persist and Recover** — local unpublished work, route/session boundaries, refresh/recovery, source cache separation.
5. **History and Source** — GitHub discovery/materialization, truthful degraded diagnostics, immutable historical Time Portal review.
6. **Export and Publish** — ordinary ZIP versus Handoff package, publication preflight, exact target confirmation, re-ingest/receipts.
7. **Truthful Presentation** — capability labels, status/findings, unavailable/partial behavior, mobile/desktop comprehension.

## Interpretation Limits

- This inventory is deliberately product-contract level. It does not claim final completeness until implementation work exercises the PoC branches and Sigma performs human acceptance. Missing behavior remains `unknown` rather than silently intentionally removed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Viewer PoC Parity Recovery — Site Implementation](001-viewer-poc-parity-recovery-implementation-task.trace.md)
  - Value: 6buMgvvatcMH-Cij-_v03JoapUlb_Cj8YGLmkSxXUtM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:xCD7MSrzw_gPw54On0gyTNHUVkqXWndXtgTVZqYY9jQ
