# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-02 18:14:00
  - Trace: [005-2-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-axiom-pinned-parent-continuity-reconciliation-decision.trace.md](005-2-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-axiom-pinned-parent-continuity-reconciliation-decision.trace.md)
  - Origin:
    - [relative](005-2-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-axiom-pinned-parent-continuity-reconciliation-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-03 17:37:45
  - Authors: Anchor
  - Why: Formalize the reduction behavior exposed by the first repository-scale cleanup before any broad deletion is committed.
  - Summary: Site-local operational contract for discoverable reduction placement and deterministic historical expansion from immutable leaf permalinks.
  - Status: ready/local

---

# Reduction Placement + Expansion Contract

## Decision

- Decision: Site reductions are observable replacement nodes for lineage removed from current source, not deletion logs and not anonymous repository cleanup markers.
- State: accepted/local for the current Site reduction pass; canonical schema promotion remains separate Docs/Axiom work.
- Placement rule: a Reduction is authored as a child of the nearest **currently qualified** semantic ancestor that owns the reduced work. When a completed Task subtree is collapsed back to its Epic or roadmap Task, that current Epic/roadmap anchor remains current and the Reduction becomes its child so ordinary child/follow traversal can discover what happened.
- Ancestor refresh rule: if the historical Epic/ancestor no longer qualifies under current maintained schema/integrity representation, do not keep or rewrite invalid historical bytes merely to host the Reduction. Author a small current carry-forward Task/Topic for that semantic ancestor, link its immutable historical representation, and place the Reduction beneath the carry-forward anchor.
- Leaf rule: every semantically removed leaf must be represented in the Reduction by an immutable permalink to the exact pre-reduction leaf, the surviving ancestor/boundary it collapses to, a disposition/reason, and enough scope metadata to understand what was compressed.
- Expansion rule: `leaf permalink + immutable source commit + surviving ancestor` defines a recoverable expansion boundary. A Viewer/graph may fetch the pinned snapshot and follow declared Parent edges from that leaf back to the surviving ancestor, deduplicating shared ancestors, without rematerializing that historical lineage as current workspace truth.
- Multi-epic rule: one broad cleanup may produce multiple Reduction artifacts, one at each appropriate surviving semantic ancestor. A repository-level checkpoint may index those reductions, but must not replace their local placement/provenance role.
- Safety rule: active, unresolved, disputed, unlanded, or non-recoverable branches are not eligible for physical reduction. Historical source is removed from current source only after immutable Git recovery exists.
- Current-versus-history rule: reduced artifacts cease to be current workspace material; they remain provenance/history addressable through the Reduction. Expansion is a read/history operation and must not strengthen old material into current authority.

## Basis

- The first Viewer Navigation reduction was semantically useful but intentionally narrow; a later broad deletion experiment exposed that repository-wide pruning without locally discoverable replacement nodes makes the graph feel as if history simply disappeared.
- The maintained `tiinex.reduction.v1` contract already requires observable reduction, explicit fuller source context, carry-forward state, loss/uncertainty, validation, recoverability, and readable source references. The stronger placement/leaf-expansion rules above specialize that existing contract for reliable Site graph reduction without redefining canonical Reduction semantics.
- Existing successful Site reductions already use pinned immutable source links and carry-forward state, demonstrating that Git-backed expansion is compatible with the current representation model.
- Plaything Verse and Node Graph Verse need a stable distinction between current topology and collapsed historical topology: ordinary views should show the Reduction node; an explicit explode/history action should reconstruct the pinned old Parent graph without making it current.
- The Kodax role move exposed the same durability principle across repositories: Site must not reduce the Viewer-local role as superseded by Business until the canonical Business role is actually durable at an immutable Business commit.

## Consequences

- The pending broad Site reduction must be rebuilt by semantic ancestor rather than by one root-level deletion manifest.
- The current Site graph may use the already-qualified Parent-less Axiom continuity cutoff only as the technical current root. Current Tooling/Viewer carry-forward Tasks then restore semantic anchors before child Reductions are attached; the Axiom cutoff is not itself promoted into product/Tooling epic authority.
- Viewer PoC Parity Recovery remains a surviving roadmap/Epic-like Task. Completed Navigation work is represented by a child Reduction under that roadmap instead of disappearing; active Artifact + Action implementation continues under its existing planned Artifact + Action Task.
- Closed Tooling execution branches are reduced only under the surviving Tooling Task/Discovery/Decision that semantically owns them; already-useful Reduction artifacts may themselves remain current where they are the appropriate replacement node.
- Each new Reduction must include a `Reduced Leaves / Expansion Boundary` surface with one entry per removed leaf: exact immutable permalink, collapse-to ancestor, disposition/reason, and compressed-artifact count or bounded scope description.
- Intermediate artifacts need not all be copied into the Reduction when the pinned leaf and surviving boundary allow deterministic Parent traversal through the immutable snapshot. Exceptions must be listed explicitly when source topology is not sufficient to reconstruct the omitted range.
- A repository-wide audit/checkpoint may list every emitted Reduction and every retained non-current fixture lineage, but it is an index/validation artifact rather than the provenance replacement for the reduced branches.
- Before the Site commit, Business must first land the canonical Kodax Role. The Site reduction may then cite the immutable Business SHA and reduce the Viewer-local Kodax role with disposition `superseded-by-canonical-business-role`.
- Operational human work is handed from Anchor to Sigma. Anchor-to-Anchor Handoffs remain continuity checkpoints and are not substitutes for a Sigma commit/push gate.
- A later Axiom/Docs pass should consider whether leaf expansion metadata and placement guidance should become normative `tiinex.reduction.v1` validation rules or a maintained companion contract; this local decision does not silently mutate canonical schema authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [005-2-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-axiom-pinned-parent-continuity-reconciliation-decision.trace.md](005-2-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-axiom-pinned-parent-continuity-reconciliation-decision.trace.md)
  - Value: Q-Zzn2ugtcvvRg79_Mj03nw3L4LMAfxo-SCQODGApjo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Oj5DZL9ELL9iZfrJi9pQbYS6jRRrGgOe2_vtLYhBeVo