# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 13:41:00
  - Trace: [026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md](../../tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
  - Origin:
    - [relative](../../tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/b7de59cc6c47e122265188debbd2964b8e5a00a1/.topics/development/tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-24 20:47:00
  - Authors: Anchor
  - Why: Route the accepted repair/projection tranche into the next executable cold-start qualification step: make Tiinex-first semantic ingress measurable and reusable across LLM, CLI, Viewer and host projections without changing carrier representation or inventing provider-specific authority.
  - Summary: Anchor-to-Loom Handoff for Tooling 026 cold-start Tiinex-first ingress and preferred-path qualification, preserving package-wide continuity integrity and keeping Tooling 027 carrier redesign plus post-refactor Chrome bridge work separate.
  - Status: draft/local

---

# Cold-start Tiinex-first ingress and preferred-path qualification handoff

## Handoff Parties

- Purpose: implement Tooling 026's portable cold-start ingress/grounding qualification contract so successful recovery no longer counts as preferred-path PASS when qualified Tiinex orientation was available but native archive/filesystem archaeology happened first
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- tooling-026
  - Transfer Kind: work
  - Description: implement the portable Tiinex-first cold-start ingress contract, measurable preferred-path evidence, recipient Role/participant/interaction grounding, provider-neutral capability projection, explicit degraded fallback, and deterministic cold-consumer fixtures
  - Controlling Artifact: [Tooling 026](../../tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
  - Boundary: shared portable Tooling and qualification evidence only; do not redesign carrier representation, implement Viewer/VS Code product UI, add provider-specific semantic authority, perform remote writes, or execute deferred Chrome bridge work

## Required Context

- tooling-026-task
  - Material: exact preferred-path objective, Done Criteria, fallback boundary, grounding contract, provider-neutral capability requirements, and cold-start qualification fixtures
  - Material Reference: [Tooling 026](../../tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
  - Purpose: controlling implementation scope and completion contract
  - Availability: available

- cold-start-consumer-grounding-feedback
  - Material: actual-path evidence that native archive/filesystem/Python archaeology can recover correctly while still failing preferred-path qualification, plus Role/participant/purpose and carrier direction
  - Material Reference: [Cold-start consumer grounding feedback](../../architect/continuity/001-37-cold-start-consumer-grounding-provider-capability-and-carrier-ingress-feedback.trace.md)
  - Purpose: ground measurable cold-start behavior and provider/host/session separation in observed use rather than idealized flows
  - Availability: available

- tooling-022-anchor-acceptance
  - Material: accepted adapter-neutral operation/projection boundary and current shared portable operation baseline after independent replay
  - Material Reference: [Tooling 022 Anchor acceptance](../../tooling/dogfood/022-2-lineage-integrity-repair-human-projection-anchor-acceptance.trace.md)
  - Purpose: preserve shared-operation and adapter-neutrality discipline while 026 adds consumer-ingress qualification
  - Availability: available

- package-wide-continuity-feedback
  - Material: Parent-target v2 as graph-recovery edge, package-wide Tiinex artifact conformance, and machine recomputation/verification requirement
  - Material Reference: [Continuity footer graph-recovery feedback](../../architect/continuity/001-38-continuity-footer-graph-recovery-and-package-wide-conformance-feedback.trace.md)
  - Purpose: ensure any new Tiinex artifacts emitted by Tooling/tests/carriers preserve the already accepted 019 integrity semantics across the whole package, not only workspace material
  - Availability: available

## Reference Context

- tooling-027-carrier-audit
  - Material: separate carrier/control-plane minimality and workspace-artifact/archive investigation
  - Material Reference: [Tooling 027](../../tooling/dogfood/027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md)
  - Purpose: make the 026/027 boundary explicit so preferred-path qualification does not opportunistically redesign the transport
  - Availability: available

- tooling-022-result
  - Material: current shared portable projection implementation, operation-catalog integration, deterministic adapter fixtures, and package/workspace identity normalization
  - Material Reference: [Tooling 022 result](../../tooling/dogfood/022-1-lineage-integrity-repair-human-adapter-projection-contract-result.trace.md)
  - Purpose: reuse current portable operation/result conventions where 026 exposes grounding and qualification outputs
  - Availability: available

## Retained Responsibilities

- independent-tooling-026-acceptance
  - Retained By: Anchor or another fresh reviewer
  - Responsibility: independently review source, replay focused/aggregate qualification, and accept or return bounded correction
  - Boundary: implementing Loom does not self-accept preferred-path qualification

- carrier-representation-and-control-plane
  - Retained By: Tooling 027 / Anchor / Axiom where exact workspace-binding semantics require classification
  - Responsibility: audit and, only after qualification, redesign package workspace/archive/control representation
  - Boundary: Tooling 026 measures and exposes behavior but does not change the carrier format

- product-adapter-integration
  - Retained By: future Viewer/VS Code/CLI adapter routes
  - Responsibility: consume the shared grounding/qualification contract after acceptance
  - Boundary: no independent adapter policy forks

- post-refactor-human-matic-bridge
  - Retained By: deferred Tooling 029
  - Responsibility: later Chrome convenience transport/level-0 human-matic bridge with automatic-turn circuit breakers
  - Boundary: no browser-extension implementation or autonomous Handoff routing in Tooling 026

## Exclusions And Dependencies

- no-carrier-format-redesign
  - Kind: excluded-scope
  - Description: do not replace exploded workspaces, remove package controls, create workspace-archive binding semantics, or implement the Tooling 027 candidate layout
  - Responsible Party Or Role: Tooling 027 / Anchor

- no-provider-semantic-fork
  - Kind: excluded-scope
  - Description: provider/host-specific skills or prompts may only project canonical portable operations/capability requirements; they must not become a second semantic authority
  - Responsible Party Or Role: Loom/Anchor

- explicit-fallback-only
  - Kind: excluded-scope
  - Description: native archive/filesystem/process/repository actions remain valid execution mechanics and degraded fallback, but preferred-path PASS requires their pre-Tiinex use to stay within the explicit minimal ingress boundary when qualified Tiinex orientation is available
  - Responsible Party Or Role: Loom

- package-wide-continuity-conformance
  - Kind: excluded-scope
  - Description: all newly created Tiinex artifacts anywhere in a produced package follow the same continuity rules. Parent-bearing artifacts require one exact Parent-target c14n-v2 entry plus the primary self entry; roots do not invent Parent edges. Stored digest equality may assist graph discovery but machine qualification must independently recompute and verify exact candidate representations.
  - Responsible Party Or Role: Loom/Anchor

- no-remote-or-authenticated-mutation
  - Kind: excluded-scope
  - Description: no credential collection, authentication flow, repository mutation, commit, push, publication, hidden network action, or fabricated receipt is authorized
  - Responsible Party Or Role: future explicitly authorized host routes

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns one portable Tooling 026 implementation with deterministic cold-start fixtures and measurable preferred-path evidence proving Tiinex-first takeover, Role/participant/purpose grounding, provider-neutral host/session capability projection, explicit degraded fallback, and recovery-versus-preferred-path distinction without changing carrier representation
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: carrier format is redesigned, Viewer/VS Code integration exists, provider-specific semantic skills are authoritative, native tools are forbidden after Tiinex semantic takeover, cold-start correctness alone is a PASS, remote mutation is available, or the deferred Chrome bridge is implemented
- Must Not Be Used To Claim: one chat transport equals one semantic identity, `lineage leaf` equals workflow frontier, capability advertisement proves exercised authority, fallback may silently access remote state, or stored footer values alone constitute machine integrity qualification
- Authority Limits: canonical Handoff/Role/schema/Process truth and accepted operation/provider receipt contracts remain authoritative; Tooling 026 owns preferred-path ingress/grounding qualification only.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md](https://github.com/Tiinex/site/blob/b7de59cc6c47e122265188debbd2964b8e5a00a1/.topics/development/tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
  - Value: iRouKmWhOwa1k50Z1k-4r4ZzInQeEZkWLNBtzDkPWJc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:oB3Waa84azvneRt0XmdTO_Pvg-_iqyH2I0zBhZ2kfwU