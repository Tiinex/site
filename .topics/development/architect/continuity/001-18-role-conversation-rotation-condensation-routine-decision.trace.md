# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 01:11:00
  - Trace: [Role successor conversation migration](001-11-role-successor-conversation-migration.trace.md)
  - Origin:
    - [relative](001-11-role-successor-conversation-migration.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 16:37:00
  - Authors: Anchor
  - Why: Preserve the working-method refinement that a Role conversation must condense durable value before successor rotation so cold-start recovery does not depend on rereading a long predecessor lineage or mixing stable Role semantics with transient current state.
  - Summary: Make early branch-two condensation a normal predecessor duty before successor Handoff while preserving stable Role identity, separate evidence/decisions, and cold-start-complete routing.
  - Status: accepted/local

---

# Role conversation rotation condensation routine decision

## Decision

- State: accepted
- Subject: conversation-rotation working method for durable Role continuity
- Decision: normal bounded work proceeds in the first conversation lineage; once a long-lived conversation enters an early second branch or otherwise approaches a natural rotation checkpoint, condensation becomes a priority before additional work accumulates. The predecessor must materialize durable new value into correctly typed artifacts, keep stable Role identity/boundary separate from transient current state, preserve decisions/results/observations in their own artifacts, and only then build the successor Handoff. The old conversation becomes optional historical/control evidence rather than operational continuity infrastructure.
- Trust Level: local working-method decision / host-portable intent with current ChatGPT evidence
- Does Not Mean: every chat turn creates an artifact, Role definitions become rolling status documents, historical artifacts may be rewritten to match current understanding, branch count itself is semantic authority, or condensation may collapse uncertainty into canon.

## Rotation Routine

1. Continue normal bounded work while the current conversation remains a healthy operational context.
2. At an early branch-two / lineage-growth / natural successor checkpoint, prioritize durable condensation before starting another large tranche.
3. Materialize new decisions, results, feedback/observations, open gaps, and reusable working methods under their correct semantic owners; do not create one catch-all summary artifact.
4. Keep the Role artifact stable: identity, authority boundary, responsibility, holder relationship, and interpretation limits belong there; current task state and transient host observations do not.
5. Create or refresh only the minimum current-state/continuity projection needed for cold-start orientation, with explicit pointers to deeper authoritative artifacts rather than copied prose.
6. Build a cold-start-complete recipient-relative Handoff whose Required Context contains the material genuinely required for the next bounded responsibility.
7. Start the successor conversation and verify recovery through real bounded work. Use the predecessor only as a comparison/control when a missing inference is suspected.

## Epistemic Boundary

- Condensation reduces reading volume; it must not reduce epistemic precision.
- Observation remains observation, open remains open, conflicting evidence remains conflicting, and accepted decisions remain distinct from proposals or host preferences.
- Existing historical traces are not silently rewritten merely because a newer condensation offers a shorter current-state view.
- If an important working method must be remembered across rotations, prefer a dedicated reusable Process semantics when available rather than copying the method into every Role/Handoff.

## Review Conditions

Revisit when a maintained Process schema can directly own reusable rotation workflow, when host branch/sync behavior changes materially, or when cold-start evidence shows this condensation routine either omits necessary inference or burdens the successor with excessive re-grounding.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:U6MGNvGgu5h6MXbeWccxshQS1TY9TJWDZdphBb9l2P8
