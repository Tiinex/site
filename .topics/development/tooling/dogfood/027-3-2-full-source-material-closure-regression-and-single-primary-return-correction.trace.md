# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 22:44:00
  - Authors: Anchor
  - Why: Close the one regression only visible after the 027-3 implementation is replayed against the full working source, and preserve the normal single-primary Handoff return surface observed to be violated in the host UI.
  - Summary: Tooling 027-3-2 — migrate the remaining full-source material-closure fake Handoff fixtures behind the new exact conformance gate and return only the primary recipient package plus routing.
  - Status: open/local

---

# Tooling 027-3-2 — full-source material-closure regression and single-primary return correction

## Objective

Make the full working-source Handoff regression suite agree with the accepted 027-3 fail-closed selected-Handoff conformance boundary by replacing remaining structurally minimal fake Handoff fixtures with the shared schema-valid qualified fixture baseline. Do not weaken the conformance gate. Also honor the existing normal human-output contract on return: the operator should receive one primary Handoff package plus exact routing, not a menu of patch/evidence/result files.

## Done Criteria

- `src/tooling/portable/handoff/materialClosure.test.mjs` passes when executed from the full working source containing its pre-existing `src/export/package.zip.js` dependency.
- Replace the test's structurally minimal Handoff fixture(s) with `qualifiedHandoffFixture.js` or an equivalent existing shared schema-valid baseline; do not special-case, bypass, downgrade, or disable `selectedHandoffConformance`.
- Preserve the original material-closure assertions: complete/partial qualification, caller-readiness bypass resistance, anonymous workspace projection, duplicate ids, provider ambiguity, required/reference closure, exact package bytes, and all other pre-existing behavior must still be tested behind a valid Handoff contract.
- Rerun the focused 027-3 regressions: route-artifact conformance, manufacture, material closure, carrier projection, Pointer, cold-consumer, Tooling 026 cold-start, context audit, multi-root, scale, human-output presentation, and transport companion.
- Rerun architecture shape, browser import boundary, schema bindings, and TypeScript checks from the full source.
- Do not alter the substantive Tooling 027 audit finding, corrected result semantics, workspace/archive schema-classification blocker, carrier representation, canonical schemas, c14n-v2 algorithms, or exact carried canonical material.
- If the full-source material-closure regression exposes an implementation defect rather than only stale fixtures, stop and return the exact blocker instead of weakening qualification.
- Manufacture a normal current-format return package that independently orients/context-audits `ready`.
- Normal human return presentation must expose only `humanOutput.primary` as the package choice plus the exact normal inline routing. Do not present result artifacts, patch files, receipts, JSON evidence, or helper files as parallel transport choices.
- This correction does not create the future new carrier format and therefore does not trigger Sigma's first-new-format inspection gate.

## Scope

Full-source material-closure fixture migration and regression closure for the 027-3 conformance gate, plus adherence to the already-defined single-primary human return presentation contract.

## Dependencies

- [Anchor independent 027-3 review](027-3-1-handoff-route-artifact-conformance-anchor-independent-review.trace.md) owns the observed full-source regression and correction boundary.
- [Tooling 027-3 task](027-3-handoff-route-artifact-conformance-and-ready-gate-correction.trace.md) remains the implementation semantic boundary.
- [Tooling 027 corrected result](027-1-1-handoff-package-audit-schema-conformance-corrected-result.trace.md) preserves the accepted audit substance and current implementation evidence.
- [Material closure regression test](../../../../src/tooling/portable/handoff/materialClosure.test.mjs) is the exact full-source failing test.
- [Package ZIP dependency](../../../../src/export/package.zip.js) is the pre-existing dependency omitted from the previous route-scoped return package and must be carried in this correction package so Loom can reproduce the independent failure.
- [Qualified Handoff fixture](../../../../src/tooling/portable/handoff/qualifiedHandoffFixture.js) is the preferred shared baseline for valid test Handoff material.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:hThgHH7FAPLXW2vOVSh_MUy7bpEeAeGg0r9VybVMsRc
