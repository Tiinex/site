# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-25 00:43:00
  - Authors: Anchor
  - Why: Close the two independent Anchor findings from Tooling 027-5 without reopening accepted carrier semantics or creating another broad implementation tranche.
  - Summary: Tooling 027-5-3 — require full qualified Tiinex Workspace-target artifact conformance in archive carrier v2 and remove only Tooling 027-5's newly introduced v119 source-size violations while preserving all accepted v1/v2 behavior.
  - Status: open/local

---

# Tooling 027-5-3 — Workspace target conformance and static-discipline correction

## Objective

Apply one bounded correction to the retained Tooling 027-5 implementation: a v2 Workspace target must be a genuinely qualified Tiinex artifact, not merely Markdown declaring `tiinex.workspace.v1`, and the implementation must not add new source-size failures relative to the accepted pre-027-5 baseline.

## Done Criteria

- Make Workspace target qualification fail closed unless the exact explicitly bound `.workspace.md` bytes validate as `tiinex.workspace.v1` under the existing general Root/schema validation authority and have independently verified primary c14n-v2 self integrity.
- Preserve ordinary Parent semantics when a Workspace target declares Parent: no filename/path inference, and no bypass of required Parent-target continuity verification.
- Ensure both manufacture-time qualification and archive-provider reinspection enforce the same Workspace target conformance truth; stored descriptor self-integrity state must not make a missing/prepared/mismatching target acceptable merely because stored and recomputed states agree.
- Replace the positive archive-v2 Workspace fixture with a genuinely sealed/qualified Workspace artifact. Add explicit negative regressions for missing/unverified self integrity, self mismatch, Root/schema invalidity, and relevant Parent-target invalidity.
- Preserve all prior Tooling 027-5 archive-v2 positive/adversarial behaviors: deterministic archive bytes, exact target/archive binding, route resolution, Required Context dedup + detached fallback, same-path multi-workspace isolation, unsafe/duplicate path blocking, digest/entry/completeness staleness blocking, unavailable provider/decoder blocking, invalid selected Handoff blocking, outer file-map tamper blocking, roundtrip.
- Remove the three newly introduced `tools/validate-static.mjs` source-size regressions by extracting cohesive helpers without semantic behavior changes:
  - `src/tooling/portable/adapters/node/handoff.manufacture.js`
  - `src/tooling/portable/handoff/materialClosure.archiveV2.js`
  - `src/tooling/portable/handoff/workspaceByteProvider.js`
- Do not opportunistically clean the five pre-existing baseline source-size violations. Acceptance is that Tooling 027-5 adds zero new static failures relative to the supplied baseline.
- Rerun focused v2 regression, material closure, Handoff manufacture, route artifact conformance, carrier projection, Pointer, cold consumer, Tooling 026 cold-start, context audit, multi-root, human-output, transport companion, architecture shape, browser import boundary, schema bindings/runtime projections, TypeScript, and `validate-static.mjs` with baseline-delta interpretation.
- Return exactly one current/v1 route-scoped recipient-relative Handoff package. Use the qualified route-scoped partial manufacture path directly; do not retry the broad generic full-workspace manufacture path that already timed out.
- Do not manufacture a human-deliverable v2 candidate, create/mint a real `tiinex-site` Workspace artifact, switch defaults, publish, commit, push, authenticate, or perform remote mutation.

## Scope

Only Workspace-target conformance qualification/tests and structural extraction needed to remove the three new source-size violations. Existing Tooling 027-4 semantics, archive representation rules, v1 carrier behavior, unrelated static debt, Workspace artifact authoring, first-candidate generation, Viewer/UI, and remote state are out of scope.

## Dependencies

- [Tooling 027-5 Anchor review](027-5-2-archive-backed-carrier-v2-anchor-review-correction-required.trace.md) controls the exact two correction findings.
- [Tooling 027-5 implementation result](027-5-1-archive-backed-handoff-carrier-v2-implementation-and-preflight-result.trace.md) is the implementation baseline.
- [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md) remains the semantic boundary.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:1-Ze_zEj6ilRqLXF5ivMDDP6EKVOv2lpExrB9i4G2ys
