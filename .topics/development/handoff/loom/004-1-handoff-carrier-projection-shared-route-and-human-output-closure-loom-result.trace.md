# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 14:41:00
  - Trace: [004-handoff-carrier-projection-shared-route-and-human-output-closure-handoff.trace.md](004-handoff-carrier-projection-shared-route-and-human-output-closure-handoff.trace.md)
  - Origin:
    - [relative](004-handoff-carrier-projection-shared-route-and-human-output-closure-handoff.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/refactor/.topics/development/handoff/loom/004-handoff-carrier-projection-shared-route-and-human-output-closure-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 15:34:00
  - Authors: Loom
  - Why: Record the bounded Tooling 012 implementation and final-source evidence for deterministic human carrier projection, explicit shared-route fan-out, and one-primary output without promoting filename or transport prose into Handoff/package authority.
  - Summary: Loom result for Tooling 012 carrier projection, shared-route, and human-output closure
  - Status: draft/local

---

# Loom result for Tooling 012 carrier projection, shared-route, and human-output closure

## Objective

Implement the bounded Tooling 012 projection layer over accepted Tooling 011 so one immutable Handoff package can expose rename-safe human carrier naming, single-primary output, optional regenerable transport text, and explicitly qualified multi-route fan-out while retaining package/Handoff truth as the only authority for route eligibility and exact carried bytes.

## Done Criteria

PASS at the Loom implementation/evidence boundary; independent Tooling 012 acceptance remains Anchor-owned. A new package-local `tiinex.package/handoff-carrier.json` projection is built and re-inspected from packaged truth. Each advertised route must correspond to exactly one qualified workspace materialization, an exact packaged controlling Handoff byte/digest, and a Handoff artifact that declares `tiinex.handoff.v1`; `From`, `To`, and local dimension are derived from that qualified artifact/path rather than trusted from an outer filename. Single-route packages can implicitly project one qualified route while preserving Tooling 011 fallback when older synthetic Handoffs cannot qualify the new human projection. Explicit shared-route packages fail closed unless every requested route qualifies and require an explicit route selector before human output is projected. The deterministic default filename is `<workspace-name-slug>-<dimension>-<from>-to-<to>[optional-purpose].handoff-package.zip`; a transport-only `--N` collision instance changes only the disposable outer name and never Handoff dimension/lineage. `--output-dir`, `--route`, `--collision-instance`, and optional `--transport-text` are exposed through the ordinary CLI; `project-handoff-carrier-output` regenerates filename and minimal transport text directly from package truth without prior conversation state. The normal path still exposes one primary package; the text sidecar is optional and non-authoritative. A dedicated three-route fixture proves one immutable shared package reused for Loom, Axiom, and Kodax with three distinct routing texts, common workspace/material/bootstrap bytes carried once, route-order determinism, fail-closed missing-route behavior, tamper detection, and collision suffixes that do not alter the package bytes or dimension. Legacy single-route Tooling 011 manufacturing remains green.

A first real final-package cold-start exposed one additional serialization/input boundary that the small fixture did not: the generic ZIP intake treated `tiinex.package/handoff-closure.json` above its 128 KiB preview threshold as locator-only, so a fresh embedded runtime could regenerate the correct human route but could not independently re-inspect carrier truth. The correction is bounded in `src/tooling/portable/input/node.input.js`: `tiinex.package/*.json` control material is hydrated as text when it remains within the existing portable `maxTextBytes` bound (4 MiB by default), while larger control material stays locator-only and emits the existing text-too-large warning. `node.input.test.mjs` now pressures a control JSON above 128 KiB and below 4 MiB plus an explicitly smaller bound, and the real package cold-start projection returns `ready` after the correction.

Final-source validation was run after the last `src/` mutation. `node tools/validate-static.mjs`, the Tooling 012 carrier-projection pressure test, Tooling 011 manufacturing regression, transport-companion regression, operation catalog, bootstrap contract, full portable aggregate, and `npm run portable:smoke` all pass. The aggregate now includes the Tooling 012 pressure fixture. Repository-wide `npm run validate` passes through the Tooling 012/static surface and stops later at the pre-existing `src/parity/poc.m1StartupRenderParity.test.mjs` read of absent `.old/app.js` with `ENOENT`. The 121 validation commands after that point were run independently against the same frozen source bytes: 120 PASS and one dependency-bound nonpass, `src/app/useLocalMaterialIntake.test.mjs`, because the transported workspace has no installed `react` package. No later `src/` mutation occurred after this evidence run.

## Scope

Portable/shared carrier projection, package-local route qualification/inspection, deterministic disposable human filename projection, explicit shared-route selector semantics, collision-only outer naming, one-primary CLI output, optional regenerable transport text, CLI/operation/catalog/bootstrap/docs exposure, focused three-route pressure, legacy single-route regression, and exact final-source validation evidence. No canonical ZIP schema, no new Handoff semantics, no Parent/assignment/acceptance inference from dimensions or filenames, no route authority from human prose, no Viewer/product integration, no publication/source mutation, no Q acceptance requirement, and no Loom self-acceptance.

## Dependencies

Controlling authority is `004-handoff-carrier-projection-shared-route-and-human-output-closure-handoff.trace.md`, carrying exact Tooling 012 task/decision/host-feedback/Tooling 011 acceptance material. Tooling 011 remains the accepted manufacturing/bootstrap/roundtrip foundation; this result adds only the bounded projection/fan-out layer. Anchor retains Tooling 012 architecture acceptance. Axiom retains canonical Handoff/schema semantics if implementation pressure exposes a genuine semantic gap. Kodax retains later Viewer/product consumption if separately routed. Sigma/Q retain separately requested human product/host acceptance; Q is transport-only for this leaf. The known absent `.old/app.js` and uninstalled `react` boundaries remain transported-workspace/dependency limitations and are not repaired or hidden by Tooling 012.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: umtfZ_vQriON9if9HC4jXSJmkZnbtC5YYxaHM7P6iqU