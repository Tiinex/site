# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-22 00:26:24
  - Summary: Maintained schema for explicit declarative transfer of bounded work or responsibility between declared parties or roles while keeping context, retained responsibility, exclusions, dependencies, and completion-facing expectations distinct from transport mechanics.

---

# Handoff

- Status: maintained schema note

## Summary

Defines a declarative handoff between one explicit `From` endpoint and one explicit intended `To` endpoint.

A Handoff states which bounded work or responsibility is being transferred, which material is required context versus reference-only context, which relevant responsibility remains outside the transfer, what exclusions or unresolved dependencies matter, and what completion-facing signal is expected.

A Handoff is not a ZIP, export bundle, package builder, resolver, transport receipt, or proof that the intended recipient accepted, completed, or was authorized to accept the transfer.

## Core Semantics

- Handoff = explicit bounded work/responsibility transfer declaration.
- `From` and `To` are handoff endpoint declarations and are not inferred from `Authors`, path, filename, directory, package membership, upload recipient, or transport destination.
- Endpoint identity and endpoint capacity are separate truths: a Handoff may target a Role directly, or may identify a concrete Party and separately state the bounded Role/capacity in which that Party is intended to participate.
- `Authors` remains authorship only.
- Only declarations under `## Transfers` move work or responsibility within the semantic scope of the Handoff.
- Required context and reference-only context support interpretation; they do not transfer responsibility merely because they are linked, copied, or packaged.
- Relevant responsibility that intentionally remains outside the transfer should be stated under `## Retained Responsibilities`.
- Material availability and responsibility transfer are separate truths.
- Packaging and transport may carry a Handoff representation but do not define its transfer semantics.
- A Handoff may declare an expected acknowledgement, result, disposition, return, or other completion-facing signal without defining a protocol state machine.
- Party and Role artifacts may strengthen endpoint resolution when available, but a Handoff remains readable when an endpoint must be represented by a precise human-readable descriptor.
- Handoff does not by itself prove delegation authority, recipient acceptance, completion, truth, permission, consent, ownership, or legal effect.

## Schema Validation Contract

### Handoff Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.handoff.v1`

Rules

- `tiinex.handoff.v1` identifies artifacts whose main job is to declare one bounded handoff of work or responsibility from one explicit endpoint to one explicit intended recipient.
- A Handoff must remain understandable without hidden chat context, application state, repository location, ZIP membership, or delivery history.
- A Handoff must not infer transfer from authorship, path, package membership, transport delivery, or artifact adjacency.
- Prose outside `Schema Validation Contract` may explain handoff intent but does not add machine handoff requirements.

### Handoff Body

Required Shape

- first body heading after the continuity envelope
- `## Handoff Parties` section
- `## Transfers` section
- `## Required Context` section
- `## Reference Context` section
- `## Retained Responsibilities` section
- `## Exclusions And Dependencies` section
- `## Completion Expectation` section
- `## Interpretation Limits` section

Rules

- Required sections must remain human-readable and machine-extractable.
- `Transfers`, `Required Context`, `Reference Context`, `Retained Responsibilities`, and `Exclusions And Dependencies` use repeated declaration shapes defined below.
- `Transfers` must contain at least one transfer declaration and must not use `none`.
- `Required Context`, `Reference Context`, `Retained Responsibilities`, and `Exclusions And Dependencies` may intentionally contain zero declarations by using one literal first-level entry named `none` and no other entries.
- A literal `none` entry means no declaration is made in that section for this Handoff scope; it must not be interpreted as a global claim about all possible context, responsibility, exclusions, or dependencies.

### Handoff Parties

Required Fields

- Purpose
- From
- From Kind
- To
- To Kind

Optional Fields

- From Reference
- From Capacity
- From Capacity Reference
- To Reference
- To Capacity
- To Capacity Reference
- Notes

Field Value Constraints

- From Kind
  - Allowed Value: party
  - Allowed Value: role
  - Allowed Value: unknown
  - Domain Policy: closed

- To Kind
  - Allowed Value: party
  - Allowed Value: role
  - Allowed Value: unknown
  - Domain Policy: closed

- From Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

- To Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

- From Capacity Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

