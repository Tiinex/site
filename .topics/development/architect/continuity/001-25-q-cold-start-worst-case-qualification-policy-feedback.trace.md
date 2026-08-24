# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 08:50:00
  - Authors: Anchor
  - Why: Preserve Q's explicit qualification policy that known-Role reliability is judged from fresh cold starts rather than coached or context-warmed continuations, so the trust standard survives conversation rotation and does not depend on hidden chat memory.
  - Summary: Q requires fresh-project, fresh-conversation Role qualification during the current trust tranche; same-session correction is diagnostic only, and every transport may be used as a worst-case cold-start stress probe until the Tooling/Handoff routine is reliably boring.
  - Status: draft/local

---

# Q cold-start worst-case qualification policy feedback

## Feedback Target

- Target: the current Known Role cold-start trust closure, especially how Anchor, Axiom, Loom and Kodax qualification evidence is collected and when Q is willing to call Tooling/Handoff behavior reliable.

## Feedback Received

- Q is willing to start a new, fresh LLM project/conversation for every transport during the current trust phase so each route doubles as an actual-path cold-start probe.
- A same-session correction does not qualify the corrected behavior. The corrected implementation or routine must survive a later fresh cold start without Q re-teaching the behavior inside that session.
- Q's working assumption is asymmetric: if a cold-started Role repeatedly succeeds from package truth plus minimal host activation, a medium/warm-started Role should not be harder. Qualification therefore designs for the worst case rather than relying on remembered context.
- When a fresh Role exposes friction, ambiguity or output drift, the finding should be made durable and corrected in Tooling/Handoff/Role materialization as appropriate, then re-tested through another fresh route rather than coached into compliance and counted as PASS.
- Q explicitly prioritizes this brute-force reliability work over additional feature expansion until the known-Role routine is trustworthy. The objective is operationally boring transport: correct grounding, bounded work, Tooling-owned return output, and no human semantic courier work.

## Source

- Q actual-path operating policy stated during the Tooling 018 cold-start qualification sequence after repeated Loom transport-output drift despite otherwise correct package manufacturing and regressions.

## Disposition

- State: accepted-for-current-trust-qualification-policy
- Follow-Up: treat each next known-Role transport as a fresh-project qualification probe when feasible; record failures durably, route corrections normally, and require a later fresh Role to demonstrate the correction before qualification.
- PASS Rule: no Role is considered qualified merely because a coached continuation or the implementation author can produce the right output. The qualifying evidence is an uncoached fresh Role operating from the current package contract.

## Limits

- This feedback sets the evidence standard for the current dogfood/trust tranche; it does not claim every future host/model version is permanently qualified after one successful run.
- Fresh-project qualification does not replace package integrity, source authority, context audit, Role-boundary or semantic correctness checks; it adds actual-path behavioral pressure on top of them.
- Warm context may help in ordinary use, but it is not qualification authority during this tranche.
- This feedback does not itself accept Tooling 018, qualify Loom, or close the Known Role cold-start trust task.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:RqiaI2qpPOiVx1DrJk7z24HXVzQSz_aHuJd4dJZbE9Q
