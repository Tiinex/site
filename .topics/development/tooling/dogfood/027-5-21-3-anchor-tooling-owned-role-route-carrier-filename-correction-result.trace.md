# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 22:35:00
  - Authors: Anchor
  - Why: Close the filename authority leak exposed by Sigma before warm-recipient testing and restore the established deterministic role-route carrier naming convention at the Tooling filesystem boundary.
  - Summary: Handoff package basenames are now Tooling-owned: normal manufacture uses `--output-dir` and writes exactly `humanOutput.primary.filename`; explicit `--output` is accepted only when its basename is exactly the Tooling projection; route purpose/test labels are excluded from filename generation; qualified Handoff dimension and From/To parties remain the projection inputs.
  - Status: accepted/local/retest-packages-required

---

# Anchor Tooling-owned role-route carrier filename correction result

## Decision

- State: accepted correction.
- Subject: physical Handoff package basename generation and CLI output-path authority.
- Rule: a qualified carrier filename is generated from the qualified workspace/package slug, exact Handoff dimensional path, and exact Handoff `From` / `To` parties.
- Role-to-Role Example: the 027-5-21 Anchor-to-Loom route projects `tiinex-site-027-5-21-anchor-to-loom.handoff-package.zip`.
- Excluded Inputs: Handoff purpose, test scenario, task title, summaries, conversation prose, user-suggested labels, and LLM-generated convenience names cannot contribute to the projected basename.
- Normal CLI Path: use `--output-dir <dir>`; Tooling chooses the basename.
- Explicit Path Boundary: `--output <path>` may choose location only when `basename(path) === humanOutput.primary.filename`; any mismatch fails closed with `portable.cli.handoff-carrier.output-filename.mismatch`.

## Basis

- Carrier projection already computed the correct 027-5-21 filename from package truth, but `materializeHandoffManufactureCliOutput` allowed an arbitrary caller-supplied `--output` basename to override it at filesystem write time.
- That split authority allowed Anchor to manufacture correct bytes under the misleading `warm-recipient` scenario slug even though package-truth regeneration projected `anchor-to-loom`.
- Sigma correctly identified the mismatch before behavioral testing.

## Tooling Changes

- CLI Handoff materialization now resolves output through one guarded Tooling-projected filename path.
- Arbitrary basename override fails closed; exact projected basename remains usable when an explicit path is operationally required.
- Carrier filename projection no longer appends route `purpose`, preventing scenario/test labels from leaking into filenames even when a route descriptor carries purpose metadata.
- CLI help and embedded bootstrap instruct normal Handoff manufacture to use `--output-dir` and state that basenames are Tooling-owned.
- Existing package-truth regeneration remains able to recover the exact projected filename and transport label from a received carrier.

## Regression Evidence

- Carrier projection test: PASS for shared route fan-out and historic `workspace-dimension-from-to` naming.
- New purpose-pressure regression: a route descriptor with purpose `warm recipient pressure test` still projects only `tiinex-shared-fixture-004-anchor-to-loom.handoff-package.zip`.
- New CLI authority regression: `--output warm-recipient.handoff-package.zip` fails closed with `portable.cli.handoff-carrier.output-filename.mismatch`.
- New CLI exact-path regression: an explicit path whose basename exactly equals the Tooling projection writes successfully.
- recipient-v2 archive carrier regression: PASS after enforcing the same filesystem naming boundary.
- Static discipline remains at the retained historical five oversized-source findings; no new source-size finding is introduced by this correction.

## Consequences

- The first scenario-named 027-5-21 and 027-5-22 physical files remain historical pre-correction specimens and must not be used for the planned behavioral tests.
- Both behavioral test packages must be manufactured again through `--output-dir` so the actual file exposed to Sigma/recipient has the Tooling-projected basename.
- Same package bytes may still be copied/addressed separately for different qualified routes when shared-carrier semantics permit it; each human delivery uses the filename projected for the selected Handoff route without changing semantic package authority.

## Interpretation Limits

- Does Not Mean: filenames become semantic route authority or package identity.
- Must Not Be Used To Claim: two differently named copies necessarily contain different bytes, or role-party names in the filename replace Start/Continue-from transport addressing.
- Standardization Boundary: filename, package bytes, and transport text are all Tooling outputs; only package artifacts remain semantic authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ExKrfi364PqzI2X0CCHZp5wl2G_yl0Tnp29h3g5Sb5Y
