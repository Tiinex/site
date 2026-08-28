# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-28 18:09:00
  - Trace: [Anchor Pre-Phase-2 Two-Loss Acceptance And Context-Audit Classification](008-anchor-pre-phase2-two-loss-acceptance-and-context-audit-classification-decision.trace.md)
  - Origin:
    - [relative](008-anchor-pre-phase2-two-loss-acceptance-and-context-audit-classification-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 18:10:00
  - Authors: Anchor
  - Summary: Transfer one fixture-only context-audit baseline reconciliation to Loom, preserve accepted Phase 1 behavior, and require a broad handoff-suite rerun before any Phase 2 authorization.

---

# Anchor To Loom — Context-Audit Baseline Reconciliation

## Handoff Parties

- Purpose: reconcile the exact `contextAudit.test.mjs` baseline blocker as an explicit Workspace-target fixture migration, then rerun the broad portable handoff suite to establish a trustworthy pre-Phase-2 baseline without changing production semantics by assumption.
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- context-audit-fixture-reconciliation
  - Transfer Kind: work-and-responsibility
  - Description: update `src/tooling/portable/handoff/contextAudit.test.mjs` so its synthetic `site` Workspace creates and declares an exact qualified `tiinex.workspace.v1` target and passes that target into deterministic Handoff manufacturing input. Preserve the existing context-audit coverage, duplicate-byte visibility, minimal/full comparison, detached-material assertions, adversarial pressure, and CLI roundtrip behavior.

- no-production-mutation-by-default
  - Transfer Kind: work
  - Description: the currently reproduced failure is classified as fixture setup debt because manufacture blocks with `portable.handoff-v2.workspace-target.missing` before context-audit behavior executes. Do not change production carrier/context-audit/recipient-v2 semantics merely to satisfy the stale fixture. If a corrected explicit Workspace fixture exposes a production defect, stop and return that exact blocker unless current qualified semantics make the minimal repair unambiguous.

- phase-one-preservation-gate
  - Transfer Kind: work
  - Description: preserve both accepted artifact-first Phase 1 regressions and the already reconciled carrier-projection/cold-consumer expectations while correcting the context-audit fixture.

- broad-baseline-rerun
  - Transfer Kind: work-and-responsibility
  - Description: after the fixture correction, run the broad `src/tooling/portable/handoff/*.test.mjs` baseline far enough to establish a green suite or identify the next exact failing test and symptom. Return the result to Anchor; do not expand into unrelated cleanup automatically.

- phase-two-readiness-evidence
  - Transfer Kind: work
  - Description: return evidence sufficient for Anchor to decide whether a separate Phase 2 compatibility-JSON omission/default-transition tranche may finally be authorized. This Handoff does not authorize Phase 2 implementation itself.

## Required Context

- anchor-context-audit-classification
  - Material: Anchor Decision accepting the two prior stale-expectation reconciliations and classifying the current context-audit failure.
  - Purpose: controls this fixture-only reconciliation and the continued Phase 2 gate.
  - Availability: available
  - Material Reference: [Anchor Classification Decision](008-anchor-pre-phase2-two-loss-acceptance-and-context-audit-classification-decision.trace.md)

- loom-two-loss-return
  - Material: exact Loom return for the two originally disclosed broad-suite losses.
  - Purpose: preserves the prior reconciliation evidence, no-production-mutation boundary, and newly surfaced baseline blocker.
  - Availability: available
  - Material Reference: [Loom Two-Loss Return](007-loom-to-anchor-pre-phase2-suite-loss-reconciliation-return.trace.md)

- context-audit-regression
  - Material: exact current context-audit regression.
  - Purpose: the only newly authorized fixture mutation target.
  - Availability: available
  - Material Reference: [contextAudit.test.mjs](../../../src/tooling/portable/handoff/contextAudit.test.mjs)

- explicit-workspace-fixture-reference
  - Material: reconciled carrier-projection regression demonstrating the current explicit Workspace-target fixture pattern.
  - Purpose: comparison evidence for the smallest authority-preserving fixture migration.
  - Availability: available
  - Material Reference: [carrierProjection.test.mjs](../../../src/tooling/portable/handoff/carrierProjection.test.mjs)

- accepted-phase-one-next-subset-regression
  - Material: accepted artifact-first Phase 1 detached-cache and participant-role focused regression.
  - Purpose: non-regression gate.
  - Availability: available
  - Material Reference: [Phase 1 next-subset test](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.nextSubset.test.mjs)

- accepted-phase-one-predecessor-regression
  - Material: accepted artifact-first Phase 1 predecessor regression.
  - Purpose: non-regression gate.
  - Availability: available
  - Material Reference: [Phase 1 predecessor test](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.test.mjs)

## Reference Context

- prior-anchor-reconciliation-handoff
  - Material: previous Anchor-to-Loom two-loss reconciliation Handoff.
  - Purpose: preserves the narrow pre-Phase-2 baseline policy and no-unbounded-cleanup boundary.
  - Availability: available
  - Material Reference: [Prior Anchor Handoff](006-anchor-to-loom-pre-phase2-suite-loss-reconciliation.trace.md)

- phase-one-acceptance
  - Material: accepted Anchor Phase 1 Decision.
  - Purpose: preserves the implementation subset that must remain green.
  - Availability: available
  - Material Reference: [Phase 1 Acceptance](005-anchor-artifact-first-phase1-cache-role-acceptance-decision.trace.md)

## Retained Responsibilities

- phase-two-authorization
  - Retained By: Anchor
  - Responsibility: review the broad-suite rerun and decide separately whether Phase 2 may begin.

- broader-baseline-debt-routing
  - Retained By: Anchor
  - Responsibility: classify any newly surfaced failure before authorizing additional cleanup or implementation work.

## Exclusions And Dependencies

- no-phase-two-implementation
  - Kind: excluded-scope
  - Description: do not omit compatibility JSON, change clean-carrier defaults, or implement other Phase 2 behavior in this tranche.

- no-production-change-without-new-evidence
  - Kind: excluded-scope
  - Description: do not mutate production Handoff, recipient-v2, context-audit, lineage, Workspace, or carrier semantics merely to make the fixture green.

- no-unbounded-suite-cleanup
  - Kind: excluded-scope
  - Description: if the broad rerun surfaces another loss, report it precisely rather than treating this Handoff as permission to fix the entire historical suite.

- no-viewer-docs-or-remote-mutation
  - Kind: excluded-scope
  - Description: Viewer work, canonical Docs changes, repository publication, and unrelated Tooling work remain excluded.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns an exact Workspace-bearing package after `contextAudit.test.mjs` is reconciled to the explicit Workspace-target contract and the broad portable handoff suite is either green or stopped at one newly identified exact blocker, with both accepted Phase 1 regressions still passing.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the context-audit fixture correction authorizes production semantic changes, the broad suite must be forced green, Phase 2 is approved, or every legacy test expectation is stale.
- Must Not Be Used To Claim: compatibility JSON may be omitted, clean-carrier defaults may change, or unrelated failures may be repaired without a new bounded disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor Pre-Phase-2 Two-Loss Acceptance And Context-Audit Classification](008-anchor-pre-phase2-two-loss-acceptance-and-context-audit-classification-decision.trace.md)
  - Value: hZRATe_3lsPHzg1_OObCJ_LuUEoCJj1h4wuQNjWQ_HE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: NFLTj1tFH_6eJVEZ49lGOsc6n9GJEGJeMJuHuktGXx8
