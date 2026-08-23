# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 14:38:00
  - Trace: [Handoff carrier dimensional lineage and human projection decision](../../architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
  - Origin:
    - [relative](../../architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 14:40:00
  - Authors: Anchor
  - Why: Convert the host attachment-budget and carrier-naming findings into bounded Tooling so humans do not choose among helper outputs and parallel recipients can reuse common source bytes without prose overriding package truth.
  - Summary: Standardize rename-safe Handoff carrier filename projection, one-primary human-visible output, and explicit shared-carrier multi-route fan-out while preserving Handoff/package authority boundaries.
  - Status: open/local

---

# Handoff carrier projection, shared-route, and human-output closure

## Objective

Provide portable/shared Tooling that projects human-safe outer Handoff carrier names from package/artifact truth, exposes one obvious primary transport result by default, and can represent one immutable shared carrier with multiple independently qualified Handoff routes so parallel Role work can reuse common workspace/material bytes without requiring one full source ZIP per task.

## Done Criteria

- A deterministic carrier-name projection consumes qualified workspace identity plus an explicit controlling Handoff route and produces the local default `<workspace-name-slug>-<dimension>-<from>-to-<to>[optional-purpose].handoff-package.zip` shape without treating the filename as semantic authority.
- Dimension extraction/allocation remains local readability/pathing only. Tooling never infers Parent/Trace/Origin, completion, acceptance, Role assignment, or authority from the dimension or filename.
- Parallel single-route carriers may legally share one dimension when route labels differ. Filename uniqueness must not force artificial child-dimension allocation.
- Exact filename collisions can be resolved through an explicitly transport-only instance suffix such as `--2`; collision handling must never mutate the Handoff artifact dimension or become lineage semantics.
- Normal Role return exposes one primary human-visible Handoff carrier. Result JSON, workspace receipts, result traces, return-Handoff traces, and verification detail may exist internally or behind explicit diagnostic output but are not separate required human transport choices.
- Cross-device recovery can optionally materialize a disposable minimal transport-text sidecar when the originating conversation is unavailable but Files/new-chat access remains usable. The sidecar is regenerated from package truth, contains no work interpretation beyond the existing transport invariant, and is not emitted as a normal second required deliverable.
- A single-route package must retain enough qualified routing projection to regenerate that transport text without reading the prior conversation; shared-route packages must require an explicit qualified route selection rather than guessing from filename or human memory.
- Shared-carrier fan-out is explicitly represented rather than simulated through human prose: one immutable package may advertise multiple qualified workspace-relative controlling Handoff routes, and recipient selection of one route is verifiable against package truth.
- A shared carrier must not imply that all included Handoffs are accepted, assigned, or active. One recipient route selects one controlling Handoff; package inclusion remains carriage only.
- Common workspace/material/bootstrap bytes are deduplicated across the shared carrier. A three-route fixture demonstrates one package reused with three distinct minimal routing texts rather than three equivalent full workspace packages.
- Shared-route returns remain free to project the same dimensional path when From/To labels distinguish them; Tooling does not allocate unique child dimensions merely for filename uniqueness.
- Existing single-route recipient-relative package manufacture/roundtrip remains green and remains the safe fallback when shared-route qualification is unavailable.
- Host-specific attachment budget values remain configuration/evidence, not canonical constants. The implementation is portable and another qualified consumer can use the same route/name/output projection without ChatGPT-only logic.
- Bootstrap/docs/CLI help explain the current capability and preserve the boundary that outer ZIP renaming is safe while controlling artifact/package truth is authoritative.

## Scope

Outer Handoff carrier name projection, collision-safe transport-instance naming, human output projection, multi-route shared-carrier representation/verification, common-byte deduplication across parallel routes, CLI/portable operation exposure, tests/docs, and directly required package companion/inspection extensions.

Out of scope: canonical Handoff semantic changes; making dimensional lineage a Parent system; canonicalizing `tiinex.zip.v1`; product Viewer integration; Q product acceptance; scheduler/orchestrator semantics; automatically choosing work priorities; changing Role authority; requiring multi-route packages when one single-route carrier is simpler.

## Dependencies

- [Handoff carrier dimensional lineage and human projection decision](../../architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md) owns the local naming/pathing boundary.
- [ChatGPT host transport budget and single-primary-deliverable feedback](../../architect/continuity/001-16-chatgpt-host-transport-budget-and-single-primary-deliverable-feedback.trace.md) owns the observed current host pressure: approximately 60 attachments per three-hour window and one obvious human transport choice.
- [ChatGPT cross-device conversation and Files fallback feedback](../../architect/continuity/001-17-1-chatgpt-cross-device-conversation-files-fallback-feedback.trace.md) owns the observed device-swap condition where prior conversation state may be unavailable while Files and a new conversation remain usable.
- [Tooling 011 Anchor acceptance](011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md) supplies the accepted deterministic workspace manufacturing/bootstrap/roundtrip foundation and must not be reimplemented as a parallel package engine.
- Current Handoff schema/docs preserve that path/filename placement does not imply sender, recipient, responsibility, ownership, semantic parentage, or authority; dimension prefixes remain local allocation/readability convention.
- Loom is the intended implementation/review peer for this Tooling leaf; Anchor retains architecture acceptance, Axiom retains canonical schema semantics, Kodax retains Viewer integration, and Sigma/Q retain separately requested product/host acceptance.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:oH9rr6_XB21lC8GFtWIFNS3huyBsUOKqWS43pMXvTkQ
