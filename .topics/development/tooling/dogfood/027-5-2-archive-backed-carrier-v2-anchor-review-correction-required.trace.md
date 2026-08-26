# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 00:42:00
  - Authors: Anchor
  - Why: Independently replay Tooling 027-5 against the full working source and gate first-new-format generation on both Workspace target conformance and non-regression of current source-discipline checks.
  - Summary: Anchor review of Tooling 027-5 — the opt-in archive carrier design and regressions are substantially sound, but acceptance is withheld pending two bounded corrections: Workspace targets must require verified Tiinex artifact conformance rather than schema-id-only qualification, and the implementation must not add new v119 source-size violations.
  - Status: correction-required/local

---

# Tooling 027-5 Anchor review — correction required before first v2 candidate

## Decision

- State: correction-required / implementation-retained / first-v2-candidate-blocked
- Subject: independent acceptance of Tooling 027-5 archive-backed Handoff carrier v2 implementation
- Decision: retain the returned opt-in v2 implementation as the correction baseline, but do not accept it or generate the first human-deliverable v2 package yet. Open one bounded Loom correction for Workspace-target artifact conformance and newly introduced static source-size regressions. Current/default v1 remains unchanged.
- Boundary: this review does not reject the archive-backed representation model, reopen Tooling 027-4 semantics, authorize Workspace artifact invention, switch the default carrier, or authorize publication/remote mutation.

## Independent Replay Evidence

- Returned current/v1 package orientation: ready.
- Selected Loom→Anchor Handoff: `tiinex.handoff.v1`, compiled-schema validated, independently verified c14n-v2 self integrity, no invented Parent.
- Loom result: `tiinex.decision.v1`, compiled-schema validated, independently verified c14n-v2 self integrity, no invented Parent.
- Exact implementation diff against the supplied Tooling 027-5 baseline: 14 source paths, matching Loom's declared changed-path set.
- Focused archive-v2 regression: PASS.
- Downstream replay PASS: Handoff manufacture, route-artifact conformance, carrier projection, Pointer, cold consumer, Tooling 026 cold-start qualification, context audit, multi-root manufacture, human-output normal/copyable presentation, transport companion, operation catalog, CLI run, architecture shape, browser import boundary, schema bindings/runtime projections, TypeScript.
- Reconstructed full-source `materialClosure.test.mjs`: PASS. The earlier carried-environment limitation was transport-only, not a production regression.

## Correction Finding 1 — Workspace target conformance is too weak

The v2 manufacture path requires an explicit `.workspace.md` target and checks that its `Current Schema` is `tiinex.workspace.v1`, but qualification does not currently require the target artifact itself to have a verified primary c14n-v2 self seal or full Root/schema conformance.

Concrete evidence:

- `materialClosure.archiveV2.js` computes `validatedC14nV2PrimarySelfDigest(...)` for the Workspace target but does not fail manufacture when that state is not `verified`.
- `workspaceByteProvider.js` compares the stored target self-integrity state with the recomputed state, but accepts matching non-verified states such as missing/prepared rather than requiring verified state.
- The positive `archiveCarrierV2.test.mjs` fixture currently uses a Workspace artifact with `Draft Local Integrity / browser-local-draft`, and the v2 positive path still returns ready.

This contradicts the Tooling 027-5 contract that the Workspace target be an independently verifiable Tiinex artifact/representation identity and that package-wide newly generated/carried Tiinex artifact conformance remain fail-closed.

Required correction boundary:

- Reuse existing general Root/schema/integrity validation seams rather than inventing Handoff-specific Workspace hash logic.
- Require the exact Workspace target to validate as `tiinex.workspace.v1` and to have independently verified c14n-v2 primary self integrity.
- If the Workspace target truthfully declares Parent, preserve the ordinary Root/Parent-target continuity requirements rather than bypassing them.
- Add adversarial fixtures for missing/unverified self integrity, mismatched self integrity, malformed Root/schema body, and any relevant Parent-target failure.
- Replace the current positive Workspace fixture with a genuinely qualified sealed Workspace artifact.

## Correction Finding 2 — new static source-size regressions

Reconstructed full-source `tools/validate-static.mjs` already has five pre-existing source-size failures in the accepted baseline. Tooling 027-5 adds three new failures and therefore worsens the baseline:

- `src/tooling/portable/adapters/node/handoff.manufacture.js`: 23,800 → 25,587 bytes.
- `src/tooling/portable/handoff/materialClosure.archiveV2.js`: new, 29,029 bytes.
- `src/tooling/portable/handoff/workspaceByteProvider.js`: new, 29,338 bytes.

The current static discipline flags source `.js` files above 24,000 bytes. The correction must remove only the newly introduced violations through responsibility-preserving extraction/splitting; do not opportunistically refactor unrelated pre-existing oversized modules.

Acceptance condition: after correction, `validate-static.mjs` may still report the exact pre-existing baseline violations, but must report no additional Tooling 027-5 source-size violation.

## Retained Acceptance Boundary

- Preserve all already-passing archive-v2 semantic/adversarial regressions.
- Preserve v1 byte/topology behavior and default manufacture.
- Preserve explicit Workspace target binding; do not reintroduce filename/content scanning or Workspace minting.
- Preserve fail-closed archive/entry/completeness/provider/outer-file-map behavior.
- Keep first real `tiinex-site` v2 candidate blocked until Anchor independently accepts the correction and a truthful real `.workspace.md` instance target is deliberately landed.
- Sigma's first-new-format package inspection gate remains retained and has not yet fired.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:OFAhdLzku8N6cIVI6q7PpRgmTVNjauKpC73r5-fiq7w
