# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 19:42:00
  - Authors: Anchor
  - Why: Transfer the newly materialized human-output failure to the active successor Anchor through Tiinex itself so Q does not become a process/debugging context bus and the pending Axiom route is not dispatched with a known transport UX regression.
  - Summary: Bounded Anchor-to-Anchor correction Handoff for the missing adjacent copyable minimal routing block in otherwise qualified Handoff output.
  - Status: draft/local

---

# Handoff human output copyable transport correction handoff

## Handoff Parties

- Purpose: let the active successor Anchor independently classify and correct the normal Handoff human-output fast path before dispatching the pending Axiom package
- From: Anchor
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- handoff-human-output-correction
  - Transfer Kind: work
  - Description: independently reconcile the observed primary-carrier-only output against current carrier/human-output Tooling and durable transport decisions, then correct the smallest responsible layer and re-qualify the pending Axiom dispatch
  - Controlling Artifact: [Handoff human output copyable transport correction](../../architect/continuity/001-19-6-handoff-human-output-copyable-transport-correction-task.trace.md)
  - Boundary: same peer Role across predecessor-control and active-successor sessions; transfers only this bounded human-output correction and does not return ordinary execution ownership to the predecessor conversation

## Required Context

- correction-task
  - Material: bounded active-Anchor correction objective and done criteria
  - Material Reference: [Handoff human output copyable transport correction](../../architect/continuity/001-19-6-handoff-human-output-copyable-transport-correction-task.trace.md)
  - Purpose: define exact work and completion boundary
  - Availability: available

- human-output-failure-feedback
  - Material: Q actual-path observation plus independent package-local carrier-output inspection showing the missing copyable block despite derivable routing text
  - Material Reference: [Handoff human output copyable transport block feedback](../../architect/continuity/001-16-1-handoff-human-output-copyable-transport-block-feedback.trace.md)
  - Purpose: carry the failure itself rather than relying on predecessor/Q transport prose
  - Availability: available

- single-primary-deliverable-boundary
  - Material: accepted host constraint that Q's normal path exposes one primary carrier rather than helper-file selection
  - Material Reference: [ChatGPT host transport budget and single-primary-deliverable feedback](../../architect/continuity/001-16-chatgpt-host-transport-budget-and-single-primary-deliverable-feedback.trace.md)
  - Purpose: prevent fixing the copyable text by regressing to multiple required human attachments
  - Availability: available

- carrier-projection-boundary
  - Material: accepted local decision for disposable carrier naming/output projection and non-authority
  - Material Reference: [Handoff carrier dimensional lineage and human projection decision](../../architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
  - Purpose: preserve the separation between human projection and Handoff/package truth
  - Availability: available

## Reference Context

- cross-device-fallback
  - Material: host observation that a separate transport-text helper may be useful for Files/new-chat recovery after device swaps
  - Material Reference: [ChatGPT cross-device conversation/files fallback feedback](../../architect/continuity/001-17-1-chatgpt-cross-device-conversation-files-fallback-feedback.trace.md)
  - Purpose: keep fallback attachment behavior distinct from normal desktop emission
  - Availability: available

- pending-axiom-handoff
  - Material: current Process classification Handoff already manufactured for Axiom
  - Material Reference: [Process artifact scope composition semantic classification handoff](../axiom/001-1-process-artifact-scope-composition-semantic-classification-handoff.trace.md)
  - Purpose: let active Anchor preserve/reseal rather than recreate semantic work unnecessarily after the presentation correction
  - Availability: available

## Retained Responsibilities

- process-semantic-classification
  - Retained By: Axiom
  - Responsibility: own Process semantic classification once the active Anchor explicitly re-qualifies and dispatches that route
  - Boundary: this correction does not transfer Process semantics to Anchor or authorize Axiom execution before corrected dispatch

- tooling-implementation
  - Retained By: Loom
  - Responsibility: own any recurring mechanical Tooling change only if active Anchor binds the failure to a Tooling responsibility and creates a separate bounded transfer
  - Boundary: this Handoff does not presume that Tooling is defective because current projection already derives transport text

- human-transport
  - Retained By: Q
  - Responsibility: carry one primary package plus copy the adjacent minimal routing block
  - Boundary: Q is not required to reconstruct paths, inspect package output structures, choose correction layer, or convey semantic debugging context

## Exclusions And Dependencies

- semantic-transport-prose
  - Kind: excluded-scope
  - Description: correction instructions or work interpretation must not be supplied through Q's routing text; durable artifacts own the failure and task
  - Responsible Party Or Role: Anchor

- duplicate-helper-normal-path
  - Kind: excluded-scope
  - Description: do not make a second transport-text attachment required in the normal desktop path merely because a copyable code block was omitted
  - Responsible Party Or Role: Anchor

- axiom-semantic-work
  - Kind: unresolved-dependency
  - Description: pending Axiom work remains held until active Anchor corrects/re-qualifies the human-output path; preserve its semantic task unchanged unless a durable dependency actually changed
  - Responsible Party Or Role: Anchor/Axiom

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: active successor Anchor materializes the corrected human-output contract, demonstrates the one-carrier-plus-copyable-minimal-routing fast path, and explicitly decides whether the existing Axiom carrier may be dispatched or must be rebuilt/resealed
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: package truth failed, Tooling must be changed, the Axiom semantic task is invalid, a code fence is canonical Handoff semantics, or predecessor Anchor resumes active ownership
- Must Not Be Used To Claim: transport prose owns work semantics, a sidecar file is mandatory on every host, Q must debug Role output, or valid Axiom work should be discarded solely because its presentation omitted the routing block

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:SISKXWNgKkMr6yk035lV_EJIMsBgFiWv1OXurC_CsL8
