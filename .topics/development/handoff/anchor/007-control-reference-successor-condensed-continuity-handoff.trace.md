# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 20:38:00
  - Authors: Anchor
  - Why: Make the predecessor/control Anchor conversation independently cold-startable before a second ChatGPT branch is required, while preserving that the separate successor Anchor conversation owns active execution.
  - Summary: Control/reference-only Anchor successor Handoff carrying the first-branch condensed continuity, Role-materialization gap and current transport/Role identity boundaries without creating a competing execution route.
  - Status: draft/local

---

# Control/reference successor condensed continuity handoff

## Handoff Parties

- Purpose: cold-start a successor for this predecessor/control conversation lineage with durable access to its high-value findings, without transferring active project execution away from the separate active Anchor conversation
- From: Anchor
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- control-reference-continuity
  - Transfer Kind: work
  - Description: recover the preserved control findings, remain reference/control only, independently inspect future packages or contradictions when Q explicitly brings them here, and artifactize any new material evidence before routing it onward
  - Controlling Artifact: [Control branch cold-start preservation decision](../../architect/continuity/001-21-control-branch-cold-start-preservation-decision.trace.md)
  - Boundary: this is conversation-control continuity only; it does not transfer normal active project execution, current task ownership, repository publication authority or downstream Role routing from the separate active Anchor conversation

## Required Context

- control-preservation
  - Material: exact current control/reference ownership boundary and condensed first-branch findings
  - Material Reference: [Control branch cold-start preservation decision](../../architect/continuity/001-21-control-branch-cold-start-preservation-decision.trace.md)
  - Purpose: allow a fresh control successor to recover what matters without predecessor chat access
  - Availability: available

- role-materialization-gap
  - Material: Site+Docs Viewer actual-path evidence and bounded interpretation of the current Role identity materialization/resolution debt
  - Material Reference: [Current Role materialization and resolution gap signal](../../architect/continuity/001-21-1-current-role-materialization-and-resolution-gap-signal.trace.md)
  - Purpose: preserve the newest unresolved Role identity finding without requiring screenshots or conversational memory
  - Availability: available

- role-identity-transition
  - Material: accepted current Role label mapping, peer invariant and exact predecessor Role grounding boundary
  - Material Reference: [Role family identity transition decision](../../architect/continuity/001-8-1-role-family-identity-transition-decision.trace.md)
  - Purpose: prevent a fresh control successor from treating historical Role labels as current merely because those are the only Role artifacts presently visible
  - Availability: available

- human-output-contract
  - Material: accepted current-host one-primary-carrier plus copyable package-derived routing-block rule
  - Material Reference: [Handoff human output copyable transport correction disposition](../../architect/continuity/001-19-6-1-handoff-human-output-copyable-transport-correction-disposition.trace.md)
  - Purpose: preserve the human transport completion boundary across cold starts and Roles
  - Availability: available

## Reference Context

- source-discovery-gap
  - Material: source-neutral workspace Source/lazy-discovery signal
  - Material Reference: [Workspace source binding and lazy discovery signal](../../architect/continuity/001-19-5-workspace-source-binding-and-lazy-discovery-signal.trace.md)
  - Purpose: keep Source authority separate from Role/workspace identity while future discovery semantics remain open
  - Availability: available

- process-classification-result
  - Material: Axiom's returned schema-warranted Process semantic classification contained in the carried current workspace
  - Material Reference: [Process artifact scope composition semantic classification disposition](../../architect/continuity/001-20-1-process-artifact-scope-composition-semantic-classification-disposition.trace.md)
  - Purpose: preserve the latest semantic result available to this control package without asking the control successor to accept or route it as active architecture owner
  - Availability: available

## Retained Responsibilities

- active-project-execution
  - Retained By: Anchor
  - Responsibility: the separate active successor Anchor conversation owns current project disposition, normal routing and acceptance of returned Role work
  - Boundary: this control successor may challenge or preserve evidence but may not silently become the active Anchor because it has richer predecessor context

- semantic-schema-work
  - Retained By: Axiom
  - Responsibility: own separately transferred semantic/schema classification or authoring work under explicit Handoff
  - Boundary: this control successor does not author Process/Role/Source semantics from convenience

- human-transport
  - Retained By: Q
  - Responsibility: carry one primary Handoff package plus copy the adjacent minimal routing block
  - Boundary: Q is not a technical synchronization bus and does not reconstruct hidden context

## Exclusions And Dependencies

- active-route-duplication
  - Kind: excluded-scope
  - Description: do not create normal competing project routes/tasks merely to continue the predecessor conversation's historical execution state
  - Responsible Party Or Role: Anchor

- role-schema-invention
  - Kind: excluded-scope
  - Description: do not materialize successor Role artifacts or choose their canonical home/relation until the semantic/currentness question is properly classified
  - Responsible Party Or Role: Anchor/Axiom

- transport-semantic-steering
  - Kind: excluded-scope
  - Description: future control evidence must enter active state through durable artifacts/Handoff rather than Q copy/paste technical interpretation
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: a fresh control successor can recover this branch's durable findings, remain control/reference only, and independently compare future evidence without predecessor chat access
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the current active Anchor is replaced, Axiom's Process classification is accepted by architecture, current Role artifacts should be renamed in place, `Tiinex/business` owns Role authority, Source semantics are settled, or Tooling/shared-layer trust is complete
- Must Not Be Used To Claim: branch number or filename dimension proves semantic Parent, the richest conversation owns project authority, historical Role labels are obsolete artifacts to delete, or package carriage proves publication/source authority

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:KENvHHXfI_OXlKD95ao3wma0rjn1BBi90uH-tD9XpaI
