# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:25:00
  - Trace: [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
  - Origin:
    - [relative](005-tooling-first-foundation-ergonomics-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:30:00
  - Authors: Anchor; Sigma
  - Why: The executable entry file is already tiny, but ordinary grounding and CLI use still expose too much specialist machinery and allow a recipient to become confidently under-grounded unless current authority, leaves, uncertainty, and next action are composed explicitly.
  - Summary: Grounding Reliability, Common CLI Surface And LLM Ergonomics
  - Status: draft/local

---

# Grounding Reliability, Common CLI Surface And LLM Ergonomics

## Objective

Make one human-first, use-case-oriented Tiinex CLI surface serve both humans and LLMs over the same canonical portable operations, while making grounding self-checking enough that a recipient cannot treat partial orientation as sufficient current-state coverage without that limitation being explicit.

## Done Criteria

- Grounding composes existing authority routing, exact loaded artifact-lineage leaf discovery, declared current-work signals, blocker/gate evidence, and explicit missing/ambiguous coverage into one bounded decision-oriented projection rather than requiring a model to infer readiness from roots, README, executive summaries, or operation familiarity.
- The grounding projection distinguishes at least known/qualified evidence, bounded inference, unresolved/unknown state, and human-only gates where those distinctions affect action.
- The grounding projection emits an explicit readiness state equivalent to `grounded-to-act`, `grounded-to-discuss`, or `insufficient-grounding`, with the smallest reasons and missing evidence needed to understand that state; wording/schema naming may differ if the same contract is preserved.
- A recipient that has only roots/reception/executive material while relevant current leaves are unavailable must not receive an act-ready projection merely because high-level authority routing succeeded.
- Current leaf topology is derived from declared Parent/artifact lineage using the shared resolver/search machinery; filename dimensions, carrier dimensions, lifecycle labels, branch names, or directory depth must not be substituted for semantic leaf topology.
- Grounding remains bounded and progressive: ordinary output contains the decision-relevant receipt and pointers/identities, while large bodies and broad inventories are explicitly requested only when needed.
- The public CLI has one taught invocation model for humans and LLMs. There is no separate LLM CLI, hidden LLM alias language, or parallel API-shaped CLI vocabulary that users must learn as a second normal path.
- Human-first command syntax is therefore also the LLM common path. Commands are organized around ordinary user intents/use cases with natural positional input and safe defaults where qualified authority exists.
- The rich portable operation catalog remains the canonical internal/shared implementation substrate. It may remain programmatically available for implementation, diagnostics, tests, or compatibility, but the accepted CLI surface must not require users or LLMs to choose raw internal operation names as a competing normal invocation path.
- Existing Handoff intents such as orientation, receipt/continuation, validation, and manufacture are reconciled into the same common CLI grammar rather than duplicated as independent human-versus-LLM routes.
- Default output is bounded and useful for the next decision. Large schema bodies, broad finding arrays, full operation catalogs, and other context-heavy detail are opt-in unless the operation genuinely requires them.
- Common error output names the intent/target, blocked/degraded/ambiguous state, and the smallest useful recovery direction without dumping unrelated internal state.
- The recipient-facing Handoff package ZIP/Markdown topology and its existing artifact kinds are locked for this track. No new package artifact kind or new recipient-facing package topology is introduced without explicit Sigma approval routed through Anchor.
- Viewer-specific behavior remains downstream. Viewer consumes qualified shared Tooling primitives after they are stable; it must not become the private implementation of grounding, lineage, validation, or source truth.
- Measure representative human/LLM flows before and after the common path using command count, emitted bytes/context, required recovery steps, and false-green/false-blocked grounding outcomes where fixtures can exercise them.
- Focused/tooling, integration, Foundation, static-regression, applicable CLI/Handoff contract tests, and a bounded regression for the observed partial-grounding failure mode remain green; strict dependency-bound closure is reported separately when host availability blocks it.

## Scope

- Shared portable grounding composition, portable CLI adapter/help/input/output façade, bounded common-path projections, and measurement of ordinary operational/context cost in `Tiinex/site`.
- Reuse existing lineage resolver/search, cold-start grounding/qualification, operating-overview evidence, package qualification, schema/runtime owners, and `runPortableOperation` machinery where their contracts are already sufficient.
- Prefer composition and deletion of duplicated ceremony over adding another persistent subsystem.
- Internal module count or source-line reduction is not the primary metric: trustworthy grounding, one public CLI model, and low user/context burden are.
- Do not redesign canonical schemas merely to simplify command names or add a grounding receipt when an implementation-level projection contract is sufficient.
- Do not create a second semantic runtime, duplicate lineage logic, infer currentness from filename/carrier dimensions, or weaken fail-closed qualification for convenience.
- Do not implement Viewer PoC parity in this Task; Viewer recovery consumes the qualified Tooling primitives afterward.

## Dependencies

- [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
- [Site Branch Authority Grounding](005-1-site-branch-authority-grounding-task.trace.md), whose carried README/`llms.txt` candidate is locally validated before this implementation tranche.
- Existing `tools/tiinex-portable.mjs`, CLI adapter/help/input/output seams, operation catalog, bounded summary projection, cold-start grounding/qualification, operating overview, and lineage resolver/search.
- Current Anchor grounding retrospective: authority routing was recoverable, but current-leaf coverage and readiness inference were insufficiently self-checking and allowed generic model assumptions to displace Tiinex-specific meaning.
- Business Viewer PoC Parity Recovery demand map; Viewer implementation itself remains later.

## Acceptance Focus

- Deterministic Tooling must prove machine-verifiable grounding composition, fail-closed states, command routing, output bounds, and no semantic fork before Sigma is asked to judge human CLI quality.
- Sigma acceptance later evaluates whether an ordinary human can understand and use the same common CLI path an LLM is taught, without needing the internal operation catalog or repository archaeology.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
  - Value: jw4P4fYtwsJFltZP-iRKrzsQMWMyOpXliDB_2mBn48M

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: oc-F2HZIYWGxihsBjQZU4A95-Y5OGWP3ryuEL1jKMv0
