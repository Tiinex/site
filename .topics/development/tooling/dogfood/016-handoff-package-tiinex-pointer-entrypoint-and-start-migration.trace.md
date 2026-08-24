# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 21:43:00
  - Authors: Anchor
  - Why: Replace package-specific cold-consumer orientation semantics with ordinary Tiinex navigation where the maintained Pointer schema is sufficient, while preserving current START behavior until the replacement is actually qualified.
  - Summary: Qualify and, if compatible, implement 1..N package-root `tiinex.pointer.v1` entrypoints that point to exact carried Handoffs, with package controls remaining route authority and START retained during migration until Anchor acceptance.
  - Status: open/local

---

# Tooling 016 — Tiinex Pointer package entrypoint qualification and START migration

## Objective

Determine whether the maintained canonical `tiinex.pointer.v1` contract can own the human/LLM package entrypoint currently projected as `tiinex.package/START.md`. If it can, implement generated package-root Pointer artifacts as thin non-authoritative entrypoints to exact carried Handoffs, one Pointer per qualified route by default, and make portable orientation validate/traverse them without creating a second semantic routing authority.

## Done Criteria

- Recover the exact maintained `tiinex.pointer.v1` schema from qualified Tiinex/docs material before implementation. Treat Pointer semantics as canonical authority and Tooling as projection/validation owner only.
- Verify current portable/Viewer traversal capabilities rather than assuming a Pointer is automatically followed. Record the exact current gap.
- Preserve the host-activation fact already observed: attaching a ZIP alone is not an autorun trigger. Pointer entrypoints improve package-local navigation after inspection; they do not claim to force a host to open files.
- For a single qualified route, generate one thin root Pointer whose explicit destination resolves to that route's exact carried Handoff artifact.
- For a shared package, generate 1..N route-specific root Pointers by default so each recipient has one obvious next hop. Do not collapse distinct recipient routes into one ambiguous destination list merely to reduce file count.
- Pointer filenames, prose, and root placement remain disposable projection and carry no Parent, assignment, acceptance, source, or route-selection authority.
- Package carrier/closure truth remains authoritative for route qualification. Orientation must reject missing, stale, tampered, duplicate/ambiguous, or mismatched Pointer projections instead of allowing a Pointer to override package truth.
- Use ordinary valid `tiinex.pointer.v1` artifacts, including valid continuity/integrity shape, rather than inventing a package-only pointer dialect.
- Add single-route, shared-route, multi-workspace, tamper, stale-target, duplicate-pointer, and pointer-to-unqualified-route tests.
- Preserve `tiinex.package/START.md` and current `orient-handoff-package` compatibility during implementation unless/until the new Pointer path is independently accepted as a complete replacement. A safe transitional state may correlate both projections to the same route truth.
- Document whether minimal human transport should eventually locate the root Pointer or continue locating the controlling Handoff directly; do not change that external contract merely for implementation convenience inside this leaf.
- Return an implementation/result or a precise semantic/tooling blocker. If canonical Pointer semantics are insufficient, do not mutate the Pointer schema under Loom authority.

## Scope

Portable package entrypoint projection, Pointer validation/traversal integration, focused tests, migration compatibility, and discoverability. Out of scope: changing canonical Pointer/Handoff semantics, host autorun behavior, Viewer product redesign, Process semantics, or publication.

## Dependencies

- [Tooling 013 Anchor acceptance](013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md) owns the currently accepted START/plural-route behavior that must remain intact until successor acceptance.
- [Handoff carrier projection acceptance](012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md) preserves route selection as package-qualified truth.
- Canonical `tiinex.pointer.v1` at the recovered Tiinex/docs source must be read directly; this task may not infer Pointer meaning from this Task prose.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:DZo3u4TtjmFoZ5nA6pnir_W3Y0_F82ZKz9DP8qcQpuQ
