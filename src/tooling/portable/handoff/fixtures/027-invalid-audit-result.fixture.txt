# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 21:52:00
  - Authors: Loom
  - Why: Return the bounded Tooling 027 carrier/control-plane responsibility audit, workspace-artifact/archive classification, and measured candidate evidence without migrating the production Handoff representation.
  - Summary: Tooling 027 result — current control-plane classification, exact-material deduplication analysis, workspace-archive A/B evidence, schema-binding blocker, and bounded implementation recommendation.
  - Status: draft/local

---

# Tooling 027 result — Handoff workspace archive and control-plane minimality audit

## Objective

Audited the exact received Tooling 027 Handoff carrier, the manufacturing/inspection code carried in the workspace and embedded portable runtime, and the exact `tiinex.workspace.v1` schema at the supplied Site commit. Compared the current exploded workspace carriage against a bounded nested-workspace prototype without changing normal manufacture/output semantics.

## Executive Disposition

- Disposition: **open a bounded implementation task, gated by Axiom/schema classification; keep the current production carrier until that task is independently accepted.**
- The workspace-artifact plus exact workspace-archive direction is mechanically viable and materially reduces outer carrier surface. Existing archive Tooling can decode the nested tree in memory and preserve exact per-entry SHA-256 qualification without arbitrary filesystem extraction.
- The current `tiinex.workspace.v1` schema does **not** authorize a package-local binding from an arbitrary workspace artifact/instance to an exact workspace-tree archive. `Workspace Entrypoints` describe source declarations and `Repository Transports` describe repository delivery; overloading either would change their semantics. Axiom must classify whether the binding belongs in a workspace schema extension or, preferably if semantically sufficient, a package/Handoff workspace-carrier binding descriptor that references an ordinary workspace artifact plus an archive representation.
- The generic export-package control layer is valid as an inner planning/build layer but is misleading at the final Handoff boundary. In particular, serialized `manifest.json` and `receipt.json` still say a future package may be built / no ZIP was written after Handoff manufacture has already produced the actual carrier. These controls are current compatibility dependencies, not Handoff semantic truth.
- All six `handoff.material` carriers in the received package are byte-identical to entries already carried in the qualified `tiinex-site` workspace. This package therefore proves a real deduplication opportunity. Detached material must remain available when exact material is not already addressable through a qualified workspace provider.

## Current Carrier Qualification

Embedded portable Tooling replayed the exact received package:

- `orient-handoff-package`: `ready`.
- `audit-handoff-package-context`: `ready`; 104/104 non-control carriers classified, zero unexplained carriers.
- Duplicate-byte summary: 6/6 detached `handoff.material` carriers also exist byte-identically in the qualified workspace.
- `ground-cold-consumer`: degraded only because the carried package has no current Loom Role artifact; the Handoff purpose resolved correctly.
- The carried workspace snapshot is intentionally partial as a source checkout. Running focused tests directly from that partial workspace fails on omitted runtime files. Replaying those same focused tests against the package-qualified embedded runtime plus the carried test fixtures passes carrier projection, cold-consumer START, context audit, Pointer projection, transport companion, multi-root manufacture, scale manufacture, and Tooling 026 cold-start qualification.

## Responsibility Inventory

