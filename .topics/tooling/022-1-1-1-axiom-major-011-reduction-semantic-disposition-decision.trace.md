# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 01:09:18
  - Trace: [022-1-1-anchor-to-axiom-major-011-reduction-semantics-handoff.trace.md](022-1-1-anchor-to-axiom-major-011-reduction-semantics-handoff.trace.md)
  - Origin:
    - [relative](022-1-1-anchor-to-axiom-major-011-reduction-semantics-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-06 01:16:09
  - Authors: Axiom
  - Why: Major 011 needs one current canonical boundary before Loom changes shared mechanics: ordinary Reduction already supports hierarchical source material, while destructive eligibility remains a separate context-sensitive proof whose historical invariants must be reconciled with Major 010 lifecycle/currentness and explicit placement-parent versus historical-closure semantics.
  - Summary: Accept current Reduction v1 for hierarchical composition with bounded clarification; keep destructive eligibility separate in one adjacent maintained fail-closed contract with exact snapshots, candidate binding, cross-repository Parent closure, Major 010 currentness inputs, and deterministic recovery.
  - Status: ready/local

---

# Major 011 Reduction Composition / Destructive Eligibility Semantic Disposition

Current `tiinex.reduction.v1` already permits a Reduction to reduce prior qualified Reductions because its source surface is deliberately domain-neutral and may name fuller material, lineage, context, or evidence without restricting source schema. Major 011 therefore does not require `tiinex.reduction.v2` or a second canonical reduction artifact. The missing canonical follow-through is narrower: make hierarchical composition/recovery explicit within v1 semantics, and place context-sensitive destructive eligibility in one adjacent maintained validation contract owned by Reduction rather than make ordinary Reduction validity depend on deletion intent.

## Decision

- State: accepted bounded refinement of the historical Reduction-before-delete disposition.
- Subject: domain-neutral Reduction-of-Reductions, separate destructive-lineage eligibility, immutable cross-repository Parent closure, lifecycle/currentness inputs, and recoverable expansion.
- Ordinary Reduction authority: a qualified `tiinex.reduction.v1` artifact establishes only the observable reduction/carry-forward event it declares. It may contribute current/re-test evidence within its Source Context, Carry-Forward State, Loss And Uncertainty, and Validation boundary. It does not establish Task completion, authoritative re-test PASS, closure, destructive eligibility, deletion authorization, or release readiness.
- Hierarchical composition: a Reduction may use one or more prior qualified Reductions as immediate source material. Each layer remains independently qualified and must preserve the identities of the immediate source Reductions/material, its own carry-forward delta, inherited unresolved loss/uncertainty that still matters, and a path to fuller immutable material where recoverability is claimed. Downstream validation does not silently revalidate, erase loss from, or widen authority of an upstream Reduction.
- Canonical Docs follow-through: keep `tiinex.reduction.v1`; add only an in-place v1 clarification that prior qualified Reductions are valid Source Context and that hierarchical composition preserves immediate-source identity, inherited loss/uncertainty, validation boundaries, and recoverability. Do not version-bump merely for this clarification.
- Destructive eligibility placement: satisfy the historical Decision through one adjacent maintained destructive-lineage eligibility validation/profile contract explicitly owned by `tiinex.reduction.v1`. Do not make this conditional external proof a required part of ordinary Reduction artifact qualification. The adjacent contract may be implemented/projected by shared Tooling, but its semantics are canonical and presentation adapters may not fork them.
- Historical safety Decision: the core `010-1-1` invariants remain accepted unchanged: Reduction-before-delete, exact pre-delete binding, complete disappearing semantic coverage, immutable leaf recovery, complete Parent closure, cross-repository truth, operative/fixture protection, and fail-closed shared qualification. This Decision only refines hierarchical composition, Major 010 lifecycle/currentness input, and the exact separation of placement Parent from historical closure endpoint.

## Hierarchical Reduction Contract

For a Reduction whose Source Context includes prior Reduction artifacts:

- Immediate sources must be exactly identifiable qualified material; filenames, directory placement, chronology, or summary resemblance do not establish a source edge.
- The downstream Reduction records or exposes enough qualified source references for Loom to traverse `current Reduction -> immediate source Reduction/material -> fuller source lineage` without guessing.
- The downstream Carry-Forward State states what later work may rely on after this layer. It may consolidate prior carry-forward states but must not present upstream omitted/uncertain material as retained fact.
- Loss And Uncertainty is cumulative in authority, not necessarily cumulative in prose. A downstream layer must preserve every upstream unresolved/material loss that can still affect the downstream claimed state, and separately identify new loss introduced by this layer. A downstream layer may retire an upstream uncertainty only when qualified evidence explicitly resolves it.
- Validation is layer-scoped. Qualification of a monthly Reduction of daily Reductions validates the monthly event under its declared method; it does not retroactively make an invalid/unqualified daily source valid or establish facts that the monthly source set did not preserve.
- Recoverability means deterministic navigation/retrieval toward fuller immutable source material. It is not a claim that lossy content can be reconstructed from the reduced bytes alone.
- Physical repository/workspace location is irrelevant to semantic source scope. Daily, monthly, and yearly layers may reside in different qualified workspaces/repositories when their explicit source identity and recovery chain remain qualified.
- A domain-neutral fixture such as `event material -> daily Reduction -> monthly Reduction of daily Reductions -> yearly Reduction of monthly Reductions` is conforming when the rules above hold; no financial, donation, PayPal, or other domain meaning enters core Reduction semantics.

## Destructive Eligibility Contract

Destructive-lineage eligibility is a separate ephemeral qualification against intact material. A result may be projected as `eligible`, `blocked`, or `unresolved`; any state other than `eligible` forbids destructive apply.

### Exact Bound Inputs

One qualification binds all of the following as a single input set:

- exact qualifying Reduction artifact identity and digest of its exact bytes;
- exact pre-delete snapshot descriptor for every repository/workspace whose material participates in classification, Parent traversal, lifecycle/currentness proof, or recovery;
- exact candidate destructive set, with each candidate identified by repository/workspace, normalized path/artifact identity, intended destructive action, and expected pre-delete identity/digest where available;
- exact qualified lifecycle/currentness evidence basis used to decide whether disappearing obligations are still operative;
- exact validator/profile version or maintained contract identity used for the qualification.

For Git-backed material, an immutable repository identity plus commit is the minimum immutable source anchor. When the qualified pre-delete state includes uncommitted/local material, the snapshot descriptor must additionally bind a deterministic exact content/manifest digest covering the proof-relevant state. Branch names, HEAD labels, timestamps, or working-directory placement are not exact snapshot identities.

The qualification receipt must expose a deterministic digest/fingerprint of the complete bound input set. Any change to Reduction bytes, any bound snapshot descriptor/content, candidate membership/action/preimage, lifecycle/currentness evidence basis, or qualification contract invalidates the receipt and requires requalification. A stale receipt never degrades into advisory deletion authority.

### Disappearing Semantic Coverage

- Loom derives the disappearing semantic set from the intact qualified graph plus the exact candidate destructive set. The Reduction's own prose/list cannot self-authorize the set.
- Transport/package/cache artifacts and declared fixtures participate in classification but are not silently treated as semantic leaves. Ambiguous semantic/transport/fixture classification yields `unresolved` and blocks eligibility.
- Every disappearing semantic expansion entrypoint must be represented by exactly one inspectable leaf disposition, while shared closure material may be deduplicated in proof output.
- The union of all qualified leaf-to-boundary spans must cover every semantic artifact that will disappear. Any uncovered disappearing semantic artifact is a positive `blocked` condition.
- A candidate named as disappearing while actually retained unchanged is a candidate/coverage mismatch and invalidates qualification.
- Surviving current semantic material must not retain a required unresolved Parent/currentness dependency on disappearing material unless that obligation/continuity is truthfully reissued under qualified surviving material.

### Immutable Leaf And Parent Closure

For every disappearing semantic leaf, eligibility requires:

- an exact immutable source locator containing repository identity, immutable commit/snapshot identity, and repository-relative path;
- exact source bytes or digest verified against that immutable locator;
- an explicit disposition/reason;
- a separately identified historical Parent-closure endpoint;
- the complete declared `Parent` traversal through every disappearing intermediate artifact to that endpoint, with every hop resolved from immutable qualified material rather than filename/path adjacency;
- proof that the endpoint is the nearest truthful surviving semantic boundary on declared continuity, unless qualified current material explicitly reissues that same boundary and its continuity/provenance is qualified;
- proof that the endpoint survives the candidate change or is represented by that qualified surviving reissue.

Relative Parent targets may resolve only in their already-qualified repository/ref context. If Parent explicitly crosses a repository/workspace boundary, traversal continues across that boundary using exact immutable repository/ref/path material. Missing, ambiguous, multiply resolved, integrity-invalid, mutable-only, or non-deterministically fetched Parent material yields `unresolved` and blocks eligibility.

A leaf permalink, span count, same-repository ancestor, supersession target, Relation edge, or placement convenience is useful evidence only when its governing semantics apply; none substitutes for declared Parent closure.

### Placement Parent Versus Historical Closure Endpoint

The Reduction artifact's own direct Parent and a disappearing leaf's historical Parent-closure endpoint are distinct semantic fields and must not be forced equal.

- The Reduction Parent continues ordinary artifact continuity/placement according to Root/Parent rules.
- The historical closure endpoint belongs to the destructive proof for each disappearing leaf and is derived from immutable declared Parent traversal.
- They may be identical when that is truthful.
- When they differ, Loom must preserve both identities and the qualified continuity/reissue basis connecting any current placement/carry-forward representation to the historical boundary.
- The current preflight check that blocks merely because `reductionQualification.parentPath` differs from `collapseToPath` is implementation drift and must not survive into the accepted shared contract.
- Cross-repository truth outranks repository-local convenience; a local proxy is not an ancestry substitute merely because the Reduction is stored locally.

## Lifecycle And Currentness Input After Major 010

Destructive eligibility consumes qualified currentness/operative-state evidence; it does not define lifecycle semantics itself.

- Major 010's shared normalized lifecycle/readiness projection is an accepted input source when it targets the exact relevant controlling scope and its basis/current representatives qualify.
- Lexical `lifecycleStatus`, `currentStatus`, Root `Status`, filenames, timestamps, branch state, or cleanup observations remain observations unless an active qualified contract gives them exact narrower meaning. The current preflight's `INELIGIBLE_LIFECYCLE_TOKENS` must not be promoted or preserved as canonical destructive policy.
- A qualified explicit `closure.closed` for the exact obligation/scope can establish that the closed scope itself is no longer operative, subject to all other Reduction/destructive rules. It does not make unrelated artifacts deletable.
- `ready-for-retest`, `retest.passed` with `closure.open`, `not-ready-for-retest`, `retest.failed`, or any other qualified evidence that the exact obligation remains open/operative blocks disappearance unless the obligation is explicitly retained/reissued under qualified surviving current material.
- `readiness.unresolved`, `retest.unresolved`, `closure.unresolved`, ambiguous representative selection, or missing currentness/authority evidence yields destructive `unresolved`; it must not be normalized into eligible or merely historical.
- Historical nonterminal status does not block forever when qualified current evidence explicitly supersedes/resolves it. Conversely, physical absence or a later Reduction does not prove supersession/currentness by itself.
- If an operative obligation is reissued before deletion, the receipt must identify the surviving qualified artifact and exact mapping of the retained obligation without falsely marking the historical branch complete.
- Fixture-required material remains blocked until its fixture dependency is explicitly replaced/retired by qualified evidence.

Major 010 facts are therefore evidence inputs to this gate, never destructive authority. Eligibility remains necessary-but-not-sufficient for any real delete/apply.

## Recovery And Expansion Contract

Loom's shared path must support deterministic expansion from a hierarchical Reduction toward fuller source material before destructive apply is considered.

- Expansion follows explicit immediate-source identities, not reverse filename discovery or repository placement.
- For each Reduction hop, Loom exposes source identity/qualification, carry-forward state, local loss/uncertainty, inherited unresolved loss/uncertainty relevant to the requested expansion, and the immutable recovery locator/basis when available.
- Full expansion is qualified only when every required hop/source resolves deterministically to qualified immutable material and the requested fuller material remains retrievable. Missing or ambiguous source material is `unresolved`; known irrecoverable/lost material is reported as known loss rather than reconstructed.
- Cross-repository expansion is first-class and uses the same exact repository/ref/path qualification as Parent closure.
- A qualified destructive receipt must retain enough immutable source and closure identity to re-run expansion/recovery after the current representation is reduced.
- Post-apply re-audit, if later separately authorized, must compare actual disappearance against the exact qualified candidate set and prove no uncovered semantic loss. Post-apply recovery evidence cannot retroactively satisfy a missing pre-delete qualification.

## Loom Shared Projection Contract

After Anchor acceptance/delegation, Loom may implement one adapter-neutral path with two related but distinct projections.

### Composition / Recovery Projection

It should expose, at minimum:

- exact current Reduction identity/digest and ordinary qualification;
- immediate source identities and source kinds, including prior Reduction sources;
- ordered/graph-qualified reduction hops sufficient for expansion;
- effective carry-forward boundary;
- local and inherited loss/uncertainty;
- recoverability/expansion state, immutable source locators, ambiguities, and blocking findings.

### Destructive Eligibility Projection

It should expose, at minimum:

- `state`: `eligible`, `blocked`, or `unresolved`;
- exact Reduction bytes digest;
- exact bound repository/workspace snapshot descriptors;
- exact candidate destructive set and deterministic set digest;
- qualified lifecycle/currentness evidence basis;
- derived disappearing semantic set and classification results;
- every disappearing leaf, immutable locator/digest, disposition, historical closure endpoint, and complete Parent span;
- distinct Reduction placement Parent/current carry-forward references where relevant;
- shared/deduplicated closure material without losing per-leaf reachability;
- recovery/expansion proof status;
- `basis`, `findings`, `blockers`, `missingEvidence`, `ambiguities`, and deterministic receipt/input fingerprint;
- explicit boundaries: planning/qualification only, source mutation false, destructive apply not authorized by this result.

Stable finding codes are Loom implementation detail, but the fail-closed conditions and their semantic distinction are not. Positive qualified rule violations should be visible as `blocked`; missing/ambiguous/unqualified proof should remain `unresolved`. Presentation layers may format or filter the result but may not reinterpret eligibility.

## Consequences

- No new Reduction schema version is required.
- The smallest Docs work is: (1) add the hierarchical composition/recovery clarification to current `tiinex.reduction.v1`; and (2) add/maintain one adjacent destructive-lineage eligibility validation/profile contract owned by Reduction and explicitly separate from ordinary artifact qualification.
- Loom should replace the planning preflight's lexical lifecycle heuristic with qualified normalized currentness inputs, remove placement-parent-equals-collapse-boundary as a semantic requirement, add exact receipt/snapshot/candidate binding, make cross-repository immutable closure/recovery first-class, and preserve the preflight's existing non-mutating shared-consumer boundary.
- Existing historical Reduction artifacts do not become invalid merely because they lack destructive receipts. They remain ordinary Reduction evidence within their declared qualification/loss/recoverability boundaries.
- Existing planning-only preflight successes do not authorize deletion and must be freshly qualified under the accepted contract against intact material.
- No physical deletion, destructive apply, remote mutation, Viewer work, deployment/release work, Foundation exit, or Major 011 closure is authorized by this Decision.

## Required Neutral Regressions

Loom qualification should cover at least:

- ordinary non-destructive Reduction with no destructive intent;
- Reduction-of-Reductions across daily -> monthly -> yearly layers;
- inherited known loss and inherited unresolved loss;
- downstream validation not repairing an unqualified upstream Reduction;
- exact candidate-set mismatch and candidate preimage change;
- changed Reduction bytes;
- changed bound repository/workspace snapshot;
- semantic/transport/fixture ambiguity;
- uncovered disappearing semantic artifact;
- retained artifact incorrectly declared disappearing;
- active/open operative branch;
- authoritative closed historical branch;
- currentness/authority unresolved;
- reissued operative obligation under qualified surviving material;
- local Parent closure;
- cross-repository Parent closure;
- missing/ambiguous immutable Parent hop;
- current placement Parent distinct from historical closure endpoint;
- hierarchical expansion back to fuller immutable material;
- known irrecoverable source loss reported without fabrication;
- post-apply/audit mismatch as a separately simulated boundary without destructive mutation.

## Review Conditions

Re-open canonical semantics only if implementation proves one of these required distinctions cannot be represented without inventing schema-specific meaning: immediate-source Reduction identity, inherited loss/uncertainty, exact external snapshot/candidate binding, cross-repository Parent closure, lifecycle/currentness evidence, placement-parent/closure-endpoint separation, or deterministic expansion. Do not respond to implementation inconvenience by making Reduction itself deletion authority or by broadening Parent into generic dependency/currentness semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [022-1-1-anchor-to-axiom-major-011-reduction-semantics-handoff.trace.md](022-1-1-anchor-to-axiom-major-011-reduction-semantics-handoff.trace.md)
  - Value: 9WPWHEXMTckX98zSlXF1hgfkOSaIK88M3x_yruEglNU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: NFoqln0uCO4KjUMv5vIwPdIioupC0LLBrTtT-1gSWkI