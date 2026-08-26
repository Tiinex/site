# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/site/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 15:31:00
  - Authors: Anchor
  - Why: Land the bounded correction required by the quarantined 027-5-13 recipient-surface preflight without redesigning the accepted flat carrier or weakening Workspace/archive qualification.
  - Summary: Recipient-v2 generated semantic artifacts no longer serialize the manufacture-internal transport correlation key; recipient inspection derives its disposable in-memory correlation from independently qualified visible Workspace/archive identity facts, and new generated c14n-v2 self footers preserve canonical readable `Value: <digest>` spacing.
  - Status: accepted-bounded/final-specimen-pending

---

# Tooling 027-5-13.1 visible-control metadata and footer canonicalization correction

The quarantined candidate remains historical evidence. This decision governs the correction used to manufacture the next numbered Sigma audit specimen.

## Decision

- State: accepted-bounded / source-and-regression-gates-green / physical-027-5-14-specimen-pending
- Subject: recipient-facing v2 generated Tiinex artifact control-surface readability and continuity-footer representation
- Decision: remove the manufacture-internal `transportCorrelationKey` from the visible Workspace External Payload artifact entirely. Recipient-side qualification reconstructs one disposable local correlation key in memory from already visible and independently qualified Workspace/archive identity facts, uses that same local value for the reconstructed Workspace materialization and binding, and gives that value no persisted semantic authority. Generated recipient Pointer, External Payload, and Relation artifacts must seed self sealing with nonempty placeholder text so c14n-v2 output preserves canonical `Value: <digest>` spacing.
- Boundary: do not change Workspace identity, archive bytes, entry identity, route selection, Handoff lifecycle, Parent semantics, v1/current/default carriage, or remote state; do not replace one leaked giant control object with a differently named visible control token unless the semantic artifact genuinely needs it.

## Basis

- Triggering preflight: [Tooling 027-5-13 recipient-v2 artifact-envelope and visible-control-surface preflight](027-5-13-recipient-v2-artifact-envelope-and-visible-control-surface-preflight-validation-report.trace.md).
- The 027-5-13 preflight proved that the full manufacture correlation key is unnecessary recipient-visible machinery: it made one readable External Payload artifact roughly 717 KB while package qualification only needed internal equality between the reconstructed Workspace and binding correlation values.
- The accepted Workspace/archive classification says package-local correlation is disposable transport-control metadata rather than Workspace schema truth. The visible External Payload artifact should preserve payload identity, location, integrity, access boundary, and the bounded facts needed to verify those claims — not a serialized manufacture graph.
- The recipient inspector already independently verifies Workspace target digest, archive digest, archive entry set fingerprint, completeness, and Relation/Pointer bindings before provider reconstruction. A local correlation derived from those qualified facts is therefore an implementation-local join key, not a new semantic claim.
- Sigma supplied the maintained [`tiinex.transition.v1` schema](https://github.com/Tiinex/docs/blob/master/.topics/.schemas/transition/tiinex.transition.v1.schema.md) as a canonical Parent/header/footer readability reference. Its footer uses the human-readable `Value: <digest>` form; this correction follows that representation style without changing c14n-v2 semantics or rewriting historical artifacts.

## Corrected Implementation Surface

- `src/tooling/portable/handoff/recipientV2.topology.js`
  - stops projecting `binding.transportCorrelationKey` into the visible Workspace payload facts.
- `src/tooling/portable/handoff/recipientV2.inspect.helpers.js`
  - derives one `recipient-v2:<sha256>` local correlation from `workspaceId`, exact Workspace target path/digest/inner path, archive path/digest, and independently verified entry-set fingerprint;
  - assigns that same local value only to the in-memory reconstructed Workspace and archive binding needed by existing provider invariants.
- `src/tooling/portable/handoff/recipientV2.artifacts.js`
  - seeds self footer sealing with `Value: pending`, allowing canonicalization to preserve one readable space when replacing the placeholder with the computed c14n-v2 digest.
- `src/tooling/portable/handoff/archiveCarrierV2.test.mjs`
  - rejects visible `transportCorrelationKey` leakage;
  - bounds the synthetic Workspace payload artifact below 20 KB so manufacture-control dumps cannot silently reappear;
  - requires generated recipient artifacts to end in canonical readable `Value: <43-char digest>` form.

## Regression Evidence

- Focused `archiveCarrierV2.test.mjs`: PASS after the correction.
- Material closure, current/v1 manufacture, carrier projection, route artifact conformance, Pointer entrypoint, cold consumer, context audit, Tooling 026 cold-start, multi-root manufacture, human-output, transport companion: PASS.
- Existing 1,286-workspace scale pressure: PASS, 3,447 ms in this Anchor environment.
- TypeScript `tsc -p tsconfig.json --noEmit`: PASS, 10.64 s in this Anchor environment.
- Static discipline: exactly the five historical oversized source findings and no new recipient-v2 implementation source finding.
- No test, schema, guard, tsconfig, static threshold, or v1 behavior was weakened to obtain these results.

## Consequences

- The 027-5-13 physical ZIP stays quarantined and must not be presented as the accepted v2 candidate.
- The next personal-audit specimen is numbered 027-5-14 and must be manufactured from the corrected full working state with a new Sigma Handoff rather than silently rewriting the old bytes.
- The corrected physical ZIP must still pass exact root inspection, visible artifact header/footer inspection, absence of leaked transport correlation control metadata, payload ownership, recipient-v2 inspection, selected Handoff qualification, orientation, context audit, and exact deterministic byte roundtrip before Anchor gives it to Sigma.
- Current/v1 remains the default carrier; a successful Sigma audit only unlocks the next fresh cold-start qualification stage.

## Review Conditions

- Reject the correction if any visible generated semantic artifact again contains the manufacture-internal `transportCorrelationKey` or expands into machine-control bulk inconsistent with its canonical artifact role.
- Reject the correction if canonical footer presentation is achieved by weakening integrity verification rather than by preserving whitespace through the existing seal path.
- Reject the final specimen if the actual serialized ZIP differs from the inspected root/bytes or if any old legacy outer control directory reappears.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: W3HGk252UZLgoibTB753hNboKygqThRYMA4DIRY0k0A
