# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 14:02:30
  - Trace: [Grounding Reliability Adversarial Quality — Loom To Anchor Return](005-2-2-1-1-loom-to-anchor-grounding-adversarial-quality-return-handoff.trace.md)
  - Origin:
    - [relative](005-2-2-1-1-loom-to-anchor-grounding-adversarial-quality-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-02 14:20:00
  - Authors: Anchor; Sigma
  - Why: Tranche B passed its authorized adversarial matrix, but the real returned carrier still produces `grounded-to-act` while an upstream declared Parent is unavailable; subsequent human review clarified that a cold-started LLM must not begin substantive work when required continuity to a qualified root cannot be established or carried by a valid compact proof.
  - Summary: Accept Tranche B's bounded hardening while withholding carrier-major promotion and reopening one cold-start continuity/recovery gap before broader CLI work.
  - Status: accepted/local

---

# Cold-Start Continuity And Recovery — Anchor Review

## Decision

- State: accepted
- Subject: Tranche B disposition and cold-start LLM continuity threshold
- Decision: accept Loom's Tranche B role-boundary hardening, malformed carrier-parent fail-closed fix, adversarial matrix, bounded-noise behavior, and qualification evidence as valid local progress, but do not promote the carrier major yet. For a cold-started LLM, `grounded-to-act` requires required artifact continuity to a qualified root, either by resolving the declared Parent chain or by consuming an explicit qualified continuity proof that validly carries that result. A missing or ambiguous required Parent that prevents such proof is blocking; an apparent loaded root created only because its declared Parent is unavailable is not sufficient closure.
- Decision: keep this requirement consumer/context-sensitive rather than making every human interaction eagerly traverse full lineage bodies. Humans may lazy-load historical lineage when prior biological memory and explicit current context make that ergonomically reasonable; Tooling must not pretend an unprovided memory exists for a cold-started LLM.
- Decision: continuity qualification should prove more than it reads. Mechanical Parent-chain proof and compact qualified receipts are preferred over projecting every ancestor body into model context.

## Basis

- Anchor cold-started the returned carrier through the exact Start/bootstrap/`ground` path. The selected route, recipient Role, four Required Context items, all three carried Workspaces, selected route leaf, and current Task frontier qualified.
- The same real receipt reports `lineage.state = resolved-with-upstream-degradation` and exposes `lineage.parent.exactTargetNotLoaded` plus a missing Parent for the loaded 003-era root candidate, yet still returns `grounded-to-act`.
- Loom intentionally treated that older gap as a nonblocking control in Tranche B, so its 0/3 false-block result is internally consistent with the previous acceptance boundary. The later human review changes that boundary for cold-started LLM execution rather than invalidating the rest of Tranche B.
- A cold-started LLM has no trustworthy biological/pre-conversation memory to substitute for an unproven Parent chain. Starting substantive work while required continuity cannot be established would allow an under-grounded model to act on a potentially detached branch.
- Full-body ancestry reads are not required for this guarantee. The existing Parent resolver, exact carried snapshots, integrity state, host-capability machinery, and progressive disclosure provide enough primitives to prove continuity compactly and expand only when an edge is unresolved.
- Missing external material has different operational impact depending on its role. A required Parent/authority/context edge may block; an unavailable historical asset or non-critical external reference may remain visibly degraded without blocking unrelated work.
- Recovery must preserve origin. A fetched or archived representation is not automatically the original source, and semantically similar material must not silently replace an unavailable declared origin.

## Consequences

- Carrier major `005` is not authorized from this return. Continue the current carrier suffix and close one bounded Tranche C before reconsidering a stable grounding checkpoint.
- Loom should harden the shared grounding path so cold-start execution cannot become act-ready when required continuity-to-root proof is broken, including the exact returned-carrier shape that currently surfaces an upstream missing Parent.
- The common human/LLM CLI remains one public path. Do not create a separate LLM CLI. Consumer/host capability and cold-start state may influence recovery/readiness evidence without changing semantic command ownership.
- When required external material is missing, Tooling should project the smallest exact recovery route: use carried/local material first; then a qualified host capability such as an exact connector/public fetch when available; finally block with a precise Transport Operator request when the operator must provide the missing material.
- Recovery instructions must name the exact declared target, why it is required, the allowed scope, and the command/resumption point. They must not tell the consumer to search broadly for something merely similar.
- Retrieved material remains candidate input until its identity/integrity/provenance relation qualifies. `FETCHED` must not collapse into `VERIFIED`.
- Non-critical unavailable assets/references should remain explicit loss/degradation states and should not over-block the user. Required Parent continuity that prevents root qualification is the hard blocking case for cold-start substantive work.
- Reuse existing host-action/cold-consumer/transport primitives where sufficient. Do not expand Viewer TL0–TL4 behavior in this tranche; connected Viewer/local CLI/Copilot ergonomics remain later.
- Handoff package artifact kinds/topology remain locked. No new recipient-facing package artifact kind is authorized.
- Axiom is not required unless implementation exposes a concrete canonical schema contradiction. Sigma human common-CLI acceptance remains later, after deterministic isolated-sandbox behavior is stable.

## Review Conditions

- Reconsider carrier-major promotion only after the exact real-carrier upstream-Parent gap no longer yields cold-start `grounded-to-act` without valid continuity proof, while fully qualified current carriers remain act-ready.
- Reopen if the fix requires full ancestry body projection by default, infers artifact ancestry from filename/carrier/path dimensions, broadens external retrieval scope silently, invents consumer identity solely from sandbox placement, or creates a second normal CLI path.
- Reopen if a missing non-critical asset blocks ordinary work without an evidence-based necessity, or if an unavailable original source is silently replaced by a different representation/origin.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Grounding Reliability Adversarial Quality — Loom To Anchor Return](005-2-2-1-1-loom-to-anchor-grounding-adversarial-quality-return-handoff.trace.md)
  - Value: 4iSwclxnmqpZADMIOWAM1luHbFz8hPv5cJJBGoSGKXM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:YqFGlv2F-evbsSFijfGZcjJFtLHxe0pxtDmsw4fI1e0
