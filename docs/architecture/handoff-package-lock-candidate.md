# Handoff Package Lock Candidate

Status: Anchor continuity lock candidate. This records the agreed package intent and next reconciliation work. It is not Tiinex semantic authority until the owning schemas and Tooling are reconciled and the resulting carrier is qualified.

## Why this exists

The Handoff carrier drifted from an earlier bare-minimum design into a larger transport model with companion payload/representation artifacts, improvised lineage dimensions, confusing carrier-major projection, and manufacture behavior that is too easy for both humans and LLMs to misuse.

The target is not historical rollback for its own sake. The target is the smallest package grammar that preserves cold-start trust, route closure, human readability, LLM recoverability, and machine qualification without materializing verification plumbing as durable artifacts unless it owns unique semantic truth.

## Locked intent

### 1. Package traversal is the recipient discovery plan

The transport message names one exact package-local Handoff Pointer as `Continue from`.

Tooling takes over after the package-local Start/bootstrap boundary and traverses that selected Handoff Pointer's package-local Parent lineage backwards to the package root before resolving the Pointer to the authoritative Handoff artifact.

Therefore every route-specific dependency that must be known before the authoritative Handoff is followed MUST be an ancestor of the selected Handoff Pointer in package-local lineage.

Material placed after/below the selected Handoff Pointer is not part of pre-Handoff closure and may be skipped by correct traversal.

Package-local Parent/path ordering is discovery/closure ordering only. It MUST NOT be interpreted as semantic ownership, Role hierarchy, authority precedence, Handoff endpoint identity, or source-artifact Parent truth.

### 2. Workspace placement tells the recipient where the Handoff lives

A Handoff Pointer route is descended from the packaged Workspace that contains the authoritative Handoff artifact.

This placement is deliberate navigation information. A route below the Business Workspace means the authoritative Handoff is resolved from Business; a route below Docs means Docs; a route below Site means Site.

Do not create a global package-level `handoffs/` lineage that discards this signal.

### 3. Route grammar

Conceptually, one selected route is:

```text
Workspace
  -> [0..n package-local closure dependencies]
  -> [0..n participant Role Pointers]
  -> Handoff Pointer
```

No empty lineage levels are reserved when an optional element is absent.

If several routes share one package-local dependency, they may branch below that dependency.

Participant Role Pointers are Pointers to authoritative Role artifacts. The package does not duplicate Party Role artifacts merely to make routing work.

Handoff endpoint grounding remains owned by the authoritative Handoff's explicit `From` / `To` and their references/capacity references. Package participant pointers do not replace endpoint declarations.

### 4. Cache is bounded Handoff closure, not scope mirroring

`external-cache.zip` exists only when the selected Handoff closure requires packageable material that is unavailable inside all already-packaged Workspaces but is available to Tooling during manufacture.

Cache completeness is measured against the selected Handoff closure, never against the surrounding repository or Workspace scope.

An artifact that merely happens to exist in the same scope creates no cache obligation unless it participates in the selected Handoff closure.

Tooling MUST NOT crawl/download arbitrary external sources merely to fill the cache. If required external material is not available to manufacture, preserve that source/reference truth rather than silently vendoring it.

For a qualified route, if an artifact in the Handoff lineage needs an asset that is absent from packaged Workspaces, the cache is the next high-probability package-local lookup surface.

The cache Markdown is a human/LLM decision and orientation surface, NOT an exhaustive ZIP manifest. It should remain compact and answer roughly:

- why the cache exists;
- when it needs to be opened;
- what bounded need(s) it serves;
- where/how relevant material can be located;
- what authority or interpretation must not be inferred from mere cache presence.

It must not grow into a megabyte-scale enumeration, per-entry checksum ledger, or long link dump merely because Tooling can inspect the archive.

### 5. Bare-minimum visible package shape

The intended human-readable carrier remains structurally close to:

```text
001-tiinex-handoff-package.trace.md

001-1-READ-BEFORE-PROCEEDING.trace.md

001-2-bootstrap.trace.md
001-2-bootstrap.zip

001-3-business.workspace.md
001-3-business.workspace.zip

001-4-docs.workspace.md
001-4-docs.workspace.zip

001-5-site.workspace.md
001-5-site.workspace.zip
```

Route closure is then expressed numerically under the Workspace that owns the authoritative Handoff.

Example with one shared package-local cache and two routes:

```text
001-3-business.workspace.md
001-3-business.workspace.zip

001-3-1-external-cache.trace.md
001-3-1-external-cache.zip

001-3-1-1-sigma-role-pointer.trace.md
001-3-1-1-1-anchor-to-loom-handoff-pointer.trace.md

001-3-1-2-sigma-role-pointer.trace.md
001-3-1-2-1-leo-role-pointer.trace.md
001-3-1-2-1-1-anchor-to-axiom-handoff-pointer.trace.md
```

