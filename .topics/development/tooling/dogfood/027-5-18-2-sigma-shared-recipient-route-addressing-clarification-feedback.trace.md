# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-25 20:30:00
  - Authors: Anchor
  - Why: Preserve Sigma’s clarification that the recipient-v2 standard must support one exact shared ZIP across parallel Handoff tracks without requiring a recipient to infer which carried Handoff or recovery material applies.
  - Summary: Sigma clarification after 027-5-18 review — fixed READ entry addressing is necessary but insufficient for a shared carrier; the outer invocation must identify the recovery entry plus exactly one package-local Handoff Route Pointer and exact Handoff, while sibling routes remain carried but unselected.
  - Status: accepted/correction-required/local

---

# 027-5-18 shared-recipient route-addressing clarification

## Observed Signal

- Sigma did not send the 027-5-18 retest package because the proposed host invocation named only the fixed READ entry artifact.
- In the intended operating model, one identical Handoff package may be attached to Loom, Axiom, Kodax, or other parallel recipient dialogs while carrying several qualified Handoff routes.
- Naming only `001-1-READ-BEFORE-PROCEEDING.trace.md` still leaves the recipient to infer which carried Handoff route applies when multiple sibling routes are visible.
- Sigma requested that the standardized transport minimally identify the selected Handoff inside the package and the recovery path so the recipient can determine which carried files are relevant without guessing.

## Interpretation

- The fixed READ artifact remains the correct recovery entry.
- The same exact ZIP bytes should remain reusable across parallel recipient invocations; recipient selection belongs in the outer Tooling-generated routing text, not in per-recipient package mutation or pruning.
- The outer invocation must bind exactly one package-local Handoff Route Pointer and exact Workspace-relative Handoff path.
- The READ artifact must state that sibling Handoff routes are not selectable by inference and that recovery follows only the externally selected route’s declared Parent/payload lineage plus the selected Handoff’s own Required Context.

## Superseded Reading

- Superseded: 027-5-18’s assumption that normal recipient-v2 CLI delivery should prune the visible package to one selected route/workspace before serialization.
- Preserved: optional route-scoped projection may remain a bounded non-default helper, but the standard transport must support one shared package with route-specific outer invocation.

## Feedback Target

- Target: Tooling 027-5-18 recipient-v2 entry/invocation contract and shared-route serialization behavior.
- Required Correction: shared immutable carrier bytes plus exact route/recovery addressing in the Tooling-produced outer invocation.

## Feedback Received

- Sigma stated that a fixed READ entry alone is insufficient when the same package is reused for several parallel Handoffs.
- Sigma requested that the standardized transport at minimum identify the selected Handoff inside the package and the recovery path so the recipient can determine which carried files are relevant without guessing.
- Sigma confirmed the intended model: one shared ZIP may be attached to several parallel recipient dialogs, with route-specific outer addressing rather than per-recipient archive mutation.

## Source

- Source: direct Sigma review in the Anchor dialogue after 027-5-18 was prepared but before it was sent to Loom.
- Evidence Type: direct user transport-model clarification.
- Fidelity Limit: this feedback specifies intended recipient addressing behavior; it does not itself prove cold-start success.

## Disposition

- State: accepted.
- 027-5-18 Retest Package: do not send.
- Correction: preserve one shared recipient-v2 carrier and move exact recipient route selection into Tooling-generated outer invocation plus READ recovery contract.
- Retest: manufacture a new 027-5-19 package after affected gates pass.

## Limits

- Does Not Mean: filenames independently create Handoff authority, every sibling Handoff is relevant to every recipient, or the host invocation may invent Role/Task semantics.
- Must Preserve: package-local Parent lineage, exact Workspace/Handoff bytes, qualified route pointers, fail-closed route selection, and package-owned semantic authority.


---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ZIHTVju6tAlUN_I0nYsiLX3WczccEAxpYmpTyZynkh0
