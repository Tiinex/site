# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 14:40:00
  - Trace: [Handoff carrier projection, shared-route, and human-output closure](../../tooling/dogfood/012-handoff-carrier-projection-shared-route-and-human-output-closure.trace.md)
  - Origin:
    - [relative](../../tooling/dogfood/012-handoff-carrier-projection-shared-route-and-human-output-closure.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 14:41:00
  - Authors: Anchor
  - Why: Transfer the next bounded Loom dogfood leaf after Tooling 011 closure, using the newly decided major/dimensional carrier projection and preserving Q as transport-only.
  - Summary: Anchor to Loom Handoff for deterministic outer carrier naming, one-primary human output, and explicit shared-carrier multi-route fan-out over the accepted Tooling 011 manufacturing foundation.
  - Status: open/local

---

# Handoff carrier projection, shared-route, and human-output closure handoff

## Handoff Parties

- Purpose: implement and pressure the bounded Tooling 012 transport-projection/fan-out closure without changing canonical Handoff semantics or requiring Q to choose among helper artifacts
- From: Anchor
- From Kind: role
- From Reference: [Anchor semantic predecessor Role](../../architect/continuity/001-3-1-architect-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](../../loom/role/001-loom-role.trace.md)

## Transfers

- tooling-012-carrier-projection-shared-route
  - Transfer Kind: work
  - Description: implement the Task-defined deterministic rename-safe outer carrier projection, single-primary human-visible output, device-swap transport-text fallback, and explicit shared-carrier multi-route fan-out/verification over the existing accepted recipient-relative Handoff manufacturing path
  - Controlling Artifact: [Tooling 012 Task](../../tooling/dogfood/012-handoff-carrier-projection-shared-route-and-human-output-closure.trace.md)
  - Boundary: preserve the existing Handoff/package semantic separation; do not treat dimension, From/To filename text, ZIP names, package inclusion, or route selection as Parent/assignment/acceptance/authority

## Required Context

- tooling-012-task
  - Material: exact bounded objective, done criteria, scope, and dependencies for the carrier projection/shared-route closure
  - Material Reference: [Tooling 012 Task](../../tooling/dogfood/012-handoff-carrier-projection-shared-route-and-human-output-closure.trace.md)
  - Purpose: controlling work authority
  - Availability: available

- carrier-dimensional-lineage-decision
  - Material: local dimensional-lineage vocabulary, filename projection, parallel same-dimension rule, collision suffix boundary, and disposable Downloads/carrier model
  - Material Reference: [Handoff carrier dimensional lineage and human projection decision](../../architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
  - Purpose: exact architecture/readability boundary the implementation must consume without upgrading to canonical ZIP semantics
  - Availability: available

- host-single-primary-feedback
  - Material: current ChatGPT attachment-budget and one-primary-human-deliverable observation
  - Material Reference: [ChatGPT host transport budget and single-primary-deliverable feedback](../../architect/continuity/001-16-chatgpt-host-transport-budget-and-single-primary-deliverable-feedback.trace.md)
  - Purpose: pressure the human fast path while keeping host-specific limits non-canonical
  - Availability: available

- host-cross-device-files-fallback
  - Material: current ChatGPT device-swap observation where prior conversation state may be unavailable while Files and new conversations remain usable
  - Material Reference: [ChatGPT cross-device conversation and Files fallback feedback](../../architect/continuity/001-17-1-chatgpt-cross-device-conversation-files-fallback-feedback.trace.md)
  - Purpose: require a durable minimal transport-text fallback without making host prose or sidecars semantic authority
  - Availability: available

- tooling-011-acceptance
  - Material: accepted deterministic workspace manufacturing, non-Site Tooling bootstrap, binary ZIP, CLI/catalog, roundtrip, and bounded scale foundation
  - Material Reference: [Tooling 011 Anchor acceptance](../../tooling/dogfood/011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md)
  - Purpose: extend the existing package engine rather than building a second transport implementation
  - Availability: available

- loom-qualification-once
  - Material: current bounded Loom cold-start qualification disposition
  - Material Reference: [Loom qualification-once decision](../../architect/continuity/001-11-4-loom-first-fresh-successor-qualification-once-decision.trace.md)
  - Purpose: preserve that this is ordinary subsequent Loom work, not a ceremonial second cold-start qualification run
  - Availability: available

## Reference Context

- loom-role
  - Material: stable Loom Role boundary
  - Material Reference: [Loom Role](../../loom/role/001-loom-role.trace.md)
  - Purpose: recover portable/shared implementation capacity and authority limits; current qualification state remains external to the Role artifact
  - Availability: available

## Retained Responsibilities

- architecture-acceptance
  - Retained By: Anchor
  - Responsibility: independently review the implementation against Tooling 012 and decide acceptance/correction
  - Boundary: Loom result/package readiness does not self-accept the architecture leaf

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: own any genuine Handoff/ZIP/schema semantic insufficiency discovered by implementation pressure
  - Boundary: Loom must return semantic gaps rather than fill them with filename/path heuristics

- viewer-integration
  - Retained By: Kodax
  - Responsibility: own later Viewer/product consumption of carrier/output projection if separately routed
  - Boundary: Tooling 012 does not claim Viewer parity or product behavior

- human-product-host-acceptance
  - Retained By: Sigma/Q
  - Responsibility: separately requested product/host observation and actual-path acceptance
  - Boundary: Q is transport-only for this leaf; no Q test is required before Anchor source review

## Exclusions And Dependencies

- no-canonical-zip-schema
  - Kind: excluded-scope
  - Description: do not create or imply maintained canonical `tiinex.zip.v1` semantics merely to standardize human transport filenames
  - Responsible Party Or Role: Loom

- no-dimensional-parent-semantics
  - Kind: excluded-scope
  - Description: do not infer or encode Parent, closure, assignment, acceptance, dependency, or authority from `004`, `004-1`, shared dimensions, route slugs, or collision suffixes
  - Responsible Party Or Role: Loom

- no-human-route-override
  - Kind: excluded-scope
  - Description: exclude any implementation where human transport prose overrides package truth; a shared physical package must explicitly qualify its allowed controlling Handoff routes before different transport texts may select them
  - Responsible Party Or Role: Loom


## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns durable implementation/result evidence and one independently groundable recipient-relative Handoff package to Anchor, including focused single-route regression, device-swap transport-text fallback evidence, and a three-route shared-carrier fixture or a precise fail-closed blocker if package truth cannot yet support it without semantic overreach
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: this Handoff assigns Loom permanently, Tooling 012 is already accepted, filename convention is canonical Tiinex semantics, shared carrier means shared acceptance, Q should inspect helper artifacts, or a major `004` proves every `003` branch is semantically closed
- Must Not Be Used To Claim: package naming owns artifact identity, route slug owns Handoff parties, collision suffix is lineage, parallel same-dimension carriers are semantically siblings by filename alone, or host attachment limits are universal constants

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:jWpEuUOvX0MP3ZJXSO-YhUuvjUX3OY1k1RFWR9JPx0M
