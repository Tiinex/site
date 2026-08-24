# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 10:32:00
  - Authors: Loom
  - Why: Record the bounded Tooling 024 correction that prevents immutable-looking publication locator syntax from becoming repair authority without exact provider/source evidence bound to the loaded Parent material.
  - Summary: Tooling 024 result — lineage publication locator evidence qualification correction
  - Status: draft/local

---

# Tooling 024 result — lineage publication locator evidence qualification correction

## Objective

Corrected the read-only lineage planner so declared publication-locator syntax and independently qualified publication evidence are separate machine states. A commit-pinned GitHub blob URL remains useful locator-shape evidence, but it is unresolved for publication authority until explicit accepted provider/source evidence exactly matches the declared target and the loaded Parent material identity.

## Done Criteria

Implementation evidence: src/tooling/portable/lineage/lineage.publicationQualification.js now classifies declared locator shape separately from evidence state, validates nested exact publication/source evidence against target, loaded Parent SHA-256/byte identity, and provider repository/commit/path identity where applicable, and emits host-mediated source/repository verification requirements without performing fetches or writes. src/tooling/portable/lineage/lineage.integrity.plan.js consumes that classifier, removes the lexical commit-pinned-GitHub-to-qualified fallback, exposes locatorState/evidenceState/providerRequirement plus an explicit Tooling 022 compatibility note, and preserves all read-only/no-refresh/no-mutation/cascade rules. A plain caller-supplied state: qualified flag outside the accepted evidence shape is insufficient. Mutable/noncanonical GitHub blob URLs remain stale; local unpublished Parents remain missing; target/material/provider mismatches are contradictory; and pre-existing digest mismatch remains requires-explicit-approval regardless of publication verification.

Focused regression src/tooling/portable/lineage/portable.lineagePublicationEvidenceQualificationCorrection.test.mjs passes lexical commit-pinned locator without provider evidence, exact qualified provider/source evidence, locator/evidence target mismatch, Parent material SHA mismatch, mutable branch URL, local unpublished Parent, pre-existing mismatch review retention, compatibility note, and no remote/source mutation. The existing lineage repair-plan foundation test was updated to supply truthful exact qualification evidence where it expects qualified publication and continues to pass. The full portable aggregate and prospective Parent-target v2 acceptance regression pass.

## Bounded Scan Reconciliation

Before this correction, the current-Site scan reported 248 records with publication states missing 129, not-applicable 89, qualified 18, stale 12; repair dispositions blocked 145, no-change 88, proposed 15. With the corrected evidence boundary over the same 248 records, the 18 lexical-only commit-pinned origins are locatorState commit-pinned-github-blob but publication state unresolved, leaving qualified 0; the 15 clean backfill proposals become 0 because publication evidence is not independently qualified; blocked rises to 160 while no-change remains 88. Thirty records require host-mediated provider verification (18 commit-pinned unresolved plus 12 stale/mutable locator cases). Parent/child integrity classifications remain unchanged: healthy 88, parent-target-missing 152, parent-unresolved 6, child-self-mismatch 1, child-self-unavailable 1. No scanned artifact was mutated or resealed.

## Scope

This is read-only planner/evidence qualification only. Exact declared Parent Trace/Origin and loaded Parent bytes remain semantic/integrity inputs; no Parent identity, permalink, checksum, or publication receipt was invented. Network verification remains host-mediated, with remoteFetchPerformed=false and remoteWriteAuthorized=false. Tooling 021 repair application and Tooling 022 human-adapter projection remain blocked pending independent acceptance and retained semantic/publication decisions.

## Validation Evidence

Focused Tooling 024, lineage foundation, full portable aggregate, and src/acceptance/postV482ParentTargetV2ContinuityIntegrityClosure.test.mjs pass. npm run validate remains stopped by the same two pre-existing baseline source-size violations, src/tooling/portable/engine.facade.js and src/tooling/portable/operation.catalog.js; the Tooling 024-modified lineage.integrity.plan.js was refactored below the 24k guard, so this tranche does not add a new size-guard failure.

## Dependencies

Controlling task: .topics/development/tooling/dogfood/024-lineage-publication-locator-evidence-qualification-correction.trace.md. Controlling transfer: .topics/development/handoff/loom/015-human-output-copyable-presentation-and-publication-evidence-correction-handoff.trace.md. The unresolved unpublished Parent Origin semantic gap remains external authority; exact Source/provider qualification and any future mutation/publication authorization remain retained outside this implementing session.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:YbjIX0MnzBwnMUbCN63rSz9nLsX6V277e2p0NHY1UCI
