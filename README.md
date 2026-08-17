# Tiinex Site v426 — Semantic-Package Locality + Compiled Transition Registry Integration

v426 migrates the already source-gated canonical Topic → Task product definition from an application-local Transition directory into an explicit schema-local semantic-package neighborhood. Product semantics remain frozen from v424/v425; discovery/locality authority now comes from the frozen portable semantic-package compiler.

## Canonical locality

The one bundled Topic → Task Transition Definition now lives at:

```text
src/schemas/core/task/.transitions/
  topic-to-task-transition-definition.trace.md
```

There is no second bundled representation under `src/transitions/definitions/`.

Task and Topic expose explicit package neighborhoods:

```text
src/schemas/core/task/
  task-semantic-package.trace.md
  tiinex.task.v1-transitions.trace.md
  tiinex.task.v1.schema.md
  .transitions/topic-to-task-transition-definition.trace.md

src/schemas/core/topic/
  topic-semantic-package.trace.md
  tiinex.topic.v1-transitions.trace.md
  tiinex.topic.v1.schema.md
```

The package graph uses explicit `site-local:` cross-package routes. Task owns the Transition representation. Topic reverse-discoverability is an explicit companion attachment through the declared Task package dependency; it does not duplicate the Transition.

## Task schema authority normalization

`src/schemas/core/task/tiinex.task.v1.schema.md` now contains the exact already-qualified canonical Task bytes:

```text
SHA256  ff26811ac5c4393bc6b69d652f0b9fcdb38c2bdc9688dccb0b42608cbef07a98
Git blob e4d545ad45382a150351ead587339d8b43cc0fb2
```

Canonical source identity remains Tiinex/docs at the manifest-declared repository/commit/path/blob. The old duplicate physical Task copy under `src/transitions/canonical-schema-cache/d69b8ff.../` is removed. Root and Transition Definition cache entries remain where they were.

## Compiled runtime discovery

`canonicalTransition.semanticPackage.js` is a Site adapter over the frozen portable leaf compiler. It compiles:

```text
Semantic Package Manifest
+ Schema Transition Companion
+ exact schema material
+ one Task-local Transition Definition
→ package graph
→ schema resolutions
→ attachment projection
→ distributed Transition registry
```

The browser defaults consume the resulting compiled registry rather than importing a hard-coded `src/transitions/definitions` file. Site still adapts the compiled representation into the existing frozen Transition read/planner/product shapes.

The compiled package is expected to prove:

```text
2 package nodes
4/4 Topic/Task schema resolutions
2 valid companions
1 Topic → Task registry representation
2 explicit attachment provenance records
```

The Topic↔Task package cycle is explicit, observable, and deterministically terminated by the portable compiler. Package path is locality/provenance, not Transition semantic identity.

## Product behavior preserved

v426 does not reopen the v424 product mechanism:

```text
source-backed Topic
→ Create task
→ canonical five-field form
→ fresh v422
→ fresh v423
→ canonical Task Markdown
→ source-backed Parent
→ exactly one browser-local Task
```

No remote write, repository path allocation, source mutation, relation materialization, or generic Transition execution is introduced.

The legacy `topic.continue.task` bridge remains compatibility-only and is suppressed only by the exact Site-bundled compiled Topic→Task representation provenance, not by Canonical Identifier or path equality.

## Browser boundary

v425 remains frozen:

```text
src/main.jsx browser graph
→ 0 node:* import edges/importers
→ 0 broad src/tooling/portable/index.js edges
```

v426 imports only exact portable leaf owners for semantic-package compilation and schema contracts.

## Environment boundary

Restore-source validation may still stop when the later React-specific tranche reaches `useLocalMaterialIntake` without installed dependencies. That is an environment boundary, not a v426 product claim. Runtime/public build remain unclaimed unless a real Vite/React dependency tree is available.

## Supported local start

With dependencies installed, use the repository's Vite development server:

```bash
npm run dev
```

The supported local address is:

```text
http://127.0.0.1:5173/
```

A source-only restore without installed dependencies does not claim runtime/browser readiness.

## Final canonical-contract and integrity closure

The four v426 package/companion artifacts are now finalized as ordinary Tiinex descendants under the full canonical Root contract. Each carries a real `sha256-base64url-c14n-v2` self seal, and the final acceptance validates the artifacts against the exact full Root + descendant contract chains rather than lightweight Tooling pressure fixtures.

Production semantic-package compilation no longer imports `src/tooling/portable/package/fixtures/**` as contract authority. The Site-owned `canonicalTransition.packageContracts.js` seam carries exact source-qualified snapshots for:

