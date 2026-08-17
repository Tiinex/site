# Validation Notes v426 — Semantic-Package Locality + Compiled Transition Registry Integration

Checkpoint: `v426`  
Version: `0.2.245-v426`  
Runtime: `react-v426-semantic-package-locality-transition-registry-integration`

## Starting baseline

Architect-supplied premerged source:

```text
Dev v425 full
11134abb7547a68075ef15a59b169075be44eb53ad471e50af4b31a89fa21dce

+ frozen final Tooling overlay
cfe89535e0a2dfff654f5dc13edbe71e54e974888b9f4c3d76654418e6381199

premerged source
df72fee7489ccc9fdfab9c41b3116adb759613edf24829fd647abb2b8e85f7ef
```

Tooling semantic-package compiler is frozen. v426 changes Site integration/locality, not Tooling semantics.

## Task authority resolution

The pre-v426 Site-local Task schema was stale. Architect authorized exact materialization of the already-qualified canonical Task bytes at:

```text
src/schemas/core/task/tiinex.task.v1.schema.md
```

Qualification:

```text
SHA256             ff26811ac5c4393bc6b69d652f0b9fcdb38c2bdc9688dccb0b42608cbef07a98
Git blob           e4d545ad45382a150351ead587339d8b43cc0fb2
validation groups  6
creation groups    2
freshness           equivalent-current
```

The duplicate Task cache materialization under `src/transitions/canonical-schema-cache/d69b8ff.../` is removed. `CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST` still preserves remote canonical repository/commit/path/blob identity.

## Semantic-package integration

Focused v426 acceptance proves:

```text
Task package                       valid
Topic package                      valid
package nodes                      2
Topic/Task schema resolutions      4 / 4 resolved
Task companion                     valid / consistent
Topic companion                    valid / consistent
compiled Transition registry       exactly 1 Topic→Task representation
attachment provenance              2 explicit companion routes
relative cross-package escape      absent
old Transition source path         absent
new Task-local .transitions path   present
```

The package graph intentionally contains a declared Topic↔Task cycle. The portable compiler reports the cycle informationally and terminates it by exact manifest representation; repeated compilation yields identical graph/resolution/registry projections.

## Frozen product regressions

Required preservation sequence includes:

```text
final v424 product capability/source/path/placement matrix
v422 invocation/binding planner
v423 generation/materialization-intent planner
canonical Task cache source identity
portable semantic-package suites
portable aggregate
v425 browser import boundary
schema navigation
```

The product still executes fresh v422 + v423 and creates exactly one local Task from a qualified source-backed Topic. No product semantic redesign is part of v426.

## Browser import boundary

`tools/check-browser-import-boundary.mjs` remains authoritative for the browser entrypoint. v426 must retain:

```text
node:* edges/importers          0
broad portable barrel edges    0
unresolved local imports       0
```

## Full validate boundary

Full `npm run validate` is run on final candidate bytes. In restore-source environments without installed React/Vite dependencies, the expected first environment stop remains the historical React import boundary after the complete pre-React tranche. The suffix is then run separately so later source regressions are not hidden by the environment.

Runtime smoke and public build are not claimed unless dependencies are actually present.

## Final canonical-contract + integrity closure

Architect's final v426 source gate identified two coupled authority gaps and both are closed without changing Tooling production semantics or package topology.

### G — inherited Root integrity

These four v426 artifacts now carry real c14n-v2 self seals and validate as `valid` under the exact full canonical Root + descendant contract chains:

```text
src/schemas/core/task/task-semantic-package.trace.md
src/schemas/core/topic/topic-semantic-package.trace.md
src/schemas/core/task/tiinex.task.v1-transitions.trace.md
src/schemas/core/topic/tiinex.topic.v1-transitions.trace.md
```

Focused acceptance also removes the footer from one package and one companion and requires full-chain validation to return `incomplete`, proving that inherited `Continuity Integrity` remains an active canonical requirement.

### H — production canonical contract source

Production browser/package compilation no longer consumes Tooling pressure fixtures as contract authority. Exact source-qualified snapshots are used for Root, Transition Definition, Semantic Package, and Schema Transition Companion. The two newly materialized canonical snapshots are byte-checked against:

```text
tiinex.semantic.package.v1
SHA256  5a457d9a7a4f6b9281819d2c1e1bc80e7d4f3ea15069285399fce4f7a28c1502
Git blob 5686051540603e05d483dc527af27b8e69ffee36

tiinex.schema.transition.companion.v1
SHA256  f78dbf800c3080d6f0ab5832a31e793278ba723796996aae57a6a82a4a5c8f4a
Git blob 1b45d674c3f8b553b9a26f2e9983d2ccf4197cca
```

The real product path uses the exact full Transition Definition contract. Site derives the required Topic/Task schema resolver facts from the selected exact schema materials: valid/complete lineage, actual Artifact Creation Contract, and actual File Naming contract surface. This closes the full-contract `target-schema` / classification resolution without modifying the frozen portable compiler.

`tools/check-browser-import-boundary.mjs` now also fails when any browser-reachable production module imports `src/tooling/portable/package/fixtures/**`.

Required final invariants:

```text
four package/companion full canonical-chain validations   PASS
real c14n-v2 self seals                                  PASS
production package pressure-fixture imports              0
Semantic Package snapshot identity                       exact
Schema Transition Companion snapshot identity            exact
compiled Task↔Topic registry                              valid / exactly one Topic→Task
compiled registry → Site product → fresh v422/v423       PASS
v424 product matrix                                       PASS
v425 browser boundary                                     PASS
```

## Q-fail canonical Topic→Task browser-path closure

Q acceptance exposed a real actual-path mismatch: ordinary GitHub source loading with blank/default Ref left a moving branch (`main`/`master`) as `source.ref`, while canonical Parent recovery correctly required immutable commit-pinned provenance. Presentation then exposed legacy `topic.continue.task`, masking the unavailable canonical path.

The bounded correction preserves requested/configured ref truth and adds immutable materialization provenance rather than weakening Parent semantics.

Required focused pressure now covers:

```text
blank/default ref + exact resolved commit
→ branch/default ref preserved
→ materializedCommit preserved
→ raw Markdown loaded from exact commit URL
→ canonical Parent qualified

named branch + exact resolved commit
→ canonical Parent qualified

explicit 40-char commit
→ unchanged qualified
→ no redundant commit-resolution request

branch with no exact material commit
→ source load may remain readable
→ materializedCommit absent
→ canonical product unavailable
→ legacy compatibility does not mask active bundled canonical authority
```

The Q-like actual-path acceptance runs through `runGithubSourceOperation` with a blank Ref and proves:

```text
configured source ref         main
requestedRef                  blank
materializedCommit            exact 40-char SHA
record sourceTarget commit    same exact SHA
raw URL                       exact commit-pinned URL
canonical product action      present / productCapable
legacy topic.continue.task    absent
canonical authoring inputs    Summary, Objective, Done Criteria, Scope, Dependencies
fresh v422                    qualified
fresh v423                    qualified
local Task                    exactly one
source Topic                  byte-unchanged
Parent permalink              exact commit-pinned GitHub blob URL
```

Durability regressions additionally prove that `materializedCommit` does not redefine configured-source identity and survives route/F5 projection separately from requested/default ref truth.

The browser import-boundary invariants remain unchanged:

```text
node:* edges/importers          0
broad portable barrel edges    0
package pressure fixture edges 0
unresolved local imports       0
```

## Final GitHub discovery request-budget closure

The immutable GitHub provenance correction increased the direct repo-discovery request shape. Transport policy now derives the budget before discovery from the selected ref:

```text
blank/default + budget 2   → blocked before fetch
blank/default + budget 3   → allowed
named ref + budget 1       → blocked before fetch
named ref + budget 2       → allowed
exact commit + budget 1    → allowed
```

Blocked discovery preserves the existing degraded-warning contract and performs zero direct GitHub discovery fetches. The correction is owned by `github.repoDiscovery.js`; `github.adapter.js` only consumes the derived count and remains under the 24 KB source guard.

## Final GitHub raw-file request-budget closure

Explicit/raw-file loading now derives request-policy cost from the same ref-shape authority as repo discovery. Focused direct-transport pressure proves:

```text
one explicit file, blank/default, budget 2
→ BLOCKED before any direct fetch
→ requestedRequests = 3

one explicit file, blank/default, budget 3
→ ALLOWED
→ exact commit-pinned raw load

one explicit file, named branch, budget 1
→ BLOCKED before any direct fetch
→ requestedRequests = 2

one explicit file, named branch, budget 2
→ ALLOWED

one explicit file, exact commit, budget 1
→ ALLOWED
→ no default-branch or commit-resolution fetch

two unique explicit files, blank/default, budget 3
→ BLOCKED
→ requestedRequests = 4

two unique explicit files, blank/default, budget 4
→ ALLOWED

prequalified materializedCommit + one raw target, budget 1
→ ALLOWED
→ only the raw target request is made
```

Repo-discovery 3/2/1 accounting remains unchanged and is now implemented from the same `githubRefResolutionRequestCount()` owner. No global budget, provenance rule, configured-source identity, canonical Parent rule, legacy migration rule, package/locality behavior, Tooling semantic code, or Task product semantics changes in this closure.


## Prequalified materializedCommit repo-discovery consistency closure

Focused direct-transport pressure proves:

```text
ref=main + prequalified exact materializedCommit + discovery budget 1
→ allowed
→ tree at exact materializedCommit
→ zero /commits/ requests
→ raw record uses the same exact materializedCommit
→ configured ref remains main

blank ref + prequalified exact materializedCommit + discovery budget 1
→ allowed
→ no repo metadata/default-branch request
→ no /commits/ request
→ tree + raw use the exact materializedCommit
→ configured ref remains blank

fresh named branch without prequalification
→ existing 2-request discovery accounting preserved

fresh blank/default without prequalification
→ existing 3-request discovery accounting preserved

exact commit ref without separate materializedCommit
→ existing tree-only discovery preserved
```

An actual `runGithubSourceOperation` refresh regression seeds `ref=main` with historical `OLD materializedCommit`, performs a fresh direct refresh, resolves the branch to `NEW`, uses `NEW` for both tree and raw bytes, preserves configured `ref=main`, and persists `NEW` as the new immutable materialization receipt. This prevents prequalified optimization from freezing ordinary mutable-branch refresh semantics.
