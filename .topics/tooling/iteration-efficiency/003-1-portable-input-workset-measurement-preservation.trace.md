# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:11:00
  - Authors: Loom
  - Summary: Preserve Site and carrier portable-input materialization measurements for iteration-efficiency triage.
  - Status: preserved/local

---

# Portable Input Workset Measurement Preservation

## Preserved Material

- Material Description: focused test and exact read-only portable-input workset measurements from the current warm Site working state and current Anchor-to-Loom carrier.
- Material Kind: portable loader materialization counts, byte totals, source/kind decomposition, findings, and elapsed observations.
- Focused Test: `node tools/measure-portable-input-workset.test.mjs` passed; external elapsed `0.14 s` in the first measured run.
- Site Measurement: internal elapsed `327.942 ms`; external elapsed `0.46 s`; 1,836 entries; 14,180,220 declared bytes; 1,773 resident text entries / 13,479,832 text bytes; 58 resident binary entries / 550,358 bytes; 5 locator-only entries / 150,030 declared bytes; zero warnings/errors.
- Site Source Modes: 1,660 local entries / 12,444,737 bytes and 176 ZIP-expanded entries / 1,735,483 bytes.
- Current Carrier Measurement: internal elapsed `15.158 ms`; external elapsed `0.14 s`; 10 entries; 17,714,953 declared bytes; 7 resident text entries / 23,216 text bytes; 3 resident binary entries / 17,691,737 bytes; zero locator-only entries and zero warnings/errors.
- Task 001 Comparison: the same current carrier previously reported CLI input preparation `14.349 ms`; the direct loader measurement `15.158 ms` is consistent with that phase attribution.
- Triage Result: current-carrier input materialization is measurable in tens of milliseconds, not minutes; no loader optimization is justified by this evidence alone.

## Preservation Act

- Preservation Method: copied numeric output from the read-only diagnostic built directly on the existing production portable input loader.
- Preservation Time Or State: captured after Site tasks 001 and 002, before any workset cleanup or input-loader mutation.

## Provenance

- Known Source: current warm Site working state and `/mnt/data/tiinex-business-003-1-1-1-1-1-1-1-anchor-to-loom.handoff-package.zip`.
- Provenance Limits: loader elapsed covers portable input materialization only; it excludes downstream orientation, qualification, audit, manufacture, host review/queue behavior, and model work.

## Fidelity And Loss

- Fidelity Notes: counts and bytes come from the exact `loadNodePortableInput()` result shape; internal elapsed uses `process.hrtime.bigint()` around that call.
- Known Losses: filesystem cache state and host scheduling are uncontrolled; one measurement does not establish a stable performance distribution.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact under `.topics/tooling/iteration-efficiency/`.
- Reuse Boundary: suitable for performance triage and later before/after comparison if input loading is intentionally changed.

## Interpretation Limits

- Does Not Prove: that repository size is irrelevant to other discovery/grounding paths, that input loading can never become expensive, or what causes host additional review.
- Not Yet Used As: cleanup authorization, broad performance acceptance, Anchor acceptance, or transport closure.
- Must Not Be Treated As: permission to weaken input validation, ZIP safety checks, file limits, integrity validation, or qualification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Sk7hK4j4YqSDq0FS-3VsuAGWc8YocI7zf3o59DpFeKY