- To Capacity Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- `Purpose` states why this bounded handoff exists.
- `From` identifies the party or role from which the declared transfer originates.
- `To` identifies the intended recipient party or role.
- `From Kind` and `To Kind` classify each endpoint as `party`, `role`, or explicitly `unknown`; the classification does not prove identity, authority, current holder state, or acceptance.
- `From` and `To` may be precise human-readable descriptors even when no Tiinex Party or Role artifact exists.
- `From Reference` and `To Reference`, when present, are optional resolution aids and must not override contradictory readable endpoint identity.
- `From Capacity` and `To Capacity`, when present, state the bounded collaboration Role/capacity in which an endpoint is intended to participate in this Handoff; they do not replace endpoint identity.
- `From Capacity Reference` and `To Capacity Reference`, when present, should resolve to the durable Role artifact that owns the referenced collaboration capacity. A readable corresponding `From Capacity` or `To Capacity` is required when its Capacity Reference is present.
- When an endpoint `Kind` is `party`, the corresponding Capacity fields may preserve a distinct Role/capacity without claiming that the Party generally or currently holds that Role outside this Handoff.
- When an endpoint `Kind` is `role`, the endpoint itself already denotes the required Role/capacity; the corresponding Capacity and Capacity Reference fields must be absent rather than duplicating role authority.
- When an endpoint `Kind` is `unknown`, a separately known Capacity may be preserved while concrete endpoint identity remains unresolved; tools must not promote that capacity into proof of which Party will receive the Handoff.
- A Capacity Reference does not prove holder/assignment state, delegation authority, endpoint acceptance, employment, model identity, or permanent responsibility. Use Role holder/Relation/Decision/Instrument/Evidence or another separately owned authority when those claims matter.
- If readable Capacity and resolved Capacity Reference materially contradict one another, the endpoint capacity is ambiguous; neither silently overrides the other.
- An unresolved optional endpoint or capacity reference must remain unresolved; validators and tools must not replace it by guessing from path, filename, `Authors`, repository actor, transport recipient, application session, or Role holder heuristics.
- `Authors` in the Continuity Context remains authorship and must not be treated as `From`, `To`, endpoint Capacity, current responsibility, ownership, holder assignment, or transfer authority.
- The entity that physically sends or receives a ZIP, message, upload, or repository checkout is not a Handoff endpoint unless the Handoff declares it.

### Transfers

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Transfer Kind
- Description

Optional Fields

- Controlling Artifact
- Boundary
- Notes

Field Value Constraints

- Transfer Kind
  - Allowed Value: work
  - Allowed Value: responsibility
  - Allowed Value: work-and-responsibility
  - Domain Policy: closed

- Controlling Artifact
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Transfers` are repeated named transfer declarations.
- The declaration name is a local readability handle only and is not responsibility identity.
- `work` transfers a bounded execution/work obligation without by itself asserting a broader ongoing responsibility transfer.
- `responsibility` transfers the responsibility described by the declaration without by itself creating an executable Task.
- `work-and-responsibility` transfers both the described work and responsibility for that bounded work.
- Every transfer declaration is interpreted from the Handoff `From` endpoint to the Handoff `To` endpoint.
- `Controlling Artifact`, when present, identifies the durable artifact that controls or defines the transferred work/responsibility; linking that artifact does not transfer responsibility for every artifact it references.
- `Boundary` should state important limits when the transferred description could otherwise be over-read.
- Only items explicitly declared in `## Transfers` are transferred by this Handoff.
- Presence in the same workspace, package, ZIP, directory, source tree, or transport does not create a transfer declaration.
- A Handoff transfer declaration does not by itself prove that `From` possessed delegation authority or that `To` accepted the transfer; separate Decision, Party/Role, Instrument, Evidence, Attestation, or other authority may support those claims when needed.

### Required Context

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Material
- Purpose
- Availability

Optional Fields

- Material Reference
- Notes

Field Value Constraints

- Availability
  - Allowed Value: available
  - Allowed Value: unavailable
  - Allowed Value: unresolved
  - Allowed Value: unknown
  - Domain Policy: closed

- Material Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Required Context` are repeated named declarations for material required to understand, execute, review, or complete the declared transfer.
- The declaration name is a local readability handle only and is not material identity.
- `Material` describes the required context item.
- `Purpose` explains why the item is required for this handoff.
- `Availability` preserves whether the required context is currently available, unavailable, unresolved, or unknown.
- `Material Reference`, when present, is a resolution aid and does not transfer responsibility for the referenced artifact.
- Required context may be referenced rather than physically packaged when the reference remains usable.
- `Availability: unavailable`, `unresolved`, or `unknown` is an explicit handoff fact and must not be replaced by repository-global search, filename guessing, package guessing, or fabricated source.
- Explicitly unavailable required material does not make the Handoff artifact unreadable or invalid merely because execution readiness may remain blocked or unresolved.
- The literal entry `none` is allowed only as the sole `## Required Context` entry and is exempt from declaration fields.

