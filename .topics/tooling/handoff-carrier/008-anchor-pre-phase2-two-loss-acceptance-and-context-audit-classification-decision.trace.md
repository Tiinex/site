# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 18:04:00
  - Trace: [Loom To Anchor — Pre-Phase-2 Handoff-Suite Loss Reconciliation Return](007-loom-to-anchor-pre-phase2-suite-loss-reconciliation-return.trace.md)
  - Origin:
    - [relative](007-loom-to-anchor-pre-phase2-suite-loss-reconciliation-return.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-28 18:09:00
  - Authors: Anchor
  - Summary: Accept the two named pre-Phase-2 regression reconciliations as stale test expectations, independently classify the newly surfaced context-audit failure as an explicit-Workspace fixture gap, and keep Phase 2 gated behind a clean broad handoff baseline.
  - Status: accepted/local

---

# Anchor Pre-Phase-2 Two-Loss Acceptance And Context-Audit Classification

## Decision

- State: accepted
- Subject: pre-Phase-2 broad handoff-suite baseline after Loom's bounded two-loss reconciliation return
- Decision: accept Loom's exact reconciliation of `carrierProjection.test.mjs` and `coldConsumerEntrypoint.test.mjs` as test/fixture expectation corrections with no production semantic mutation. Independently classify the newly surfaced `contextAudit.test.mjs` line-29 failure as a stale fixture setup against the current recipient-v2 explicit Workspace target contract: the fixture prepares a Workspace id but does not create and declare an exact qualified `tiinex.workspace.v1` target, so v2 correctly blocks with `portable.handoff-v2.workspace-target.missing` before context-audit behavior is exercised. Authorize one narrow Loom reconciliation of that fixture and a broad handoff-suite rerun. Phase 2 remains withheld until that rerun establishes a trustworthy green baseline or returns the next bounded blocker.

## Basis

- Cold-start qualification of Loom's returned carrier passed the preferred routed-package path and qualified all five declared Required Context files from exact carried Workspace bytes.
- The exact carried Workspace archive matched its declared SHA-256 before materialization.
- Loom changed only `carrierProjection.test.mjs` and `coldConsumerEntrypoint.test.mjs`; the return explicitly reports no production source mutation.
- The accepted artifact-first Phase 1 next-subset and predecessor regressions remain qualified Required Context in the returned carrier.
- Anchor independently reproduced `node src/tooling/portable/handoff/contextAudit.test.mjs` and observed `blocked !== ready` at line 29.
- Anchor inspected the manufacture result before the failing assertion and observed `portable.handoff-v2.workspace-target.missing` for Workspace id `site` with `targetCount: 0`.
- The same current contract is already reflected in the reconciled carrier-projection fixture, which creates a qualified Workspace artifact and passes `workspaceTargetPath: 'workspace.workspace.md'` into deterministic input preparation.
- No evidence currently requires changing production carrier, context-audit, recipient-v2, lineage, or Workspace qualification semantics to reconcile this third loss.

## Consequences

- Treat the two originally disclosed broad-suite losses as accepted stale expectation debt, not Phase 1 production regressions.
- Route `contextAudit.test.mjs` back to Loom for fixture-only reconciliation against the explicit Workspace target contract.
- Loom should create and declare the smallest qualified Workspace target needed by the fixture, preserve the existing context-audit assertions and adversarial cases, and avoid production mutation unless the corrected fixture exposes a separately evidenced runtime defect.
- After the fixture correction, rerun the broad `src/tooling/portable/handoff/*.test.mjs` baseline far enough to establish whether it is green or identify the next exact blocker.
- Keep both accepted artifact-first Phase 1 regressions green throughout.
- Do not authorize compatibility-JSON omission, clean-carrier default transition, broader binary expansion, Viewer work, or unrelated legacy cleanup in this decision.

## Review Conditions

- Reopen this classification if a correctly qualified explicit Workspace target still produces a context-audit failure that points to current production semantics rather than fixture setup.
- Reopen Phase 1 acceptance if the broad rerun demonstrates an unrecognized regression caused by the accepted artifact-first subset.
- Phase 2 requires a separate Anchor decision after the broad baseline is demonstrably trustworthy; this decision is not that authorization.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Loom To Anchor — Pre-Phase-2 Handoff-Suite Loss Reconciliation Return](007-loom-to-anchor-pre-phase2-suite-loss-reconciliation-return.trace.md)
  - Value: qmOn-UPC9RBlMc8sQo3Zm95OPBFVkZEU7ODTQyUpULA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: hZRATe_3lsPHzg1_OObCJ_LuUEoCJj1h4wuQNjWQ_HE
