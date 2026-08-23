# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 16:06:00
  - Trace: [Handoff package cold-consumer entrypoint and multi-workspace feedback](../../architect/continuity/001-17-2-handoff-package-cold-consumer-entrypoint-and-multi-workspace-feedback.trace.md)
  - Origin:
    - [relative](../../architect/continuity/001-17-2-handoff-package-cold-consumer-entrypoint-and-multi-workspace-feedback.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 16:39:00
  - Authors: Anchor
  - Why: Convert the accepted cold-consumer/multi-workspace feedback into bounded portable Tooling only after Tooling 012 independently closed shared-route recipient qualification and human carrier projection.
  - Summary: Add a parseable package-local cold-consumer entrypoint generated from package truth and make Handoff orientation/projection structurally 1..N-workspace capable without forcing multi-workspace packaging or Viewer-specific behavior.
  - Status: open/local

---

# Handoff package cold-consumer entrypoint and multi-workspace projection

## Objective

Make a recipient-relative Handoff package independently orienting for a completely cold qualified consumer that has the ZIP but no usable predecessor conversation, while preserving single-workspace as the ergonomic default and avoiding structural assumptions that a Handoff carrier can only expose one workspace.

## Done Criteria

- A package-local human/LLM entrypoint is present at an obvious maintained path, with `tiinex.package/START.md` as the current candidate unless implementation review finds a better existing package convention.
- The entrypoint is reliably parseable from supplied package bytes. It contains a bounded structured projection rather than requiring heuristic extraction from free-form prose; human-readable orientation may accompany the structured form.
- The structured projection is generated from qualified package truth and models `workspaces[]` plus route(s). Each route binds an exact workspace id to an exact workspace-relative controlling Handoff artifact.
- Entry-point text/structure carries no semantic authority. Inspection recomputes or correlates it against package/closure/carrier truth; missing, stale, tampered, ambiguous, or mismatched projection fails closed or is explicitly degraded rather than overriding package truth.
- A completely cold portable consumer can discover the entrypoint, identify available workspace(s), select a qualified route when necessary, and reach the exact controlling Handoff without predecessor-chat prose or filename inference.
- Normal single-workspace packages remain simple: one workspace in `workspaces[]`, one implicit qualified route where applicable, one primary carrier file, and no normally required second transport-text attachment.
- Multi-workspace is a first-class representation capability, not a mandatory packaging policy. A bounded pressure fixture represents at least two qualified workspace materializations and verifies route-to-workspace binding without assuming `package == exactly one workspace`.
- Human carrier filename projection remains route-local. If one immutable multi-workspace/shared package exposes routes in different workspaces, selecting a route may project that selected workspace's readable slug without changing package bytes or authority.
- Existing Tooling 011 single-route manufacture and Tooling 012 shared-route/Required-Context qualification remain green. Do not create a second package engine merely to satisfy the entrypoint.
- Current Node/CLI manufacturing may retain a one-workspace ergonomic fast path if broad multi-root filesystem authoring is not required to prove the plural package/projection contract in this leaf. Any remaining multi-root authoring gap must be explicit rather than hidden by singular schema fields.
- Bootstrap/docs/operation help explain cold-consumer startup: received package code is not executed merely to inspect orientation; readable package files remain sufficient when runtime execution is unavailable.

## Scope

Portable package-local cold-consumer orientation, structured START projection, package inspection/correlation, plural workspace/route projection where existing package truth supports it, focused multi-workspace fixtures, bootstrap/docs, and directly required operation/CLI surfaces.

Out of scope: Viewer UI/product activation prompts; hard-coding ChatGPT or another provider as consumer identity; changing canonical Handoff semantics; merging Tiinex/site and Tiinex/docs progress into one package by default; canonicalizing `tiinex.zip.v1`; building a general scheduler/orchestrator; Process-schema work; Q product acceptance.

## Dependencies

- [Tooling 012 Anchor acceptance](012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md) is the accepted route/human-projection foundation and must remain green.
- [Handoff package cold-consumer entrypoint and multi-workspace feedback](../../architect/continuity/001-17-2-handoff-package-cold-consumer-entrypoint-and-multi-workspace-feedback.trace.md) owns the product/host design signal and single-default/plural-capability boundary.
- [ChatGPT cross-device conversation and Files fallback feedback](../../architect/continuity/001-17-1-chatgpt-cross-device-conversation-files-fallback-feedback.trace.md) supplies current host evidence that Files + new chat may be usable while predecessor conversation state is unavailable.
- [Handoff carrier dimensional lineage and human projection decision](../../architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md) preserves rename-safe, non-authoritative outer carrier naming.
- Tooling 011 remains the accepted deterministic manufacturing/bootstrap/roundtrip base; this task composes it rather than rebuilding it.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:xj8yTwUYIVhxWRUuKPfnqP-AeuNB6izkUUwFg5ys8L0
