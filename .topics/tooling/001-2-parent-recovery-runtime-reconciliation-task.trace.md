# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-08-30 17:08:35
  - Trace: [Tooling Development Loop Efficiency Discovery](001-tooling-development-loop-efficiency-discovery.trace.md)
  - Origin:
    - [relative](001-tooling-development-loop-efficiency-discovery.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-30 23:20:00
  - Authors: Loom; Anchor
  - Why: Apply Axiom's Parent recovery correction to the portable runtime without rewriting historical published schema bindings or fabricating cross-repository locality.
  - Summary: Runtime and authoring reconciliation for truthful local relative Parent recovery and qualified version-stable external Parent recovery.
  - Status: completed/local

---

# Parent Recovery Runtime Reconciliation

## Objective

Make current Site/portable Tooling consume the corrected local Root Parent-Origin authority while preserving the distinction between directly recoverable local Parents and version-stable external Parents.

## Done Criteria

- The qualified local Root runtime projection carries the exact local Docs Root candidate and no longer models `relative` as universally required.
- Root validation rejects a Parent with no recovery locator and rejects duplicate recovery labels without requiring a particular locator label in source-neutral validation.
- Existing local authoring continues to emit exact `relative` recovery, with truthful publication evidence permitted as a supplement.
- Exact authoring can explicitly represent an `external-versioned` Parent with commit/version-qualified recovery and without fabricating `relative`.
- Handoff route conformance accepts a verified version-stable Parent recovery route without `relative`, while parent-target integrity still has to verify exact bytes.
- Recipient-v2 route qualification preserves explicit exact Required Context material bindings through transport even when the source Handoff intentionally omits optional `Material Reference`; transport binding must not force source-artifact mutation merely to satisfy package closure.
- Cross-repository Viewer recovery tests use an immutable Business commit ref rather than mutable `master`.
- The historical published schema-source binding remains byte-truthful and is not silently rewritten to the unpublished local Root candidate.

## Scope

- Site local Root runtime projection, Root readability validation, exact creation representation, portable exact-parent qualification, route conformance expectations, and cross-repository recovery tests.
- This Task does not claim the new Docs Root candidate is published; publication binding/repinning waits for a real Docs commit.
- This Task does not implement scoped-export Parent-boundary augmentation. The durable Business/Axiom rule requires that future bounded exporters close omitted ancestry through carried bytes, qualified version-stable recovery, scope expansion, or fail closed.
- This Task does not change Viewer product acceptance, Atlas, role inheritance, or unrelated validation orchestration.

## Dependencies

- Axiom local source candidate: `Tiinex/docs::.topics/.schemas/tiinex.root.v1.schema.md` plus `.topics/recovery/001-parent-origin-recovery-boundary-discovery.trace.md` in the carried Docs workspace.
- Business recovery/dimension intent: `Tiinex/business::.topics/decisions/001-business-lineage-structure-decision.trace.md` and `.topics/initiatives/001-2-2-portable-handoff-cold-start-ingress-task.trace.md` in the carried Business workspace.
- Focused receipts: `qualifiedLocalRoot.runtime.test.mjs`, `portable.runtimeValidationContractUnificationClosure.test.mjs`, `portable.exactAuthoringFidelityClosure.test.mjs`, `routeArtifactConformance.test.mjs`, `lineageSourceRecovery.test.mjs`, and `archiveCarrierV2.test.mjs` pass on the candidate source.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Tooling Development Loop Efficiency Discovery](001-tooling-development-loop-efficiency-discovery.trace.md)
  - Value: QRZ5v4Q_RZEZqLFEHIfc0HzUgqGugoaYIQFm0xUtgcY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: lk4fzC9ecLE-0pC8No4GEpqtmJx63DhsJyLpd29L60c
