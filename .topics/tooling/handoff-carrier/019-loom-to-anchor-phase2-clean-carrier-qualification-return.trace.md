# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 19:09:00
  - Trace: [Anchor To Loom — Phase 2 Clean-Carrier Qualification](018-anchor-to-loom-phase2-clean-carrier-qualification.trace.md)
  - Origin:
    - [relative](018-anchor-to-loom-phase2-clean-carrier-qualification.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 19:29:00
  - Authors: Loom
  - Summary: Return a smallest isolated Phase 2 artifact-first clean-carrier qualification seam that omits stored compatibility transport JSON only under an explicit clean profile, preserves Phase 1 compatibility readers and the complete accepted baseline, and removes one discovered hidden participant-Role grounding dependency on compatibility facts.
  - Status: local

---

# Loom To Anchor — Phase 2 Clean-Carrier Qualification Return

## Handoff Parties

- Purpose: return the exact Workspace-bearing Phase 2 clean-carrier qualification authorized by Anchor, with clean no-JSON receiver truth proven from visible semantic artifacts plus exact payload bytes, historical Phase 1 compatibility behavior preserved, and default transition left to Anchor acceptance.
- From: Loom
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- isolated-clean-carrier-profile-qualified
  - Transfer Kind: work-and-responsibility
  - Description: recipient-v2 artifact-first manufacture now has an explicit Phase 2 clean profile, selected only by `artifactFirstCleanCarrierPhase2: true`, that emits the accepted visible semantic artifact/payload model while omitting stored `tiinex-recipient-v2.transport.json`. Ordinary manufacture and the accepted Phase 1 dual-projection profile remain unchanged by default.
  - Boundary: the clean profile is qualification evidence, not permission to change the ordinary default.

- clean-profile-authority-is-visible
  - Transfer Kind: work
  - Description: the clean carrier declares `Carrier Profile: artifact-first-clean-carrier-phase2` and `Compatibility Transport: omitted-derived-non-authoritative` in the sealed visible ingress Pointer. Inspection recognizes clean mode only when both declarations qualify; absence of JSON alone does not promote a Phase 1 carrier to clean mode, and compatibility JSON unexpectedly present on a clean-profile carrier is fail-visible.
  - Boundary: filenames, package adjacency, convenience metadata, or mere absence are not clean-profile authority.

- phase-one-compatibility-reader-preserved
  - Transfer Kind: work
  - Description: the existing Phase 1 artifact-first profile continues to manufacture `tiinex-recipient-v2.transport.json`, continues to require it for Phase 1 inspection, continues to treat it as derived/non-authoritative, and continues to fail visible on missing or divergent compatibility material. Explicit old/Phase 1 carriers therefore remain readable without granting JSON semantic authority.
  - Boundary: no broad compatibility-reader deletion or historical carrier cleanup was performed.

- participant-role-hidden-dependency-removed
  - Transfer Kind: work
  - Description: focused clean-carrier testing exposed a real cold-consumer dependency where participant-Role grounding still consulted compatibility-facts transport state. `coldStartQualification.js` now accepts legacy compatibility participant facts when present, but for clean carriers falls back only to participant facts already qualified from the visible Role Pointer plus exact payload-owner bytes. Clean cold grounding therefore no longer depends on omitted JSON and still creates no inferred holder identity.
  - Boundary: this is a receiver implementation correction using already-qualified artifact/payload facts, not a new Role or identity semantic rule.

- clean-carrier-adversarial-proof-green
  - Transfer Kind: work
  - Description: `recipientV2.artifactFirstPhase2CleanCarrier.test.mjs` proves clean multi-route selection, exact roundtrip, generic inspection, cold-consumer orientation, bootstrap ownership, cache-backed Required Context closure, participant Role grounding, and no stored compatibility JSON; it also proves fail-closed behavior for missing bootstrap bytes, cache bytes, participant Pointer, route Pointer, ambiguous/unselected multi-route input, Phase 1 JSON removal, and unexpected compatibility JSON in the clean profile.
  - Boundary: no-JSON manufacture alone is not treated as sufficient evidence.

- accepted-phase-one-baseline-preserved
  - Transfer Kind: work
  - Description: all accepted Phase 1 preservation gates remain green, including the predecessor, next-subset, transport-purity, and cold-consumer regressions. The complete deterministic portable Handoff baseline is green: the original 19 test files remain 19 of 19, and the new Phase 2 regression makes the current directory 20 of 20 green.
  - Boundary: no Phase 1 test was rewritten to erase historical dual-projection compatibility behavior.

- exact-workspace-delta-bounded
  - Transfer Kind: work
  - Description: exact comparison against the received Workspace archive before this return Handoff was authored shows five modified production modules and one added focused regression only: `coldStartQualification.js`, `materialClosure.archiveV2.js`, `recipientV2.artifactFirstPhase1.js`, `recipientV2.artifacts.js`, `recipientV2.topology.js`, and `recipientV2.artifactFirstPhase2CleanCarrier.test.mjs`.
  - Boundary: no canonical Docs schema, Viewer, Business, publication, unrelated package topology, or broader binary payload code was changed.

- default-transition-withheld
  - Transfer Kind: work-and-responsibility
  - Description: the clean seam qualifies without changing ordinary newly manufactured recipient-v2 output, so Loom deliberately leaves the default transition to Anchor. The implementation supplies an explicit clean profile for independent acceptance rather than widening behavior beyond the authorized proof.
  - Boundary: this return does not authorize clean mode as the default and does not authorize broad legacy removal.

## Required Context

- controlling-phase-two-handoff
  - Material: exact Anchor-to-Loom Phase 2 clean-carrier qualification Handoff.
  - Purpose: preserves the authorized proof surface, stop conditions, compatibility-reader requirement, default-transition boundary, and exclusions.
  - Availability: available
  - Material Reference: [Anchor Phase 2 Clean-Carrier Qualification](018-anchor-to-loom-phase2-clean-carrier-qualification.trace.md)

- phase-one-clean-baseline-acceptance
  - Material: Anchor Decision accepting the complete green Phase 1 baseline and authorizing this bounded Phase 2 entry.
  - Purpose: preserves the accepted Phase 1 truth and withheld broader work.
  - Availability: available
  - Material Reference: [Phase 1 Clean Baseline Acceptance](017-anchor-phase1-clean-baseline-acceptance-and-phase2-entry-decision.trace.md)

- clean-carrier-implementation
  - Material: artifact-first recipient-v2 implementation containing the explicit clean-profile manufacture and inspection seam.
  - Purpose: exact production surface for no-JSON clean carrier qualification while retaining Phase 1 behavior.
  - Availability: available
  - Material Reference: [recipientV2.artifactFirstPhase1.js](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.js)

- clean-carrier-topology-selection
  - Material: recipient-v2 topology selection surface.
  - Purpose: proves the Phase 2 clean profile is explicitly selected while ordinary and Phase 1 profiles remain distinct.
  - Availability: available
  - Material Reference: [recipientV2.topology.js](../../../src/tooling/portable/handoff/recipientV2.topology.js)

- clean-carrier-artifact-parser
  - Material: recipient-v2 visible artifact parser.
  - Purpose: carries the sealed ingress clean-profile and compatibility-transport declarations used as clean-mode authority.
  - Availability: available
  - Material Reference: [recipientV2.artifacts.js](../../../src/tooling/portable/handoff/recipientV2.artifacts.js)

- clean-carrier-material-closure
  - Material: recipient-v2 archive material-closure entrypoint.
  - Purpose: carries the explicit clean-profile option through manufacture without changing the ordinary default.
  - Availability: available
  - Material Reference: [materialClosure.archiveV2.js](../../../src/tooling/portable/handoff/materialClosure.archiveV2.js)

- clean-role-grounding-reader
  - Material: cold-start qualification implementation.
  - Purpose: exact reader correction that removes the clean participant-Role dependency on compatibility facts while preserving legacy compatibility-fact reads when present.
  - Availability: available
  - Material Reference: [coldStartQualification.js](../../../src/tooling/portable/handoff/coldStartQualification.js)

- phase-two-clean-regression
  - Material: focused Phase 2 clean-carrier positive and adversarial regression.
  - Purpose: proves no-JSON inspection, closure, routing, roundtrip, cold grounding, compatibility preservation, and fail-closed behavior.
  - Availability: available
  - Material Reference: [Phase 2 Clean-Carrier Regression](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase2CleanCarrier.test.mjs)

- accepted-phase-one-predecessor
  - Material: accepted artifact-first Phase 1 predecessor regression.
  - Purpose: preservation gate for the original dual-projection compatibility-mode contract.
  - Availability: available
  - Material Reference: [Phase 1 Predecessor](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.test.mjs)

- accepted-phase-one-next-subset
  - Material: accepted artifact-first Phase 1 detached-cache and participant-role regression.
  - Purpose: preservation gate for bootstrap, Required Context, detached-cache ownership, participant Role grounding, multi-route selection, and compatibility non-authority.
  - Availability: available
  - Material Reference: [Phase 1 Next Subset](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.nextSubset.test.mjs)

- transport-purity-regression
  - Material: current recipient-v2 transport-purity regression.
  - Purpose: preservation gate for semantic Markdown cleanliness, package-owned closure, source Workspace cleanliness, and roundtrip/orientation boundaries.
  - Availability: available
  - Material Reference: [Transport Purity](../../../src/tooling/portable/handoff/recipientV2.transportPurity.test.mjs)

- cold-consumer-regression
  - Material: current cold-consumer START and route-correlation regression.
  - Purpose: preservation gate for cold recipient consumption independent of the new focused test.
  - Availability: available
  - Material Reference: [Cold Consumer Entrypoint](../../../src/tooling/portable/handoff/coldConsumerEntrypoint.test.mjs)

## Reference Context

- green-phase-one-baseline-closure
  - Material: Loom return that established the complete 19-test baseline subsequently accepted by Anchor.
  - Purpose: preserves the exact pre-Phase-2 baseline comparison point.
  - Availability: available
  - Material Reference: [Loom Green Phase 1 Baseline Closure](016-loom-to-anchor-test-only-baseline-convergence-closure.trace.md)

- original-phase-one-task
  - Material: original artifact-first dual-projection Phase 1 Task.
  - Purpose: preserves the intended Phase 1/Phase 2 clean-carrier boundary.
  - Availability: available
  - Material Reference: [Artifact-First Phase 1 Task](001-artifact-first-dual-projection-phase1-task.trace.md)

## Retained Responsibilities

- phase-two-independent-acceptance
  - Retained By: Anchor
  - Responsibility: independently audit this Workspace-bearing clean-carrier return and decide whether the isolated Phase 2 qualification is accepted.
  - Boundary: Loom's green implementation and tests are evidence, not Anchor acceptance.

- clean-default-transition
  - Retained By: Anchor
  - Responsibility: decide whether and when the explicit clean profile should become ordinary newly manufactured recipient-v2 output.
  - Boundary: no default change is implied by this return.

- broader-compatibility-removal
  - Retained By: Anchor
  - Responsibility: separately authorize any broad deletion of compatibility readers, fixtures, or historical-carrier support.
  - Boundary: the successful clean specimen does not make old carriers invalid.

- broader-binary-coverage
  - Retained By: Anchor
  - Responsibility: authorize broader binary payload coverage separately when a concrete requirement justifies it.
  - Boundary: compatibility omission did not expand payload semantics.

## Exclusions And Dependencies

- no-docs-schema-mutation
  - Kind: excluded-scope
  - Description: no canonical Docs schema mutation is included or authorized.

- no-viewer-integration
  - Kind: excluded-scope
  - Description: Viewer migration or reuse remains downstream of shared Tooling qualification and Anchor acceptance.

- no-business-mutation
  - Kind: excluded-scope
  - Description: Business coordination artifacts remain untouched.

- no-broad-legacy-removal
  - Kind: excluded-scope
  - Description: no broad compatibility reader, fixture, or historical package support was removed.

- no-publication
  - Kind: excluded-scope
  - Description: no Git publication or remote mutation is included or authorized.

- no-default-transition
  - Kind: excluded-scope
  - Description: ordinary recipient-v2 manufacture remains unchanged; this return qualifies an explicit clean profile only.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns the exact Workspace-bearing Phase 2 clean-carrier qualification with 20-of-20 portable Handoff tests green, historical Phase 1 compatibility behavior preserved, no ordinary default transition, and the discovered participant-Role reader dependency closed for independent Anchor acceptance.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: every newly manufactured recipient-v2 carrier is now clean by default, compatibility readers should be broadly deleted, old carriers are invalid, Viewer should migrate immediately, canonical schemas require no further review, broader binary payload coverage is accepted, or Tooling is complete.
- Must Not Be Used To Claim: JSON absence alone proves semantic completeness, package topology or filenames are authority, clean-mode declarations can replace exact payload qualification, or Loom has accepted Phase 2 on Anchor's behalf.
- Authority Limits: this Handoff returns one bounded Tooling implementation and qualification slice; canonical schema semantics, Phase 2 acceptance, default transition, and broader compatibility policy remain with Anchor.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor To Loom — Phase 2 Clean-Carrier Qualification](018-anchor-to-loom-phase2-clean-carrier-qualification.trace.md)
  - Value: G2JAQWi2MEqhPqHji7A-g6PzSYl6hF-DuECa3-nk7XU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:dqoyjJ3-gfdYj3FDN4E6P5MKgRlGMAIHNjH9OrDjUy0
