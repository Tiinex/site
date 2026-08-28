# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 19:49:00
  - Trace: [Anchor To Loom — Phase 2 Default Clean-Carrier Transition](021-anchor-to-loom-phase2-default-clean-carrier-transition.trace.md)
  - Origin:
    - [relative](021-anchor-to-loom-phase2-default-clean-carrier-transition.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 20:08:00
  - Authors: Loom
  - Summary: Return the bounded Phase 2 default clean-carrier transition after making ordinary recipient-v2 manufacture clean by default, preserving an explicit legacy compatibility producer/read path, proving a real no-JSON default CLI package cold-start, and keeping the full 20-test portable Handoff baseline green.
  - Status: local

---

# Loom To Anchor — Phase 2 Default Clean-Carrier Transition Return

## Handoff Parties

- Purpose: return the completed bounded recipient-v2 default clean-carrier transition to Anchor for independent acceptance while preserving explicit legacy compatibility production/readability and withholding unrelated cleanup.
- From: Loom
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- default-clean-producer-implementation
  - Transfer Kind: work-and-responsibility
  - Description: ordinary newly manufactured recipient-v2 carriers now select the qualified artifact-first clean Phase 2 profile by default, with visible semantic artifacts and exact payload bytes carrying receiver truth and no stored tiinex-recipient-v2.transport.json required in the ordinary output.
  - Boundary: JSON absence is not authority; clean qualification still depends on the sealed visible clean-profile declaration plus qualified semantic artifacts and exact payload ownership.

- explicit-legacy-compatibility-preservation
  - Transfer Kind: work
  - Description: an explicit legacy recipient-v2 compatibility producer path remains available for historical Phase 1/compatibility manufacture, and existing compatibility readers remain able to consume previously produced carriers.
  - Boundary: compatibility JSON remains derived and non-authoritative; this tranche does not delete old-carrier readers or historical support.

- default-cli-package-cold-start-proof
  - Transfer Kind: work
  - Description: the ordinary CLI manufacture path, without any clean-profile opt-in flag, writes a real ZIP that reloads successfully, contains no stored compatibility JSON, orients successfully, and passes one-shot cold-start qualification through the package-local route pointer from visible artifacts and payload bytes.
  - Boundary: this proof is package-level and recipient-facing; it does not infer any new Handoff or Role semantics.

- cli-and-zip-output-boundary-correction
  - Transfer Kind: work
  - Description: bind the existing selected route into manufacture before recipient-v2 topology construction and allow the ZIP writer to validate already-qualified artifact-first clean inspection rather than assuming the historical compatibility bundle shape.
  - Boundary: no route semantics were invented and no package filename/path was promoted to authority.

- historical-compatibility-regression-preservation
  - Transfer Kind: work
  - Description: historical tests whose assertions intentionally describe pre-transition carrier topology now opt into the explicit legacy compatibility producer path, while the focused Phase 2 regression proves the new ordinary default.
  - Boundary: historical Phase 1 tests were not rewritten to claim the new default; they remain compatibility evidence.

- complete-portable-handoff-baseline-result
  - Transfer Kind: work
  - Description: the complete src/tooling/portable/handoff test directory is green at 20 of 20 files after the transition, including both accepted Phase 1 regressions, transport purity, the focused Phase 2 clean-carrier test, and the real CLI ZIP cold-start proof.
  - Boundary: this is regression evidence for the bounded transition, not release readiness or authorization for broader cleanup.

## Required Context

- controlling-default-transition-handoff
  - Material: exact Anchor-to-Loom Phase 2 default clean-carrier transition Handoff.
  - Material Reference: [Anchor Default Transition](021-anchor-to-loom-phase2-default-clean-carrier-transition.trace.md)
  - Purpose: preserves the authorized default transition, compatibility requirements, real-package proof requirement, stop conditions, and exclusions.
  - Availability: available

- default-topology-selection
  - Material: recipient-v2 topology selection implementation after the default transition.
  - Material Reference: [recipientV2.topology.js](../../../src/tooling/portable/handoff/recipientV2.topology.js)
  - Purpose: exact production seam where ordinary selection now resolves to the clean profile and explicit compatibility selection remains available.
  - Availability: available

- archive-material-closure
  - Material: archive-backed recipient-v2 manufacture projection after the default transition.
  - Material Reference: [materialClosure.archiveV2.js](../../../src/tooling/portable/handoff/materialClosure.archiveV2.js)
  - Purpose: preserves the default clean selection through ordinary package manufacture while accepting the explicit legacy compatibility producer option.
  - Availability: available

- cli-manufacture-adapter
  - Material: portable Handoff manufacture CLI adapter.
  - Material Reference: [cli.handoff-manufacture.js](../../../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js)
  - Purpose: binds the selected route before topology construction and exposes the explicit legacy compatibility producer switch.
  - Availability: available

- recipient-v2-zip-writer
  - Material: recipient-v2 ZIP output writer.
  - Material Reference: [recipientV2.zip.js](../../../src/tooling/portable/output/recipientV2.zip.js)
  - Purpose: exact output-boundary correction that accepts qualified clean artifact-first bundles without requiring historical compatibility JSON shape.
  - Availability: available

- phase-two-default-clean-regression
  - Material: focused Phase 2 default clean-carrier regression.
  - Material Reference: [Phase 2 Default Clean Regression](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase2CleanCarrier.test.mjs)
  - Purpose: proves ordinary default manufacture is clean, real CLI ZIP output has no compatibility JSON, cold-start qualifies, explicit legacy compatibility remains readable, and adversarial removal still fails closed.
  - Availability: available

- accepted-phase-one-dual-projection-regression
  - Material: accepted Phase 1 dual-projection regression.
  - Material Reference: [Phase 1 Dual Projection](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.test.mjs)
  - Purpose: preservation evidence for explicit compatibility-mode behavior after the default transition.
  - Availability: available

- accepted-phase-one-next-subset-regression
  - Material: accepted Phase 1 detached-cache and participant Role regression.
  - Material Reference: [Phase 1 Next Subset](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.nextSubset.test.mjs)
  - Purpose: preservation evidence for cache-backed Required Context, participant Role grounding, bootstrap ownership, and compatibility non-authority.
  - Availability: available

## Reference Context

- phase-two-clean-profile-qualification-return
  - Material: prior Loom clean-profile qualification return accepted as the basis for the default transition.
  - Material Reference: [Phase 2 Clean Profile Return](019-loom-to-anchor-phase2-clean-carrier-qualification-return.trace.md)
  - Purpose: comparison point showing the previously opt-in clean profile before this ordinary-default transition.
  - Availability: available

- complete-portable-handoff-tests
  - Material: deterministic portable Handoff regression directory.
  - Material Reference: [Portable Handoff Tests](../../../src/tooling/portable/handoff/)
  - Purpose: broad regression surface used to verify 20-of-20 green after the transition.
  - Availability: available

## Retained Responsibilities

- default-transition-independent-acceptance
  - Retained By: Anchor
  - Responsibility: independently inspect the returned Workspace, rerun the complete portable Handoff baseline, and decide whether the ordinary clean-carrier default transition is accepted.
  - Boundary: Loom's successful implementation and tests are evidence, not Anchor acceptance.

- broader-compatibility-reader-removal
  - Retained By: Anchor
  - Responsibility: separately authorize any deletion of compatibility readers, fixtures, historical producer paths, or old-carrier support.
  - Boundary: default clean output does not make old packages invalid or obsolete.

- operating-overview-next-routing
  - Retained By: Anchor
  - Responsibility: route the separately retained Operating Overview projection/discovery tranche after this recipient-v2 transition reaches an accepted checkpoint.
  - Boundary: no Operating Overview semantic work is included in this return.

## Exclusions And Dependencies

- no-schema-mutation
  - Kind: excluded-scope
  - Description: no canonical Docs schema mutation was required or performed.

- no-role-semantic-expansion
  - Kind: excluded-scope
  - Description: no Handoff or Role meaning, holder identity, participant identity, or collaboration-capacity rule was added or inferred.

- no-broad-legacy-removal
  - Kind: excluded-scope
  - Description: compatibility readers, explicit legacy producer support, and historical-carrier readability remain present.

- no-viewer-or-business-mutation
  - Kind: excluded-scope
  - Description: Viewer and Business surfaces were not changed.

- no-publication
  - Kind: excluded-scope
  - Description: no Git publication, release action, or remote mutation is included or authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: one exact Workspace-bearing Loom-to-Anchor return in which ordinary recipient-v2 manufacture is clean by default, explicit legacy compatibility production/readability remains available, a real ordinary CLI package has no stored compatibility JSON and passes orientation plus preferred cold-start qualification, and all 20 portable Handoff tests are green.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: broad compatibility cleanup is accepted, old carriers are obsolete, canonical schemas changed, Viewer or Business should migrate, Operating Overview work is complete, release readiness exists, or Anchor has accepted the default transition.
- Must Not Be Used To Claim: JSON absence alone proves semantic completeness, filenames or package topology are authority, clean output changes Handoff/Role semantics, compatibility readers may be removed without separate authorization, or Loom has accepted the transition on Anchor's behalf.
- Authority Limits: this Handoff returns one bounded Tooling implementation and qualification tranche; independent acceptance, broader compatibility policy, later semantic projection work, and publication remain with Anchor.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor To Loom — Phase 2 Default Clean-Carrier Transition](021-anchor-to-loom-phase2-default-clean-carrier-transition.trace.md)
  - Value: bL6_3L7mnh9qAVyp3DJqOPNFjB09WlZlevSedhT5RQA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:gBkwR3w4MzjQckSc1nDd3w7SH8MbG86GAGqDiYsZOrA