| Surface | Exact responsibility / authority | Current consumers / integrity dependency | Classification | Tooling 027 disposition |
| --- | --- | --- | --- | --- |
| package-root Pointer(s) | One normal `tiinex.pointer.v1` route projection per qualified Handoff; no semantic/Parent authority | `inspectHandoffPointerEntrypoints`; cold orientation requires Pointer projection to correlate with carrier/workspace bytes | derived projection; intentional compatibility duplicate with START | retain during migration; removable only through versioned orientation compatibility change |
| `tiinex.bootstrap/manifest.json` + runtime | Qualifies exact portable runtime bytes and entrypoint; bootstrap transport authority only | cold host/bootstrap execution; manifest-declared exact runtime qualification | unique required bootstrap control | keep outside workspace archives; persistent-host omission only after exact version/source/integrity qualification and explicit unavailable state |
| `handoff.workspaces/<id>/...` | Current exact workspace byte carrier; directory shape itself has no semantic identity/completeness authority | closure workspace materializations, carrier route lookup, Required Context resolution, context audit, file map | required current byte provider; high native-indexing surface | candidate replacement is archive-aware workspace provider, not blind deletion |
| `handoff.material/**` | Route-scoped exact Required/Reference Context byte closure independent of workspace path/discovery | closure descriptor, Required Context fallback, context audit, file map | required fallback; duplicated in this package | dedupe only when workspace/archive provider proves exact `(workspace identity, inner path, bytes, SHA-256)` equivalence fail-closed; otherwise retain detached bytes |
| `context/workspace.json` | Generic export/re-ingest workspace context projection; not a lineage-bearing `tiinex.workspace.v1` artifact and not Handoff route truth | generic export manifest/index/file-map layer | projection; effectively empty in this package | remove/rehome only with Handoff-specific control-topology change; do not confuse with proposed `.workspace.md` artifact |
| `tiinex.package/START.md` | Cold-consumer preferred-path projection and bounded route/workspace selector; semantic authority none | `inspectHandoffColdConsumerEntrypoint`; `orient-handoff-package`; Tooling 026 preferred ingress | derived projection; currently compatibility-critical | retain until canonical Pointer/bootstrap path fully subsumes START under a versioned compatibility transition |
| `tiinex.package/handoff-carrier.json` | Recomputed route/workspace membership, route selection, projected human filename, Required Context route-grounding projection | START/Pointer inspection, human output, shared-route selection | Handoff-specific derived control with important qualification role | keep concept; candidate must become archive-provider-aware rather than pathing directly to exploded outer files |
| `tiinex.package/handoff-closure.json` | Exact Required/Reference material plan, selected-provider/provenance, workspace materialization/correlation, bootstrap and roundtrip evidence | carrier Required Context resolution, context audit, package readiness | Handoff-specific closure control; large but semantically useful | keep responsibility; simplify representation after archive binding is classified, especially per-entry workspace locator shape and duplicate materialization |
| `tiinex.package/handoff-companion.json` | Disposable transport/UI action projection over package status/routing; no semantic authority | manufacture validity and transport presentation | derived projection | can be regenerated from qualified carrier/closure; candidate for on-demand projection or compacting, not first removal target |
| `tiinex.package/file-map.json` | Durable exact path/length/SHA-256 map for every governed outer package file and serialized representation digest | package bundle inspection, tamper detection, all final controls | unique integrity authority | keep. For nested workspaces govern the archive blob at outer level and add independently qualified inner-entry map/provider contract; do not trust archive filename |
| `tiinex.package/build-receipt.json` | Records deterministic construction status and a second digest over non-control material | generic control-consistency inspector; rewritten during Handoff manufacture | derived build evidence; partially duplicates file-map/manifest status | rehome the genuinely useful build/material digest or drop it in a new Handoff topology only after invariant coverage is preserved |
| `tiinex.package/manifest.json` | Generic export-package material-selection plan and semantic fingerprint | generic control consistency; currently also supplies primary workspace id/title to carrier workspace projection | valid inner-layer plan, misleading as final Handoff lifecycle projection | Handoff v2 should stop depending on it for route/workspace truth; primary workspace identity belongs in Handoff/workspace carrier controls |
| `tiinex.package/receipt.json` | Receipt for creation of the generic export manifest, explicitly `planned` | generic control consistency and embedded contract equality | stale-at-final-boundary planning receipt | remove/rehome in Handoff-specific topology; do not present as final carrier receipt |
| `tiinex.package/contract.json` | Embeds preflight + full manifest + full receipt | generic control consistency requires exact duplicate equality | high-duplication generic export contract | strongest control-boilerplate removal candidate once Handoff-specific topology owns its needed invariants |
| `tiinex.package/index.json` | Fixed pointers to generic control documents plus generic material entries | control-topology inspector | derived path index; canonical paths are already fixed in code/schema | remove or shrink in Handoff-specific topology after versioned compatibility change |
| `tiinex.package/findings.json` | Generic export bundle findings | topology requires presence; no unique Handoff semantic content in this package | projection-only / empty here | merge into Handoff qualification output or omit in a new topology if error disclosure remains explicit |

## Manifest / Receipt Finding

The apparent contradiction is layered rather than byte corruption:

1. `buildRecipientRelativeHandoffTransportPackage` first creates a generic export `baseBundle`.
2. That base bundle serializes a manifest saying it describes a future bounded export package with `packageZipCreated: false`, and a receipt saying no ZIP was written and a future export builder may create one.
3. Handoff manufacture then appends workspace/material/bootstrap/Handoff controls, rewrites the build receipt's material digest, rebuilds the durable file map, and serializes the actual Handoff ZIP.

Therefore the old language is truthful about the earlier export-planning operation but misleading when read as final carrier state. The result is **misleading projection reuse**, not a reason to distrust the file map. A Handoff-specific topology should not carry those lifecycle claims unless it explicitly labels them as an inner export-plan receipt.

## `handoff.material` Closure / Deduplication Contract

Detached `handoff.material` is currently a robust route-relative exact-byte provider. It remains necessary when a requirement is external to carried workspaces, a workspace snapshot is partial/unqualified, the target path is unavailable/ambiguous, or route-local custody requires a distinct representation.

A workspace/archive binding can provide equivalent closure only if all of the following fail closed:

- one qualified workspace instance/provider is selected independently of filename/directory placement;
- one safe normalized inner path resolves inside that workspace archive;
- the archive blob itself is governed by outer file-map bytes/SHA-256;
- the selected inner entry's exact bytes and SHA-256 are independently verified against the workspace-carrier binding/index;
- the Handoff reference resolves to that exact `(workspace, inner path)` pair without escaping the workspace root;
- duplicate inner paths, duplicate workspace identities, archive corruption, digest mismatch, missing archive/provider, or unavailable archive Tooling block qualification;
- Required Context remains blocking while Reference Context may remain non-blocking according to the existing contract.

On the received package, all six detached materials meet the first-order dedupe condition because context audit found byte-identical workspace copies. Production dedupe still waits for the archive-provider binding semantics above.

## Workspace Artifact / Archive Semantic Classification

The exact `tiinex.workspace.v1` schema at the supplied Site commit defines `.workspace.md` as a portable workspace entrypoint. It allows `Workspace Entrypoints` for source declarations and `Repository Transports` whose `snapshot` form is specifically a repository delivery path where separate snapshot metadata owns repository commit, archive location, and checksum.

No existing field declares: “this workspace artifact/instance is represented by this package-local exact workspace-tree archive.” Using `Workspace Entrypoints`, `Repository Transports`, `Machine State`, filename adjacency, or directory colocation for that binding would silently assign new semantics.

Required classification before implementation:

- preferred question: can a Handoff/package-local `workspace-carrier` binding descriptor own the artifact-digest ↔ archive-digest ↔ inner-entry-map relationship while leaving `tiinex.workspace.v1` unchanged?
- if the relationship is intended to be portable workspace semantics outside Handoff/package transport, then extend/classify `tiinex.workspace.v1` explicitly instead.
- either way, semantic workspace identity must not derive from `<name>.workspace.md`, `<name>.workspace.zip`, archive filename, or `tiinex.workspaces/` placement.

## Size / Compression Evidence

Exact received carrier:

- outer ZIP bytes: 4,743,466;
- outer files: 430;
- all outer entries use ZIP `STORE` (no compression);
- `handoff.workspaces`: 96 files, 962,833 payload bytes;
- `tiinex.bootstrap`: 315 files, 3,178,145 payload bytes;
- `tiinex.package`: 11 files, 456,676 payload bytes;
- file map alone: 303,985 bytes; its 96 workspace entries account for about 60,978 compact-JSON bytes before pretty-print overhead;
- detached `handoff.material`: 45,424 bytes, all duplicate in this package.

Bounded candidate experiment, keeping non-workspace outer files unchanged and replacing the 96 exploded workspace files with one provisional workspace artifact plus one workspace ZIP:

| Representation | Bytes | Outer files | Observation |
| --- | ---: | ---: | --- |
| received exploded, outer STORE | 4,743,466 | 430 | production baseline |
| inner workspace STORE, outer STORE | 4,738,269 | 336 | entry-count reduction alone barely changes bytes |
| inner workspace DEFLATE, outer STORE | 4,024,643 | 336 | −718,823 bytes / −15.15%; workspace archive 266,699 bytes vs 962,833 raw workspace payload |
| inner workspace STORE, outer DEFLATE | 1,022,452 | 336 | outer compression benefits all text/bootstrap material; not supported by current deterministic STORE serializer |
| inner workspace DEFLATE, outer DEFLATE | 1,070,114 | 336 | 47,662 bytes larger than storing an uncompressed inner ZIP under an outer-deflated carrier; concrete double-compression penalty |

The existing deterministic package serializer intentionally writes STORE-only ZIP entries. Therefore a compressed inner workspace archive stored verbatim by the current outer serializer is the directly compatible compression shape. If a future serializer adds per-entry DEFLATE for ordinary controls/bootstrap, it should STORE already-compressed workspace archives rather than recompress them.

Serialization microbenchmarks on this host are observations, not SLAs: current outer STORE rebuild median ~9.83 ms; inner workspace DEFLATE median ~31.24 ms; candidate outer STORE assembly after inner archive exists ~6.61 ms; outer-DEFLATE candidate variants ~108–134 ms. These timings exclude model/UX latency and are not acceptance thresholds.

## Cold-Start / Archive-Provider A/B Evidence

The accepted Tooling 026 contract remains the behavioral authority: zero arbitrary native archaeology before qualified orientation is the preferred path regardless of carrier shape. The carrier shape changes accidental-indexing pressure; it does not redefine PASS.

Deterministic local A/B observations:

