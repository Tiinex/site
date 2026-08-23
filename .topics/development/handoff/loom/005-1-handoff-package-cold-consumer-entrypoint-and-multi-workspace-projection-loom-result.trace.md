# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 16:40:00
  - Trace: [005-handoff-package-cold-consumer-entrypoint-and-multi-workspace-projection-handoff.trace.md](005-handoff-package-cold-consumer-entrypoint-and-multi-workspace-projection-handoff.trace.md)
  - Origin:
    - [relative](005-handoff-package-cold-consumer-entrypoint-and-multi-workspace-projection-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 17:36:00
  - Authors: Loom
  - Why: Record the bounded Tooling 013 implementation and frozen-source validation evidence for package-local cold-consumer orientation plus plural workspace/route projection without reopening accepted Tooling 011/012 semantics.
  - Summary: Loom result for Tooling 013 cold-consumer START and multi-workspace route projection
  - Status: draft/local

---

# Loom result for Tooling 013 cold-consumer START and multi-workspace route projection

## Objective

Implement the bounded Tooling 013 task so a qualified consumer that receives only package bytes can discover a maintained package-local entrypoint, parse structured workspace/route orientation, correlate that projection back to package truth, and reach the exact controlling Handoff without predecessor-chat prose or filename inference. Preserve one-workspace manufacturing as the ergonomic default while making the package/carrier projection structurally capable of multiple qualified workspace materializations.

## Done Criteria

PASS at the Loom implementation/evidence boundary; independent Tooling 013 acceptance remains Anchor-owned.

Manufactured recipient-relative Handoff packages now contain `tiinex.package/START.md`. The file carries human orientation plus exactly one bounded fenced-JSON `tiinex.portable.handoff-cold-consumer-projection.v1` block. Its structured projection exposes `workspaces[]`, exact route ids, each route's `workspaceId`, workspace-relative controlling Handoff path, package path, digest, parties, control-file locations, and route-selection policy. START explicitly carries no semantic authority. `inspectHandoffColdConsumerEntrypoint` and the new read-only `orient-handoff-package` operation parse START without executing received package code, independently requalify `tiinex.package/handoff-carrier.json` against closure/workspace/package bytes, and compare START with the recomputed projection. Missing, unparseable, stale, tampered, authority-promoted, or mismatched START orientation fails closed.

`tiinex.package/handoff-carrier.json` now exposes plural `workspaces[]`. Each advertised route binds one exact workspace id to one exact workspace-relative Handoff path and is qualified against that workspace's exact carried bytes. The prior singular `workspace` member remains only as the default-workspace compatibility projection for accepted single-workspace consumers; route qualification and cold-consumer orientation use plural binding. Shared-route Required Context qualification from Tooling 012 remains unchanged in force. Human output uses the selected route's workspace title/slug, so one immutable multi-workspace package can project `tiinex-alpha-005-anchor-to-loom.handoff-package.zip` for an Alpha route and `tiinex-beta-006-anchor-to-axiom.handoff-package.zip` for a Beta route without mutating package bytes. A route id is available as the unambiguous selector when separate workspaces expose the same relative Handoff path.

The current Node/CLI manufacturer deliberately retains its one-root ergonomic fast path. Tooling 013 does not claim general multi-root filesystem authoring. Instead, the existing package/closure engine is pressure-tested directly with two complete qualified workspace materializations and two route/workspace bindings; the fixture proves that plural package representation, START orientation, per-workspace route qualification, selected-workspace transport text, and route-local filename projection work without assuming `package == exactly one workspace`. Ordinary Node manufacture remains one workspace in `workspaces[]`, one implicit route when applicable, one primary package, and no normally emitted transport-text sidecar.

The maintained bootstrap and architecture documentation now direct cold consumers to read `tiinex.package/START.md` without executing package code, describe `orient-handoff-package`, explain fail-closed START correlation, preserve `Reference Context` as non-blocking, and state the remaining multi-root authoring gap explicitly rather than hiding it behind a singular projection field.

Final source validation occurred after the last `src/` mutation. `node tools/validate-static.mjs` passes; `npm run portable:smoke` passes; the full portable aggregate passes including Tooling 012 carrier pressure, the new Tooling 013 cold-consumer/multi-workspace pressure fixture, Tooling 011 manufacturing regression, operation catalog, bootstrap contract, runtime package, and closure tests. Repository-wide `npm run validate` passes every command through `src/app/emptyStageProductHierarchy.test.mjs` and then stops at the pre-existing transported-workspace boundary `src/parity/poc.m1StartupRenderParity.test.mjs`, which reads absent `.old/app.js` and receives `ENOENT`. The 121 validation commands after that point were then executed independently against the same frozen source bytes: 120 PASS and one dependency-bound nonpass, `src/app/useLocalMaterialIntake.test.mjs`, because the transported workspace has no installed `react` package. No later `src/` mutation occurred after this final validation evidence.

Final changed implementation/test source representations include `src/tooling/portable/handoff/carrierProjection.js` 23,199 bytes / SHA-256 `9d4cae842d1aff3a33de59e15282ff7e63b17f0565ff20f1aa6651c5c7f5e2df`; `src/tooling/portable/handoff/carrierProjection.workspaces.js` 3,962 bytes / SHA-256 `80c1f899ae356d6ff09838f094845158f3fcf414336491cbaba44a7c5f48992e`; `src/tooling/portable/handoff/coldConsumerEntrypoint.js` 9,248 bytes / SHA-256 `680ee7157e1f1c12eeab2bd7e73ceca849d28e66914589df81712b33d033ea96`; `src/tooling/portable/handoff/coldConsumerEntrypoint.test.mjs` 5,775 bytes / SHA-256 `9813e5d7621a0ad0ee6e1ad87913d8ec3e07f2186f05d3304dadfe6d05a31b8b`; `src/tooling/portable/handoff/materialClosure.package.js` 18,091 bytes / SHA-256 `5d5a51b7eb8b400e61f4c8f1543f11aef73a0f0acd9c55587a037dd558cf5de7`; and `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md` 34,204 bytes / SHA-256 `6aeb78ea24be48074fbb998d354f20bcc17eaffb911ecfecf995573395f051c9`. Additional bounded integration edits are carried in the returned workspace and remain covered by the same final-source validation run.

## Scope

Package-local cold-consumer START generation/parsing/correlation; plural carrier workspace projection; route-to-workspace binding; selected-workspace human output; bounded two-workspace pressure fixture; one read-only orientation operation/CLI path; bootstrap/docs; final-source validation evidence; durable Loom result and one recipient-relative return package. No Viewer UI, canonical Handoff redesign, Process schema, provider-specific ChatGPT behavior, general scheduler/orchestrator, forced multi-workspace packaging, broad multi-root filesystem authoring, source publication, Anchor acceptance, or Q product acceptance.

## Dependencies

Controlling implementation authority is `005-handoff-package-cold-consumer-entrypoint-and-multi-workspace-projection-handoff.trace.md` and its parent Tooling 013 task `../../tooling/dogfood/013-handoff-package-cold-consumer-entrypoint-and-multi-workspace-projection.trace.md`. Tooling 012 acceptance `../../tooling/dogfood/012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md` remains the accepted shared-route/Required Context foundation and stays green. The cold-consumer/multi-workspace design boundary remains `../../architect/continuity/001-17-2-handoff-package-cold-consumer-entrypoint-and-multi-workspace-feedback.trace.md`; the rename-safe outer carrier boundary remains `../../architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md`.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:sGCUuziU_LsusgdyUlSE-4Idz14pBqcpAxZHzn8uhxM
