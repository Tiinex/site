# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-28 19:48:00
  - Trace: [Anchor Phase 2 Clean-Carrier Acceptance And Default Transition](020-anchor-phase2-clean-carrier-acceptance-and-default-transition-decision.trace.md)
  - Origin:
    - [relative](020-anchor-phase2-clean-carrier-acceptance-and-default-transition-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 19:49:00
  - Authors: Anchor
  - Summary: Transfer one bounded recipient-v2 default-transition tranche to Loom after independent acceptance of the clean no-JSON profile, preserving explicit Phase 1/old-carrier compatibility and requiring real default-manufacture cold-start proof before broader cleanup.
  - Status: local

---

# Anchor To Loom — Phase 2 Default Clean-Carrier Transition

## Handoff Parties

- Purpose: make the already-qualified artifact-first clean-carrier profile the ordinary default for newly manufactured recipient-v2 carriers without losing explicit Phase 1/legacy producer/read compatibility or widening into unrelated cleanup.
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- default-clean-carrier-transition
  - Transfer Kind: work-and-responsibility
  - Description: change the smallest shared recipient-v2 producer/topology selection seam so ordinary newly manufactured carriers use the qualified `artifact-first-clean-carrier-phase2` profile and omit stored `tiinex-recipient-v2.transport.json` by default.
  - Boundary: do not implement the transition by treating absence of JSON as authority; the visible clean-profile declarations and qualified payload/artifact truth remain required.

- explicit-compatibility-producer-preservation
  - Transfer Kind: work
  - Description: retain a bounded explicit producer path for Phase 1/legacy compatibility manufacture where deliberate compatibility use or preserved tests require it, and preserve inspection/read support for already-produced Phase 1/old carriers.
  - Boundary: compatibility JSON remains derived/non-authoritative and divergence from visible semantic truth must remain fail-visible.

- actual-default-package-proof
  - Transfer Kind: work
  - Description: manufacture at least one package through the ordinary/default path with no clean-profile opt-in flag, prove it visibly declares the clean profile, carries no stored compatibility JSON, roundtrips, orients, and passes cold-start qualification from exact visible/payload truth.
  - Boundary: a unit-level topology selection assertion alone is insufficient evidence for the default transition.

- phase-one-and-phase-two-preservation
  - Transfer Kind: work
  - Description: keep all 20 currently green portable Handoff test files green, preserve the accepted Phase 1 compatibility regressions, and add only the minimum regression needed to distinguish ordinary clean default from explicit compatibility manufacture.
  - Boundary: do not rewrite historical Phase 1 tests to make them describe the new default; they remain explicit compatibility evidence.

- participant-role-grounding-preservation
  - Transfer Kind: work
  - Description: preserve the accepted clean-carrier participant Role grounding path that uses already-qualified visible Role Pointer and exact payload-owner facts, while allowing old-carrier compatibility facts only where they already qualify.
  - Boundary: no holder identity, transport identity, or new Role semantic rule may be inferred.

- stop-on-semantic-expansion
  - Transfer Kind: responsibility
  - Description: if making clean mode ordinary requires a schema change, changes Handoff/Role meaning, removes old-carrier readability, or reveals receiver truth still available only through compatibility JSON, stop and return the exact blocker to Anchor.
  - Boundary: broad compatibility-reader deletion, historical package cleanup, Viewer work, Business work, publication, and unrelated package modernization are not authorized.

## Required Context

- phase-two-anchor-acceptance
  - Material: Anchor acceptance Decision for the isolated clean profile and default-transition authorization.
  - Purpose: controls the accepted evidence, Major 006 intent, authorized transition, withheld cleanup, and stop conditions.
  - Availability: available
  - Material Reference: [Phase 2 Clean-Carrier Acceptance](020-anchor-phase2-clean-carrier-acceptance-and-default-transition-decision.trace.md)

- phase-two-loom-return
  - Material: Loom Phase 2 clean-carrier qualification return.
  - Purpose: exact implementation/result boundary accepted by Anchor.
  - Availability: available
  - Material Reference: [Loom Phase 2 Return](019-loom-to-anchor-phase2-clean-carrier-qualification-return.trace.md)

- clean-carrier-implementation
  - Material: artifact-first recipient-v2 clean/Phase 1 implementation seam.
  - Purpose: current clean-profile build and inspection behavior.
  - Availability: available
  - Material Reference: [recipientV2.artifactFirstPhase1.js](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.js)

- topology-selection
  - Material: recipient-v2 topology selection seam.
  - Purpose: likely smallest default-selection owner; inspect before widening.
  - Availability: available
  - Material Reference: [recipientV2.topology.js](../../../src/tooling/portable/handoff/recipientV2.topology.js)

- material-closure
  - Material: archive-backed manufacture projection seam.
  - Purpose: preserve clean/default selection through ordinary package manufacture.
  - Availability: available
  - Material Reference: [materialClosure.archiveV2.js](../../../src/tooling/portable/handoff/materialClosure.archiveV2.js)

- cold-start-reader
  - Material: cold-start qualification implementation.
  - Purpose: preserve clean participant Role grounding and old-carrier compatibility.
  - Availability: available
  - Material Reference: [coldStartQualification.js](../../../src/tooling/portable/handoff/coldStartQualification.js)

- clean-phase-two-regression
  - Material: focused Phase 2 clean-carrier regression.
  - Purpose: preserve no-JSON positive/adversarial qualification evidence.
  - Availability: available
  - Material Reference: [recipientV2.artifactFirstPhase2CleanCarrier.test.mjs](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase2CleanCarrier.test.mjs)

- explicit-phase-one-regression
  - Material: accepted Phase 1 dual-projection regression.
  - Purpose: preserve explicit compatibility manufacture/read semantics after default transition.
  - Availability: available
  - Material Reference: [recipientV2.artifactFirstPhase1.test.mjs](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.test.mjs)

- phase-one-next-subset-regression
  - Material: accepted Phase 1 detached-cache/participant Role regression.
  - Purpose: preserve the receiver truth subset exercised before Phase 2.
  - Availability: available
  - Material Reference: [recipientV2.artifactFirstPhase1.nextSubset.test.mjs](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.nextSubset.test.mjs)

## Reference Context

- complete-portable-handoff-baseline
  - Material: deterministic portable Handoff regression directory.
  - Purpose: supporting broad regression surface for detecting unrelated recipient-v2 regressions after the bounded default transition.
  - Availability: available
  - Material Reference: [Portable Handoff tests](../../../src/tooling/portable/handoff/)

## Retained Responsibilities

- default-transition-acceptance
  - Retained By: Anchor
  - Responsibility: independently inspect the returned default transition, rerun the full portable Handoff baseline, and decide whether ordinary new manufacture may be considered clean-carrier accepted.
  - Boundary: Loom implementation completion does not self-accept the default transition.

- operating-overview-next-routing
  - Retained By: Anchor
  - Responsibility: after this default-transition tranche reaches an accepted checkpoint, route the Axiom-accepted Operating Overview projection/discovery work as a separate Tooling/Business tranche.
  - Boundary: do not mix that semantic projection work into this recipient-v2 transition.

## Exclusions And Dependencies

- no-broad-reader-removal
  - Kind: excluded-scope
  - Description: compatibility-reader deletion and historical carrier cleanup remain later work even if ordinary new manufacture becomes clean.

- no-viewer-or-business-mutation
  - Kind: excluded-scope
  - Description: Viewer and Business surfaces are not part of this Site default-transition implementation.

- no-schema-change
  - Kind: excluded-scope
  - Description: no canonical Docs schema mutation is authorized; stop if a semantic gap appears.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns an exact Workspace-bearing package showing ordinary/default new manufacture now selects the clean artifact-first no-JSON profile, explicit Phase 1/legacy compatibility remains available and non-authoritative, a real default-manufactured carrier passes orientation/cold-start qualification, and the full portable Handoff baseline remains green.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: broad legacy removal, release readiness, Viewer readiness, publication, canonical schema changes, or completion of the Operating Overview Tooling criterion.
- Must Not Be Used To Claim: that clean-carrier default output changes Handoff/Role semantics, that old packages are obsolete, or that compatibility JSON was ever semantic authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor Phase 2 Clean-Carrier Acceptance And Default Transition](020-anchor-phase2-clean-carrier-acceptance-and-default-transition-decision.trace.md)
  - Value: Kk2C2zFxcHu-ZfxqMr4A1j0bfNeLphqh4sCh5uWNdb0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: bL6_3L7mnh9qAVyp3DJqOPNFjB09WlZlevSedhT5RQA