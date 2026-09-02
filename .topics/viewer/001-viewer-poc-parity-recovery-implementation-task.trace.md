# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:25:00
  - Trace: [Tooling-First Foundation Ergonomics](../tooling/005-tooling-first-foundation-ergonomics-task.trace.md)
  - Origin:
    - [relative](../tooling/005-tooling-first-foundation-ergonomics-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:32:00
  - Authors: Anchor; Sigma
  - Why: Keep Viewer technical recovery work in the Site repository where Loom will perform it, while allowing PoC discovery to proceed now and holding implementation behind the Tooling-first prerequisite gate.
  - Summary: Viewer PoC Parity Recovery — Site Implementation
  - Status: draft/local

---

# Viewer PoC Parity Recovery — Site Implementation

## Objective

Turn the demonstrated Site PoC behavior into a bounded technical recovery backlog for the active `refactor` Viewer, with Tooling-equivalent primitives qualified before corresponding Viewer implementation is treated as parity-ready.

## Done Criteria

- Technical PoC evidence is inventoried from `master` and `poc-monolith`, not reconstructed from the refactor parity ledger alone.
- The current refactor parity ledger is reconciled against that inventory and remains supporting implementation evidence rather than product-baseline authority.
- Each human-important recovery area identifies the Tooling/read-model/runtime prerequisite it consumes before UI implementation proceeds.
- Viewer-specific implementation remains presentation/interaction over shared semantics; missing Tooling capability is not silently reimplemented as Viewer-only semantic authority.
- Planned implementation is decomposed into navigation; artifact/action; Workspace/source/temporal; and final human/browser acceptance slices with narrower technical leaves added only when implementation actually starts.
- Machine-verifiable semantics and integration are green before Sigma is asked for ordinary human acceptance.
- Final product parity remains unclaimed until the Business Viewer PoC Parity Recovery outcome is accepted by Sigma.

## Scope

- Site-local technical discovery, implementation decomposition, tests, Viewer projections, and browser acceptance preparation.
- Business owns the organizational Viewer PoC Parity Recovery outcome, priority, and Sigma acceptance boundary; this Site task does not duplicate that organizational authority.
- Current implementation target: `refactor`. PoC evidence: `master` + `poc-monolith`.
- Implementation is held behind the relevant `005` Tooling prerequisites; discovery may continue in advance.

## Dependencies

- [Tooling-First Foundation Ergonomics](../tooling/005-tooling-first-foundation-ergonomics-task.trace.md)
- [Common CLI Surface And LLM Ergonomics](../tooling/005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
- Business `Viewer PoC Parity Recovery` outcome.
- Current `src/parity/poc.parityLedger.js` and `src/parity/poc.m1ParityScenarios.js` as refactor self-audit evidence.
- PoC implementation evidence on `master` and `poc-monolith`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Tooling-First Foundation Ergonomics](../tooling/005-tooling-first-foundation-ergonomics-task.trace.md)
  - Value: jw4P4fYtwsJFltZP-iRKrzsQMWMyOpXliDB_2mBn48M

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:6buMgvvatcMH-Cij-_v03JoapUlb_Cj8YGLmkSxXUtM
