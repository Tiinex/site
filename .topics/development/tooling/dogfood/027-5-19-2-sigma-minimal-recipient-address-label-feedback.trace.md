# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-25 21:35:00
  - Authors: Anchor
  - Why: Preserve Sigma's correction that recipient-v2 transport text must not expose Workspace naming or duplicate the exact semantic Handoff path, because either can become an alternate ingress hint that causes a recipient to bypass package-local Tiinex artifacts.
  - Summary: Sigma transport-address clarification — keep the accepted shared ZIP and package-local route Pointer model, but reduce normal outer text to one common Start artifact plus exactly one recipient-specific Continue-from Pointer; Workspace, exact Handoff path, Role, Task, and work semantics remain package-owned.
  - Status: accepted/correction-required/local

---

# 027-5-19 minimal recipient address-label feedback

## Observed Signal

- Sigma accepted the internal recipient-v2 ZIP structure and did not identify artifact-envelope defects in the current carrier.
- Sigma rejected the current outer transport text as over-specified because it included `Workspace: <id>` and, in the immediately preceding variant, also duplicated the exact Workspace-relative Handoff path.
- Naming a Workspace in chat creates an alternate apparent ingress: an LLM may jump directly into the same-named Workspace ZIP/material instead of reading the package-local recovery and route artifacts.
- Duplicating the semantic Handoff path has the same class of problem and also creates a second representation of truth that can drift from the selected Handoff Route Pointer.
- The recipient still needs deterministic addressing when one shared ZIP carries several Handoff routes; otherwise both LLMs and humans may stop and ask which carried route applies.

## Interpretation

- The outer message is a non-authoritative address label, not a bootstrap summary.
- `Start` identifies the one common package entry artifact: `001-1-READ-BEFORE-PROCEEDING.trace.md`.
- `Continue from` identifies exactly one package-local Handoff Route Pointer for the intended recipient.
- `Continue from` is the only recipient-specific field in normal recipient-v2 transport text.
- Workspace identity, exact semantic Handoff path/digest, Role, Task, Required Context, and work boundary are discovered through the addressed Tiinex artifacts and payload bindings.
- The same ZIP bytes may therefore be reused across Loom/Axiom/Kodax dialogs while only the Tooling-generated `Continue from` Pointer changes.

## Feedback Target

- Target: Tooling 027-5-19 outer invocation contract and `recipientV2StandardInvocation` projection.
- Required Correction: remove Workspace and exact Handoff path from recipient-v2 normal transport text while retaining exact route-Pointer selection and fail-closed sibling-route inference.

## Feedback Received

- Sigma wants the recipient to be told which file in the ZIP is relevant for that recipient, not which Workspace or semantic Handoff path to open directly.
- Sigma explicitly requested omission of Workspace naming to avoid contaminating the intended package-first ingress.
- Sigma accepted the concise shape `Handoff package attached` + common `Start` + recipient-specific `Continue from` as the better standardization candidate.

## Source

- Source: direct Sigma review in the Anchor dialogue after examining the 027-5-19 carrier, prior v1 transport convention, and fresh Loom cold-start behavior on 2026-08-25.
- Evidence Type: direct user transport-contract clarification.
- Fidelity Limit: this feedback fixes addressing semantics; a new truly fresh recipient is still required before claiming cold-start proof.

## Disposition

- State: accepted.
- Package Interior: retain the currently accepted recipient-v2 structure and package-local Parent/pathing semantics.
- Normal Transport Text: minimize to `Start` + exactly one package-local `Continue from` route Pointer.
- Prior 027-5-19 Result: remains immutable historical evidence but its Workspace/exact-Handoff outer-text requirements are superseded by this feedback.
- Retest: only after Tooling, bootstrap guidance, and regressions emit the minimized address label deterministically.

## Limits

- Does Not Mean: filenames independently create semantic Handoff authority, the recipient may infer among sibling routes, or the outer text replaces READ/Pointer semantics.
- Must Preserve: exact shared ZIP bytes across recipient selections, route Pointer authority, no sibling inference, package-local Parent lineage, exact Workspace/Handoff bytes, deterministic serialization, and current/default v1 behavior.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Zox-PPX9QrDp2rJPgOIXoFExsZC-9j21eLKKNwv5iMU
