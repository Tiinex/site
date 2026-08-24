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
  - Why: Preserve Tooling 016's canonical Pointer qualification, package-root projection implementation, migration limits, and current traversal gap for independent Anchor acceptance.
  - Summary: Loom result for Tooling 016 canonical Pointer package entrypoint qualification and START migration
  - Status: draft/local

---

# Loom result for Tooling 016 canonical Pointer package entrypoint qualification

## Objective

Recover canonical `tiinex.pointer.v1`, determine whether it can represent a thin package-root entrypoint without acquiring Handoff route authority, implement a fail-closed portable projection when compatible, and preserve accepted `tiinex.package/START.md` behavior until successor acceptance.

## Done Criteria

Implementation is complete at the Loom portable Tooling boundary and awaits Anchor acceptance.

The maintained Pointer contract was recovered directly from Tiinex/docs at commit `3988951208eb9a8926e84ab42625d4b42fa00c2d`: `https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/pointer/tiinex.pointer.v1.schema.md`. Its maintained semantics are sufficient for this projection: a Pointer may be a thin destination-list redirect, a destination list does not create Parent continuity, and at least one explicit machine-detectable target is required. Loom did not mutate or reinterpret the canonical schema.

`src/tooling/portable/handoff/pointerEntrypoint.js` now generates one deterministic package-root `tiinex.pointer.v1` artifact per carrier-qualified Handoff route. Each generated artifact has ordinary Tiinex continuity shape, the exact canonical Pointer schema reference, no `Parent`, exactly one explicit `## Destinations` target to the route's qualified `(workspaceId, workspace-relative path)` carrier, and a verified `sha256-base64url-c14n-v2` self-integrity value. Shared packages therefore receive 1..N route-specific thin Pointers rather than one ambiguous multi-recipient list. Filenames are deterministic projections derived from route identity and remain disposable navigation aids.

Package truth remains controlling. `inspectHandoffPointerEntrypoints` independently inspects carrier truth, rebuilds the expected projection, and rejects missing, unexpected, duplicate-path, stale-target, unqualified-target, schema-mismatched, integrity-invalid, Parent-promoting, route-count-mismatched, or byte-mismatched Pointer artifacts. `materialClosure.package.js`, `handoff.plan.js`, portable manufacture verification, and cold-consumer orientation now include this inspection. A Pointer can therefore help a recipient navigate but cannot select or override a route that carrier/closure truth did not qualify.

Current `tiinex.package/START.md` is retained. `orientColdConsumerFromHandoffPackage` requires both the existing START projection and the new Pointer projection to validate against the same package truth before reporting ready. ZIP attachment remains only transport: nothing in this implementation claims that attaching a ZIP causes a host to autorun or automatically open the root Pointer.

Current traversal capability is deliberately qualified rather than overstated. In the supplied Site source Loom found the existing package-specific START/orient path and a separate workspace-issue pointer convention, but no generic Viewer traversal path that recognizes canonical `tiinex.pointer.v1` and follows its destination. The new Pointer is therefore traversable/validated in the portable package layer only; Viewer behavior remains a Kodax-owned gap and no product/UI acceptance is claimed.

Focused coverage is in `src/tooling/portable/handoff/pointerEntrypoint.test.mjs`: single route, shared routes, multi-workspace routes, tampered pointer, stale target, duplicate pointer, and pointer to an unqualified route. The final timed focused run passed in 0.30 s wall time with 84,592 KB maximum RSS. The aggregate portable suite passes, and existing START/carrier/cold-consumer regressions remain green.

Minimal human transport should continue locating the controlling Handoff directly for now. The generated root Pointer materially lowers package-local search cost after a recipient inspects the package, but changing the external human transport contract in this leaf would get ahead of both START migration acceptance and Viewer/host traversal reality. Anchor can later decide whether a Pointer should become the preferred external locator once an end-to-end successor path is independently qualified.

Exact implementation surfaces for this result are new `src/tooling/portable/handoff/pointerEntrypoint.js`, `src/tooling/portable/handoff/materialClosure.package.js`, `src/export/handoff.plan.js`, `src/tooling/portable/handoff/manufacture.js`, `src/tooling/portable/handoff/coldConsumerEntrypoint.js`, `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`, new `src/tooling/portable/handoff/pointerEntrypoint.test.mjs`, and `src/tooling/portable/portable.test.mjs`.

## Scope

Canonical Pointer recovery/qualification; deterministic package-root Pointer projection; carrier-correlated fail-closed validation; portable orientation integration; START compatibility; bootstrap/help discoverability; focused tests and migration recommendation. No canonical Pointer/Handoff mutation, Viewer implementation, host autorun claim, Process semantics, publication, or external transport migration acceptance.

## Dependencies

Controlling work is `007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md` and Tooling 016 `../../tooling/dogfood/016-handoff-package-tiinex-pointer-entrypoint-and-start-migration.trace.md`. Canonical semantic authority is the recovered maintained `tiinex.pointer.v1` schema at the exact Tiinex/docs commit named above. Accepted START/plural route behavior remains Tooling 013 `../../tooling/dogfood/013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md`; accepted route selection truth remains Tooling 012 `../../tooling/dogfood/012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md`. Axiom retains canonical semantics and Kodax retains Viewer traversal/product implementation.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:BTdNO1sZ0VFZXxMYpjMrEOPNfyzQWmWxenwM5DnCyD8
