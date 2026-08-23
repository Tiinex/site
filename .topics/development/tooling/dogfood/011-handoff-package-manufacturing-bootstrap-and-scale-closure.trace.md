# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 12:38:00
  - Trace: [Handoff package bootstrap and manufacturing feedback](../../architect/continuity/001-14-handoff-package-bootstrap-manufacturing-feedback.trace.md)
  - Origin:
    - [relative](../../architect/continuity/001-14-handoff-package-bootstrap-manufacturing-feedback.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/refactor/.topics/development/architect/continuity/001-14-handoff-package-bootstrap-manufacturing-feedback.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 12:38:00
  - Authors: Anchor
  - Why: Convert the concrete cross-workspace bootstrap/manufacturing and terminal package-scale dogfood gaps into one bounded shared-Tooling leaf before broader Role cold-start migration depends on them.
  - Summary: Make recipient-relative Handoff package manufacturing portable, discoverable, workspace-agnostic, bootstrap-qualified, and operationally bounded without manual LLM carrier enumeration.
  - Status: open/local

---

# Handoff package manufacturing, bootstrap, and scale closure

## Objective

Provide one ordinary portable/shared manufacturing path that can build and verify a recipient-relative Handoff package from a qualified current workspace and Handoff/context inputs without requiring an LLM to manually enumerate package carriers or rely on Site being the current workspace to obtain portable Tooling bootstrap capability.

## Done Criteria

- A normal portable operation and/or stable CLI surface exposes recipient-relative Handoff package manufacturing; callers do not need to import implementation-private builders or hand-assemble the final package topology.
- The manufacturing path can start from at least one non-Site current-workspace fixture and produce qualified workspace identity plus exact workspace-relative controlling Handoff routing with no carrier-relative routing leakage.
- Workspace enumeration/materialization is deterministic and bounded, produces completeness evidence from the enumeration owner rather than caller assertion, and does not require an LLM to construct one entry object per file manually.
- Tooling bootstrap delivery policy is explicit for non-Site current workspaces. A fresh recipient can discover/use the portable LLM Tooling needed to inspect/continue the package without assuming `Tiinex/site` is the current workspace. The solution must keep transport-orientation bootstrap, portable Tooling bootstrap, and canonical schema-material bootstrap as distinct semantic concerns.
- Embedded versus persistent Tooling bootstrap behavior, if both are supported, is verifiable and cannot promote ordinary package/workspace bytes into runtime/bootstrap authority by filename or co-location.
- Existing recipient-relative closure, workspace correlation, material authority, companion routing, participation, ambiguity, and roundtrip boundaries remain green.
- Package-scale behavior is pressure-tested against a carrier count comparable to the Tooling 010 return (~1,284 entries) or a reproducible equivalent. The result must either complete within the available bounded test/runtime budget or return a precise bounded limitation with an implemented reduction in avoidable repeated enumeration/file-map/roundtrip work.
- Portable bootstrap/operation documentation and operation catalog reflect the resulting current capability; stale claims that canonical Handoff generation is simply unavailable are corrected without implying stronger canonical semantics than the implementation provides.
- Return contains durable Loom result/evidence plus a complete independently groundable recipient-relative Handoff package for Anchor. No changed-only continuity return.

## Scope

Shared portable Handoff package manufacturing, workspace enumeration/materialization, Tooling bootstrap carriage/qualification, operation/CLI discoverability, deterministic package verification, scale pressure, and directly required tests/docs.

Out of scope: changing canonical Handoff semantics; redefining Role or Party schemas; making Site product UI consume the new operation; Q product QA; arbitrary archive optimization unrelated to Handoff manufacturing; collapsing all bootstrap concepts into one authority class; or introducing a host-only solution that another qualified portable consumer cannot use.

## Dependencies

- [Handoff package bootstrap and manufacturing feedback](../../architect/continuity/001-14-handoff-package-bootstrap-manufacturing-feedback.trace.md) owns the reproduced gap and interpretation boundary.
- [Tooling 010 Anchor acceptance](010-1-party-role-schema-material-authoring-closure-anchor-acceptance.trace.md) closes the prior schema-material leaf and preserves its provider/bootstrap regressions.
- `src/tooling/portable/handoff/materialClosure.package.js`, `src/export/handoff.plan.js`, `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`, `src/tooling/portable/schema/bootstrap/**`, `src/tooling/portable/transfer/transfer.plan.js`, and `tools/tiinex-portable.mjs` are current candidate owners/surfaces; their existing boundaries remain evidence, not mandatory implementation shape.
- [Current Loom Role](../../loom/role/001-loom-role.trace.md) is successor seed material for the fresh-conversation run; [qualification deferred](../../architect/continuity/001-11-1-loom-successor-qualification-deferred-decision.trace.md) means this Task is also the first real Loom cold-start pressure leaf, not proof of qualification before review.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: TI7xQ6Gn6pDqZWw4ntlIvFGP1OvZG6nTLpvsEsTPpso
