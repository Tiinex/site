# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 19:08:00
  - Authors: Anchor
  - Why: Close the workflow gap exposed when predecessor-control evidence arose after Role rotation and a proposed Q copy/paste would otherwise have become hidden semantic context outside Tiinex artifacts.
  - Summary: After successor activation, new predecessor evidence that may affect active state must enter through durable artifacts and a bounded Handoff; human transport prose remains routing-only and may not carry the missing semantics.
  - Status: accepted/local

---

# Post-rotation predecessor evidence durable transfer decision

Post-rotation control remains useful, but it must not turn Q into a semantic synchronization layer between Role conversations.

## Decision

- State: accepted
- Subject: new durable evidence discovered by a predecessor conversation after successor activation
- Decision: once a successor conversation has taken active Role ownership, the predecessor conversation is control/reference only. If the predecessor discovers new evidence that may affect active state, that evidence must first be materialized in the appropriate Tiinex artifact and transferred through a bounded Role-to-Role Handoff/package. Human transport prose may identify the package/workspace and exact controlling artifact only; it must not carry the substantive correction, interpretation, or missing context.

## Basis

- The Anchor rotation correctly transferred then-known durable state, but a later predecessor-only scaling control created genuinely new evidence after the successor had already started.
- Asking Q to copy a technical reconciliation paragraph into the successor would make semantic continuity depend on hidden chat context and human interpretation, contradicting the existing Handoff transport boundary and the goal that a cold consumer can recover from durable artifacts.
- A durable observation plus bounded Handoff preserves independent successor disposition: the predecessor can report what it observed without deciding active state, and the successor can accept, narrow, reject, or reconcile it from artifacts.

## Consequences

- Predecessor conversations do not resume ordinary execution after rotation merely because they remain available as controls.
- Post-rotation evidence may create a new bounded Handoff turn when it is material to active state; no semantic payload is smuggled through Q transport text.
- If a successor cannot recover the needed update from the package/artifacts alone, that is a Tiinex continuity gap to fix rather than a reason to add more transport prose.
- This local working-method decision does not define canonical Process semantics; Axiom classification remains separate.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:kxQZGxNtK1MaJYyQokfTNPlJjlGtHLZh64wfXXh_Fbo
