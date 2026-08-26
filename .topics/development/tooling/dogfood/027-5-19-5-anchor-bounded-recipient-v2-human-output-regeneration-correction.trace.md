# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 22:02:00
  - Authors: Anchor
  - Why: Close a package-truth regeneration output-volume defect found while auditing the minimized recipient-v2 address-label standard: the v2-aware regeneration path returned correct routing bytes but also serialized internal Workspace/provider inspection state into an approximately 85 MB result.
  - Summary: 027-5-19 bounded regeneration correction — keep exact package-truth Start/Continue-from regeneration while projecting only bounded root/entry/workspace/route/finding summaries; package byte/provider internals remain internal and legacy v1 regeneration stays unchanged.
  - Status: accepted/local

---

# Tooling 027-5-19 — bounded recipient-v2 human-output regeneration correction

## Decision

- State: accepted.
- Human Output Boundary: read-only transport-text regeneration must remain bounded and must not serialize Workspace archive bytes, provider byte views, descriptor internals, or other package-control state into the user-facing operation result.
- Semantic Boundary: bounding the receipt changes no carrier bytes, route selection, Handoff authority, Start/Continue-from text, or v1 behavior.

## Basis

- The first v2-aware `project-handoff-carrier-output` implementation correctly regenerated Loom and Axiom address labels from the same shared package.
- Its operation result included the complete recipient-v2 inspection object, including qualified Workspace/provider internals, producing roughly 85 MB JSON per projection.
- The ordinary human-output contract is explicitly bounded and exists to recover one package choice plus exact routing bytes, not to dump carrier internals.

## Correction

- `recipientV2.humanOutput.js` now emits a bounded recipient-v2 carrier-inspection summary containing only format/status, package root, entrypoint, Workspace ids/artifact/archive paths, route Pointer/path summaries, and findings.
- Exact package/provider byte state remains used internally for qualification but is omitted from human-output projection.
- `archiveCarrierV2.test.mjs` now requires serialized v2 package-truth human-output regeneration to remain below 60 KB while preserving exact route-specific transport bytes.
- Legacy v1 `project-handoff-carrier-output` continues through its accepted carrier-projection path.

## Validation Evidence

- recipient-v2 archive carrier regression: PASS with bounded regeneration assertion.
- TypeScript: PASS.
- v1 carrier-projection regression: retained and re-run before final specimen manufacture.
- The final Tooling 027-5-20 specimen is manufactured only after this bounded correction is present in the carried Workspace/runtime source.

## Interpretation Limits

- Does Not Mean: internal inspection detail is unavailable to diagnostic tooling, or human-output receipts replace full audit operations.
- Must Not Be Used To Claim: output-volume bounding changes semantic carrier truth or proves fresh cold-start success.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: tLnXp_DDOpEqHktz26GyAh-J7Ed2YNYACCNXM4NA3JI
