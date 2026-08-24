# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 11:06:00
  - Authors: Loom
  - Why: Record the bounded Tooling 025 correction that makes positive publication qualification depend on exact accepted repository-read provider material rather than record-local evidence assertions.
  - Summary: Tooling 025 result — publication provider receipt binding correction
  - Status: draft/local

---

# Tooling 025 result — publication provider receipt binding correction

## Objective

Closed the retained Tooling 024 provenance-binding gap without authorizing repair application or network access. `publicationOrigin.state = qualified` now requires accepted repository-read provider material supplied to the lineage operation through the existing portable host-action receipt/acceptance boundary; record-local `publishedReference.evidence` and related nested metadata remain descriptive and cannot independently create mutation authority.

## Done Criteria

Implementation evidence: `src/tooling/portable/lineage/lineage.publicationProviderReceipts.js` normalizes explicit `publicationProviderReceipt(s)` by replaying `acceptPortableHostActionReceipt`, accepts only `tiinex.portable.host-action-acceptance.v1` material with `status=accepted` and `action=repository-read`, rejects wrong/missing/rejected actions, and ignores direct unaccepted `providerResponses` for publication authority. `src/tooling/portable/lineage/lineage.integrity.plan.js` threads this accepted evidence into publication classification while remaining read-only. `src/tooling/portable/lineage/lineage.publicationQualification.js` preserves Tooling 024 locator classification and record-local contradiction checks, but positive GitHub commit-pinned qualification now requires exact repository, forty-hex commit, normalized path, and provider-returned UTF-8 content identity. Tooling hashes the returned provider content itself and compares that digest and byte count with the loaded Parent; caller-supplied material digests are not sufficient. Record-local receipt references bind only to the same accepted host action id.

Focused regression `src/tooling/portable/lineage/portable.lineagePublicationProviderReceiptBindingCorrection.test.mjs` proves: fully fabricated nested record evidence remains unresolved; an exact accepted repository-read receipt qualifies; a missing receipt step is rejected; a wrong host action is rejected; missing receipt references remain unresolved; referenced repository/commit/path mismatch is contradictory; exact-target returned-byte mismatch is contradictory; direct unaccepted `providerResponses` are ignored; mutable branch locators remain stale; local unpublished Parent state remains missing; and a pre-existing Parent target mismatch remains `requires-explicit-approval` even with exact accepted provider material. Tooling 024 focused coverage and the lineage foundation were updated to supply explicit accepted provider observations for positive qualification cases without reopening their lexical/stale/local/mismatch semantics.

The existing host receipt plan now preserves an explicitly requested repository-read path in its arguments template. No hidden fetch, GitHub authentication, remote write, source mutation, repair application, checksum refresh, permalink insertion, or descendant reseal was performed.

## Bounded Scan Reconciliation

A pre-return current-Site scan over the 254 supplied `.topics/**/*.trace.md` records, with no publication provider receipts supplied, remains fail-closed: publication states are missing 129, not-applicable 96, stale 12, unresolved 17, qualified 0; repair dispositions are blocked 158, no-change 96, proposed 0. Locator states are commit-pinned-github-blob 17, mutable-or-noncanonical-github-blob 12, missing 129, and not-applicable/root 96. Twenty-nine artifacts expose a required host-mediated provider requirement. Parent/child integrity states are healthy 96, parent-target-missing 152, parent-unresolved 5, child-self-mismatch 1. The record count differs from Tooling 024's earlier 248-record snapshot because the handoff/review tranche added six local continuity artifacts; positive qualified/proposed counts did not increase from record-local nested evidence.

## Validation Evidence

Passing: `src/tooling/portable/host/tool.bindings.test.mjs`; lineage repair-plan foundation; Tooling 024 focused publication-evidence regression; Tooling 025 focused provider-receipt regression; `src/acceptance/postV482ParentTargetV2ContinuityIntegrityClosure.test.mjs`; and the complete `src/tooling/portable/portable.test.mjs` aggregate. `npm run validate` reaches the supplied-baseline static source-size guard and stops only on the same two pre-existing violations: `src/tooling/portable/engine.facade.js` and `src/tooling/portable/operation.catalog.js`. Tooling 025 modified lineage files remain below the 24k guard.

## Scope

This result is portable read-only publication evidence consumption/provenance binding only. Tooling 021 repair application remains blocked pending independent acceptance, exact provider evidence for any intended repair set, and retained semantic/mismatch decisions. Tooling 022 human-adapter projection remains blocked behind the repair/application contract. Unpublished Parent Origin semantics, existing lineage mutation, publication acts, and remote provider authorization remain external responsibilities.

## Dependencies

Controlling task: [Tooling 025](025-lineage-publication-provider-receipt-binding-correction.trace.md). Controlling transfer: [Anchor-to-Loom Handoff 017](../../handoff/loom/017-publication-provider-receipt-binding-correction-handoff.trace.md). Independent basis: [Tooling 024 Anchor disposition](024-2-lineage-publication-locator-evidence-qualification-anchor-disposition.trace.md) and [provider evidence provenance binding feedback](../../architect/continuity/001-34-publication-provider-evidence-provenance-binding-gap-feedback.trace.md).

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:mzKiAcgYAbd7H844h1tlDBLu6dVYYBswcujPFCgy-iw