### Reference Context

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Material
- Purpose
- Availability

Optional Fields

- Material Reference
- Notes

Field Value Constraints

- Availability
  - Allowed Value: available
  - Allowed Value: unavailable
  - Allowed Value: unresolved
  - Allowed Value: unknown
  - Domain Policy: closed

- Material Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Reference Context` are repeated named declarations for useful supporting material that is not required for the declared transfer to be understood or attempted.
- The declaration name is a local readability handle only and is not material identity.
- `Material` describes the reference-only context item.
- `Purpose` explains why the item may help.
- `Availability` preserves current availability without promoting the item into required context.
- `Material Reference`, when present, is a resolution aid only.
- Reference-only context must not be interpreted as transferred work, transferred responsibility, a required dependency, or proof that the recipient reviewed it.
- The literal entry `none` is allowed only as the sole `## Reference Context` entry and is exempt from declaration fields.

### Retained Responsibilities

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Retained By
- Responsibility

Optional Fields

- Retained By Reference
- Boundary
- Notes

Field Value Constraints

- Retained By Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Retained Responsibilities` are repeated named declarations for relevant responsibility that remains outside the handoff transfer.
- The declaration name is a local readability handle only and is not responsibility identity.
- `Retained By` explicitly identifies the party or role that keeps the declared responsibility; it may be the Handoff `From` endpoint or another prior responsible party/role.
- `Retained By Reference`, when present, is an optional resolution aid and does not prove holder authority.
- `Boundary` should clarify partial retention when the same broad domain contains both transferred and retained work.
- A responsibility declared here must not be treated as transferred to `To`.
- Responsibility not listed under `## Transfers` is not silently transferred merely because it is absent from this section.
- The literal entry `none` is allowed only as the sole `## Retained Responsibilities` entry and means only that no relevant retained-responsibility declaration is recorded for this bounded Handoff scope; it does not mean all possible responsibility has transferred.

### Exclusions And Dependencies

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Kind
- Description

Optional Fields

- Reference
- Responsible Party Or Role
- Notes

Field Value Constraints

- Kind
  - Allowed Value: excluded-scope
  - Allowed Value: unresolved-dependency
  - Domain Policy: closed

- Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Exclusions And Dependencies` are repeated named declarations for explicit out-of-scope boundaries or unresolved dependencies that materially affect the handoff.
- `Kind: excluded-scope` records work, responsibility, authority, or material explicitly excluded from the transfer.
- `Kind: unresolved-dependency` records a dependency whose resolution is not currently established.
- `Responsible Party Or Role`, when present, is readable coordination context and does not by itself create or transfer that responsibility.
- Required material that is unavailable, unresolved, or unknown should preserve that truth primarily in its `## Required Context` declaration through `Availability`; this section may describe the dependency consequence without duplicating material identity authority.
- Exclusions and unresolved dependencies must not be silently filled from package membership, nearby files, repository-global search, or UI defaults.
- The literal entry `none` is allowed only as the sole `## Exclusions And Dependencies` entry and is exempt from declaration fields.

### Completion Expectation

Required Fields

- Signal Kind
- Signal Meaning

Optional Fields

- Return To
- Return To Reference
- Expected Result Reference
- Notes

Field Value Constraints

- Signal Kind
  - Allowed Value: acknowledgement
  - Allowed Value: result
  - Allowed Value: disposition
  - Allowed Value: return
  - Allowed Value: none
  - Allowed Value: custom
  - Allowed Value: unknown
  - Domain Policy: closed

- Return To Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

- Expected Result Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- `Signal Kind` classifies the completion-facing expectation without defining a protocol state machine.
- `Signal Meaning` states the concrete acknowledgement, result, disposition, return, custom signal, absence of expected signal, or unresolved expectation in human-readable terms.
- `Return To`, when present, identifies the party or role expected to receive the completion-facing signal.
- `Return To Reference`, when present, is an optional resolution aid and must not substitute for an omitted readable return target.
- `Expected Result Reference`, when present, identifies a known durable result target or expected artifact reference; absence does not imply that no result may exist.
- If no completion-facing signal is expected, use `Signal Kind: none` and explain that boundary in `Signal Meaning`.
- An expected signal declaration does not prove the signal occurred, the recipient accepted responsibility, the work completed successfully, or responsibility automatically returned.
- No implicit transition from handed-off to accepted, active, completed, returned, or closed is created by this schema.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Authority Limits
- Transport Limits
- Review Notes

