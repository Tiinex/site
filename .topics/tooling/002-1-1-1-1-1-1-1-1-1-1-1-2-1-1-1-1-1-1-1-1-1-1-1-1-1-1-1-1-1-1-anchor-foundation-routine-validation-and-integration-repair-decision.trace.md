# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-01 01:47:00
  - Trace: [Foundation Test Strategy Consolidation — Loom To Anchor](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-foundation-test-strategy-consolidation-return-handoff.trace.md)
  - Origin:
    - [relative](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-foundation-test-strategy-consolidation-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-01 01:47:00
  - Authors: Anchor
  - Why: Accept the aggressive Foundation test consolidation as progression, remove the remaining broad default-test trap for cold recipients, and use the smaller test surface to repair the two inherited schema-validator drifts without reopening broad static work.
  - Summary: Foundation Routine Validation And Integration Repair
  - Status: accepted/local

---

# Foundation Routine Validation And Integration Repair

## Decision

- State: accepted
- Subject: post-consolidation Foundation validation defaults and the next bounded Loom progression
- Decision: Loom's Foundation test-strategy consolidation is accepted as a progression checkpoint. The canonical Site source now has one standalone acceptance entrypoint plus 54 suite-owned current-contract cases, and Anchor independently reproduced 54/54 permanent acceptance plus focused/tooling 4/4 with seven inherited unresolved, six resolved inherited, and zero introduced static regressions.
- Default Test Rule: a generic developer or cold-recipient `npm test` must run the permanent component/use-case acceptance surface or an equivalently bounded routine gate, not `validate:closure`. Integration and closure remain explicit escalation choices tied to purpose rather than default curiosity.
- Cold-Start Validation Rule: recipients should run the narrowest relevant component/use-case suite first and escalate only when the task or closure boundary requires it. The durable Foundation testing strategy remains non-monotonic: new pre-production behavior updates an owned case; standalone regression files remain temporary production-bug evidence unless a distinct invariant justifies permanence.
- Next Repair: after hardening the default command and guidance, Loom may repair exactly the two inherited schema-validator drifts already reproduced by `validate-schema-bindings.mjs` and `check-schema-runtime-projections.mjs`, preserving the accepted Axiom Root/Schema-Contract clarification bytes and without entering the seven larger inherited strict-static owners.
- Observation Boundary: post-cleanup run time and host checkpoints may be recorded as ordinary observations, but this work does not probe, infer, optimize against, or claim knowledge of hidden host-safety controls.

## Basis

- The returned carrier cold-starts preferred-pass with qualified Business, Docs, and Site Workspaces.
- Loom reduced the historical source from 338 standalone `*.test.mjs` files to one standalone entrypoint plus 54 `*.case.mjs` files and reduced profile steps from 3/8/262/273 to 2/4/12/23.
- Anchor independently reran `node tools/foundation-acceptance.test.mjs` at 54/54 in about 9.8 seconds and `focused/tooling` at 4/4 in about 4.0 seconds; canonical ingress source contained zero `.tiinex/**` runtime files.
- The permanent testing lifecycle is now carried in `docs/architecture/foundation-test-strategy.md` and enforced by `tools/foundation-test-suite.contract.case.mjs`.
- `package.json` still maps `npm test` to `validate:closure`, which leaves an avoidable broad-validation affordance for cold LLM recipients even though the historical test corpus has been consolidated.
- The two schema-validator failures are explicitly returned as inherited baseline drift; fixing them is a bounded integration step and a useful ordinary-development sample under the new test discipline.

## Consequences

- Test consolidation itself is no longer a pending task; future work must preserve the one-entrypoint/suite-owned model unless a distinct current invariant proves otherwise.
- Loom should change the generic default test affordance and nearby durable guidance so cold recipients are not encouraged to invoke closure without an explicit closure purpose.
- Loom may repair the two inherited schema-validator drifts and then run only the targeted validators, permanent acceptance/focused gate, and integration needed to demonstrate repair.
- The seven inherited oversized static owners remain a later separate tranche.
- No host-safety mitigation is declared complete yet; Anchor will require representative post-cleanup work/return observations before changing that status.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Foundation Test Strategy Consolidation — Loom To Anchor](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-foundation-test-strategy-consolidation-return-handoff.trace.md)
  - Value: AfvrO5L1RZHSI6Fv80jj0VGe_wLK1W63xGUEONC9K6w

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: S1R1t9Y6RvPf55MJhqTAkigfoptPJrHig1LIM5OUUOA
