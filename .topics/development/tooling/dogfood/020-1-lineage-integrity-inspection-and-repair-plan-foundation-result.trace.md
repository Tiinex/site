# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 09:34:00
  - Authors: Loom
  - Why: Record the read-only lineage-integrity inspection and repair-plan foundation plus bounded Site diagnostics while preserving mismatch, publication, and mutation authority as explicit human review boundaries.
  - Summary: Tooling 020 result — read-only lineage integrity inspection and repair-plan foundation
  - Status: draft/local

---

# Tooling 020 result — read-only lineage integrity inspection and repair-plan foundation

## Objective

Implemented an adapter-neutral, read-only lineage integrity inspection and repair-plan operation over supplied artifacts. It resolves only declared lineage authority, classifies Parent/child c14n-v2 and publication states, reports descendant cascade impact, and reuses tiinex.portable.repair-plan.v1 without authorizing artifact or publication mutation.

## Done Criteria

Implementation evidence: src/tooling/portable/lineage/lineage.integrity.plan.js adds tiinex.portable.lineage-integrity-inspection.v1 and produces repair plans in the existing tiinex.portable.repair-plan.v1 language; src/tooling/portable/engine.facade.js exposes planPortableLineageIntegrity; src/tooling/portable/operation.catalog.js registers lineage-integrity-plan with planning-only-read-only safety. Focused regression src/tooling/portable/lineage/portable.lineageIntegrityRepairPlanFoundation.test.mjs passes healthy qualified A→B, self-only missing target/backfill proposal, B→C cascade ordering, mismatching target review-required behavior without refresh authority, Parent self missing, child self mismatch, local-only publication blocking, and unresolved/ambiguous Parent cases. The operation reports exact Parent target, old/candidate digest, publication locator state, expected header/footer-only mutation surface, descendant impact, approval disposition, blockers, and reasons while declaring sourceMutation=false, remoteWrite=false, bodyMutationAuthorized=false, publicationMutationAuthorized=false, and descendantRefreshAutomatic=false.

## Scope

Bounded current-Site scan: 238 continuity Markdown records parsed with 0 parse failures; 159 are Parent-bearing and all 159 are self-only with no v2 non-self Parent-target entry. 152 resolve far enough to classify parent-target-missing; 6 are parent-unresolved; 1 pre-existing child-self mismatch is flagged rather than refreshed. Publication state counts are 18 qualified, 129 missing, 12 stale, and 79 not-applicable. Repair-plan dispositions are 15 proposed clean backfill candidates, 145 blocked, 0 mismatch-refresh approvals, and 78 no-change roots/healthy records. Blockers include 6 declared Parents not loaded, 1 missing Parent primary self, 129 missing publication origins, 12 stale publication origins, and 1 digest mismatch. No scanned file was mutated. Historical ai-provenance quick-fix code is not present in the supplied workspace; only references to it are available, so prior-art reuse remains unresolved rather than assumed.

## Dependencies

Controlling task: .topics/development/tooling/dogfood/020-lineage-integrity-inspection-and-repair-plan-foundation.trace.md. Controlling transfer: .topics/development/handoff/loom/013-lineage-integrity-creation-and-repair-planning-tooling-handoff.trace.md. Tooling 021 mutation/apply and Tooling 022 human-adapter projection remain blocked pending independent acceptance of Tooling 019/020 and retained semantic/publication decisions. The unpublished Parent Origin canonical tension remains unresolved and this implementation fails closed instead of inventing browse+git provenance.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: pnZu8R77OszR3FN1pPMYVMNfeOr3EVKlMyVnl3DvG5M