Rules

- `Does Not Mean` must name important interpretations the Handoff does not support.
- `Must Not Be Used To Claim` must name important claims that require separate authority or evidence.
- A Handoff does not by itself prove sender authority, recipient identity, recipient acceptance, acknowledgement, completion, result correctness, consent, ownership, custody transfer, publication, transport delivery, package completeness, or successful material resolution.
- A transport artifact may carry the Handoff but transport presence or delivery must not be treated as semantic transfer.
- Handoff responsibility transfer must not be reconstructed from directory placement, filename, path, package boundary, workspace membership, `Authors`, repository actor, or viewer UI state.

### File Naming

Allowed Shapes

- `<lineage>-handoff.trace.md`
- `<lineage>-<handoff-slug>.trace.md`

Rules

- Handoff artifacts should keep the lineage label first.
- The optional slug should describe the bounded transfer or receiving context.
- Handoff artifacts should keep the `.trace.md` suffix stable.
- File and directory placement are discovery/navigation conventions only and must not imply `From`, `To`, responsibility, semantic Parent, or transfer authority.

### Interpretation Boundaries

Rules

- Use `tiinex.handoff.v1` when the artifact's main value is an explicit bounded transfer of work or responsibility from one declared endpoint to one intended recipient.
- Use `tiinex.task.v1` when the main value is defining work to be done and no explicit responsibility/work transfer semantics are needed.
- Use `tiinex.invitation.v1` when the main value is requesting or offering participation rather than declaring a bounded handoff.
- Use `tiinex.relation.v1` when the main value is a typed non-parent relation rather than a responsibility/work transfer.
- Use `tiinex.external.payload.v1` when the main value is preserving or locating an external payload rather than declaring transfer semantics.
- Party and Role artifacts may describe handoff endpoints or endpoint capacities but do not themselves create a Handoff; a Party named with a Capacity is not thereby proven to hold that Role generally or to have accepted the Handoff.
- A Handoff must not become a generic package manifest, dependency resolver, ZIP schema, delivery receipt, workflow engine, or state-machine protocol.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a Handoff when one bounded transfer of work or responsibility needs explicit `From`, `To`, transfer, context, retained-responsibility, and completion-facing semantics that should survive outside a conversation or application session.
- Do not create a Handoff merely because files are copied, a ZIP is built, a workspace is shared, a message is sent, a Task exists, or a relation is declared.
- Do not use Handoff to manufacture delegation authority, acceptance, completion, or package truth that is not separately supported.

### Required Inputs

Required Fields

- Purpose
- From
- From Kind
- To
- To Kind
- Transfers
- Required Context
- Reference Context
- Retained Responsibilities
- Exclusions And Dependencies
- Completion Expectation
- Interpretation Limits

Rules

- Creation must identify the transfer endpoints and at least one explicit transfer declaration.
- When a concrete Party endpoint and a distinct required Role/capacity both materially affect the transfer, creation should preserve the Party as endpoint identity and the Role/capacity through the corresponding Capacity fields rather than collapsing one truth into the other.
- When only a Role/capacity is intentionally targeted and no concrete Party is asserted, use the existing `Kind: role` endpoint form rather than inventing a Party holder.
- Creation must classify supporting material as required context or reference-only context rather than leaving package membership to imply its role.
- Creation must make relevant retained responsibility explicit or intentionally use `none`.
- Creation must preserve exclusions, unresolved dependencies, and unavailable required material where those facts matter.
- Creation must state the expected completion-facing signal or explicitly state that none is expected.

### Generation Rules

Rules

- Write `From` and `To` from declared handoff intent, never from `Authors`, file path, repository actor, current chat participant, upload target, or ZIP recipient. When Party identity and Role/capacity are both material, preserve them separately instead of rewriting the Party as the Role or inferring holder state.
- Put only transferred work/responsibility under `## Transfers`.
- Put material needed to understand or perform the handoff under `## Required Context`; use `Availability` rather than silently replacing missing material.
- Put useful but non-required supporting material under `## Reference Context`.
- Put relevant non-transferred responsibility under `## Retained Responsibilities`.
- Put explicit scope exclusions and unresolved dependencies under `## Exclusions And Dependencies`.
- Keep completion-facing expectations declarative and bounded; do not generate protocol states that the source did not request.
- Prefer explicit Party, Role, Task, Decision, Evidence, Discovery, Relation, External Payload, validation, or other Tiinex references when they already exist, but do not require fabrication of those artifacts merely to make the Handoff readable.
- Keep packaging and resolver behavior outside Handoff semantics.

