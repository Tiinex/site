# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 01:08:00
  - Trace: [Handoff human participation and Role discovery](001-9-handoff-human-participation-role-discovery.trace.md)
  - Origin:
    - [relative](001-9-handoff-human-participation-role-discovery.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 01:09:00
  - Authors: Anchor
  - Why: Land the current architecture boundary before Viewer or package implementation starts so transport convenience cannot silently become Role, holder, endpoint, acceptance, or delegation semantics.
  - Summary: Human package carriage is participation/session context, not a Role by default; Role selection should be explicit and artifact-discovered, with any canonical semantic expansion routed to Axiom.
  - Status: accepted/local

---

# Handoff human participation boundary decision

This decision establishes the current architecture boundary for future Handoff package human-participation and Role-discovery work; it does not define a final schema vocabulary or Viewer design.

## Decision

- State: accepted
- Subject: human participation context during Handoff package creation and transport
- Decision: do not create a dedicated Courier/Transport Role merely to represent a human who downloads, uploads, copy/pastes routing text, or carries package bytes. Treat that minimum behavior as bounded transport/session participation context, distinct from Handoff endpoints and distinct from an explicitly selected acting Role.
- Role discovery: future Handoff creation surfaces should discover selectable collaboration Roles from qualified `tiinex.party.role.v1` artifacts and preserve exact Role references/ambiguity rather than hard-code current role labels.
- Default: no acting Role is inferred from account name, package uploader, conversation owner, display name, Handoff authorship, or transport action. A transport-only/no-Role posture must remain a valid explicit state.
- Escalation boundary: if future evidence shows that participation context itself carries durable Handoff semantics rather than disposable transport/session orientation, Axiom owns the schema-semantic reconciliation before Loom or Kodax implements that meaning.

## Basis

- Current Handoff authority already separates endpoint identity from endpoint capacity and explicitly rejects inferring an endpoint from the entity that physically sends or receives a ZIP, message, upload, or checkout.
- Current Tiinex dogfood repeatedly uses a human as a byte/prompt carrier between bounded LLM roles. Requiring that human to hold a special transport Role would add semantic identity where no independent capacity is needed.
- The same human may sometimes participate as Sigma or another explicitly selected Role and sometimes perform transport only. Conflating those states would make role/authority inference depend on chat/account/transport accidents rather than declared artifacts.
- The accepted recipient-relative Handoff package already has a package-local disposable transport-control descriptor. That establishes an appropriate architectural class for future session/transport orientation metadata without turning the descriptor into a canonical Tiinex artifact.
- Data-driven Role discovery follows the existing Tiinex architecture direction: schema/artifact meaning owns role identity; runtime/tooling resolves; Viewer presents. A Viewer-specific enum of role names would make the UI a second role authority.

## Consequences

- Human carriage of a Handoff package does not create `From`, `To`, holder, delegation, acceptance, review, or product authority.
- A recipient may use explicit transport-only context to keep requests to the human mechanically bounded, for example exact upload/download/copy/paste steps or direct human observation when deliberately requested; the recipient must not infer that the carrier should debug, reconcile semantics, or mediate technical disagreement.
- Explicit acting-Role selection is per current Handoff/session context unless a separately authoritative artifact establishes a broader holder relationship.
- Candidate posture vocabulary beyond the required transport-only/no-Role case remains provisional until later semantic/product pressure justifies closing it.
- Role discovery must preserve unresolved/conflicting candidates and exact references; a matching label or filename is insufficient semantic authority.
- Loom may later extend portable transport planning/descriptor machinery only within an explicit Handoff and with Axiom review if semantic scope expands. Kodax may later expose the qualified choices in Viewer UI without duplicating discovery or role semantics.
- This decision does not require immediate implementation and does not reopen the terminal v481 package foundation or the closed validation-report material-closure work.

## Review Conditions

Reopen if transport participation proves to require durable semantic truth that cannot safely remain package-local/session-local, if canonical Handoff/Party/Role authority changes the endpoint/capacity boundary, if Role discovery cannot remain provider-neutral and ambiguity-preserving, or if human dogfood shows that transport-only is insufficient to prevent technical-intermediary pressure.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:TycWa7IC7GOw94TxtLxcrA8jS8uBwEe21JwLODwcx4A
