# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 12:06:00
  - Authors: Anchor
  - Why: Tooling 025 now correctly binds publication qualification to provider receipts, exposing two remaining semantic questions that Tooling must not answer by mutation policy: truthful Parent Origin for unpublished/local Parents and representation identity after historical canonical repairs whose old published bytes remain immutable.
  - Summary: Axiom semantic classification task for unpublished Parent Origin and seven v471-v474 repaired-local-versus-pre-repair-published Parent representation mismatches before Tooling 021 may apply any affected lineage repair.
  - Status: open/local

---

# Publication lineage mismatch and unpublished Parent semantic classification

## Objective

Produce an evidence-backed canonical semantic disposition for two coupled lineage cases that remain outside Tooling authority: (1) a truthful Parent relation whose current Parent representation is local/unpublished and therefore may not have an immutable remote `browse + git` locator, despite the current Root Parent-Origin requirement; and (2) a child whose carried Parent was explicitly canonically repaired after publication, while the child's existing commit-pinned Parent Origin still resolves to the older pre-repair published representation. Define what representation/provenance truth is required before repair tooling may mutate either case, without inventing publication history or retroactively rewriting immutable provider material.

## Done Criteria

- Ground the classification in qualified current Root/schema authority. The carried Root bytes match Tiinex/docs commit `3988951208eb9a8926e84ab42625d4b42fa00c2d`; do not treat Anchor/Tooling repair policy as schema authority.
- Resolve the apparent Parent-Origin tension explicitly: Root says Parent `Origin` is required when Parent exists, requires `browse + git`, describes it as the portable archive permalink, and says it should be commit-pinned when available. Determine whether this intentionally blocks a Parent-bearing local continuation until an archive representation exists, whether an already-authorized extension/state can truthfully represent unavailable publication, whether another canonical mechanism separates Parent identity from publication locator, or whether a Root/schema clarification/change is actually required.
- Do not infer the answer from the separate Root schema-reference rule that permits local/unpublished schema locators. State whether that rule is relevant analogy only or actual reusable authority for Parent Origin.
- Classify the seven v471-v474 lineage edges where exact provider bytes at declared commit/path equal the Parent's explicitly recorded `pre-repair published representation` but differ from the carried canonically repaired Parent bytes. Preserve the carried `Repairs -> Historical canonical representation repair` provenance and the stated intent to preserve body/work-result meaning while replacing false-PASS envelope/schema-reference/continuity/integrity representation.
- Decide what a child continuing from the repaired Parent representation may truthfully claim as Parent Origin before a new immutable repaired representation is published. Explicitly classify at least these possibilities: retain the old immutable locator only as historical/pre-repair evidence; require publication of the repaired representation before it can serve as current Parent Origin; carry old and new representation locators with explicit non-equivalence/history; or another existing canonical construct supported by exact authority.
- Distinguish semantic continuity identity from exact representation identity. Do not allow “same work meaning” to silently become “same bytes/representation,” and do not allow byte mismatch alone to erase an explicitly qualified semantic continuation relationship.
- Determine whether the seven child Parent-target integrity entries should remain review-required until the repaired Parent has a qualified immutable representation, may bind locally to the repaired Parent while preserving historical published provenance separately, or need another explicit state. Tooling 021 must receive a machine-actionable semantic disposition rather than infer one from an Anchor prose summary.
- Preserve the eight exact-material missing-backfill edges as a separate non-semantic candidate set. Axiom need not approve their actual repair application; they still require accepted full provider receipts and Tooling 021 per-artifact approval.
- Preserve `001-13-validator-surface-convergence-and-integrity-repair-strategy.trace.md` as a separate child-self-integrity blocker even though its declared Parent publication representation matches the carried Parent.
- Preserve the external Tiinex/docs Parent-unresolved edge as a material-availability problem unless semantic review finds a genuine contract issue; do not fold unavailable Parent bytes into the historical-repair classification.
- If canonical authority is insufficient to choose a valid representation/origin state, fail closed and identify the smallest exact schema/decision material needed. Do not invent a new Root field, status vocabulary, extension label, or repair convention from convenience.
- If a canonical schema change or semantic clarification is required, return that as a separately bounded recommendation/authority need. Do not mutate schemas, historical artifacts, or current lineage in this task.
- Return one explicit disposition that separates: (a) current canonical semantic truth, (b) historical representation provenance, (c) permitted future publication/origin state, (d) what Tooling 021 may later treat as approved/blocked, and (e) any unresolved authority.

## Scope

Canonical semantic classification of Parent Origin availability and exact Parent representation after historical canonical repair; applicability to the seven identified v471-v474 mismatch edges; explicit boundary for later Tooling 021 repair planning/application. Out of scope: implementing Tooling 021/022, collecting provider receipts, applying lineage mutations, refreshing digests, publishing repaired artifacts, changing Git history, pushing remote state, Viewer/product work, or broad redesign of Source/Origin semantics beyond what the two cases require.

## Dependencies

- [Current Site publication provider material reconciliation feedback](001-35-current-site-publication-provider-material-reconciliation-feedback.trace.md) is the exact current-Site evidence split between material matches, historical representation mismatches, child-self mismatch, and unavailable Parent material.
- [Unpublished Parent Origin truthfulness and canonical requirement gap feedback](001-31-1-unpublished-parent-origin-truthfulness-and-canonical-requirement-gap.trace.md) preserves the original semantic tension and fail-closed requirement.
- [Tooling 025 Anchor acceptance](../../tooling/dogfood/025-2-lineage-publication-provider-receipt-binding-anchor-acceptance.trace.md) closes provider-receipt provenance binding while retaining semantic/mismatch disposition as external authority.
- [Tooling 021 repair application task](../../tooling/dogfood/021-lineage-integrity-repair-application-and-representation-preservation.trace.md) defines the future mutation consumer that must not decide harmlessness or canonical representation identity itself.
- `src/schemas/tiinex.root.v1.schema.md` is the carried exact Root representation matched to Tiinex/docs commit `3988951208eb9a8926e84ab42625d4b42fa00c2d`; Axiom must still apply its normal source/schema authority rules rather than treating the Site path alone as semantic authority.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:bdiJ_-q8rk2j96BG12r-WWRT7028OnEgvsJzq9pev2M
