# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:02
  - Trace: [Macro roadmap and refactor-exit recovery](001-2-macro-roadmap-refactor-exit-recovery.trace.md)
  - Origin:
    - [relative](001-2-macro-roadmap-refactor-exit-recovery.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:22:00
  - Authors: Architect
  - Why: Preserve the recovered macro-roadmap and refactor exit intent so later Architects do not confuse success of the canonical architecture stack with completion of retained PoC product parity.
  - Summary: Recovered refactor roadmap and exit model: M0 classified PoC capability obligations; later milestones implemented capability families, but global retained PoC parity remains an explicit exit obligation.
  - Status: accepted/local

---

# Macro Roadmap And Refactor Exit Recovery

## Decision

- State: accepted
- Subject: historical refactor roadmap, later supersession/refinement, and current refactor-exit obligation
- Decision: preserve the old milestone roadmap as historical structural intent, not as a mechanically reopened queue. Later S1/Transition/M0-A-F work legitimately refined and implemented substantial parts of it, but did not erase the original product obligation: retained PoC HARD PARITY behavior must be recovered/requalified or consciously superseded with explicit evidence before "refactor complete" is claimed.

## Basis

### What M0 Originally Did

- Historical Architect/role handover evidence identifies M0 as the PoC -> refactor capability ledger: observed PoC behavior was classified into HARD PARITY, REFINE BEFORE PORT, STRUCTURAL LESSON, or DO NOT PORT rather than copying the monolith wholesale.
- The current source still carries this intent directly in [src/parity/poc.parityLedger.js](../../../src/parity/poc.parityLedger.js): `Recover one observed PoC loop at a time under explicit semantic/runtime owners before claiming parity.`
- Therefore M0 was not "build the new architecture" by itself; it established which proven product behaviors the refactor was obliged to recover and which implementation details should not be ported.

### Recoverable Historical Milestone Map

The following labels are supported by historical handover evidence and current source/test lineage strongly enough to preserve as recovered structure:

- M1 -> Workspace Spine / startup and workspace foundation.
- M2 -> workspace presentation, scoped interaction, lifecycle/product-contract closure.
- M3 -> route/share/public restore/history and related source/member identity boundaries.
- M4 -> authoring/local draft/edit foundations.
- M5 -> lineage/status/readability family.
- M6 -> mobile/evidence family.
- M7 -> export redesign/publication/re-ingest family.
- M8 -> historical evidence implies an FS25 reinterpretation family in this position, but the exact `M8 = ...` label is reconstruction rather than directly verified canonical naming here.
- M9 -> Tooling bridge/integration family.
- M10 -> exact historical definition remains unverified in the currently recoverable artifacts and must stay unknown rather than be invented.

### Current Reconciliation

- Current source contains durable acceptance families for M2, M3 and M4, plus later product-parity tranches `M0-A` through `M0-F` covering cold start, route/readability, authoring, historical/time behavior, export/publication/re-ingest and product acceptance hardening.
- Later canonical Transition/S1 work superseded old implementation mechanics where current authority changed, especially around authoring, Reference/Relation, schema-driven generation, package/locality and exact authority binding. That is legitimate refinement/supersession of *how* parity is achieved, not automatic cancellation of *whether* retained product value exists.
- The current parity ledger is the strongest current source-level macro signal. At the carried Site runtime checkpoint it still marks every listed scenario as `partial`, including workspace startup/config, Tree, root fallback, lineage, authoring/reference, GitHub discovery, persistence/reload, audit, publication/re-ingest, export package/file-map, schema capability registry, storage policy, time portal, route shell, discovery presentation and semantic action truth.
- Therefore current source does **not** support a global `PoC HARD PARITY closed` claim even though many individual implementation tranches are source-qualified.

### Refactor Exit Criterion

`refactor complete` requires more than canonical Transition/schema/package architecture functioning. It requires:

- each retained PoC HARD PARITY capability family is either requalified on the current architecture or explicitly superseded/rejected through durable product/architecture authority;
- actual-path behavior is tested where the claim is user-visible, with Q/human acceptance where product acceptance is required;
- current parity ledger/roadmap truth no longer relies on broad `partial` placeholders for retained exit-critical behavior;
- no old implementation mechanism is revived merely to satisfy parity if current semantic/authority boundaries intentionally replaced it;
- remaining debt is ordinary post-refactor evolution rather than a known missing retained product behavior required by the original parity contract.

## Consequences

- Do not restart the historical M1->M9 roadmap mechanically. Use it as a capability/recoverability map and reconcile each family against current artifacts.
- Do not declare refactor completion merely because current canonical Topic/Task/Transition/Handoff/tooling stacks are architecturally coherent.
- The current next-step plan must retain an explicit remaining-parity view; generic Tiinex expansion may proceed only without silently dropping unresolved retained parity obligations.
- Exact M8 wording and M10 definition remain unresolved historical details. Future evidence may refine them without invalidating the product-exit principle above.
- This decision is the preferred recoverability entrypoint for "why are we refactoring and what does done mean?".

## Review Conditions

- Reconcile this artifact when a later durable parity ledger closes/supersedes capability families, when exact historical M8/M10 evidence is recovered, or when Q/Architect explicitly changes the refactor exit contract.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:uL0vp5qB45HqsWCAPB4mSrm4G2OJxppsaHO73UvTXIg