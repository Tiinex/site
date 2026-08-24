# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 09:03:00
  - Authors: Anchor
  - Why: Remove the remaining cold-consumer ambiguity between preserving exact structured Tooling evidence for review and emitting the intentionally minimal normal human return surface.
  - Summary: Structured `humanOutput` is machine/review evidence; normal human completion emits only the sole primary Handoff package plus exact adjacent `humanOutput.normalInlineRouting.content`, with no full structured-object display requirement.
  - Status: accepted/local

---

# Human-output review evidence versus normal emission boundary

The Tooling result may remain richly structured for machines and review while the ordinary human transport surface stays deliberately minimal. Evidence preservation and human emission are different obligations.

## Decision

- State: accepted
- Subject: Tooling human-output machine/review evidence versus normal human emission
- Decision: when a Handoff manufacture or read-only carrier projection returns `humanOutput.status: ready`, the normal human completion surface is exactly `humanOutput.primary` as the sole package attachment/choice plus the exact bytes of `humanOutput.normalInlineRouting.content` rendered adjacent. The full `humanOutput` object, `selectedRoute`, fallback metadata/content, receipts, audits, result traces, and internal validation objects may be retained as machine/review evidence but are not additional normal human display requirements.
- Evidence Rule: language such as "include/preserve the exact Tooling output object as evidence" means keep or cite the exact structured result in durable review evidence when needed; it does not mean render that whole object to Q during normal transport completion. When a task needs human-visible structured diagnostics, that requirement must be explicit and separate from the normal Handoff return contract.
- Presentation Rule: host copy affordances, fences, cards, attachment widgets, or equivalent surfaces are presentation-only. They may wrap the exact normal routing bytes but must not rewrite them or promote presentation metadata into canonical/package authority.

## Basis

- Tooling 018 already marks the normal inline projection as required normal emission and the fallback sidecar as non-normal. Its help/bootstrap text tells a cold consumer to use the sole primary package and render `normalInlineRouting.content` adjacent.
- Fresh Loom 008-2 correctly manufactured and returned the package plus routing block but also displayed the exact structured `humanOutput` JSON after being told that the exact Tooling object was required external completion evidence. That interpretation was defensible under the mixed wording and therefore exposes a contract ambiguity rather than mere Role forgetfulness.
- The Known Role worst-case policy requires ambiguous behavior to be corrected durably and demonstrated later by a fresh consumer, not coached in place and counted as qualification.
- The human transport projection is explicitly non-authoritative. Narrowing normal human presentation to its declared primary-plus-inline fields changes no canonical Handoff, Pointer, Role, Workspace, Source, Parent, assignment, acceptance, or package-identity semantics.

## Consequences

- No Tooling 018 implementation correction is required solely for the extra JSON observed in Loom 008-2. Tooling 018 is independently accepted at its bounded mechanics in `018-1-handoff-human-output-normal-emission-anchor-acceptance.trace.md`.
- Future tasks, results and Handoffs in the current trust tranche should distinguish "preserve/inspect exact structured Tooling evidence" from "emit normal human transport" so a cold Role is not pressured to expose both.
- A normal qualifying return that displays the full structured object as an additional completion artifact remains a human-surface qualification finding even when the underlying package is valid.
- A fresh later consumer must demonstrate this clarified boundary without Q teaching it in-session. The clarification itself does not qualify Loom, Anchor, Axiom or Kodax.
- Optional sidecars remain fallback-only, and internal evidence remains available for diagnosis/review without becoming a second human transport choice.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:bfvPCN-VrNqSLFMgqlu2TkYImI5ZdE6rJluYUNSfUf4
