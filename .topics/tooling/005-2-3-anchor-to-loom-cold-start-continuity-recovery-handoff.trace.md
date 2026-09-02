# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-02 14:20:00
  - Trace: [Cold-Start Continuity And Recovery — Anchor Review](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
  - Origin:
    - [relative](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 14:21:00
  - Authors: Anchor
  - Why: Transfer one bounded Tranche C to Loom after real-carrier review exposed a cold-start false-green at the exact point where an upstream declared Parent is unavailable, while preserving Tranche B's accepted hardening and the isolated-sandbox/common-path/package-purity boundaries.
  - Summary: Anchor-to-Loom Tranche C for cold-start root-continuity proof, capability-aware exact recovery, and non-critical loss handling before carrier-major promotion.
  - Status: ready/local

---

# Cold-Start Continuity Proof And Recovery — Anchor To Loom

## Handoff Parties

- Purpose: close the remaining cold-start LLM continuity/recovery gap in the shared `ground` path so an isolated recipient can prove required continuity to a qualified root without full-body history dumps, recover exact missing external material through available host capabilities when possible, and escalate a precise TL0 operator request only when required evidence cannot otherwise be supplied
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- cold-start-root-continuity-gate
  - Transfer Kind: work-and-responsibility
  - Description: refine the shared grounding-readiness composition so a cold-started LLM cannot receive `grounded-to-act` when a required declared Parent chain cannot be established to a qualified root or valid compact continuity proof; reproduce and fix the exact current returned-carrier shape where `resolved-with-upstream-degradation` plus `lineage.parent.exactTargetNotLoaded` still yields act-ready
  - Controlling Artifact: [Cold-Start Continuity And Recovery — Anchor Review](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
  - Boundary: do not require every ancestor body in model context; prove continuity mechanically/compactly and expand only unresolved edges

- compact-continuity-proof
  - Transfer Kind: work-and-responsibility
  - Description: define the smallest implementation-level continuity proof/receipt needed for the common `ground` path to distinguish a qualified semantic root from an apparent loaded root whose declared Parent is missing, reusing the existing Parent resolver/integrity/material owners rather than creating a second lineage system
  - Controlling Artifact: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Boundary: no canonical schema redesign unless a concrete contradiction is discovered; filename/path/carrier/lifecycle state remains non-authoritative for artifact ancestry

- capability-aware-exact-recovery
  - Transfer Kind: work-and-responsibility
  - Description: when required grounding material is external or absent, project one bounded recovery route that names the exact target, why it is required, allowed retrieval scope, and resumable command/operation; prefer carried/local bytes, then an already-declared host capability such as exact connector/public fetch, then a precise Transport Operator request when no machine route is available
  - Controlling Artifact: [Cold-Start Continuity And Recovery — Anchor Review](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
  - Boundary: reuse existing cold-consumer/host-action capability machinery where sufficient; do not infer credentials, widen discovery, auto-traverse arbitrary external surfaces, or create a separate LLM CLI

- recovery-provenance-and-loss-boundary
  - Transfer Kind: work-and-responsibility
  - Description: preserve `FETCHED != VERIFIED` and keep unavailable original origins explicit; retrieved/archive/user-provided representations must qualify separately and semantically similar material must not silently replace the declared origin. Required Parent continuity may block cold-start work, while non-critical unavailable assets/references should remain visible degraded/lost states without over-blocking unrelated work
  - Controlling Artifact: [Cold-Start Continuity And Recovery — Anchor Review](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
  - Boundary: classify operational necessity from existing artifact/relation/context role; do not redesign general evidence/source schemas in this tranche

- regression-and-burden-qualification
  - Transfer Kind: work-and-responsibility
  - Description: extend the permanent adversarial matrix with the real-carrier upstream-Parent false-green, a fully qualified root control, exact host-recoverable missing material, operator-only recovery, and non-critical unavailable-asset degradation; preserve bounded output/body projection and rerun focused/tooling, integration, dependency-independent Foundation, static qualification, and representative context-burden measurements
  - Controlling Artifact: [Grounding Reliability Adversarial Quality — Loom Implementation Evidence](005-2-2-1-loom-grounding-adversarial-quality-implementation-evidence.trace.md)
  - Boundary: avoid synthetic breadth for its own sake; add only regressions that own a durable current invariant

## Required Context

- anchor-cold-start-review
  - Material: Anchor decision refining the cold-start LLM continuity threshold after real-carrier review
  - Material Reference: [Cold-Start Continuity And Recovery — Anchor Review](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
  - Purpose: controlling policy for root proof, consumer-sensitive blocking, capability-aware recovery, loss handling, package purity, and carrier-major withholding
  - Availability: available

- loom-tranche-b-evidence
  - Material: Loom Tranche B grounding adversarial quality implementation Evidence
  - Material Reference: [Grounding Reliability Adversarial Quality — Loom Implementation Evidence](005-2-2-1-loom-grounding-adversarial-quality-implementation-evidence.trace.md)
  - Purpose: accepted local fixes, current matrix/burden baseline, exact current owners changed, and explicit historical-upstream-degradation control that must now be refined for cold-start execution
  - Availability: available

- grounding-cli-task
  - Material: current shared Tooling Task for grounding reliability and one human/LLM common CLI surface
  - Material Reference: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Purpose: preserve the one-path rule, progressive disclosure, Parent-only topology, package lock, measurement criteria, and Viewer-downstream boundary
  - Availability: available

- current-loom-return
  - Material: Loom-to-Anchor Tranche B return Handoff
  - Material Reference: [Grounding Reliability Adversarial Quality — Loom To Anchor Return](005-2-2-1-1-loom-to-anchor-grounding-adversarial-quality-return-handoff.trace.md)
  - Purpose: exact return context whose selected real carrier currently demonstrates the upstream Parent gap while otherwise qualifying current authority/frontier
  - Availability: available

## Reference Context

- existing-host-capability-machinery
  - Material: current Site portable host/cold-consumer operations including `project-cold-start-host`, `plan-host-action`, and `accept-host-receipt`
  - Purpose: preferred existing seam for capability-aware external recovery directions rather than a new connector subsystem
  - Availability: available

- current-transport-level-readmodel
  - Material: current `src/sources/transport.levels.js` implementation and historical TL0–TL4 intent retained in source history
  - Purpose: conceptual guard that the operator-mediated fallback is a transport/capability choice, not provenance/authority; this tranche should only use the minimal isolated-sandbox recovery implications and should not reopen Viewer transport UX
  - Availability: available

## Retained Responsibilities

- architecture-and-carrier-progression
  - Retained By: Anchor
  - Responsibility: review Tranche C, independently cold-start its return carrier, and decide whether the grounding/isolation batch is finally stable enough for explicit carrier-major promotion

- schema-semantic-authority
  - Retained By: Axiom
  - Responsibility: no active work is transferred; reconcile only a concrete canonical schema contradiction if Loom cannot implement the policy through existing shared semantics

- human-common-cli-acceptance
  - Retained By: Sigma
  - Responsibility: judge human-facing CLI comprehensibility and ergonomics after isolated/cold deterministic grounding is stable; this tranche does not substitute machine tests for human acceptance

- transport-operation
  - Retained By: Transport Operator
  - Responsibility: move the canonical package and, when Tooling explicitly blocks on operator-recoverable missing material, provide exactly the requested material without being forced to perform semantic judgment

## Exclusions And Dependencies

- second-cli-model
  - Kind: excluded-scope
  - Description: keep one public human-first `ground` path for humans and LLMs; no LLM-only alias language or parallel normal command surface

- full-lineage-body-dump
  - Kind: excluded-scope
  - Description: cold-start continuity proof must not become an instruction to project every ancestor body by default; verify chain identity/integrity compactly and retrieve body content only when the current decision needs it

- viewer-transport-expansion
  - Kind: excluded-scope
  - Description: do not design or implement Viewer/local-Copilot TL0–TL4 UX in this tranche; isolated sandbox reliability remains first priority

- package-topology-change
  - Kind: excluded-scope
  - Description: recipient-facing Handoff package ZIP/Markdown topology and artifact kinds remain locked; no new package artifact kind without explicit Sigma approval routed through Anchor

- broad-external-search
  - Kind: excluded-scope
  - Description: recovery may request/fetch an exact declared target through a qualified capability but must not instruct broad search for semantically similar replacements or silently broaden origin scope

- remote-mutation
  - Kind: excluded-scope
  - Description: no commit, push, merge, publication, release, deployment, source write, or other remote mutation is authorized

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return one canonical full-source Loom-to-Anchor child carrier in which the shared cold-start `ground` path blocks or otherwise refuses substantive act-readiness when required Parent continuity to a qualified root is unproven, emits bounded exact recovery directions through available host capability or operator fallback, preserves non-critical loss as visible degradation rather than universal blocking, keeps provenance/representation boundaries explicit, retains one human/LLM CLI path and package purity, and passes the applicable permanent regression/quality spine with measured bounded context
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: every human interaction must eagerly traverse all history, all external URLs must be fetched, any fetched representation is verified truth, missing non-critical assets always block, isolation implies credentials/connectors exist, the Viewer transport model is complete, canonical schemas changed, stable-major promotion is pre-authorized, Sigma accepted human CLI quality, or remote publication is authorized
- Must Not Be Used To Claim: root continuity from filename/path/carrier numbering, a hidden memory substitute for cold LLMs, broad autonomous web discovery, provenance equivalence between original and recovered material, universal provider support, full common-CLI completion, Viewer readiness, release readiness, or Foundation exit
- Authority Limits: Loom owns bounded shared Tooling implementation/evidence only; Anchor owns architecture/progression, Axiom owns canonical semantic contradiction resolution, Sigma owns later human quality acceptance, and the Transport Operator owns material movement rather than semantic approval

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Cold-Start Continuity And Recovery — Anchor Review](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
  - Value: YqFGlv2F-evbsSFijfGZcjJFtLHxe0pxtDmsw4fI1e0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:FsgCy8yVipYJ_nrpU4rSos45zwTf38ZRn4OCcrRGz-Y
