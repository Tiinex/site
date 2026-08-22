# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:04
  - Trace: [Cold-start orientation and bootstrap](001-4-cold-start-orientation-bootstrap.trace.md)
  - Origin:
    - [relative](001-4-cold-start-orientation-bootstrap.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:23:00
  - Authors: Architect
  - Why: Define a reusable non-hidden orientation contract for fresh role starts so Tiinex can be recovered from artifacts and tooling rather than Project Instructions or manual semantic coaching.
  - Summary: Cold-start orientation baseline for artifact-first role recovery with template-only transport.
  - Status: accepted/local

---

# Cold-Start Orientation Baseline

## Decision

- State: accepted
- Subject: minimum reusable orientation for a fresh Tiinex role session
- Decision: cold-start orientation is artifact-first and must work without Project Instructions. Transport may point to one current workspace/package and one Handoff entrypoint; semantic work instructions must remain in durable Role/Handoff/Task/Decision/Validation artifacts.

## Basis

A fresh recipient should recover in this order:

1. Treat the supplied workspace/package as current material only when the transport explicitly says so; do not infer source authority from ZIP membership.
2. Open the exact Handoff named by transport. Read Handoff Parties, Transfers, Required Context, Reference Context, Retained Responsibilities, exclusions/dependencies, and completion expectation.
3. Resolve the recipient Role artifact and read stable scope/authority/pushback boundaries. Role does not prove holder identity or Handoff acceptance.
4. Read the controlling Task and any current Feedback/Decision/Validation authority before mutation.
5. For Architect, read [Architect Operating Model](001-1-1-architect-operating-model.trace.md) and [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md).
6. Establish current source/material/checkpoint identity from the workspace itself. Distinguish Site runtime checkpoint identity from independent Tooling/Task lineage labels.
7. Discover available portable Tooling from the workspace when Tiinex-specific parsing/resolution/validation/package operations are required. Prefer existing qualified Tooling owners over ad-hoc reimplementation. If the environment lacks required execution/network capability, preserve that as an explicit blocker instead of pretending the capability is absent from Tiinex.
8. Before mutation, return or durably record a grounding disposition: recovered Role, current Handoff/Task, current gate, known unresolved authority, and intended first bounded action.

### Baseline Environment

- Project Instructions: not required.
- Prior project chats: not required.
- Prior role conversation: not required.
- Manual semantic coaching: not allowed for a true zero-coaching qualification run; if provided, it must be recorded and downgrades the run classification.
- Network/GitHub: optional capability. Required external material must either be reference-sufficient for the recipient or materially supplied; lack of network must not cause invented repository state.
- Bootstrap file: optional disposable transport orientation only. A bootstrap may summarize these navigation steps, but it is not a Tiinex artifact, semantic authority, Role, Task, or workspace lineage member.

## Consequences

- A "boring" transport message is sufficient when the package/workspace has truthful recipient-relative closure: `Ny current Tiinex/site workspace bifogad. Fortsätt från: <handoff path>`.
- Project Instructions may later be measured as an optimization, never as a hidden prerequisite for baseline trust.
- If a fresh worker cannot locate the role/current task/tooling from these entrypoints, treat that as cold-start affordance debt rather than patching the test with extra coaching.

## Review Conditions

- Reopen if true cold-start pressure shows missing orientation needed by more than one role or if current tooling/package discovery semantics change.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ysVli2OIuwHBW8xfEarkx-6_uBhka_SxIUkKxz_8r9Q