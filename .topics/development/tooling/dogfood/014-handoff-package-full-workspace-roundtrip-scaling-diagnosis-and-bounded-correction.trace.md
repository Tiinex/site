# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 18:06:00
  - Authors: Anchor
  - Why: Turn the observed >300-second default full-workspace manufacture roundtrip boundary into one bounded Loom diagnosis/correction leaf without inventing a generalized performance SLA or weakening accepted package verification.
  - Summary: Diagnose and, where locally justified, correct pathological scaling in the default full-workspace Handoff manufacture roundtrip while preserving Tooling 011-013 semantics.
  - Status: open/local

---

# Handoff package full-workspace roundtrip scaling diagnosis and bounded correction

## Objective

Instrument and reproduce the current default full-workspace Handoff manufacture roundtrip path, identify the phase(s) and proven work amplification responsible for the practical >300-second review-window boundary, and apply a bounded portable Tooling correction only when the cause is owned by the existing implementation. Preserve package/file-map/carrier/closure/START/workspace truth and accepted Tooling 011-013 behavior throughout.

## Done Criteria

- Establish an apples-to-apples control on the supplied current full workspace: equivalent manufacture with normal roundtrip and with `--no-roundtrip`, recording explicit phase boundaries, elapsed time and sufficient counters/resource observations to distinguish where the additional work occurs. Do not infer a root cause from total wall clock alone.
- Trace the default roundtrip through its existing build/inspect/import-plan/apply/compare or equivalent stages and identify any repeated full-workspace parse/hash/materialization/reconstruction work, multiplicative traversal, ZIP rehydration, or other concrete amplification with source-level evidence.
- Add focused deterministic instrumentation/regression coverage for the proven cause. Prefer operation counts, bounded fixture growth, phase receipts, or another host-portable invariant over a brittle universal wall-clock assertion.
- If the proven root cause is a local portable Tooling defect/inefficiency and can be corrected without changing semantic verification, implement the smallest coherent correction and keep the existing roundtrip truth comparison intact. Do not make `--no-roundtrip`, skipped comparison, reduced file coverage, weaker hashes, or stale cached truth the default merely to obtain a green result.
- After the final mutation, rerun the focused Handoff manufacture/scale/carrier/START/material-closure suites plus static/portable gates relevant to Tooling 011-013. Preserve already accepted single-route, shared-route, Required Context, human carrier projection, cold-consumer START correlation, plural workspace representation, and embedded-runtime behavior.
- For closure-by-correction, demonstrate one final default roundtrip manufacture of the current full-workspace class completing inside the previously imposed 300-second review window in the Loom environment, with the same package truth checks still enabled, and record the phase evidence. This is a bounded operational proof for this leaf, not a generalized performance guarantee.
- If a safe local correction cannot satisfy that bounded proof, return a diagnosis disposition instead of false closure: exact dominant phase/cause evidence, what source boundary prevents correction, what redesign or explicit requirement decision would be needed, and which accepted behavior must remain frozen.
- Return durable Loom result/evidence and one primary recipient-relative Handoff package to Anchor. If the gap is still open, manufacturing the return carrier with `--no-roundtrip` is allowed only when the result explicitly preserves that unresolved state.

## Scope

Portable Tooling instrumentation, full-workspace Handoff manufacturing/roundtrip internals, deterministic scaling regression coverage, and a minimal implementation correction when the diagnosed cause is locally owned. Out of scope: canonical Handoff/schema redesign; Process/Axiom semantics; Viewer/Kodax integration; broad multi-root authoring; a universal runtime performance SLA; changing transport semantics; refactor product-parity work; Q technical debugging or product acceptance.

## Dependencies

- [Handoff successor package roundtrip scale signal](../../architect/continuity/001-19-2-handoff-successor-package-roundtrip-scale-signal.trace.md) is the controlling operational observation and preserves the exact no-roundtrip/default contrast and its limits.
- [Tooling 013 Anchor acceptance](013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md) freezes the latest accepted cold-consumer/plural projection behavior that must remain semantically unchanged.
- [Tooling 012 Anchor acceptance](012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md) freezes shared-route, per-route Required Context qualification and human output projection.
- [Tooling 011 Anchor acceptance](011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md) is the accepted deterministic manufacturing/bootstrap/roundtrip foundation and should be diagnosed rather than replaced by a second package engine.
- [Loom first fresh-successor qualification-once decision](../../architect/continuity/001-11-4-loom-first-fresh-successor-qualification-once-decision.trace.md) bounds the current Loom execution trust level; successful work here may add regression evidence but does not silently strengthen that label.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: w27Bn20uCuR-jxIcQ_z75frVmqPJE0yQHNXsKcyr-64