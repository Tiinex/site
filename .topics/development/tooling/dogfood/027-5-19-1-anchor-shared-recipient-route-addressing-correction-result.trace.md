# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 20:30:00
  - Authors: Anchor
  - Why: Preserve Anchor’s implementation disposition for Sigma’s shared-package clarification and record the exact standard transport contract before a new fresh recipient test.
  - Summary: 027-5-19 correction result — recipient-v2 now keeps sibling qualified Handoff routes in one shared ZIP, requires an exact route-specific outer invocation over those unchanged bytes, declares fail-closed sibling-route selection in READ, and preserves optional route-scoped projection only as a non-default helper.
  - Status: accepted/local/fresh-retest-ready

---

# Tooling 027-5-19 — shared recipient route-addressing correction result

## Decision

- State: accepted for one new genuinely fresh retest.
- Shared Carrier Decision: normal recipient-v2 output preserves all qualified carried Handoff routes in one reusable ZIP; route selection does not prune the carrier.
- Addressing Decision: recipient selection is expressed by Tooling-generated outer routing text that names the fixed Recovery Entry, exactly one package-local Selected Handoff Route Pointer, its Workspace, and exact Workspace-relative Selected Handoff.
- Recovery Decision: recipients begin at READ, follow only the selected route’s declared Parent/payload lineage, and then follow the selected Handoff’s own Required Context. Sibling Handoff routes are carried context but are not selected by inference.
- Optional Projection Boundary: the existing explicit selected-delivery helper remains available for bounded callers but is not the normal shared-recipient transport path.
- Promotion Boundary: recipient-v2 remains non-default until a genuinely fresh recipient passes the preferred path with this route-addressed shared-carrier contract.

## Implementation

- `cli.handoff-manufacture.js`: recipient-v2 invocation is now route-specific and generated from qualified carrier/inspection truth; normal v2 output writes the unchanged shared bundle instead of automatic selected-route pruning.
- `recipientV2.topology.js` + `recipientV2.entryContract.js`: READ declares exact outer-invocation route-selection authority, no sibling inference, and bounded recovery behavior.
- `recipientV2.inspect.js`: READ qualification fails closed when the route-selection authority contract is absent or enables sibling inference.
- `archiveCarrierV2.test.mjs`: proves one shared v2 ZIP grounds two explicitly selected routes, route-specific invocations differ, normal CLI output retains both routes, and optional selected delivery still qualifies.
- `humanOutputNormalEmission.test.mjs`: proves the standardized routing text contains Recovery Entry, exact package-local route pointer, Workspace, exact Handoff path, and no-sibling-inference instruction.
- Portable bootstrap guidance now states the same shared-carrier contract.

## Validation Evidence

- `humanOutputNormalEmission.test.mjs`: PASS.
- `archiveCarrierV2.test.mjs`: PASS.
- `bootstrap.test.mjs`: PASS.
- `carrierProjection.test.mjs`: PASS.
- `coldStartQualification.test.mjs`: PASS.
- `coldConsumerEntrypoint.test.mjs`: PASS.
- TypeScript: PASS.
- Static discipline: exactly five historical over-size findings; no new finding.
- Architecture shape, browser import boundary, schema bindings/runtime projections, Workspace schema guard, artifact parser, validation, lineage resolve/traverse, and material-closure planner: PASS.
- Broad `portable.test.mjs`: same pre-existing lineage-repair human-projection snapshot failure reproduces unchanged on the accepted pre-027-5-19 baseline; classified as unrelated baseline debt rather than a new carrier regression.

## Standard Outer Invocation Shape

```text
Tiinex Handoff package attached.

Recovery Entry:
001-1-READ-BEFORE-PROCEEDING.trace.md
Selected Handoff Route:
<exact package-local handoff-pointer.trace.md>
Workspace: <exact workspace id>
Selected Handoff:
<exact workspace-relative handoff.trace.md>

Begin at the Recovery Entry, then follow only the Selected Handoff Route and its declared Parent/payload lineage. Do not infer or select a sibling Handoff route.
```

## Interpretation Limits

- Does Not Mean: the outer invocation is semantic Role/Task authority, sibling routes are hidden, or filenames independently prove Handoff identity.
- Must Not Be Used To Claim: route selection mutates package truth, one route’s context applies to siblings, or a fresh preferred-path PASS has already occurred.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:X-KL7DvRiQFIP9E4e8ILl55UlJE-XIz2f6PtUx0c-ak
