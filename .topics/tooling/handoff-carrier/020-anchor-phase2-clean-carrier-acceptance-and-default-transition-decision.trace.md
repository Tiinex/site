# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 19:29:00
  - Trace: [Loom To Anchor — Phase 2 Clean-Carrier Qualification Return](019-loom-to-anchor-phase2-clean-carrier-qualification-return.trace.md)
  - Origin:
    - [relative](019-loom-to-anchor-phase2-clean-carrier-qualification-return.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-28 19:48:00
  - Authors: Anchor
  - Summary: Accept Loom's isolated Phase 2 clean-carrier qualification after independent 20-of-20 verification, preserve Phase 1/old-carrier compatibility, advance Major 006, and authorize one bounded transition making clean artifact-first recipient-v2 the ordinary new-manufacture default without broad legacy-reader deletion.
  - Status: accepted/local

---

# Anchor Phase 2 Clean-Carrier Acceptance And Default Transition

## Decision

- State: accepted
- Subject: isolated artifact-first recipient-v2 clean-carrier qualification, Major 006 checkpoint, and bounded ordinary-default transition
- Decision: accept Loom's `019-loom-to-anchor-phase2-clean-carrier-qualification-return.trace.md` as the qualified Phase 2 clean-carrier seam. The explicit clean profile proves that stored `tiinex-recipient-v2.transport.json` can be absent while route selection, Workspace/bootstrap/cache ownership, exact Required Context closure, participant Role grounding, roundtrip, orientation, and cold-start truth remain recoverable from visible Tiinex artifacts plus exact payload bytes. Historical and explicit Phase 1 compatibility behavior remains readable and fail-visible. Authorize Loom to make the clean artifact-first profile the ordinary default for newly manufactured recipient-v2 carriers through the smallest shared selection seam, while retaining bounded explicit producer/read compatibility for older or Phase 1 carriers.

## Independent Acceptance Basis

- Cold-start qualification of the returned `005-1` carrier passed the preferred routed-package path and qualified all twelve declared Required Context items from exact carried package bytes.
- The exact returned Site Workspace archive matched SHA-256 `f293c09aaa91c41b0719af65f281be63e361117abc86eea9f4faa36627917015`.
- Anchor independently ran all 20 deterministic `src/tooling/portable/handoff/*.test.mjs` files on the exact returned Workspace; all 20 passed. The run completed in approximately 25 seconds in this host, with `carrierProjection.test.mjs` accounting for most of the elapsed test time.
- Exact comparison against the controlling Major 005 Workspace shows five modified production modules, one added focused Phase 2 regression, and Loom's return Handoff only: `coldStartQualification.js`, `materialClosure.archiveV2.js`, `recipientV2.artifactFirstPhase1.js`, `recipientV2.artifacts.js`, `recipientV2.topology.js`, and `recipientV2.artifactFirstPhase2CleanCarrier.test.mjs`.
- The production delta is bounded to explicit clean-profile manufacture/inspection, visible profile declarations, compatibility omission qualification, and removal of the discovered participant-Role cold-start dependency on compatibility facts. No Docs schema, Business, Viewer, publication, unrelated package topology, or broad binary-payload semantics changed.
- The explicit clean profile remains opt-in in Loom's return. Ordinary manufacture has not yet been transitioned by this acceptance artifact.

## Phase 2 Accepted Boundary

- Clean-carrier authority is visible: `Carrier Profile: artifact-first-clean-carrier-phase2` and `Compatibility Transport: omitted-derived-non-authoritative` must qualify together.
- Mere absence of compatibility JSON is not authority and must not promote another carrier into clean mode.
- Clean carriers must fail visible if compatibility JSON is unexpectedly present or if required semantic artifacts/payload bytes are missing, ambiguous, or inconsistent.
- Explicit Phase 1 carriers remain allowed to carry one derived compatibility JSON projection; divergence from visible artifact/payload truth remains blocking and JSON remains non-authoritative.
- Participant Role grounding for clean carriers may use only already-qualified visible Role Pointer and exact payload-owner facts; holder identity is not inferred.
- Broader compatibility-reader deletion, historical package cleanup, canonical schema changes, Viewer work, unrelated source cleanup, and broad binary payload expansion remain outside this acceptance.

## Major Checkpoint

- Checkpoint Intent: independently accepted no-JSON artifact-first recipient-v2 receiver truth with the complete portable Handoff baseline green and historical Phase 1 compatibility preserved.
- Carrier Action: the next Anchor-to-Loom carrier should advance the progress major from `005` to `006`.
- Major Reason: `artifact-first-phase2-clean-carrier-qualified`.
- Boundary: Major numbering is a human recovery/progress projection only; this Decision plus the exact carried Workspace own the semantic acceptance.

## Default Transition Authorization

- Authorized: make the qualified clean artifact-first recipient-v2 profile the ordinary newly manufactured carrier path at the smallest shared producer/topology selection boundary.
- Authorized: retain an explicit bounded producer compatibility path for Phase 1/legacy carrier manufacture where current tests or deliberate compatibility use require it; old-carrier inspection/read compatibility must remain available.
- Authorized: add the minimum regression coverage proving ordinary/default manufacture now emits the clean profile with no stored compatibility JSON, while explicit Phase 1 manufacture still emits and validates its derived JSON companion.
- Authorized: prove an actual default-manufactured package can orient and qualify cold-start from the clean visible/payload truth without a hidden JSON dependency.
- Withheld: deleting broad compatibility readers, rewriting historical packages, changing canonical Docs schemas, changing unrelated package layout, Viewer integration, Business mutation, publication, or treating clean-mode qualification as authority for unrelated cleanup.
- Stop Condition: if making clean mode ordinary requires a semantic change beyond profile selection/producer compatibility, loses old-carrier readability, or exposes any receiver truth that still exists only in compatibility JSON, stop and return the exact blocker before mutation widens.

## Cross-Lane Coordination

- Axiom's separate Operating Overview semantic-composition return is accepted by Anchor at the schema boundary: maintained existing schemas are sufficient and no new Dashboard/Status/Initiative/Epic/Frontier schema is presently justified.
- That Business work remains open at the Tooling projection criterion. Do not mix Operating Overview implementation into this default-transition tranche.
- After the clean-carrier default transition reaches an accepted checkpoint, the Axiom-informed Operating Overview projection/discovery tranche becomes a preferred next independent Tooling slice.

## Review Conditions

- Reopen this acceptance if the default transition demonstrates that the clean profile depended on explicit test-only setup that ordinary manufacture cannot reproduce.
- Reopen participant Role acceptance if old-carrier compatibility or clean-carrier grounding produces different Role authority/holder semantics.
- Reopen the no-new-schema Operating Overview disposition only on a concrete maintained-schema representation gap, not UI convenience.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Loom To Anchor — Phase 2 Clean-Carrier Qualification Return](019-loom-to-anchor-phase2-clean-carrier-qualification-return.trace.md)
  - Value: dqoyjJ3-gfdYj3FDN4E6P5MKgRlGMAIHNjH9OrDjUy0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Kk2C2zFxcHu-ZfxqMr4A1j0bfNeLphqh4sCh5uWNdb0