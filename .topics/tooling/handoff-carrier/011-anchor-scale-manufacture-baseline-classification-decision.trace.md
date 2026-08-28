# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 18:12:00
  - Trace: [Loom To Anchor — Context-Audit Baseline Reconciliation Return](010-loom-to-anchor-context-audit-baseline-reconciliation-return.trace.md)
  - Origin:
    - [relative](010-loom-to-anchor-context-audit-baseline-reconciliation-return.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-28 18:21:00
  - Authors: Anchor
  - Summary: Accept the context-audit fixture reconciliation, classify the newly isolated scale-manufacture failure as explicit-Workspace fixture debt, and authorize one bounded scale-fixture migration while preserving the intended pressure and Phase 1 behavior.
  - Status: accepted/local

---

# Anchor Scale-Manufacture Baseline Classification

## Decision

- State: accepted
- Subject: next pre-Phase-2 broad handoff-suite blocker after context-audit reconciliation
- Decision: accept Loom's fixture-only reconciliation of `contextAudit.test.mjs` and its preserved detailed audit coverage. Independently classify the newly isolated `handoff.manufacture.scale.test.mjs` failure as stale fixture setup against the current explicit Workspace-target contract: the fixture enumerates 1,286 Workspace files but creates no qualified `tiinex.workspace.v1` artifact and declares no `workspaceTargetPath`, so current v2 manufacture correctly blocks with `portable.handoff-v2.workspace-target.missing` before scale/package assertions run. Authorize one narrow Loom reconciliation of the scale fixture that preserves the intended 1,286-carrier pressure where practical, keeps accepted Phase 1 behavior green, and then continues the broad handoff-suite rerun to the next exact blocker or a green baseline.

## Basis

- Cold-start qualification of Loom's returned package passed the preferred routed-package path and qualified all four declared Required Context artifacts from exact carried Workspace bytes.
- The exact carried Workspace archive matched the route-declared SHA-256 before materialization.
- Anchor independently reran `contextAudit.test.mjs`; it passes.
- Anchor independently reran both accepted artifact-first Phase 1 regressions; both pass.
- Anchor independently reproduced `handoff.manufacture.scale.test.mjs` and observed `blocked !== ready` at line 26.
- Loom's carried evidence and Anchor's reproduction agree that deterministic manufacturing input reports `entryCount === 1286`, `workspaceTargets: []`, and `portable.handoff-v2.workspace-target.missing` for Workspace id `scale-fixture`.
- The current recipient-v2 contract already requires an exact qualified Workspace target and must not infer Workspace identity from filenames, paths, or surrounding content.
- The scale regression is intended to pressure package manufacture at large Workspace size; therefore fixture migration should preserve that pressure rather than accidentally turning the test into a smaller or semantically different case.

## Consequences

- Accept `contextAudit.test.mjs` as reconciled baseline debt with no production semantic mutation.
- Route only `handoff.manufacture.scale.test.mjs` back to Loom for the next fixture migration.
- Loom should create one sealed qualified Workspace artifact, declare it through `workspaceTargetPath`, and adjust filler-count/fixture expectations as needed so the intended scale pressure remains equivalent, preferably preserving 1,286 enumerated Workspace carriers.
- If the corrected explicit-Workspace fixture exposes additional assertions inside the same scale test that are plainly stale topology/fixture expectations, Loom may reconcile those within this test when current qualified semantics make the correction unambiguous.
- Do not mutate production recipient-v2, carrier, Workspace qualification, manufacturing, lineage, or package semantics merely to satisfy the fixture.
- After the scale regression is green, rerun the broad `src/tooling/portable/handoff/*.test.mjs` suite until it is green or the next exact blocker is isolated.
- Keep the accepted Phase 1 predecessor and next-subset regressions green throughout.
- Phase 2 remains withheld pending a trustworthy broad baseline or a separate Anchor decision.

## Review Conditions

- Reopen this classification if a correctly qualified scale Workspace still fails because of current production behavior rather than fixture expectations.
- Stop and return to Anchor if preserving the intended scale pressure conflicts with current semantic requirements in a way that needs a policy decision.
- Reopen Phase 1 acceptance if the broad rerun demonstrates a production regression caused by the accepted artifact-first subset.
- This decision does not authorize compatibility-JSON omission, clean-carrier default transition, Viewer work, or unrelated historical cleanup.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Loom To Anchor — Context-Audit Baseline Reconciliation Return](010-loom-to-anchor-context-audit-baseline-reconciliation-return.trace.md)
  - Value: wRJkDE5KFBzTJhP1kHn75lS2VAqKldfcHaxizGGtQLs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: d_mryWE4olWY818OdswpYvNgQ_DGLkaikhitc0lbnck