```text
Root
Tiinex/docs@d69b8ff55a56b8cb9282b8684db6a938a4435b94

Transition Definition
Tiinex/docs@d69b8ff55a56b8cb9282b8684db6a938a4435b94

Semantic Package
Tiinex/docs@053d46ce082d4ec261b82abc44ecca403d61e240
SHA256 5a457d9a7a4f6b9281819d2c1e1bc80e7d4f3ea15069285399fce4f7a28c1502
Git blob 5686051540603e05d483dc527af27b8e69ffee36

Schema Transition Companion
Tiinex/docs@053d46ce082d4ec261b82abc44ecca403d61e240
SHA256 f78dbf800c3080d6f0ab5832a31e793278ba723796996aae57a6a82a4a5c8f4a
Git blob 1b45d674c3f8b553b9a26f2e9983d2ccf4197cca
```

The package adapter supplies schema semantic resolvers derived from the exact Topic/Task schema materials that are already present in the selected package graph. A schema contributes resolver authority only when its full Root+schema lineage compiles `valid / complete`; generation authority comes from an actual Artifact Creation Contract and File Naming authority from the actual `File Naming` validation group. No schema assignability or second schema ontology is introduced.

The browser import-boundary gate additionally rejects any browser-reachable Tooling package pressure fixture, while retaining the v425 invariants of zero `node:*` edges/importers and zero broad portable-barrel edges.

## Q-fail canonical Topic→Task browser-path closure

The first real v426 Q run showed the legacy continuation dialog instead of the canonical five-field Task dialog. The browser path was using ordinary GitHub default-ref material while the earlier product fixture already carried an exact 40-character commit.

The source model now keeps two separate truths:

```text
requested / configured ref
→ blank, main, master, branch, tag, or exact commit
→ configured-source boundary truth

materialized representation
→ exact Git commit when transport can resolve it
→ immutable record/source provenance
```

Direct GitHub repo/file materialization resolves an exact commit when possible and loads repo-relative Markdown from that commit-pinned raw target. The resulting record carries `sourceTarget.materializedCommit`; configured sources retain `ref`/`requestedRef` separately and may carry the same materialization receipt without changing configured-source identity.

Canonical Topic→Task Parent recovery accepts only immutable 40-character materialization authority. A moving branch without an exact resolved commit may still be readable source material, but it is not canonical Parent authority and remains product-unavailable.

The exact Site-bundled Topic→Task definition also owns the compatibility migration boundary even when its local-create capability cannot qualify. Legacy `topic.continue.task` therefore no longer silently substitutes for a provenance failure while the canonical packaged definition is active.

Focused acceptance now reproduces the ordinary browser ingress:

```text
blank Ref
→ GitHub default branch main
→ exact resolved commit
→ commit-pinned raw Topic bytes
→ canonical product action
→ Task title / Objective / Done Criteria / Scope / Dependencies
→ fresh v422
→ fresh v423
→ exactly one browser-local Task
→ commit-pinned Parent
→ source Topic unchanged
```

The synthetic exact-commit fixture remains as an independent regression; it is no longer the only actual-path proof.

## Final GitHub discovery request-budget closure

Immutable commit resolution adds transport work to direct repo discovery, so request-policy accounting now follows the selected ref shape before any covered discovery fetch begins:

```text
blank/default ref
→ default-branch resolution + commit resolution + tree
→ 3 requests

named branch/tag
→ commit resolution + tree
→ 2 requests

exact 40-char commit
→ tree
→ 1 request
```

A failed best-effort commit-resolution attempt still consumes its request. This changes only transport-budget accounting; requested/configured ref truth, `materializedCommit`, canonical Parent recovery, legacy masking, package/locality semantics and Task creation remain unchanged.

## Final GitHub raw-file request-budget closure

The sibling explicit/raw-file path now uses the same ref-resolution accounting authority as repo discovery. For `N` unique raw targets, transport policy authorizes the complete direct request shape before the first covered fetch:

```text
blank/default ref, no immutable materialized commit
→ default-branch resolution + commit resolution + N raw files
→ N + 2 requests

named branch/tag, no immutable materialized commit
→ commit resolution + N raw files
→ N + 1 requests

exact 40-char commit
→ N raw files
→ N requests

already-qualified materializedCommit
→ N raw files
→ N requests
```

The helper is shared with repo-discovery accounting in `github.repoDiscovery.js`; a failed best-effort commit-resolution attempt still consumes the request it attempted. Policy blocks preserve degraded-warning semantics and occur before direct GitHub fetches. Requested/configured ref truth and immutable `materializedCommit` truth remain separate.


## Prequalified materialized-commit repo-discovery consistency closure

Repo discovery now consumes an already-qualified exact `materializedCommit` as the immutable representation authority instead of re-resolving the configured/default ref. This keeps request accounting and actual direct transport equivalent:

```text
prequalified materializedCommit
→ no default-branch request
→ no branch/tag commit-resolution request
→ tree directly at materializedCommit
→ raw Markdown from the same materializedCommit
```

Configured source truth remains separate: a named `ref` such as `main` remains `main`, and a blank configured ref remains blank rather than being rewritten to the commit. A normal source refresh does not inherit a historical materialization receipt as invocation authority; it resolves the current mutable ref again and stores the newly materialized exact commit.
