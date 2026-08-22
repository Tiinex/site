# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 00:56:00
  - Trace: [Role family identity transition decision](001-8-1-role-family-identity-transition-decision.trace.md)
  - Origin:
    - [relative](001-8-1-role-family-identity-transition-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 01:08:00
  - Authors: Anchor
  - Why: Preserve the newly identified distinction between a human who physically carries a Handoff package and a human who explicitly participates in a Tiinex Role, while keeping future Viewer/package UX data-driven and authority-safe.
  - Summary: Plan human participation context and qualified Role discovery for Handoff package creation without inventing a Courier Role or conflating transport with Handoff endpoints.
  - Status: planned/local

---

# Handoff human participation and Role discovery

## Objective

Define and later qualify one portable, human-readable way for Handoff package creation surfaces to state how the human behind the transport is participating in the current transfer, including a minimum transport-only posture and optional explicit acting Role, without turning physical package carriage into Handoff endpoint identity, holder assignment, delegation authority, acceptance, or semantic ownership.

The same work should let Viewer/package creation discover available Tiinex Roles from qualified `tiinex.party.role.v1` artifacts rather than hard-coding the current role-name set.

## Done Criteria

- Human transport participation is represented separately from semantic Handoff `From`/`To` endpoint declarations.
- A minimum transport-only/courier-style posture can be expressed without creating a new Tiinex Role merely for copy/paste, upload/download, or byte carriage.
- The transport-only posture makes it possible for a recipient worker to know that the human may carry exact package/routing material without becoming a debugger, schema interpreter, technical intermediary, or inferred acceptance authority.
- A human may explicitly select an acting Role/capacity for the current Handoff/session when that is useful; the selection is bounded to the current participation context and does not establish permanent holder identity or general assignment.
- Role selection is driven by discovery of qualified `tiinex.party.role.v1` artifacts and exact readable Role references. Viewer/package code does not require a hard-coded list such as Anchor/Axiom/Loom/Kodax/Sigma.
- Role label, Role artifact semantics, human/party identity, current acting capacity, and transport posture remain distinguishable truths.
- Duplicate, contradictory, unresolved, or unqualified Role candidates remain visible/ambiguous rather than being silently selected by filename, label, package order, or proximity.
- The default package-creation posture can truthfully express no acting Role plus transport-only participation.
- Package-local participation metadata remains disposable transport/session context unless Axiom independently determines that some part has durable canonical semantic value.
- Existing recipient-relative material closure, workspace materialization, provider provenance, package integrity, and Handoff semantic validity remain independent from participation metadata.
- Focused dogfood demonstrates at least: transport-only/no Role; explicit human acting Role; Role discovery from supplied workspace material; ambiguous duplicate Role candidates; package roundtrip preservation; and no promotion of transport participant into Handoff `From`/`To`.

## Scope

This task is architecture/planning authority for a future bounded Axiom/Loom/Kodax decomposition. It does not currently change the canonical Handoff schema, Party/Role schema, package descriptor implementation, Viewer UI, holder/Relation semantics, recipient acceptance state, or product behavior.

Candidate human-facing posture labels such as `transport-only`, `observer`, `collaborative`, or `acceptance` are UX/design hypotheses, not a closed canonical vocabulary in this Task. Only the need for an explicit transport-only/no-Role case is currently required by the observed dogfood workflow.

If implementation pressure shows that participation context changes the durable meaning of a Handoff rather than only transport/session orientation, stop and route the semantic question to Axiom. Loom must not mint canonical Handoff semantics inside transport tooling, and Kodax must not hard-code role meaning into Viewer behavior.

## Dependencies

- [Role family identity transition decision](001-8-1-role-family-identity-transition-decision.trace.md) for the current peer/no-hierarchy, human-handle, and Role-identity boundary.
- [v481 Architect terminal acceptance](../../tooling/dogfood/008-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-v481-architect-terminal-acceptance.trace.md) for the accepted recipient-relative Handoff material-closure/package foundation and disposable transport descriptor boundary.
- Canonical `tiinex.handoff.v1` at `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d`, which separates endpoint identity from endpoint capacity and states that the entity physically carrying a ZIP/message/upload is not a Handoff endpoint unless declared.
- Canonical `tiinex.party.role.v1` authority for Role identity/semantics. Exact successor Role artifacts under Anchor/Loom/Axiom/Kodax/Sigma may be materialized later; discovery must tolerate the current predecessor-role transition state without converting a label into semantic authority.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:QkwrtQuT3o83apqBxq2n7u2-Xgkxv3n6cyqrcoTTm0w