Example with no cache and no participant role requirement:

```text
001-5-site.workspace.md
001-5-site.workspace.zip
001-5-1-anchor-to-loom-handoff-pointer.trace.md
```

Exact sibling/ancestor ordering for multiple participant pointers must be deterministic in Tooling, but that serialization order must not create Role hierarchy or authority semantics.

### 6. No duplicated Role authority

Handoff-package Role companions are `tiinex.pointer.v1` artifacts that point to authoritative Roles.

Do not materialize detached copies of `tiinex.party.role.v1` into the carrier merely for package grounding.

### 7. Existing schema mapping we already consider sound

- `READ-BEFORE-PROCEEDING.trace.md` -> `tiinex.pointer.v1`
- `bootstrap.trace.md` -> `tiinex.external.payload.v1`
- `bootstrap.zip` -> raw package-local payload bytes referenced by the bootstrap descriptor
- `*.workspace.md` -> `tiinex.workspace.v1`
- route Handoff Pointer -> `tiinex.pointer.v1`
- participant Role Pointer -> `tiinex.pointer.v1`
- `external-cache.trace.md` -> prefer `tiinex.external.payload.v1`; do not invent `tiinex.cache.v1` merely because the filename says cache
- `external-cache.zip` -> raw package-local payload bytes referenced by the cache descriptor
- authoritative Handoff target -> `tiinex.handoff.v1` in its owning Workspace
- authoritative Role target -> `tiinex.party.role.v1` in its owning authority/Workspace

### 8. Workspace snapshot binding is the remaining semantic simplification question

Current generic Core semantics can model a Workspace ZIP with separate:

- `tiinex.external.payload.v1`; and
- `tiinex.workspace.representation.v1`.

Those schemas solve real general problems such as external payload identity, multiple representations, bounded representations, decoder/mapping qualification, and representation relations that must survive outside a Handoff package.

The lock target does NOT assume those schemas are wrong.

However, a self-contained Handoff carrier deliberately manufactures one package-local Workspace snapshot next to an explicitly referenced Workspace. Requiring two additional durable companion artifacts per Workspace creates substantial carrier and Tooling overhead.

Axiom/Core must therefore decide whether a Handoff-package-specific explicit Workspace -> package-local snapshot binding can own this narrow relation without also materializing standalone External Payload + Workspace Representation companions for the same snapshot.

Preferred solution if semantically sound:

- introduce one narrow `tiinex.handoff.package.v1` schema for `001-tiinex-handoff-package.trace.md`;
- let that package artifact explicitly bind each carried Workspace artifact to its package-local snapshot, including only the minimum qualification fields needed for the carrier contract (for example coverage and byte identity/status where required);
- clarify that this package-local explicit binding is sufficient for this bounded carrier relation and does not invalidate or replace the generic `tiinex.external.payload.v1` / `tiinex.workspace.representation.v1` model elsewhere.

Do NOT overload `tiinex.semantic.package.v1`; its maintained purpose is portable schema/Transition discovery boundaries, not recipient-facing Handoff transport.

Do NOT add separate `cache`, `bootstrap`, `snapshot`, `archive`, `zip`, or `workspace-payload` schemas unless a distinct semantic job is proven first.

### 9. Outer Handoff Package artifact

`001-tiinex-handoff-package.trace.md` should survive only as the one carrier-level identity/discovery contract.

Its job must remain narrow:

- identify this Handoff carrier;
- expose Start/bootstrap;
- explicitly bind the packaged Workspace snapshots if Axiom accepts the narrow package-local binding model;
- expose route roots/selected-route discovery rules;
- declare carrier convenience/progress dimension without rewriting artifact lineage;
- declare only carrier-level qualification facts that cannot be reconstructed more appropriately elsewhere.

It must NOT become a receipt, exhaustive file inventory, integrity ledger, Handoff duplicate, Workspace duplicate, or generic workflow engine.

### 10. Carrier lineage is convenience only

Carrier lineage exists for human progress/continuity convenience.

It does not advance, synchronize, reinterpret, or constrain artifact Parent/Trace/Origin lineages.

Only the first carrier dimension is the carrier major.

No second apparent major may be introduced by concatenating another zero-padded major-looking token after a Workspace slug.

Lineage/path dimensions are numeric only. Do not invent alphabetic dimensions such as `e` or `p`.

A carrier-major boundary carries complete Business + Docs + Site source snapshots and is only called stable after qualification.

### 11. No receipt or verification-artifact multiplication

`receipt.json` is not part of the locked semantic design.

Tooling absolutely may hash, compare, index, inspect, and qualify bytes. Those verification operations do not automatically deserve their own durable artifacts.

