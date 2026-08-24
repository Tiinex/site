# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 21:46:00
  - Trace: [007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md](007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md)
  - Origin:
    - [relative](007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 22:25:00
  - Authors: Loom
  - Why: Preserve Tooling 015's completed portable multi-root operator-input implementation and its bounded scaling evidence for independent Anchor acceptance.
  - Summary: Loom result for Tooling 015 multi-root Handoff workspace manufacturing and operator input
  - Status: draft/local

---

# Loom result for Tooling 015 multi-root Handoff workspace manufacturing

## Objective

Expose qualified 1..N operator-supplied workspace roots through the normal Node/CLI Handoff manufacturer while preserving the already plural core workspace model, deterministic one-root behavior, route qualification, source-neutral carriage, and fail-closed package verification.

## Done Criteria

Implementation is complete at the Loom portable Tooling boundary and awaits Anchor acceptance.

The normal Node adapter now accepts one legacy primary positional workspace root plus explicit additional workspace descriptors. CLI input supports `--workspace-roots <json>` / `--workspace-descriptors <json>` for structured additional roots and `--additional-workspaces id=dir,id=dir` for bounded inline use. Route input supports `--workspace-routes <json>` / `--handoff-route-descriptors <json>`; structured routes require an explicit `workspaceId`, while existing string `--handoff-routes` remains a compatibility surface bound to the primary workspace. The adapter composes all roots into the existing plural `workspaceMaterializations[]` core representation instead of requiring callers to pre-enumerate files.

Every supplied root reuses the same Node enumeration path and therefore the same deterministic path normalization, package exclusions, file-count/byte limits, binary handling, and symlink rejection as the primary root. Additional workspace ids are normalized and rejected when duplicated; missing roots fail during enumeration; explicit route descriptors are checked against the declared workspace set; carried workspace bytes remain source-availability evidence with authority `none` rather than becoming Source authority through operator input.

One carrier normalization correction was required for the intended multi-root semantics. `normalizeRouteSpecs` previously injected the descriptor's default Handoff route even when the caller supplied an explicit route list. It now uses the fallback route only when no explicit routes were supplied. This permits a complete primary workspace to be carried with no recipient route while the only qualified route lives in a secondary workspace, without silently manufacturing an extra primary route. Existing Tooling 012/013 route and cold-consumer regressions remain green after this change.

Focused adversarial coverage is in `src/tooling/portable/handoff/multiRootManufacture.test.mjs`: one-root compatibility; two supplied roots representing Site + Docs; the only advertised Handoff route in the secondary workspace; two routes across one and two workspaces; duplicate workspace ids; missing roots; binary carriage; and full package/closure/carrier/cold-consumer/bootstrap roundtrip behavior. The final timed focused run passed in 0.56 s wall time with 87,136 KB maximum RSS. `src/tooling/portable/portable.test.mjs` passes with the new regression included, and `npm run portable:smoke` passes with the normal operation catalog.

Scale evidence remains bounded. The available `handoff.manufacture.scale.test.mjs` fixture passed with 1,286 workspace carriers and 1,306 package files; its internal measured interval was 1,891 ms and the process completed in 2.15 s wall time with 144,300 KB maximum RSS. The approximately 30 MB Docs fixture associated with the earlier greater-than-180-second Anchor observation is not present in the supplied 007 package. Loom therefore cannot honestly remeasure that exact contradictory case and does not claim a universal ergonomics/performance closure or SLA from the smaller available fixture. This implementation closes the operator-input gap; the historical larger-fixture scaling discrepancy remains separate evidence for Anchor to retain or route if another concrete reproduction becomes available.

Final repository validation preserves the pre-existing transported-workspace boundary. After the source-size refactor below, `node tools/validate-static.mjs` passes, `npm run portable:smoke` passes, and full `npm run validate` progresses through `src/app/emptyStageProductHierarchy.test.mjs` before `src/parity/poc.m1StartupRenderParity.test.mjs` attempts to read absent `.old/app.js` and receives `ENOENT`. Tooling 015 does not modify or reinterpret that unrelated boundary.

Exact implementation surfaces for this result are `src/tooling/portable/adapters/node/handoff.manufacture.js`, new `src/tooling/portable/adapters/node/handoff.manufacture.multiRoot.js`, `src/tooling/portable/adapters/cli/cli.handoff-manufacture.js`, `src/tooling/portable/adapters/cli/cli.help.js`, `src/tooling/portable/handoff/carrierProjection.js`, `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`, new `src/tooling/portable/handoff/multiRootManufacture.test.mjs`, and `src/tooling/portable/portable.test.mjs`. The multi-root helper split is structural only: the first full validation exposed the static 24 KB source-size gate after additions to an already large Node adapter, so normalization helpers were moved into the small dedicated module rather than weakening or raising the gate.

## Scope

Node/CLI multi-root operator input, plural workspace materialization composition, route qualification needed by that input, documentation/help, focused adversarial tests, one-root regression preservation, bounded scale evidence, and ordinary package verification. No canonical Workspace/Source/Handoff semantics, Viewer behavior, Process semantics, publication act, or performance-policy redesign.

## Dependencies

Controlling work is `007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md` and Tooling 015 `../../tooling/dogfood/015-handoff-package-multi-root-workspace-manufacturing-and-operator-input-closure.trace.md`. Accepted semantics preserved during implementation remain Tooling 013 `../../tooling/dogfood/013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md`, Tooling 012 `../../tooling/dogfood/012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md`, and Tooling 011 `../../tooling/dogfood/011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md`. Source-neutral carriage remains bounded by `../../architect/continuity/001-19-5-workspace-source-binding-and-lazy-discovery-signal.trace.md`.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:6-l5-Ue4r-shx8vX-YBENAXIky38T9d_0bA9pgygJbk
