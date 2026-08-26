# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 21:54:00
  - Authors: Anchor
  - Why: Ensure the minimized recipient-v2 transport text is recoverable from received package truth rather than only available during manufacture, so normal routing cannot regress into manual reconstruction or improvised Workspace/Handoff hints after device or conversation loss.
  - Summary: 027-5-19 package-truth human-output regeneration closure — project-handoff-carrier-output now detects recipient-v2 from its package-local Root/READ contract, reconstructs the qualified carrier projection from visible artifacts/payload bytes, and regenerates the exact Start plus recipient-specific Continue-from address label for any explicitly selected sibling route.
  - Status: accepted/local

---

# Tooling 027-5-19 — recipient-v2 package-truth human-output regeneration closure

## Decision

- State: accepted.
- Ownership: recipient-v2 normal transport text is owned by shared Handoff Tooling, not the CLI call site or prior conversation.
- Regeneration: `project-handoff-carrier-output <package.zip> --route <path-or-route-id>` must regenerate the same recipient-v2 address bytes from the received ZIP itself.
- Detection: v2 regeneration is selected only when the package has the qualified recipient-v2 package Root plus READ format contract; legacy v1 packages retain their existing carrier-JSON projection path.
- Addressing: regenerated v2 text contains only common Start plus exact recipient-specific Continue-from Pointer and must not expose Workspace or semantic Handoff path.

## Implementation

- Added `recipientV2.humanOutput.js` as the shared owner for recipient-v2 standard invocation, v2 human-output projection, and package-truth regeneration.
- `cli.handoff-manufacture.js` delegates v2 human-output wording to that shared owner instead of defining transport prose locally.
- `operation.catalog.js` routes `project-handoff-carrier-output` through a v2-aware package projection that falls back to unchanged v1 behavior for non-v2 packages.
- Recipient-v2 detection for regeneration requires actual Root/READ v2 authority rather than the broader inspection `detected` signal, preventing legacy v1 envelopes from being misclassified as v2 merely because they expose legacy control paths.

## Validation Evidence

- recipient-v2 shared multi-route package: Loom route regeneration READY with exact `Start` plus `Continue from: 001-3-2-handoff-pointer.trace.md` and no Workspace field.
- same package bytes: Axiom route regeneration READY with exact `Start` plus `Continue from: 001-3-1-handoff-pointer.trace.md` and no Workspace field.
- `archiveCarrierV2.test.mjs`: PASS with package-truth v2 regeneration assertions for two routes.
- `humanOutputNormalEmission.test.mjs`: PASS.
- `carrierProjection.test.mjs`: PASS, proving legacy v1 regeneration remains unchanged.
- TypeScript: PASS.

## Consequences

- A recipient package can be moved to another device/conversation and still regenerate its exact route-specific outer address label without access to the originating manufacture conversation.
- One shared ZIP can yield different Loom/Axiom address labels solely by explicit route selection while preserving identical package bytes.
- Manual Workspace/Handoff prose reconstruction is outside normal tooling output.

## Interpretation Limits

- Does Not Mean: the regenerated address label has semantic authority, recipient route selection may be implicit, or host text can replace READ/Pointer artifacts.
- Must Not Be Used To Claim: recipient-v2 cold-start has passed before a genuinely fresh LLM consumes the minimized multi-route package.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: nYtnoNk6RLMkBlx6q2nbI1L2fk3i-rCUNgc2eLapCNk