Materialize an artifact only when it owns semantic truth that must survive the verification run. Do not turn every checksum, entry comparison, or archive index into lineage.

### 12. Human-first / LLM-first CLI contract

Normal package operations must be exposed through a stable `tiinex` command surface that does not require users or LLMs to know Node entrypoints or invent wrapper scripts.

Target interaction is conceptually closer to:

```text
tiinex orient <carrier>
tiinex receive <carrier>
tiinex validate
tiinex handoff --to loom
```

than to long `node tools/...` invocations with internal manufacture topology flags.

Defaults should carry the normal path. Tooling should ask for input only when required information is genuinely missing or ambiguous.

## Pre-send gates required before this design is considered implemented

Tooling must reject manufacture/qualification when any of the following is true:

1. unknown or unjustified package artifact semantic role;
2. alphabetic/non-numeric package lineage dimension;
3. participant/cache material required by selected route is not on the selected Handoff Pointer's ancestor closure;
4. Handoff Pointer is projected under the wrong Workspace relative to the authoritative Handoff target;
5. detached Role copies are used where Role Pointers should suffice;
6. selected Handoff closure requires packageable external assets that are neither in carried Workspaces nor cache;
7. cache expands to unrelated same-scope material rather than selected-Handoff closure;
8. carrier filename projects more than one apparent major;
9. carrier-major boundary lacks complete Business + Docs + Site source snapshots;
10. `receipt.json` or equivalent parallel semantic truth is reintroduced without explicit authority;
11. normal recipient/manufacture path requires an ad-hoc wrapper script instead of the supported CLI surface.

## Acceptance proof before stable lock

The lock is not complete until the reconciled schemas and Tooling prove at least one real round trip:

```text
cold Start
-> package-local bootstrap
-> select exact Continue/Handoff Pointer
-> traverse its ancestors to package root
-> discover required participant/cache closure before Handoff
-> resolve authoritative Handoff in its owning Workspace
-> perform bounded work
-> manufacture return with supported CLI/default path
-> qualify return
-> cold-start a fresh recipient from only the returned carrier
```

The proof should demonstrate:

- human-readable outer tree;
- no manual archive archaeology on the preferred path;
- no manual/ad-hoc Node wrapper scripts;
- no alphabetic path dimensions;
- correct one-major carrier naming;
- correct Workspace placement of Handoff route;
- participant pointers included before Handoff when required;
- cache only when needed and bounded to selected Handoff closure;
- no exhaustive human-facing cache inventory;
- complete three-repo source at a carrier-major boundary;
- no `receipt.json` dependency;
- ordinary Foundation acceptance/focused suites remain bounded and green.

## Immediate role sequence

### Axiom first — bounded semantic reconciliation

Axiom should answer only the minimum semantic questions needed to freeze the package:

1. Qualify or reject `tiinex.handoff.package.v1` as the narrow carrier-level schema described above.
2. Decide whether its explicit package-local Workspace snapshot binding can replace standalone External Payload + Workspace Representation companion artifacts for that same bounded carrier relation.
3. Preserve the generic External Payload / Workspace Representation schemas for contexts where their independent semantics are actually needed.
4. Confirm package-local Parent/path traversal expresses closure/discovery ordering only, not semantic authority hierarchy.
5. Confirm the listed schema mappings for Start, bootstrap, cache, Handoff Pointer, and participant Role Pointers.
6. Do not broaden Core beyond these demonstrated package gaps.

### Loom second — implement the accepted grammar

After Axiom's bounded answer, Loom should:

1. implement manufacture/orient/qualify around the accepted minimal tree;
2. remove redundant Workspace companion artifacts if Axiom authorizes package-local snapshot binding;
3. implement route ancestor closure for cache + participant pointers before Handoff Pointer;
4. implement Handoff-closure-bounded cache packaging and lookup guidance;
5. make cache Markdown concise/human-readable rather than exhaustive;
6. prohibit network fetching merely to populate cache;
7. fix numeric dimensions and one-major carrier projection;
8. enforce carrier-major full-source closure;
9. keep `receipt.json` out;
10. finish the human/LLM `tiinex` CLI front door and sane defaults;
11. add the pre-send gates above;
12. prove the fresh-recipient round trip before returning to Anchor.

## Priority / continuity rule

This reconciliation is now a Foundation blocking item, not optional UX cleanup.

Do not resume broad transport refactoring, static-debt cleanup, or unrelated Foundation optimization ahead of this package lock unless a newly demonstrated defect prevents the package lock itself.

The interrupted prior Loom CLI/carrier run produced no qualified return and therefore creates no durable implementation state to assume. Re-run or supersede its work only through a new qualified Handoff after this package semantic reconciliation is routed.
