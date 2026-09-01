# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-01 01:17:00
  - Trace: [Foundation Test Strategy Consolidation — Anchor To Loom](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-foundation-test-strategy-consolidation-handoff.trace.md)
  - Origin:
    - [relative](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-foundation-test-strategy-consolidation-handoff.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-01 01:38:00
  - Authors: Loom
  - Why: Preserve the bounded Foundation test-strategy consolidation result, its exact before/after metrics, and the inherited validation exceptions before returning to Anchor.
  - Summary: Loom evidence that the historical 338-file standalone test corpus was consolidated to one standalone acceptance entrypoint plus 54 suite-owned current-contract cases; routine profiles no longer enumerate historical tests; focused static truth remains seven inherited unresolved, six resolved inherited, and zero introduced regressions.
  - Status: ready/local

---

# Foundation Test Strategy Consolidation — Loom Implementation Evidence

## Preserved Material

- Material Description: the current qualified Site source after replacing the additive 338-file standalone test corpus with a permanent component/use-case suite contract, one acceptance entrypoint, profile composition over semantic suites, and an explicit temporary-regression lifecycle.
- Material Kind: Site-local source, architecture/testing contract, machine-readable consolidation inventory, and bounded validation receipts.

## Preservation Act

- Preservation Method: statically harvest the 338 historical `*.test.mjs` files; select current component/use-case contracts without first executing the full historical corpus; verify 53 retained cases individually; rename them to suite-owned `*.case.mjs`; add one suite-contract guard; delete 285 redundant standalone test files; compose smoke/focused/integration/closure from semantic suite entrypoints plus distinct validators; run the permanent suite and bounded profile/static gates; reproduce two schema-validator failures on an untouched ingress Site baseline rather than hiding them.
- Preservation Time Or State: captured after the 54-case acceptance spine and focused regression gate passed, after inherited schema-validation drift was reproduced on the untouched ingress baseline, and before canonical return manufacture.

## Supported Claim Or Question

- Supported Claim Or Question: whether Foundation can replace the historically additive 338-test corpus with a substantially smaller permanent component/use-case acceptance spine while preserving current use-case contracts, truthful static-debt reporting, and explicit inherited validation exceptions.
- Evidence Role: supports Anchor review of test-file reduction, suite ownership, profile-step reduction, representative timings, deleted/retained rationale, current acceptance coverage, strict-static truth, and the exact limits of integration/closure qualification.

## Provenance

- Known Source: the qualified Business, Docs, and Site Workspaces from the preferred-pass Anchor carrier `site-001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom.handoff-package.zip`; untouched ingress Site baseline extracted from the exact carried Site archive at `/mnt/data/loom-foundation-test/site-baseline`; current working Site at `/mnt/data/loom-foundation-test/site`.
- Preservation Basis: cold start qualified `preferred-pass`; Business, Docs, Site, endpoint Roles, incoming Handoff, and Required Context all resolved from carried exact bytes before workspace materialization. The baseline contained exactly 338 `*.test.mjs` files and profile step counts 3/8/262/273 for smoke/focused/integration/closure.
- Provenance Limits: no remote fetch, GitHub mutation, publication, release action, schema-byte rewrite, broad static refactor, production deployment, or host-safety probing occurred. Local wall-clock measurements cover child-process/checkpoint orchestration only and exclude host/model/client wait.

## Evidence Material

- Material: `tools/foundation-test-suite.contract.mjs`; `tools/run-foundation-suite.mjs`; `tools/foundation-acceptance.test.mjs`; `tools/foundation-test-suite.contract.case.mjs`; `tools/validation-profile.contract.mjs`; `tools/validation-profile.contract.case.mjs`; `tools/foundation-test-consolidation.inventory.json`; `docs/architecture/foundation-test-strategy.md`; `package.json`; `src/acceptance/knownScenarios.js`; `src/acceptance/knownScenarios.case.mjs`.
- Material Kind: permanent test-suite ownership contract, isolated suite runner, single acceptance entrypoint, profile composition contract, machine-readable before/after inventory, local testing convention, and updated acceptance metadata.
- Description: the result contains exactly one standalone `*.test.mjs` entrypoint (`tools/foundation-acceptance.test.mjs`) and 54 suite-owned `*.case.mjs` cases: 53 converted current cases plus one new suite-contract guard. The 54 cases are grouped as smoke 5, focused/tooling 6, workspace/source 12, schema/transition 7, product 7, package/publication 7, and tooling/detail 10. Exactly 285 historical standalone test files were deleted; 90 of those were chronological `src/acceptance` post/m/poc-style regressions.
- Sample Reference: before consolidation, profile steps were smoke 3, focused/tooling 8, integration 262, closure 273; after consolidation they are 2, 4, 12, and 23. Baseline representative timings were smoke 1,086.521 ms and focused/tooling 2,082.55 ms. After consolidation, smoke was 1,550.665 ms, focused/tooling 4,132.254 ms, and full permanent acceptance passed 54/54 in 10,230.324 ms. The timing result is not represented as uniformly faster; the primary iteration reduction is elimination of hundreds of historical entrypoints and replay steps while routine gates remain low-second bounded.

## Preservation And Fidelity

- Preservation State: the permanent acceptance spine passes 54/54; the smoke profile passes 2/2; focused/tooling passes 4/4; regression-aware static remains `inherited-debt-only` with exactly seven inherited unresolved, six resolved inherited, and zero introduced regressions. `node tools/validate-workspace-schema.mjs` passes.
- Fidelity Notes: the 53 retained current contracts were first executed individually and passed 53/53 before rename/delete. The suite runner deliberately isolates case modules in child processes because some existing current cases own process-level lifecycle and call `process.exit()`. The suite-contract guard enforces exact ownership, the single standalone acceptance entrypoint, and absence of historical test-file enumeration from `package.json validate`.
- Known Losses: the consolidation intentionally does not claim that every historical assertion remains separately represented. It preserves a curated current component/use-case spine and deletes redundant/historical sediment. Integration did not qualify because two schema validators fail with inherited baseline drift, and broad closure was not run.

## Fidelity And Loss

- Fidelity Notes: current behavior contracts were retained as suite-owned cases rather than deleted by file-count target alone. The current `knownScenarios` metadata was updated to semantic suite commands so accepted workflows do not point at deleted historical paths. The 24,000-byte static guard was not weakened, and the Tranche A seven/six/zero state was preserved.
- Known Losses: `node tools/validate-schema-bindings.mjs` still reports `workspace/tiinex.workspace.v1.schema.json checksum mismatch: 425aa24f8c1fc1115eec8cb934c410f1b01b5d38e91c73e71a2de886473ebf05 != 27d73b65f745335da79a877d3678af5497b29bed4bace218a244deeb5647c4dc`; `node tools/check-schema-runtime-projections.mjs` still reports `stale projection: src/schemas/workspace/tiinex.workspace.v1.schema.runtime.json`. Both failures reproduce unchanged on the untouched ingress Site baseline. Strict static still fails only the seven known inherited oversized Tooling owners. No schema bytes were changed to relabel those failures as pass.

## Custody Or Storage Boundary

- Storage Or Custody State: canonical implementation source, this Evidence, and the machine-readable inventory live in the current Site Workspace; unchanged Business and Docs roots remain carried dependencies. Runtime `.tiinex/**` state is local checkpoint/cache material and remains outside canonical Workspace source carriage.
- Reuse Boundary: Anchor may review and continue from this non-major consolidation checkpoint. The two inherited schema-validator drifts and seven inherited strict-static owners remain explicit exceptions; repairing them requires separate progression authority rather than reinterpretation of this Evidence.

## Interpretation Limits

- Does Not Prove: final Foundation closure, integration qualification, strict-static pass, stable-major readiness, production release readiness, preservation of every historical assertion as an independent test, Sigma human acceptance, or knowledge of hidden host-safety triggers.
- Not Yet Used As: broad integration qualification, strict closure qualification, stable-major qualification, release acceptance, schema-rebuild authorization, or human product acceptance.
- Must Not Be Treated As: permission to delete unique current behavior contracts merely to reduce file count; permission to weaken validators; permission to relabel inherited schema drift as green; permission to continue into the seven larger static owners without Anchor authorization; or evidence of internal host-safety telemetry, probing, evasion, suppression, or bypass.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Foundation Test Strategy Consolidation — Anchor To Loom](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-foundation-test-strategy-consolidation-handoff.trace.md)
  - Value: hKxKlWQ82AkmtHkBp5sooNmElNhzUTianZTOTA1WzG0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:FCzWK6_msf7oLZfPbAwsmg_TtRc2kRQn-hHubw0GcFY
