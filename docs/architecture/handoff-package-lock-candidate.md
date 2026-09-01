# Handoff Package Lock Candidate

Status: Anchor semantic lock accepted; Tooling implementation lock pending. Axiom has qualified the narrow `tiinex.handoff.package.v1` contract and its complete-only package-local Workspace snapshot binding in carried Docs. The Handoff Package is not fully locked until Loom implements the accepted grammar and Anchor qualifies the required fresh-recipient round trip.

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

#### Participant Role Pointer authority boundary

Package-local Role Pointers are recipient discovery/grounding prerequisites only. Their presence or ancestor position MUST NOT be interpreted as a semantic claim that the Role participates in, is required by, accepts, owns, delegates, or is an endpoint of the Handoff.

If participation or required/reference context is part of the actual work meaning, that meaning must be declared by the authoritative Handoff and/or an explicit typed Relation under current Docs authority. The Handoff may then carry that Relation as Required Context or Reference Context as appropriate.

Tooling may use package-local Role Pointers to ensure a cold recipient can resolve the Role before following the Handoff Pointer, but MUST NOT synthesize a canonical `participantRolePointers` semantic field, or an equivalent participant claim, from package placement or traversal order alone.

In short:

```text
Package ancestor Role Pointer
-> recipient discovery / grounding requirement

Authoritative Handoff + typed Relation/context
-> semantic meaning of participation
```

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

### 8. Workspace snapshot binding is semantically reconciled

Axiom qualified one narrow `tiinex.handoff.package.v1` carrier schema in carried Docs and qualified a strict complete-only package-local Workspace snapshot binding.

For this exact Handoff-package relation:

- the package artifact may bind one explicit carried `tiinex.workspace.v1` artifact to one exact package-local complete Workspace byte-tree snapshot;
- the binding owns package-member byte identity and receiver requalification only for this carrier;
- `Snapshot Kind` is `exact-workspace-byte-tree-archive` and `Coverage` is `complete`;
- verified binding requires exact SHA-256 over the snapshot bytes plus exact byte equality between the carried Workspace artifact and its declared inner snapshot entry;
- standalone `tiinex.external.payload.v1` plus `tiinex.workspace.representation.v1` companions are not semantically required for that same package-local complete binding when they have no independent semantic job.

The generic schemas remain authoritative and unchanged where their independent semantics are needed. In particular, bounded/partial/unknown Workspace representations, multiple selectable representations, independent provider activation, or payload identity/location/access/recovery outside the carrier MUST continue to use the generic External Payload / Workspace Representation model.

Bootstrap and cache descriptors remain `tiinex.external.payload.v1` because they own independent package-local payload-reference jobs.

Do NOT overload `tiinex.semantic.package.v1`; its maintained purpose remains portable schema/Transition discovery boundaries, not recipient-facing Handoff transport.

Do NOT add separate `cache`, `snapshot`, `archive`, `zip`, or `workspace-payload` schemas unless a distinct semantic job is demonstrated.

Canonical semantic authority for this reconciliation is carried in Docs at:

- `.topics/.schemas/coordination/handoff/package/tiinex.handoff.package.v1.schema.md`
- `.topics/handoff-package/001-axiom-handoff-package-semantic-reconciliation.trace.md`

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
- Role pointers included before Handoff when required for recipient grounding, without treating package placement as semantic participation;
- cache only when needed and bounded to selected Handoff closure;
- no exhaustive human-facing cache inventory;
- complete three-repo source at a carrier-major boundary;
- no `receipt.json` dependency;
- ordinary Foundation acceptance/focused suites remain bounded and green.

## Immediate role sequence

### Axiom reconciliation — complete

Axiom has qualified the narrow `tiinex.handoff.package.v1`, the complete-only package-local Workspace snapshot binding, and the non-conflict boundary that package-local Parent/path traversal and Role Pointer placement are recipient discovery/grounding only. No participant/Role ontology was added and no broader transport ontology is authorized.

Reopen Axiom only for a demonstrated conflict with maintained Docs authority or an implementation blocker that cannot be solved within the accepted narrow contract.

### Loom next — implement the accepted grammar

Loom should:

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
