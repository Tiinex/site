# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 08:04:00
  - Authors: Anchor
  - Why: Independently disposition Tooling 016 after replaying Pointer generation/inspection against the returned source and directly checking the pinned canonical Pointer contract.
  - Summary: Accept route-specific package-root tiinex.pointer.v1 projection and fail-closed correlation as a transitional navigation aid while retaining START and the Viewer traversal gap.
  - Status: accepted/local

---

# Tooling 016 Anchor acceptance

## Decision

- State: accepted-bounded
- Subject: canonical Pointer package entrypoint qualification and transitional START coexistence
- Decision: accept Tooling 016's generated package-root `tiinex.pointer.v1` projection, carrier-correlated inspection, and START+Pointer transitional orientation. The Pointer is accepted only as a thin disposable navigation projection to an already qualified Handoff route; package carrier/closure truth remains controlling.
- Migration Boundary: START is not deprecated or replaced by this acceptance. Current cold-consumer orientation continues to require the accepted START projection and the new Pointer projection to agree with package truth.
- Viewer Boundary: portable package validation/traversal of the Pointer is accepted; generic Viewer traversal of canonical `tiinex.pointer.v1` remains unproven and Kodax-owned.
- Trust Level: bounded portable Pointer projection acceptance / no canonical-semantic mutation / no Viewer acceptance

## Basis

- Anchor directly recovered the pinned maintained `tiinex.pointer.v1` schema and confirmed that a destination-list pointer may expose explicit current targets, a destination list does not create Parent continuity, and at least one machine-detectable target is required.
- Independent reruns pass `pointerEntrypoint.test.mjs`, the aggregate portable suite, static validation, and portable smoke.
- Independent orientation of the current 008 Anchor package returns `ready`; START, carrier, Pointer inspection and exact route correlation are valid with zero findings.
- The generated package-root Pointer has no Parent, contains one explicit destination to the exact carried Handoff route, and is rejected when stale/tampered/duplicated/unqualified by the focused adversarial tests.

## Consequences

- Generated root Pointers may remain in recipient packages as validated navigation aids.
- External human transport should continue locating the controlling Handoff directly until an independently qualified successor changes the host-facing contract.
- START remains required during this transitional state.
- No claim is made that ZIP attachment autoruns a Pointer, that Viewer follows it, or that Pointer prose may override carrier/closure route truth.

## Review Conditions

Reopen Tooling 016 if generated Pointer shape diverges from canonical semantics, carrier correlation can be bypassed, route-specific projections become ambiguous, or a separately owned host/Viewer path qualifies a safe START migration.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:JYVoO1A-I8X4QQj0An3ZSel2DffhtmWsx0StzukqlpY