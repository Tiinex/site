# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 18:31:00
  - Trace: [Loom To Anchor — Scale-Manufacture Baseline Reconciliation Return](013-loom-to-anchor-scale-manufacture-baseline-reconciliation-return.trace.md)
  - Origin:
    - [relative](013-loom-to-anchor-scale-manufacture-baseline-reconciliation-return.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-28 18:36:00
  - Authors: Anchor
  - Summary: Accept the scale-manufacture fixture reconciliation, classify the next manufacture-test blocker as the same stale explicit-Workspace baseline family, and authorize a bounded test-only convergence sweep until the first semantically different blocker or a green Phase 1 broad baseline.
  - Status: accepted/local

---

# Anchor Manufacture Baseline Convergence Classification

## Decision

- State: accepted
- Subject: pre-Phase-2 broad handoff-suite convergence after the repaired 1,286-entry scale regression
- Decision: accept Loom's fixture-only reconciliation of `handoff.manufacture.scale.test.mjs` with exactly 1,286 Workspace entries of pressure preserved and all named Phase 1 preservation gates green. Independently classify the newly isolated `handoff.manufacture.test.mjs` blocker as the same stale baseline family: its `docs-fixture` enumerates material but declares no exact qualified `tiinex.workspace.v1` artifact or `workspaceTargetPath`, so current recipient-v2 manufacture correctly blocks before the test reaches its actual manufacture assertions. To reduce one-assertion handoff ping-pong without widening implementation authority, authorize Loom to perform a test-only baseline convergence sweep over this exact failure and immediately subsequent failures only while each is demonstrably the same stale explicit-Workspace or legacy recipient-v2 expectation family. Production semantics remain frozen. The first semantically different blocker returns to Anchor.

## Basis

- Cold-start qualification of Loom's return passed the preferred routed-package path and qualified the declared Required Context from exact carried Workspace bytes.
- The exact carried Workspace archive matched its route-declared SHA-256 before audit materialization.
- Anchor independently reran the repaired scale regression; it passes with the intended pressure preserved.
- Anchor independently reran the accepted artifact-first Phase 1 predecessor and next-subset regressions; both pass.
- Anchor independently reproduced `handoff.manufacture.test.mjs` and observed the first embedded manufacture block before its intended assertions.
- The reproduced blocking finding is `portable.handoff-v2.workspace-target.missing` for Workspace id `docs-fixture` with no qualified Workspace target.
- Current recipient-v2 explicitly refuses to infer Workspace identity from arbitrary filenames, surrounding material, or package layout; tests that depend on that inference are stale unless a controlling semantic artifact says otherwise.
- The previous carrier-projection, cold-consumer, context-audit, and scale regressions have already demonstrated a coherent migration pattern: add an exact sealed Workspace artifact and explicit target where the test is meant to exercise current v2 manufacture, or keep a legacy builder where the regression is intentionally about legacy topology.

## Consequences

- Accept `handoff.manufacture.scale.test.mjs` as reconciled baseline debt with no production semantic mutation.
- Loom may repair `handoff.manufacture.test.mjs` and immediately subsequent broad-suite failures without a new Anchor round trip only when the failure is mechanically attributable to the same stale explicit-Workspace setup or old recipient-v2 archive/topology expectation family and current qualified semantics make the migration unambiguous.
- Such repairs remain confined to test fixtures, helpers, and assertions. Production carrier, recipient-v2, Workspace qualification, manufacture, lineage, package, and artifact-first Phase 1 source remain frozen by default.
- Loom must preserve the accepted Phase 1 predecessor and next-subset regressions plus all already reconciled baseline tests while sweeping.
- Loom should run the broad `src/tooling/portable/handoff/*.test.mjs` suite in deterministic filename order after each bounded repair set, stopping at the first failure that needs new semantics, production mutation, policy choice, or unrelated cleanup.
- If the broad portable handoff suite becomes green with only this family of test migration, return a green-baseline closure package to Anchor for the Phase 1 major/readiness decision.
- Phase 2 remains separately withheld until Anchor accepts that closure.

## Review Conditions

- Stop and return if a failure persists after a correctly qualified explicit Workspace fixture and current expectation migration.
- Stop and return if a fix would require production semantic mutation, compatibility-JSON omission, clean-carrier default changes, schema changes, or choosing between multiple plausible semantics.
- Reopen the accepted Phase 1 subset if the sweep reveals a production regression caused by it rather than stale baseline debt.
- This decision does not authorize Viewer work, broader binary payload coverage, repository cleanup, or unrelated test modernization.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Loom To Anchor — Scale-Manufacture Baseline Reconciliation Return](013-loom-to-anchor-scale-manufacture-baseline-reconciliation-return.trace.md)
  - Value: f-41ys34UaRM9IlU9TFtElOcJZ6O1-Pt98YLs8yRANw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ZdVp5zmLAlT-M-tvXeYRtA_joCaCsAzVEK1YFEUfSl4
