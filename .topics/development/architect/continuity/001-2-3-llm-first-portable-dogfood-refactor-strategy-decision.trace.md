# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:22:00
  - Trace: [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
  - Origin:
    - [relative](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/61fb68948831c8a601d999264cf1424ef09cd14c/.topics/development/architect/continuity/001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 11:13:00
  - Authors: Anchor
  - Why: Make the current refactor execution/testing strategy durable: artifacts remain human-first, while shared implementation is deliberately pressured LLM/portable-first to reduce Q regression friction and prevent Viewer-only private semantics before later product integration.
  - Summary: Keep Tiinex artifacts human-first while running the current refactor LLM/portable-first: qualify shared semantic/runtime capabilities through fresh-role dogfood and adversarial Tooling before Viewer integration, then reserve Q actual-path QA for coherent product tranches and exit pressure.
  - Status: accepted/local

---

# LLM-first portable dogfood strategy for the current refactor

## Decision

- State: accepted
- Subject: current refactor execution order, shared capability pressure, Viewer integration, and Q QA timing
- Decision: Tiinex remains human-first in artifact expression and ownership, while the current refactor should proceed LLM/portable-first operationally. Shared semantics and mechanics are dogfooded through fresh Roles, portable Tooling, adversarial tests, roundtrip/reconstruction, and cross-role review before Kodax integrates them into Viewer. Q actual-path QA is reserved for coherent product milestones and final exit pressure rather than used as first-line validation for mechanical/shared regressions.
- Consumer parity principle: host-specific UX may differ, but a semantic capability needed by Viewer should normally be available through shared/portable logic to another qualified consumer. If Viewer can perform a Tiinex-semantic operation only because it contains private interpretation that an LLM/portable consumer must guess or reimplement, treat that as evidence of a missing shared capability unless a genuine host-only boundary is established.

## Basis

- Q identifies manual actual-path testing as the largest current refactor friction block and is explicitly using the new workflow to measure whether LLM/Tooling-first pressure reduces regressions reaching human QA.
- Fresh Anchor and Loom successor runs already exposed defects that long-lived conversations could hide: schema material closure, transport steering, workspace/artifact routing, carrier-purpose ambiguity, and package projection needs. These are cheaper and more reusable to correct before Viewer product QA.
- The current refactor already contains substantial shared runtime/source/schema/creation/lineage/package machinery. Integrating unstable or duplicated semantics into Viewer early would create parallel owners and make later parity recovery harder.
- [Q PoC versus refactor product-feel feedback](001-2-2-q-poc-refactor-product-feel-feedback.trace.md) shows why human product pressure remains essential later: automated/LLM evidence can qualify truth mechanics but cannot replace product rhythm, spatiality, obvious action, and actual-path observation.

## Consequences

- Shared-first work order should normally be: canonical authority where needed -> portable/shared implementation -> LLM/fresh-role dogfood -> adversarial/regression/reconstruction -> independent peer review -> stable contract -> Viewer consumption -> coherent Q actual-path QA.
- Kodax integration should present/consume qualified shared capabilities rather than become the place where semantic capability secretly originates. Viewer-specific interaction and presentation remain legitimate Kodax ownership above the shared contract.
- Q testing should become less frequent, more coherent, higher-value, and more product/host focused. A desirable signal is fewer Q-discovered mechanical/semantic regressions while the remaining Q observations become more about behavior humans uniquely judge.
- Repeated Q steering, Role memory workarounds, sender-authored transport explanation, or Viewer-only semantic heuristics are diagnostic signals for missing artifacts, qualification, or shared Tooling rather than normal collaboration infrastructure.
- Shared logic need not reach theoretical perfection before Viewer work begins; it is Viewer-ready when a fresh qualified consumer can use it from durable material without hidden steering, authority/blocker states are explicit, behavior is reproducible, and the abstraction has concrete multi-consumer value.

## Review Conditions

Revisit if LLM-first pressure demonstrably delays product discovery more than it reduces Q regression friction, if a capability is proven inherently Viewer/host-specific rather than shared, if Q actual-path evidence reveals critical product risk that requires earlier integration, or if refactor parity/exit metrics show the sequencing no longer reduces uncertainty.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:iu9j1eb1Xn0PUfLdRP_DqOUZta4Fr9BpdM1gHC5s_cA
