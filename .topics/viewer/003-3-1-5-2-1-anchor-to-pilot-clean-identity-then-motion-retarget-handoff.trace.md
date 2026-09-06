# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-06 17:42:00
  - Trace: [Pilot-Mediated Clean Identity Then Motion Retarget](003-3-1-5-2-pilot-clean-identity-then-motion-retarget-task.trace.md)
  - Origin:
    - [relative](003-3-1-5-2-pilot-clean-identity-then-motion-retarget-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 17:42:00
  - Authors: Anchor; Sigma
  - Why: Transfer one bounded two-phase visual-production session to Pilot so the human is first guided to create a pure static identity authority and only then to retarget a separately authored walk authority to that exact new identity.
  - Summary: Anchor-to-Pilot clean identity authority creation followed by motion retarget Handoff.
  - Status: ready/local

---

# Clean Identity Then Motion Retarget — Anchor To Pilot

## Handoff Parties

- Purpose: execute one decision-minimal two-turn external visual-production session, preserve exact observable results from both turns, and return control to Anchor without visual acceptance or process redesign
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Pilot
- To Kind: role
- To Reference: [Pilot Role](business::.topics/roles/001-7-pilot-role.trace.md)

## Transfers

- two-phase-human-execution-guidance
  - Transfer Kind: work-and-responsibility
  - Description: guide the human through Phase 1 identity creation and Phase 2 motion retarget exactly as declared in the carried execution plan, preserving attachment order and exact user-visible text
  - Controlling Artifact: [Clean Identity Then Motion Retarget Task](003-3-1-5-2-pilot-clean-identity-then-motion-retarget-task.trace.md)
  - Boundary: do not add prior animated identity references, redesign the new character after Phase 1 begins, or introduce motion semantics into the identity-master phase

- exact-multi-turn-evidence-capture
  - Transfer Kind: work-and-responsibility
  - Description: preserve exact observable Phase-1 identity bytes and Phase-2 motion bytes, actual attachment identities, actual visible text, confirmations, and host/provider anomalies
  - Controlling Artifact: [Clean Identity Then Motion Retarget Task](003-3-1-5-2-pilot-clean-identity-then-motion-retarget-task.trace.md)
  - Boundary: evidence capture is not identity or motion acceptance; do not crop, normalize, repair, accept, reject, or promote outputs

- final-return-to-anchor
  - Transfer Kind: work-and-responsibility
  - Description: after Phase 2 succeeds or becomes blocked, write one lineage-correct Evidence and one Pilot-to-Anchor return Handoff, manufacture the canonical return package, and stop immediately
  - Controlling Artifact: [Clean Identity Then Motion Retarget Task](003-3-1-5-2-pilot-clean-identity-then-motion-retarget-task.trace.md)
  - Boundary: no ambient workspace exploration or continuation of Playthings work after terminal return manufacture

## Required Context

- pilot-role
  - Material: generic Business Pilot Role
  - Material Reference: [Pilot Role](business::.topics/roles/001-7-pilot-role.trace.md)
  - Purpose: recipient role and bounded human-mediated execution authority
  - Availability: available

- human-mediated-execution-process
  - Material: generic Business process for decision-minimal external execution, evidence, and immediate return
  - Material Reference: [Human-Mediated External Execution](business::.topics/processes/004-human-mediated-external-execution-process.trace.md)
  - Purpose: execution/evidence/return contract
  - Availability: available

- playthings-visual-process
  - Material: Site-local generative visual source production specialization
  - Material Reference: [Playthings Generative Visual Source Production](../processes/001-playthings-generative-visual-source-production-process.trace.md)
  - Purpose: domain boundary and retained review behavior
  - Availability: available

- pilot-terminal-containment
  - Material: Site-local Pilot terminal containment and fidelity specialization
  - Material Reference: [Pilot Terminal Containment And Fidelity Specialization](../processes/001-1-playthings-pilot-terminal-containment-and-fidelity-specialization.trace.md)
  - Purpose: active-context narrowing and hard terminal stop
  - Availability: available

- execution-plan
  - Material: exact two-phase human execution instructions and exact user-visible text for both turns
  - Material Reference: [Execution plan](003-3-1-5-2-1-execution-plan.md)
  - Purpose: decision-minimal multi-turn human execution surface
  - Availability: available

- execution-manifest
  - Material: phase-specific attachment identities, dynamic Phase-1 result binding, retry policy, and expected returns
  - Material Reference: [Execution manifest](003-3-1-5-2-1-execution-manifest.json)
  - Purpose: prevents attachment guessing or animated-identity substitution
  - Availability: available

- neutral-turnaround-layout
  - Material: exact 1536x1024 1x4 neutral layout authority PNG, SHA-256 ab1717d593091872be33f1f6840e44b12bf68cbbd6a3afad2af3d69e9a12f214
  - Material Reference: [Neutral turnaround layout](../../.topics/viewer/003-3-1-5-2-1-input-01-neutral-turnaround-layout.png)
  - Purpose: structural authority for Phase 1 only; contains no motion semantics
  - Availability: available

- walk-motion-authority
  - Material: exact UAL-derived 2x4 walk motion authority PNG, SHA-256 b59ab1658987c6b038e2ce586155bd91f1b65636bc5bac219f207997a229e9d4
  - Material Reference: [Walk motion authority](../../.topics/viewer/003-3-1-5-2-1-input-02-walk-motion-authority.png)
  - Purpose: Phase-2 movement authority only
  - Availability: available

## Retained Responsibilities

- identity-and-motion-review
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: review Phase-1 identity purity/consistency and Phase-2 motion/technical quality; run deterministic postprocess and decide acceptance/retry/promotion
  - Boundary: Pilot returns execution evidence only

- human-external-action
  - Retained By: human participant
  - Responsibility: perform the exact external image-generation actions as guided by Pilot and return generated results
  - Boundary: human does not reconstruct hidden intent or become durable context storage

## Reference Context

- stabilization-handoff
  - Material: preceding Pilot/process stabilization Handoff
  - Material Reference: [Pilot And Playthings Visual Production Stabilization](003-3-1-5-anchor-to-sigma-pilot-and-visual-production-stabilization-handoff.trace.md)
  - Purpose: preserves why this two-phase test belongs to the current Playthings visual-production lineage without expanding Pilot into broader review work
  - Availability: available

## Exclusions And Dependencies

- visual-acceptance-and-promotion
  - Kind: excluded-scope
  - Description: identity quality, animation quality, deterministic repair, stable promotion, and process disposition remain outside Pilot's execution role
  - Responsible Party Or Role: Anchor

- external-host-direct-control
  - Kind: unresolved-dependency
  - Description: Pilot depends on the human-operated external image-generation surface to expose Phase-1 and Phase-2 results and may not control hidden provider preprocessing or prompt compilation
  - Responsible Party Or Role: Pilot; human participant; external host/provider

- dynamic-phase-2-identity-binding
  - Kind: unresolved-dependency
  - Description: Phase 2 depends on successful preservation of the exact Phase-1 generated identity master; if exact reuse cannot be achieved without substitution or guessing, Pilot returns blocked rather than using a prior animated identity source
  - Responsible Party Or Role: Pilot

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Pilot returns one qualified Handoff package to Anchor containing exact observable Phase-1 identity output, exact observable Phase-2 motion output if reached, execution Evidence, actual input records, explicit anomalies/blocked state where applicable, and no visual acceptance claim
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: either generated image is accepted, Pilot owns character design or animation review, the neutral identity turnaround is itself an animation sheet, or hidden provider prompt/attachment preprocessing is proven equivalent.
- Must Not Be Used To Claim: visual PASS, stable asset promotion, permission to introduce prior animated identity material, or completion of broader Playthings sprite production.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Pilot-Mediated Clean Identity Then Motion Retarget](003-3-1-5-2-pilot-clean-identity-then-motion-retarget-task.trace.md)
  - Value: 3wAnub2Dbicqxzs4j0BHvkOBqF7Vy1zb6eouTp5f9SA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: P1by6tGIfUEBqIPoleviDGu62kR3YMurmuucQqrSD5g