## Minimal Example

```md
# Service Recovery Handoff To A Concrete Party In A Role

## Handoff Parties

Purpose: transfer bounded service-recovery execution to one concrete operator in the recovery-lead capacity while keeping external communications responsibility with the incident coordinator
From: incident coordinator role
From Kind: role
To: Morgan Lee
To Kind: party
To Capacity: recovery lead
To Capacity Reference: [Recovery lead role](001-recovery-lead-party-role.trace.md)

## Transfers

- restore-service
  - Transfer Kind: work-and-responsibility
  - Description: execute the bounded service recovery described by the controlling recovery task until a reviewable recovery result is returned
  - Controlling Artifact: [Recovery task](001-recovery-task.trace.md)
  - Boundary: service-recovery execution only

## Required Context

- incident-state
  - Material: current incident state
  - Material Reference: [Incident](001-incident.trace.md)
  - Purpose: establishes the current failure boundary and known impact
  - Availability: available

- recovery-runbook
  - Material: current recovery runbook
  - Material Reference: [Recovery runbook](001-recovery-runbook.trace.md)
  - Purpose: supplies the required recovery procedure and stop conditions
  - Availability: available

## Reference Context

- prior-postmortem
  - Material: prior similar incident postmortem
  - Material Reference: [Prior postmortem](000-incident-postmortem.trace.md)
  - Purpose: optional comparison context only
  - Availability: available

## Retained Responsibilities

- customer-communications
  - Retained By: incident coordinator role
  - Responsibility: external status communication and approval of public wording
  - Boundary: recovery lead may supply technical facts but does not own publication

## Exclusions And Dependencies

- vendor-console-access
  - Kind: unresolved-dependency
  - Description: vendor console access has not been confirmed and must not be invented or inferred
  - Responsible Party Or Role: incident coordinator role

## Completion Expectation

Signal Kind: result
Signal Meaning: one reviewable recovery result artifact describing actions taken, remaining uncertainty, and current service state
Return To: incident coordinator role

## Interpretation Limits

Does Not Mean: the recovery lead accepted the handoff, has vendor access, or may publish external status updates
Must Not Be Used To Claim: service recovery succeeded, incident closure, delegation authority beyond the declared recovery boundary, or completion before a result exists
```

When no concrete recipient Party is asserted and the intended target is the capacity itself, the existing role-only form remains valid:

```md
## Handoff Parties

Purpose: transfer bounded schema reconciliation to whichever explicit worker/session is assigned the Schemer capacity
From: Architect
From Kind: role
To: Schemer
To Kind: role
To Reference: [Schemer Role](001-schemer-role.trace.md)
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order used here:
`Summary`, `Core Semantics`, `Schema Validation Contract`,
`Artifact Creation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free Markdown inside those sections is allowed, but adding undeclared new schema-note section headings should be treated as schema drift.

The body headings required for artifacts using this schema are:
`## Handoff Parties`, `## Transfers`, `## Required Context`,
`## Reference Context`, `## Retained Responsibilities`,
`## Exclusions And Dependencies`, `## Completion Expectation`,
and `## Interpretation Limits`.

## Interpretation Notes

- Handoff owns explicit transfer semantics, not transport mechanics.
- Task owns bounded work definition; Handoff may reference a Task as controlling work without replacing Task semantics.
- Party and Role artifacts may resolve endpoints or endpoint capacities without making authorship, holder state, acceptance, or delegation authority equivalent to transfer truth.
- A concrete Party endpoint plus `To Capacity` / `From Capacity` preserves recipient/sender identity separately from the collaboration Role used for this Handoff; a role-only endpoint remains valid when no concrete Party is asserted.
- Required context, reference context, transferred work/responsibility, and retained responsibility are intentionally separate authorities.
- A package, ZIP, workspace, or message can carry a Handoff but inclusion or delivery does not itself move responsibility.
- Completion-facing expectations are declarative and do not create an implicit workflow state machine.
- A future package/planner artifact should be introduced only if package selection, closure, transport provenance, or resolver state has independent semantic value that existing package/payload concepts do not already own.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: ftgf8F2H5Y5YW2cjVk3eVOBufzAkGc6tclL972CEfHw
