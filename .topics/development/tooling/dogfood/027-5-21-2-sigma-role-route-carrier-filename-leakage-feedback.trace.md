# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-25 22:32:00
  - Authors: Anchor
  - Why: Preserve Sigma's rejection of the first 027-5-21 physical carrier filename before warm-recipient execution: the package bytes and inner carrier were acceptable, but the filesystem basename leaked test-scenario context instead of using the established role-route Handoff naming projection.
  - Summary: Sigma filename audit FAIL — `tiinex-site-027-5-21-warm-recipient.handoff-package.zip` is not an acceptable standard transport name; role-to-role delivery should project the qualified Handoff parties in the slug, as prior `loom-to-anchor` / `anchor-to-sigma` packages did, and filename choice must be Tooling-owned rather than caller/LLM prose.
  - Status: correction-required/local

---

# Sigma role-route carrier filename leakage feedback

## Observed Signal

- Sigma inspected the downloaded 027-5-21 warm-recipient package before running the behavioral test and rejected its physical basename.
- The visible basename was `tiinex-site-027-5-21-warm-recipient.handoff-package.zip`.
- `warm-recipient` describes the test scenario rather than the qualified Handoff transfer parties and therefore leaks context outside the package.
- Earlier accepted transport convention exposed role transfer directly in the carrier slug, for example `loom-to-anchor` or `anchor-to-sigma`.

## Interpretation

- The package interior and Start/Continue-from address-label model are not rejected by this finding.
- The physical carrier basename is a disposable human transport projection, but it still affects recipient/human attention and therefore must be deterministic and non-improvised.
- For a qualified role-to-role Handoff, the basename should project the Handoff's exact `From → To` parties plus its dimensional route identity, not a test purpose, summary, scenario label, or caller-selected filename.
- A caller/LLM must not be able to override the Tooling-projected basename with arbitrary `--output` prose.

## Feedback Target

- Target: first physical Tooling 027-5-21 warm-recipient package and the CLI output-path behavior that allowed its scenario-labelled basename.
- Accepted Interior: current recipient-v2 ZIP tree, canonical artifacts, Start/Continue-from transport content, shared sibling-route carriage, and package-local Parent/pathing behavior remain accepted for continued testing.

## Feedback Received

- State: FAIL for filename standardization.
- Required Correction: restore Tooling-owned route-party naming and prevent arbitrary caller basename override.
- Expected Warm Route Projection: `tiinex-site-027-5-21-anchor-to-loom.handoff-package.zip` for the exact carried Anchor-to-Loom 027-5-21 Handoff.
- Historical Handling: do not rename the rejected physical file in place and present it as accepted evidence; manufacture a corrected specimen after the Tooling guard exists.

## Source

- Source: Sigma pre-test visual inspection of browser download history and comparison with earlier accepted role-route package names on 2026-08-25.
- Fidelity Limit: the screenshots establish the visible filenames and historical comparison; this artifact records the bounded naming disposition rather than treating filename as semantic Handoff authority.

## Disposition

- State: accepted correction request; behavioral use of the scenario-named 027-5-21 package is blocked.
- Owner: Anchor owns Tooling correction and corrected package manufacture; Sigma retains behavioral test execution after corrected transport is delivered.
- Required Evidence: Tooling must reproduce the correct role-route basename from package truth, reject a mismatched explicit basename, and manufacture the replacement through the same projection rather than by manual rename.

## Limits

- Does Not Mean: filename becomes Parent, assignment, Handoff, package identity, or semantic route authority.
- Must Preserve: route selection and semantic truth remain inside qualified package artifacts; physical naming is only a deterministic transport projection designed to avoid misleading humans/LLMs.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qsPRfhNWQpOesD5c-kULQWstsfK2F7eEtzS4PDUMl7s
