# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-25 01:10:00
  - Authors: Anchor
  - Why: Remove the real-workspace v2 manufacture performance blocker without changing accepted carrier semantics or current/default v1 behavior.
  - Summary: Tooling 027-5-6 — make archive-backed v2 manufacture avoid mandatory full exploded-v1 workspace materialization, preserve all accepted conformance/closure semantics, and qualify the real Tiinex/site full-workspace candidate path inside the host execution budget.
  - Status: open/local

---

# Tooling 027-5-6 — direct v2 manufacture performance correction

## Objective

Correct only the archive-backed v2 manufacture pipeline so a real complete Tiinex/site workspace can reach the accepted v2 representation without first constructing the entire workspace as an exploded current/v1 transport package.

## Done Criteria

- Preserve the current/default `manufacture-handoff-package` v1 path unchanged in public semantics, serialized topology, route qualification, and existing regressions.
- Refactor only the explicit v2 manufacture path so complete Workspace/archive qualification can consume the already enumerated qualified complete workspace materialization directly rather than requiring all workspace bytes to be materialized and processed as exploded v1 carrier files first.
- Reuse existing v1 planning/closure/selected-route semantic owners; do not create a parallel Handoff meaning, requirement parser, provider model, or route-selection authority.
- Preserve exact v2 Workspace target conformance from Tooling 027-5-4: registered `tiinex.workspace.v1`/Root validation, verified primary c14n-v2 self integrity, and qualified Parent-target continuity when Parent exists.
- Preserve exact complete-archive evidence. A partial workspace must never become complete because the optimized path needs fewer bytes or less work.
- Preserve archive/provider/dedup/path-safety/tamper/outer-file-map/Pointer/START/bootstrap/context-audit behavior and existing Tooling 026 preferred-ingress semantics.
- Add focused regressions that compare the optimized/direct v2 path with the retained accepted fixture semantics, including deterministic archive identity for stable input and the existing adversarial rejection set.
- Retain or extend scale pressure so the direct v2 path is exercised with roughly the current Site scale (at least 1,300 workspace files) without first generating 1,300 exploded workspace outer carriers.
- On the exact carried working source, using `.topics/.workspaces/tiinex-site.workspace.md`, the explicit Sigma-audit Handoff fixture/route supplied by Anchor, and embedded bootstrap, execute v2 manufacture with explicit route selection inside Loom's current `120s` execution window. Record phase timings and total manufacture/serialization timing. If it exceeds the window, return the blocker honestly instead of fabricating readiness.
- Run the focused archive-v2 suite and downstream package/manufacture/context/architecture/schema/TypeScript regressions. `validate-static.mjs` may retain only the exact five historical pre-027-5 source-size failures and must gain no new failure.
- Return exactly one current/v1 route-scoped partial Loom→Anchor Handoff package. Do not return the temporary v2 test package as the primary user-facing attachment.
- Do not switch default carrier, publish, commit, push, authenticate, mint another Workspace identity, or perform remote mutation.

## Scope

Only v2 manufacture orchestration/performance and the minimum cohesive tests/helpers needed to remove the mandatory exploded complete-workspace intermediate. Workspace semantics, v1 carrier behavior, unrelated static debt, Viewer/UI, publication, and remote state are out of scope.

## Dependencies

- [Tooling 027-5-5 Anchor performance review](027-5-5-first-live-v2-manufacture-performance-anchor-review-correction-required.trace.md) controls the observed first-live blocker.
- [Tooling 027-5-4 correction result](027-5-4-workspace-target-conformance-and-static-discipline-correction-result.trace.md) is the accepted semantic/static correction baseline.
- [Tiinex Site workspace](../../../.workspaces/tiinex-site.workspace.md) is the real durable Workspace target for the carried full-source qualification.
- [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md) remains the semantic boundary.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:4N8-62R-LC_e2feNMuTbG1UqaHwpWJn9JLZdzRXUSpw
