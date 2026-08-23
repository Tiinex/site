# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 17:39:00
  - Authors: Anchor
  - Why: Independently dispose Tooling 013 after reproducing the package-local START projection, fail-closed tamper behavior, plural workspace/route pressure, embedded-runtime cold orientation, and accepted Tooling 011/012 compatibility on the returned final bytes.
  - Summary: Accept package-local cold-consumer START orientation and plural workspace/route representation while preserving one-workspace manufacturing as the ergonomic default and keeping broad multi-root authoring separate.
  - Status: accepted/local

---

# Tooling 013 Anchor acceptance

## Decision

- State: accepted
- Subject: package-local cold-consumer orientation and plural workspace/route representation
- Decision: accept Tooling 013 at the bounded portable Tooling architecture/source boundary. Recipient-relative Handoff packages may carry generated `tiinex.package/START.md` orientation with a parseable structured projection of `workspaces[]` and qualified routes; START has no semantic authority and must correlate fail-closed with carrier/closure/file-map/manifest/workspace truth. The package/carrier representation is structurally `1..N` workspace capable while normal Node/CLI manufacturing remains a one-root ergonomic default until broader multi-root filesystem authoring is separately justified.
- Trust Level: bounded implementation acceptance / not canonical Handoff-schema acceptance / not Viewer product acceptance
- Does Not Mean: START may override package truth, every package should contain multiple workspaces, broad multi-root authoring is closed, Viewer activation behavior is decided, filenames identify recipients authoritatively, or received package code must execute merely to orient a cold consumer.

## Basis

- The returned package file map governs 1,653 entries; independent byte/length/SHA-256 verification found zero mismatches.
- Independent reruns pass `carrierProjection.test.mjs`, `coldConsumerEntrypoint.test.mjs`, `handoff.manufacture.test.mjs`, `handoff.manufacture.scale.test.mjs`, `transportCompanion.test.mjs`, `materialClosure.test.mjs`, and the full portable aggregate suite.
- `node tools/validate-static.mjs` and `npm run portable:smoke` pass on the returned workspace bytes.
- Independent `orient-handoff-package` against the returned ZIP reports `status=ready`, `entrypoint.status=valid`, one qualified workspace, one qualified route, implicit single-route selection, and zero findings.
- The embedded qualified Tooling runtime carried inside the returned package independently performs the same orientation directly against the final ZIP and returns the same ready/valid route/workspace state without predecessor-chat state.
- An independently tampered copy of `START.md` that changed the projected recipient while leaving package truth unchanged is rejected as `status=blocked` / `entrypoint.status=invalid`; START therefore does not override correlated package truth.
- The focused two-workspace pressure fixture passes and verifies exact route-to-workspace binding, route-local human projection, and preservation of the accepted Tooling 012 per-route Required Context boundary.
- Independent `npm run validate` reaches the already-known transported-workspace boundary at absent `.old/app.js` only after the relevant package/Tooling/static surfaces have passed; this decision does not reinterpret that environment boundary or the separately known missing-installed-React dependency.

## Consequences

- Tooling 013 is closed for parseable package-local cold-consumer orientation, fail-closed START correlation, plural workspace/route projection, exact route-to-workspace binding, selected-workspace human projection, and cold orientation through supplied package bytes.
- Single-workspace remains the ergonomic default; plural representation is a capability rather than a packaging mandate.
- `START.md` is a generated human/LLM entrypoint projection and may support copy-free cold-start orientation, but carrier/closure/file-map/manifest/workspace bytes remain the verification basis.
- Broad multi-root filesystem authoring remains an explicit separate gap rather than being silently claimed by plural representation support.
- Viewer/product handling of externally intended Handoff packages remains separate work; this acceptance lands portable package capability only.

## Review Conditions

Reopen Tooling 013 only for a reproducible contradiction in START parsing/correlation, package-truth precedence, route-to-workspace binding, plural representation, single-workspace compatibility, cold-consumer operation behavior, or accepted Tooling 011/012 compatibility. Route Viewer activation UX, Process semantics, or general multi-root authoring to their own bounded work.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:GwjfuZCK72rzjZmN804_MPP1vI_waOwxyKhW_wtPWkU
