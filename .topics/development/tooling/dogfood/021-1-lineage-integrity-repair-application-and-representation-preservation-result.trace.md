# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 17:44:00
  - Authors: Loom
  - Why: Record the bounded Tooling 021 repair-application implementation, representation-preservation qualification, fail-closed live pressure run, and validation evidence without claiming current-Site mutation or publication authority.
  - Summary: Tooling 021 result — approved lineage integrity repair application, representation preservation, cascade resealing, and receipts
  - Status: draft/local

---

# Tooling 021 result — approved lineage integrity repair application and representation preservation

## Objective

Implemented a local, adapter-neutral lineage repair application that consumes an explicit `tiinex.portable.repair-plan.v1` Tooling 020 plan plus per-artifact approval/disposition, applies only qualified Continuity Context Parent/Origin and Continuity Integrity footer mutations, reseals approved descendants root-to-leaf, and returns a local changeset plus machine/human receipts without mutating source records, publication state, or remote systems.

## Done Criteria

Implementation is split across `src/tooling/portable/lineage/lineage.integrity.apply.js`, `lineage.integrity.apply.structure.js`, `lineage.integrity.apply.evidence.js`, and `lineage.operations.js`. The application validates the explicit Tooling 020 plan boundary, requires per-artifact approval, distinguishes missing Parent-target backfill, mismatching Parent-target refresh, qualified Parent Origin update, descendant cascade reseal, and blocked/no-change outcomes, and re-binds every applied Parent digest to the currently loaded verified Parent material. Missing-backfill requires a Tooling 020 proposed disposition plus accepted exact Tooling 025 provider material. Mismatch refresh requires a qualified semantic disposition and semantic-authority reference; the Axiom/Anchor repaired-local historical case is accepted only under explicit `repaired-local-parent` plus `historical-pre-repair-origin-retained` disposition and accepted historical provider material at the old immutable locator. Qualified Parent Origin/permalink mutation requires explicit plan header authorization, `qualified-exact-publication`, and exact provider bytes at the candidate immutable locator.

Structure-aware mutation preserves the original line endings and byte representation outside the authorized surfaces. It locates the exact Continuity Integrity footer, rejects ambiguous/malformed Parent-target structure, inserts or replaces only the c14n-v2 Parent target, optionally updates only the authorized Parent Origin `browse + git` field, computes the Parent target first, and computes/replaces the primary self Value last without using the representation-normalizing output of `sealC14nV2Self`. The representation guard snapshots body bytes, Repairs bytes, and non-c14n sibling integrity entries and fails closed if any unauthorized representation changes. Reapplying an accepted repair returns no-op when the exact desired Parent target/header/self state is already present and does not duplicate footer entries.

The focused regression `src/tooling/portable/lineage/portable.lineageIntegrityRepairApplicationRepresentationPreservation.test.mjs` passes root-to-leaf A→B→C backfill/cascade, explicit branch stop for unapproved descendants, plan/approval/semantic-authority failures, exact provider binding, Axiom historical repaired-Parent disposition, qualified Parent Origin update, CRLF preservation, multiple blank lines, embedded dividers, long nested lists, arbitrary punctuation/body text, Parent + Origin, unrelated sibling integrity entries, absent footer, malformed footer, duplicate Parent c14n entries, receipt content, source/remote mutation flags, and idempotence. `lineage-integrity-apply` is exposed through the portable operation surface with `sourceMutation=false` and `remoteWrite=false`; lineage operation wiring was extracted to `lineage.operations.js`, bringing both previously oversized `engine.facade.js` and `operation.catalog.js` below the static source-size guard.

## Scope

A deliberate current-Site read-only/fail-closed pressure run loaded 267 `.trace.md` records without provider receipts or repair approvals. Inspection returned `attention-required`: 152 Parent-target-missing, 1 child-self-mismatch, 109 healthy, and 5 Parent-unresolved. The repair plan was blocked and contained 152 backfill actions, 6 blocker-resolution actions, and 109 no-change actions. Applying that explicit plan with no approvals returned `blocked`, emitted 152 blocked receipts, changed zero paths, and reported `sourceMutation=false`, `remoteWrite=false`, and `publicationMutation=false`. This run is intentionally not a replacement for the accepted current-Site provider reconciliation; its purpose is to prove that incomplete live evidence/authority cannot become mutation.

Validation after final refactor passes `tools/validate-static.mjs`, `tools/check-architecture-shape.mjs`, `tools/check-browser-import-boundary.mjs`, `tools/validate-schema-bindings.mjs`, `npm run typecheck`, the focused Tooling 021 regression, operation-catalog regression, and the full `src/tooling/portable/portable.test.mjs` aggregate. No remote fetch, commit, push, publication, or current-Site repair write was performed.

## Dependencies

Controlling task: `.topics/development/tooling/dogfood/021-lineage-integrity-repair-application-and-representation-preservation.trace.md`. Controlling transfer: `.topics/development/handoff/loom/019-lineage-integrity-repair-application-handoff.trace.md`. Semantic classification remains owned by Axiom/Anchor; exact provider receipt/material and per-artifact live repair approval remain owned by Anchor/Q/qualified host; publication and remote state remain outside this result. Current Root still cannot truthfully represent the never-published Parent Origin case, so that canonical semantic gap remains fail-closed rather than being solved or weakened by Tooling 021. Tooling 022 remains downstream and unopened by this implementation.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: DY15Aqgp10EmnCYTaE79vHKtna_8fgy1rhWbx5RuHko