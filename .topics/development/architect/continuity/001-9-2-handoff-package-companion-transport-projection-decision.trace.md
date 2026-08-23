# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 01:08:00
  - Trace: [Handoff human participation and Role discovery](001-9-handoff-human-participation-role-discovery.trace.md)
  - Origin:
    - [relative](001-9-handoff-human-participation-role-discovery.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/1bf8c78dba5496ab1955b965b1f2f43b4f4d3430/.topics/development/architect/continuity/001-9-handoff-human-participation-role-discovery.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 02:06:00
  - Authors: Anchor
  - Why: Dogfood showed that a technically packaged Handoff could still require a large bespoke carrier prompt, creating a second hidden operational-context channel and making a fresh recipient depend on the sender's prose rather than package-derived truth.
  - Summary: Put human/LLM transport templating in a non-authoritative Handoff transport-package companion/projection layer, with language-neutral actions and progressive localized presentation, rather than carrying operational semantics in bespoke prompts.
  - Status: accepted/local

---

# Handoff package companion transport projection

## Decision

- State: accepted
- Subject: shared human/LLM transport instructions for recipient-relative Handoff packages
- Decision: treat transport instruction templating as a reusable, non-authoritative companion/projection of the Handoff transport-package contract rather than as hand-written routing prose or a Viewer-only template. The companion consumes package/Handoff/participation truth and emits a minimal language-neutral transport action model that presentation layers may localize and progressively disclose.
- Companion ownership: prefer schema-adjacent/package-contract companion ownership so LLM, CLI, Viewer, future MCP/LSP/agent adapters, and other hosts can consume one shared projection instead of independently reinterpreting Handoff transport semantics.
- Authority boundary: the companion may select, order, label, summarize, and explain already-qualified package/Handoff facts. It must not redefine Handoff `From`/`To`, Completion Expectation, Role meaning, provider/source authority, workspace completeness, acceptance, or package material truth.
- Package-contract boundary: current Site code exposes `tiinex.portable.handoff-transport-package.v1` and `tiinex.transport.handoff-material-closure-descriptor.v1` as runtime transport contracts, while the canonical schema hierarchy currently contains `tiinex.handoff.v1` but no independently qualified canonical transport-package schema artifact. Implementation may attach a non-authoritative companion to the existing runtime package contract or materialize an explicitly bounded local/runtime schema projection when technically appropriate, but must not invent canonical Tiinex schema authority merely to obtain a convenient directory shape. Any durable semantic/schema expansion routes to Axiom.

## Transport Projection Contract

The shared projection should be able to represent at least:

- controlling/recipient Handoff entrypoint by exact package-local identity or qualified reference;
- human participation posture, including the required transport-only/no-acting-Role state without promoting the carrier into a Handoff endpoint;
- explicit acting Role reference when separately selected and qualified;
- language-neutral carrier action identifiers such as upload/provide package, copy/paste a minimal recipient invocation when the host requires one, and carry/download the returned package;
- package state or blocker that prevents a safe minimal handoff;
- optional progressive-disclosure details for a newcomer without changing the expert fast path;
- localization keys/parameters rather than embedded Swedish, English, or role-specific prose in the portable core.

A normal successful transport should not require the human to restate the work, explain workspace/reference-material authority, interpret schemas, debug implementation, reconcile contradictions, or manually reproduce Completion Expectation already present in the controlling Handoff.

## Human-Facing Presentation Principles

- Put the next actionable transport step first; do not require a summary label such as `TL;DR` when the ordering already provides the summary behavior.
- Prefer delta/new information over repeating context already established by the package or prior step.
- Use progressive disclosure: the safe beginner path and the fast experienced path should be the same path, with explanation available on demand rather than mandatory before action.
- Keep downloadable material immediately adjacent to the exact copy/paste or action it belongs with, and group the final transport controls together so a carrier can act without rereading the full explanation.
- Prefer calm sentence-case/lower-intensity labels over command-like all-caps presentation. Optional icons or point-of-interest markers may improve scanning but are presentation aids, not semantic tokens.
- Copy/paste text generated for hosts that still need text should be short, exact, and code-block friendly. The minimal ideal is equivalent to `Use the uploaded Tiinex Handoff package.`; any additional instructions must be justified by package/host capability rather than sender memory.

## Basis

- The accepted human-participation boundary already makes transport-only/no-Role a valid state and identifies the package-local disposable transport-control descriptor as the appropriate architectural class for session/transport orientation metadata.
- Current recipient-relative Tooling already builds and round-trips package-local closure descriptors, exact required/reference material carriers, workspace materializations, provider provenance, and package integrity without converting transport metadata into semantic Handoff authority.
- Site already has schema companion machinery whose role is presentation/read guidance over schema-owned meaning rather than semantic redefinition, and portable Tooling already describes data-only LLM companions that may prioritize/explain without changing validation semantics.
- Site already has i18n provider/resolve infrastructure and Swedish/English locale trees; transport wording should therefore be a presentation concern over stable language-neutral action ids rather than portable core strings.
- Dogfood failure: a proposed fresh-Loom transport still depended on a large custom `TRANSPORT.md`/copy-paste prompt explaining current workspace, reference material, role grounding, human posture, and return behavior. Q rejected that transport as non-minimal hidden context. The rejection is retained as product/architecture evidence that packaging completeness alone does not yet provide a sufficient human transport projection.

## Consequences

- Do not send the rejected bespoke Loom transport as the cold-start qualification package.
- The next bounded shared-Tooling leaf should implement/qualify the package companion/projection seam before another fresh-role transport attempt.
- Loom should own portable package/companion/projection mechanics. Kodax may later render the same projection in Viewer/package UI. Site i18n may provide localized labels/messages. Neither surface owns the underlying transport semantics.
- A fresh recipient should ultimately be testable with only the package plus the smallest host-required invocation. If additional prose is necessary, the system should expose exactly which structured truth or host capability is missing instead of silently compensating with sender-authored context.
- Transport presentation quality should be pressure-tested for both first-time and experienced human carriers; this remains product/presentation evidence and does not upgrade semantic Handoff authority.

## Review Conditions

Reopen if canonical package/schema authority is materialized in a way that changes companion ownership, if a companion cannot remain non-authoritative while producing sufficient transport orientation, if host behavior proves that structured package-local orientation cannot replace bespoke prompts, or if transport participation needs durable semantics beyond the accepted session/transport boundary.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:aHS6N44PUyNb5GvUWA_gmz7avsDn6shWzAvWiZiSY44
