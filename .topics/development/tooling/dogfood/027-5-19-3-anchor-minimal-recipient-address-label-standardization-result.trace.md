# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 21:38:00
  - Authors: Anchor
  - Why: Close Sigma's final transport-text correction without changing the accepted recipient-v2 carrier interior and make the human-facing invocation deterministic enough that Tooling cannot improvise Workspace/Role/Task/Handoff hints between deliveries.
  - Summary: 027-5-19 minimal address-label standardization — recipient-v2 normal transport now emits only package attachment, common Start, and exact recipient-specific Continue-from route Pointer; Workspace and semantic Handoff path are intentionally absent, while one shared ZIP remains reusable across parallel recipients.
  - Status: accepted/local/fresh-retest-ready

---

# Tooling 027-5-19 — minimal recipient address-label standardization result

## Decision

- State: accepted for the next genuinely fresh cold-start qualification.
- Carrier Decision: retain the accepted shared recipient-v2 ZIP structure and package-local Parent/pathing lineage unchanged.
- Addressing Decision: normal recipient-v2 human transport contains exactly one common Start artifact and one recipient-specific package-local Continue-from Handoff Route Pointer.
- Omission Decision: normal v2 transport text must not contain Workspace id/name, exact Workspace-relative Handoff path, Role, Task, Required Context, or semantic work-summary prose.
- Authority Decision: the outer message remains `authority: none`; the selected Pointer and package bytes own route/Workspace/Handoff truth.
- Promotion Boundary: this is a standardization candidate, not cold-start proof. Default promotion still requires a new genuinely fresh recipient PASS.

## Standard Outer Invocation Shape

```text
Handoff package attached.

Start:
001-1-READ-BEFORE-PROCEEDING.trace.md
Continue from:
<exact package-local handoff-pointer.trace.md>
```

- `Start` is identical for every recipient of the same carrier.
- `Continue from` is the only recipient-specific line/value.
- The selected route Pointer resolves Workspace, exact Handoff path/digest, and subsequent package-owned grounding.

## Implementation

- `cli.handoff-manufacture.js`: `recipientV2StandardInvocation` no longer emits Workspace; the invocation remains generated from qualified selected-route + recipient-v2 inspection truth and fails closed when the exact route Pointer cannot resolve.
- `humanOutputNormalEmission.test.mjs`: exact byte assertions now require no `Workspace:` field and no Workspace id leakage while proving two recipient routes over one shared carrier yield different `Continue from` Pointer values.
- portable bootstrap guidance: explicitly states that Workspace identity and semantic Handoff path are intentionally omitted from host-layer routing because they are alternate ingress hints and package-owned truth.
- READ route-selection contract remains unchanged: one externally selected package-local Handoff Route Pointer, no sibling inference, fail closed on absent/ambiguous/mismatched selection.

## Validation Evidence

- `humanOutputNormalEmission.test.mjs`: PASS.
- `bootstrap.test.mjs`: PASS.
- `archiveCarrierV2.test.mjs`: PASS.
- `carrierProjection.test.mjs`: PASS.
- `coldStartQualification.test.mjs`: PASS.
- `coldConsumerEntrypoint.test.mjs`: PASS.
- `contextAudit.test.mjs`: PASS.
- architecture shape: PASS.
- browser import boundary: PASS.
- schema bindings: PASS.
- TypeScript: PASS.
- static discipline: exactly five retained historical oversized-source findings; no new finding.

## Superseded Wording

- [027-5-19 correction result](027-5-19-1-anchor-shared-recipient-route-addressing-correction-result.trace.md) remains immutable historical evidence for the earlier over-specified invocation.
- Its requirement to expose Workspace and exact Workspace-relative Handoff in normal outer text is superseded by [Sigma minimal address-label feedback](027-5-19-2-sigma-minimal-recipient-address-label-feedback.trace.md).
- Preserved from 027-5-19: one shared ZIP, exact package-local route-Pointer selection, route-specific outer addressing, READ recovery, and no sibling inference.

## Interpretation Limits

- Does Not Mean: `Continue from` filename independently establishes semantic Handoff identity, package contents are single-recipient, or Workspace identity is unimportant inside the carrier.
- Must Not Be Used To Claim: a new cold-start has passed, the recipient may bypass READ, or host-layer prose has semantic authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: goQXLk1taEJ65tFjNu5mU3jKpDzQrYei67lNNzUQhtM