- current outer package load through portable Node ZIP intake: 430 outer files, median ~57.0 ms in the bounded run;
- current `orient-handoff-package` over already loaded material: `ready`, median ~45.8 ms;
- nested candidate outer package load: 336 outer files, median ~21.2 ms;
- existing Tiinex archive decoder consumed the compressed inner workspace in memory: 96 entries, zero errors/warnings; median ~70.8–98.9 ms across the two bounded probes depending on selected verification work;
- exact route plus all four Required Context targets were recovered from the inner archive with SHA-256 values identical to the current carrier projections;
- no filesystem extraction was required by the nested probe.

This does **not** qualify candidate orientation performance because current `orient-handoff-package` still expects exploded `workspace.materialization.includedEntries[].packagePath` files in the outer bundle. The experiment proves the archive-decoding primitive and exact-byte recovery seam exist; the bounded implementation must wire that provider into carrier/closure/orientation and then rerun Tooling 026 qualification.

Native-indexing surface in the exact single-workspace package drops from 96 exposed workspace files to two outer workspace carriers (`.workspace.md` + `.workspace.zip`). A naive outer ZIP index therefore has 94 fewer workspace leaves to inspect before Tooling takeover. Preferred-path qualification should still record zero arbitrary reads; this is reduction of temptation/cost, not permission for native archaeology.

## Single- / Multi-Workspace Equivalence Requirements

Current multi-workspace route semantics already key routes by `workspaceId + workspace-relative path`; the copied runtime replay passes the existing multi-root manufacture and multi-workspace START/carrier pressure tests.

The nested prototype duplicated the same inner route path across two workspace archive providers. Path-only lookup produced two matches, while `(workspaceId, innerPath)` resolved uniquely for both. This is the required behavior: archive nesting must preserve workspace-qualified addressing and must never let an identical inner path collapse cross-workspace identity.

A bounded implementation must add positive and adversarial fixtures for at least:

- single workspace, one route, required material satisfied from archive entries;
- two workspaces with the same inner relative route path, explicit route selection preserved;
- detached material fallback when an exact workspace entry is unavailable;
- missing/duplicate workspace binding, duplicate inner path, unsafe inner path, wrong inner digest, changed archive blob, stale inner index, wrong workspace artifact digest, and archive decoder unavailable;
- outer file-map tamper and inner-entry tamper independently fail;
- carried canonical Tiinex Markdown bytes remain unchanged and package-wide continuity qualification still recomputes c14n-v2 rather than trusting stored footer equality.

## Minimal Control-Plane Target

Do not delete current files in place. The implementation target should introduce a versioned Handoff carrier topology with these responsibilities preserved explicitly:

- root Tiinex orientation projection(s): Pointer and/or START during compatibility migration;
- qualified bootstrap control/runtime outside workspace archives;
- Handoff route/workspace carrier projection;
- Handoff material/workspace closure descriptor;
- durable outer file map;
- one ordinary lineage-bearing `.workspace.md` artifact per workspace;
- one exact workspace archive per workspace plus a classified package-local binding/index;
- detached `handoff.material` only for requirements not equivalently satisfied by qualified workspace archive entries.

Generic export `manifest`/`receipt`/`contract`/`index`/empty `findings`/`context/workspace.json` should not be copied forward merely because the current Handoff builder starts from an export bundle. Any genuinely unique invariant they currently provide must be named and rehomed before removal. `build-receipt` may be retained in compact form or folded into the file-map/closure qualification if its non-control material digest/build-state evidence remains independently checkable.

## Bounded Implementation Task Shape

Open implementation only after Axiom answers the workspace-artifact/archive binding classification. Then:

1. add an archive-backed workspace byte-provider interface keyed by qualified workspace identity plus normalized inner path;
2. make carrier route qualification, Required Context resolution, context audit, and human-output projection consume that provider instead of assuming exploded outer `packagePath` leaves;
3. introduce deterministic workspace archive manufacture and an inner path/bytes/SHA-256 index with safe-path and duplicate-path rejection;
4. deduplicate detached material only after exact provider equivalence is proven;
5. version the Handoff-specific control topology and remove/rehome generic export-plan controls only with invariant-by-invariant regression proof;
6. preserve Pointer/START compatibility until the new orientation path is independently qualified;
7. rerun Tooling 026 preferred-path fixtures plus actual cold-session A/B, file-map/tamper/context-audit, single/multi-workspace, bootstrap-unavailable, and package-wide continuity conformance;
8. do not switch normal manufacture/output by default until independent Anchor review accepts the implementation and Sigma personally inspects the first actual new-format Handoff package.

## Scope / Limits

No production carrier migration, canonical workspace schema mutation, remote write, authentication, publication, Viewer/VS Code implementation, or change to active publication semantics was performed. Experimental nested archives and probes are non-authoritative evidence only. Observed timings are bounded measurements, not benchmark thresholds or SLAs.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:7q8dNLTLDhDzqOZNF9rhEE-pwJ1LdwRBiXtcy2xRUFo
