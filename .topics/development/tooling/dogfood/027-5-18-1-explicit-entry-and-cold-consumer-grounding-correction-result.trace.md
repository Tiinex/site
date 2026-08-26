# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 20:05:00
  - Authors: Anchor
  - Why: Close the concrete preferred-path defects exposed by the first genuinely fresh 027-5-17 recipient-v2 cold-start without redesigning the accepted Parent/pathing carrier: ambiguous initial file addressing and recipient-v2 Workspace-archive route grounding in ground-cold-consumer.
  - Summary: 027-5-18 correction result — recipient-v2 normal human output now names the fixed READ entry artifact explicitly, package root and READ facts declare that entry, selected CLI manufacture scopes the visible surface to the chosen route/workspace before serialization, and ground-cold-consumer resolves exact Handoff Markdown through the qualified Workspace ZIP plus workspace-relative route with digest verification.
  - Status: accepted/local/fresh-retest-ready

---

# Tooling 027-5-18 — explicit entry and cold-consumer grounding correction result

## Decision

- State: accepted for one new genuinely fresh retest.
- Subject: recipient-v2 host-layer entry addressing and selected Handoff byte grounding.
- Decision: replace the 027-5-16 generic invocation candidate with the explicit fixed-entry invocation `Tiinex Handoff package attached. Begin with 001-1-READ-BEFORE-PROCEEDING.trace.md.` for recipient-v2 normal human output. The named path is transport entry addressing only; package artifacts retain route, Role, Task, Parent, and work-boundary authority.
- Grounding Decision: when a qualified recipient-v2 route points to a `.workspace.zip` carrier, `ground-cold-consumer` must resolve the declared workspace-relative Handoff path inside that exact ZIP and verify the route digest before parsing Handoff Markdown. Direct current/v1 Markdown route behavior remains unchanged.
- Promotion Boundary: this correction is only retest-ready. Recipient-v2 remains non-default until a genuinely fresh recipient passes the preferred path.

## Basis

- 027-5-17 fresh Loom independently found READ, selected Handoff, Loom Role, controlling Task, and the intended package-local Parent chain, proving that the semantic carrier was understandable.
- The same run reported `recovered-not-preferred`, including one pre-takeover native-inspection deviation and the packaged Tooling blocker `portable.cold-start.handoff.route-bytes.unreadable`.
- Anchor reproduced that blocker exactly: orientation projected the selected route carrier as `001-3-tiinex-site.workspace.zip`, while `ground-cold-consumer` attempted to decode that outer ZIP file directly as Handoff Markdown.
- After correction, the exact previously failing 027-5-17 physical package grounds its Handoff through the Workspace archive and no longer emits `route-bytes.unreadable`; remaining degraded Role state without explicitly supplied Role material is separate from route-byte resolution.
- Sigma separately identified that `Begin from the package` still left the first file to recipient inference. A fixed entry filename is already part of recipient-v2 topology, so naming it in host-layer routing removes this ambiguity without leaking the selected Handoff or semantic work assignment.

## Implementation Boundary

- `coldStartQualification.js`: recipient-v2-aware Workspace ZIP route resolution with exact inner-path and SHA-256 checks; v1 direct route decoding retained.
- `recipientV2.topology.js` plus extracted helpers: route-scoped visible topology when CLI supplies one selected route; explicit fixed entry facts on package root and READ.
- `recipientV2.inspect.js`: fail closed if root/READ do not declare the fixed entry artifact.
- `cli.handoff-manufacture.js`: recipient-v2 normal/fallback transport prose comes from one shared exact standard invocation instead of v1 Workspace/Continue wording.
- Focused helpers were extracted so the correction introduces no new static over-24-KB source finding.

## Validation Evidence

- Exact 027-5-17 package reproduction after correction: `ground-cold-consumer` no longer blocked by route-byte decoding; exact selected Handoff parsed from its qualified Workspace archive.
- `archiveCarrierV2.test.mjs`: PASS including recipient-v2 cold-grounding regression.
- `coldStartQualification.test.mjs`: PASS.
- `humanOutputNormalEmission.test.mjs`: PASS including exact recipient-v2 standard invocation bytes.
- `coldConsumerEntrypoint.test.mjs`: PASS.
- `contextAudit.test.mjs`: PASS.
- architecture shape: PASS.
- browser import boundary: PASS.
- TypeScript: PASS.
- static source-size guard: exactly five retained historical oversized-source findings, zero new finding.

## Superseded Candidate

- [027-5-16.1](027-5-16-1-cold-start-outer-invocation-standardization-decision.trace.md) remains immutable historical evidence for the earlier candidate `Tiinex Handoff package attached. Begin from the package.`.
- That candidate is superseded for recipient-v2 execution because it does not explicitly address the stable entry artifact.
- 027-5-17 remains immutable recovered-not-preferred evidence and is not relabeled as PASS after this code correction.

## Consequences

- A recipient no longer needs to guess its initial visible file: the normal tooling-generated invocation names the fixed READ entry artifact.
- Multiple Handoffs may exist inside carried Workspace material, while recipient-specific CLI manufacture scopes the visible recipient-v2 surface to the explicitly selected route/workspace before final serialization.
- Route grounding no longer confuses the Workspace ZIP carrier with the Handoff Markdown entry inside it.
- One new fresh Loom dialogue is required to determine whether these corrections close the preferred-path cold-start gate in practice.

## Interpretation Limits

- Does Not Mean: a filename is semantic Handoff authority, the outer invocation assigns a Role or Task, this correction proves every provider/host, or recipient-v2 is already default.
- Must Not Be Used To Claim: 027-5-17 passed preferred-path qualification, targeted native mechanics after Tiinex takeover are forbidden, or exact byte integrity proves semantic correctness by itself.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: N3R6bufcncDdGeukd1e6BMD1Lh0FzVS2ZNleJOpHkfA
