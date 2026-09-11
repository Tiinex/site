# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 19:24:51
  - Trace: [010-1-anchor-to-axiom-reduction-safety-contract-handoff.trace.md](010-1-anchor-to-axiom-reduction-safety-contract-handoff.trace.md)
  - Origin:
    - [relative](010-1-anchor-to-axiom-reduction-safety-contract-handoff.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-03 20:03:03
  - Authors: Axiom
  - Why: The current reduction contract is not strong enough to authorize destructive repo-scale reduction without a pre-delete proof bound to the exact candidate delete set.
  - Summary: Axiom decision separating general Reduction validity from fail-closed destructive eligibility, with complete immutable leaf-to-boundary closure and cross-repository semantic boundaries.
  - Status: ready/local

---

# Reduction-Before-Delete And Cross-Repository Collapse Boundary

## Decision

- State: accepted Axiom semantic disposition for the current coordination frontier.
- `tiinex.reduction.v1` remains the canonical artifact schema for observable reductions. A new Reduction schema version is not required merely to make repo-scale deletion safe.
- A qualified `tiinex.reduction.v1` artifact is necessary but is **not sufficient destructive authority**. Physical removal of semantic lineage requires a separate fail-closed **destructive-lineage eligibility qualification** performed by shared Tooling against the exact pre-delete material and the exact candidate delete set.
- Canonical Docs must strengthen `tiinex.reduction.v1` with a conditional destructive-lineage validation group, or an explicitly adjacent maintained validation contract owned by `tiinex.reduction.v1`, containing the rules below. The implementation location may vary, but the semantic rules may not be weakened, duplicated privately in Viewer, or inferred by Loom.

### Reduction Before Delete

- The Reduction artifact must exist and qualify while the source material it proposes to reduce is still present. Post-delete reconstruction is evidence/recovery, not compliance with the pre-delete gate.
- The pre-delete qualification must bind: exact Reduction bytes; exact pre-delete repository/workspace snapshot identity for every repository used by the proof; and the exact planned destructive path/artifact set. Any change to those inputs invalidates the eligibility receipt and requires requalification.
- The Reduction need not be committed in a separate remote commit before the deletion commit, but Tooling must enforce a two-phase local sequence: first qualify the additive Reduction against intact source, then consume that exact qualification receipt when applying or accepting the destructive change.
- The destructive operation must fail closed when the Reduction artifact is missing, schema-invalid, integrity-invalid, not bound to the current pre-delete state, or altered after qualification.

### Complete Disappearing-Leaf Coverage

- Tooling derives the candidate disappearing semantic set from the intact pre-delete graph plus the planned destructive set; the Reduction does not self-authorize by merely listing leaves.
- Transport-only carrier/package artifacts, caches, and declared fixtures are classification inputs, not semantic leaves. Ambiguous classification is an error and blocks deletion.
- The Reduction must name every disappearing semantic leaf that is an expansion entrypoint for the deleted semantic subgraph, and must name no leaf as disappearing when it is retained unchanged as current material.
- Every semantic artifact planned for removal must be covered by the union of the declared leaf-to-boundary spans. A deleted semantic artifact outside those spans is an undeclared loss and blocks deletion.
- Shared ancestors may be represented once in proof material, but per-leaf reachability must remain reconstructable and independently checkable.

### Immutable Leaf And Parent-Closure Proof

For each disappearing semantic leaf, the destructive qualification must prove all of the following before deletion:

- one exact immutable source locator containing repository identity, commit identity, and repository-relative path for the leaf;
- exact leaf bytes or a digest that Tooling verifies against that immutable locator;
- one explicit disposition/reason;
- one explicit semantic collapse boundary;
- the complete declared `Parent` traversal from the leaf through every disappearing intermediate artifact to the closure endpoint, with each hop resolved from immutable material rather than path adjacency or filename inference;
- the boundary is the nearest truthful surviving semantic ancestor reachable by declared continuity, unless a qualified current carry-forward explicitly reissues that same semantic boundary;
- the boundary survives the candidate change or is represented by a qualified pre-delete reissue whose continuity/provenance to the historical boundary is explicit;
- unknown, missing, multiply-resolved, integrity-invalid, or non-deterministically fetched Parent material blocks eligibility.

A span count is useful evidence but is not itself a closure proof. A commit-pinned leaf permalink is useful evidence but is not itself proof that every Parent hop to the boundary resolves.

### Cross-Repository Boundary Semantics

- Repository and Workspace boundaries have no semantic ancestry authority.
- The truthful collapse boundary may reside in Site, Docs, Business, or another qualified Workspace/repository. If declared Parent traversal crosses repositories, Tooling must continue the same closure proof across that boundary using exact immutable repository/ref/path material.
- A Reduction artifact's physical storage repository does not determine its semantic collapse boundary.
- A local carry-forward or placement parent may be used only when it truthfully reissues the semantic boundary and its provenance/continuity to that boundary is explicit and qualified. Repository locality alone is never a valid reason to manufacture a Site-local semantic ancestor.
- When the Reduction's own direct Parent can truthfully be the surviving boundary, it should be. When discoverability or current-schema qualification requires a current carry-forward proxy, Tooling and the artifact must distinguish that placement parent from the historical Parent-closure endpoint instead of conflating them.
- Cross-repository supersession targets that are not on the declared Parent chain may be recorded as disposition/carry-forward targets, but they do not substitute for Parent-closure proof.

### Active, Unresolved, And Fixture Branches

- Active, unresolved, disputed, rejected-but-still-operative, unaccepted, or semantically required fixture branches are not destructively eligible merely because immutable history exists.
- Such a branch may leave current source only after the operative obligation is retained or reissued under a qualified current artifact before deletion, with the mapping stated explicitly and without falsely marking the old branch complete.
- Fixture-required historical material remains physically retained until its fixture dependency is replaced by qualified dedicated fixture material or the fixture requirement is otherwise retired.

### Canonical Validation Expectation

Shared Tooling must expose one common destructive-lineage eligibility path used by human and LLM surfaces. At minimum it must fail with stable machine-readable error findings for:

- missing or stale pre-delete Reduction qualification;
- candidate delete-set / qualification-receipt mismatch;
- semantic/transport/fixture classification ambiguity;
- disappearing-leaf declaration mismatch;
- immutable leaf locator or digest failure;
- incomplete or ambiguous Parent closure;
- unqualified or falsely-local collapse boundary;
- uncovered deleted semantic artifact;
- active/unresolved/unaccepted branch deletion;
- fixture-required deletion;
- post-apply re-audit failure.

The exact finding-code spelling is Loom implementation detail, but the conditions and fail-closed severity are canonical. The qualification result must identify the Reduction artifact, pre-delete snapshot identities, planned delete set, every leaf, every closure endpoint, shared/deduplicated closure material, and all blocking findings so a human and an LLM can inspect the same proof.

## Basis

- The current `tiinex.reduction.v1` schema is intentionally broad: it validates observable reductions for context compaction, lineage reduction, consolidation, and other narrowing. Its required body surfaces are `Source Context`, `Carry-Forward State`, `Loss And Uncertainty`, and `Validation`; it does not currently make repository deletion eligibility a schema-wide invariant.
- The existing Site Reduction Placement + Expansion decision is directionally correct in requiring immutable leaf references, surviving boundaries, dispositions, recoverability, and semantic placement. It is insufficient for destructive execution because it does not itself require a pre-delete qualification receipt bound to the candidate delete set or a machine-proven complete Parent closure for every disappearing leaf.
- The concrete Tooling Historical Lineage Reduction demonstrates useful commit-pinned leaf references, dispositions, carry-forward state, and expansion-span evidence. It remains valid Reduction evidence, but span counts plus leaf permalinks are not equivalent to a complete independently verified leaf-to-boundary closure proof.
- Treating repository co-location as ancestry would contradict Tiinex continuity semantics. Cross-repository Parent resolution therefore must preserve exact immutable source identity instead of inserting a local semantic anchor for convenience.
- Separating general Reduction validity from destructive eligibility preserves the broad purpose of `tiinex.reduction.v1` while giving Loom one precise fail-closed implementation target and avoiding retroactive invalidation of non-destructive historical reductions.

## Consequences

- The broad Site reduction remains paused. Passing tests on a pre-existing reduction candidate do not satisfy this Decision unless the candidate is requalified through the pre-delete destructive-lineage gate against the intact unreduced graph.
- `009-1-tooling-historical-lineage-reduction.trace.md` remains useful historical Reduction evidence and pattern material, but it must not be treated as repo-scale deletion authority under the stronger gate without fresh closure qualification.
- `008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md` is superseded as an immediate destructive execution frontier by the current coordination Task; any later execution Task must consume a Loom-qualified implementation of this gate.
- Loom may implement the gate as a shared validator/profile adjacent to the existing Reduction validator and existing audit/lineage-integrity mechanics. Viewer may project the resulting proof and actions, but may not fork or weaken the semantics.
- Canonical Docs should add the conditional destructive-lineage rule surface to `tiinex.reduction.v1` or a clearly owned companion contract, including the distinction between ordinary artifact qualification and destructive eligibility. No new `tiinex.reduction.v2` is required at this stage.
- Reduction planning must preserve two distinct concepts when they differ: the semantic Parent-closure endpoint and a current placement/carry-forward parent. Cross-repository truth wins over repository-local convenience.
- Anchor may reconcile this Decision with Loom implementation work. Sigma acceptance remains separate, and this Decision does not authorize any historical deletion, remote write, or repository mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [010-1-anchor-to-axiom-reduction-safety-contract-handoff.trace.md](010-1-anchor-to-axiom-reduction-safety-contract-handoff.trace.md)
  - Value: EZSehwlOi7ueOQdY9JaEvDKOGQtP8DLSvhaOL0NTM_8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 4K1mQ6rMnZUR2fDvhGyEpzVhCF6rrufOVQ0J2XZs4kg