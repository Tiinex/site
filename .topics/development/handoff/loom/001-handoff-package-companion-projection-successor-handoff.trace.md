# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 02:06:00
  - Trace: [Handoff package companion transport projection](../../architect/continuity/001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
  - Origin:
    - [relative](../../architect/continuity/001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/85cf6c36e554a7b7fc420b51d45a71a36e23d0c7/.topics/development/architect/continuity/001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 08:56:00
  - Authors: Anchor
  - Why: Fresh-recipient transport dogfood exposed two opposite failures: bespoke carrier prose duplicated operational semantics outside the package, while over-minimal package-only or carrier-relative routing forced the recipient to guess the controlling workspace/leaf or understand disposable package topology. The accepted companion and workspace/artifact routing decisions now bound one shared-Tooling leaf that can advance the architecture and pressure-test Loom successor grounding without making Q the technical intermediary.
  - Summary: Handoff to Loom to implement and qualify the shared non-authoritative Handoff transport-package companion/projection seam, including explicit workspace plus workspace-relative controlling-artifact routing.
  - Status: draft/local

---

# Handoff package companion projection successor handoff

## Handoff Parties

- Purpose: implement the shared portable Handoff transport companion/projection needed for minimal human carriage and use the bounded work as a fresh Loom successor qualification candidate
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- handoff-package-companion-projection
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify one shared non-authoritative projection over the existing recipient-relative Handoff transport package/closure truth that emits a stable language-neutral carrier action model, recipient entrypoint, participation orientation, blockers, localization keys/parameters, and progressive-disclosure data without duplicating or redefining semantic Handoff authority
  - Controlling Artifact: [Handoff package companion transport projection](../../architect/continuity/001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
  - Boundary: Loom owns portable companion/projection mechanics and machine evidence only; it does not own canonical Handoff/Role semantics, Viewer product integration, Q acceptance, or Anchor successor qualification

## Required Context

- controlling-decision
  - Material: accepted architecture boundary and transport projection contract
  - Material Reference: [Handoff package companion transport projection](../../architect/continuity/001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
  - Purpose: exact objective, authority limits, transport projection fields, presentation principles, and dogfood failure being corrected
  - Availability: available

- transport-routing-decision
  - Material: accepted minimal host routing boundary derived from fresh-recipient transport dogfood
  - Material Reference: [Handoff transport workspace and artifact routing](../../architect/continuity/001-9-3-handoff-transport-workspace-artifact-routing-decision.trace.md)
  - Purpose: requires explicit workspace identity plus exact workspace-relative controlling artifact, rejects package-only leaf discovery and carrier-relative path leakage, and keeps work interpretation out of transport prose
  - Availability: available

- loom-predecessor-role
  - Material: durable predecessor Tooling Role semantics currently mapped to Loom
  - Material Reference: [Tooling Role](../../tooling/continuity/001-tooling-role.trace.md)
  - Purpose: recover Loom's portable/local-first implementation lane, provenance discipline, ambiguity behavior, and authority boundaries without depending on the predecessor conversation
  - Availability: available

- role-identity-transition
  - Material: current Role family identity and peer/no-hierarchy decision
  - Material Reference: [Role family identity transition decision](../../architect/continuity/001-8-1-role-family-identity-transition-decision.trace.md)
  - Purpose: establishes Tooling -> Loom semantic predecessor mapping and prevents the new label from importing unstated authority
  - Availability: available

- successor-migration-task
  - Material: fresh-role conversation migration and qualification-once planning
  - Material Reference: [Role successor conversation migration](../../architect/continuity/001-11-role-successor-conversation-migration.trace.md)
  - Purpose: defines what evidence Anchor needs before the predecessor Loom/Tooling conversation can cease to be an operational dependency
  - Availability: available

- current-site-source
  - Material: current `Tiinex/site` workspace at the recipient's actual start point, based on published `refactor` source plus the explicitly local Handoff/routing-decision overlay carried by this package
  - Purpose: implementation, tests, package contracts, schema companions, i18n surfaces, and durable artifacts must be read from current workspace material rather than reconstructed from transport prose
  - Availability: available

## Reference Context

- recipient-relative-package-owner
  - Material: `src/tooling/portable/handoff/materialClosure.package.js`
  - Purpose: existing shared recipient-relative Handoff transport-package builder and roundtrip owner
  - Availability: available

- closure-descriptor-owner
  - Material: `src/tooling/portable/handoff/materialClosure.descriptor.js`
  - Purpose: existing disposable transport-control boundary and package/Handoff/workspace/material truth projection
  - Availability: available

- site-handoff-export-delegation
  - Material: `src/export/handoff.plan.js`
  - Purpose: existing Site-facing delegation to shared portable Handoff package mechanics
  - Availability: available

- schema-companion-mechanism
  - Material: `src/schemas/companion.js`
  - Purpose: current non-authoritative schema-owned presentation/read companion pattern to compare rather than blindly reuse
  - Availability: available

- localization-mechanism
  - Material: `src/i18n/`
  - Purpose: current language presentation infrastructure; portable core should emit stable language-neutral ids/parameters rather than embed Swedish or English copy
  - Availability: available

## Retained Responsibilities

- semantic-authority
  - Retained By: Axiom
  - Responsibility: reconcile any canonical Handoff, Role, Party, validation, or package-schema semantic expansion that proves necessary
  - Boundary: Loom must return the gap rather than mint canonical semantics in runtime/package code

- successor-qualification
  - Retained By: Anchor
  - Responsibility: independently judge whether the fresh Loom conversation recovered the durable role, respected authority boundaries, completed the bounded leaf, and returned sufficient evidence for qualification-once
  - Boundary: implementation PASS does not self-qualify Loom or establish repeatability/permanent trust

- viewer-integration
  - Retained By: Kodax
  - Responsibility: later consume the qualified shared projection in Viewer/package UI when the shared contract is stable enough
  - Boundary: this Handoff does not require Viewer implementation or Q product testing

## Exclusions And Dependencies

- bespoke-carrier-prose
  - Kind: excluded-scope
  - Description: do not solve the task by generating a large free-form `TRANSPORT.md` or sender-authored prompt that restates workspace authority, Role grounding, Completion Expectation, or package semantics already available from qualified structured truth
  - Responsible Party Or Role: Loom

- carrier-relative-routing
  - Kind: excluded-scope
  - Description: do not require the host/human to route with disposable package-internal paths such as `handoff.workspaces/<id>/...`, and do not assume package presence alone identifies the correct leaf; project qualified workspace identity plus the exact workspace-relative controlling artifact instead
  - Responsible Party Or Role: Loom

- canonical-package-schema-invention
  - Kind: excluded-scope
  - Description: do not fabricate a canonical Tiinex transport-package schema solely to obtain a convenient schema-directory or companion shape; attach to the existing runtime contract or return the semantic gap to Axiom
  - Responsible Party Or Role: Loom

- hardcoded-language-copy
  - Kind: excluded-scope
  - Description: do not make Swedish, English, current Role labels, or one ChatGPT host prompt the portable semantic contract; emit stable action/localization ids and parameters with presentation adapters above them
  - Responsible Party Or Role: Loom

- carrier-authority-promotion
  - Kind: excluded-scope
  - Description: do not promote the human who uploads, downloads, or copy/pastes transport material into Handoff From/To, acting Role, acceptance, delegation, or semantic ownership unless separately declared
  - Responsible Party Or Role: Loom

- viewer-product-work
  - Kind: excluded-scope
  - Description: do not defer the shared contract by implementing a Viewer-only template first; Viewer consumption belongs to a later Kodax integration leaf
  - Responsible Party Or Role: Kodax

## Completion Expectation

- Signal Kind: result
- Signal Meaning: durable Loom result/evidence plus merge-ready changed-only ZIP preserving repository hierarchy; the shared projection has focused and adversarial tests for the proven attachment + explicit workspace + exact workspace-relative controlling-artifact routing tuple, minimal expert transport, beginner progressive disclosure data, transport-only/no-Role participation, explicit qualified acting Role input when supplied, blocked/ambiguous package states, language-neutral action/localization ids, no carrier-relative package-topology leakage, and non-redefinition of semantic Handoff/package authority; the return identifies any Axiom/Kodax follow-up boundary and provides enough fresh-session evidence for Anchor to judge this run as a Loom qualification-once candidate
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Handoff package transport is already product-accepted, the fresh Loom conversation is repeatably qualified, all host-specific prompts can disappear, Viewer integration is complete, candidate participation vocabulary beyond the accepted minimum is canonical, or current runtime package contracts have become canonical schema artifacts
- Must Not Be Used To Claim: package-companion presentation changes semantic Handoff truth, Q transport action establishes endpoint/Role authority, implementation completion self-accepts the Handoff, or one successful successor run proves permanent/cross-runtime trust

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:EzpI44iTg7_8Y4TTpyCEAFWiDPFiMmFUAOjIf1is0Q4
