# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 19:30:00
  - Authors: Anchor
  - Why: Preserve the correction made immediately before the true fresh-recipient test: the earlier outer sentence `Handoff package attached. Continue from the Handoff.` still encoded legacy v1/dialog-continuation assumptions and could itself leak route semantics into a cold start.
  - Summary: Use one recipient-neutral outer invocation candidate for recipient-v2 cold-start and later ordinary transport: `Tiinex Handoff package attached. Begin from the package.` Package orientation, route selection, Role grounding, Task recovery, and execution boundary must come from the package rather than from extra chat prose.
  - Status: accepted/local/cold-start-candidate

---

# Tooling 027-5-16.1 — cold-start outer invocation standardization decision

## Decision

- State: accepted candidate for fresh qualification.
- Subject: host-layer invocation text used when delivering a recipient-v2 Handoff package to an LLM recipient.
- Decision: replace the legacy-flavored outer sentence for the retained fresh test with exactly `Tiinex Handoff package attached. Begin from the package.` Use no Role, Task, Workspace, READ filename, selected route, Handoff path, expected result, or continuation hint outside the package.
- Candidate Standard: `Tiinex Handoff package attached. Begin from the package.`
- Promotion Boundary: this wording becomes the normal recipient-v2 invocation only after the fresh cold-start test passes and Anchor with Sigma explicitly promotes the carrier/invocation pair.

## Basis

- `Continue from the Handoff` presupposes that the recipient already understands which Handoff is active and semantically resembles the legacy same-dialog/v1 transport habit.
- A true fresh-recipient test should measure whether the package itself supplies orientation and route authority. External prose that says where the Handoff is, what Role to assume, or what Task to perform weakens that evidence.
- The chosen sentence identifies only the transport class and the source of starting context. It does not tell the recipient which visible artifact to open or which route to resolve.
- The sentence is short enough to remain stable across fresh and already-running recipient sessions without becoming a second bootstrap protocol.

## Standardization Candidate Contract

```text
outer host invocation
└─ Tiinex Handoff package attached. Begin from the package.
   └─ package owns
      ├─ orientation
      ├─ package-local Parent traversal
      ├─ Workspace materialization discovery
      ├─ selected Handoff route resolution
      ├─ recipient Role grounding
      ├─ controlling Task recovery
      └─ transferred work boundary
```

- Outer invocation is transport-layer guidance only; it is not Tiinex semantic authority and does not replace the Handoff artifact.
- The exact sentence should be replayable unchanged for qualification so comparisons are not confounded by prompt variation.
- Host UI mechanics may differ, but extra explanatory prose must not be added during the fresh qualification.

## Superseded Test Wording

- Tooling 027-5-16 remains historical evidence, including its earlier Done Criterion naming `Handoff package attached. Continue from the Handoff.`
- That wording is superseded for execution by this decision and the 027-5-17 qualification task; the old artifact is not rewritten.
- No carrier implementation or package-local lineage invariant is rejected by this wording correction.

## Interpretation Limits

- Does Not Mean: the outer sentence is itself a Handoff, Role assignment, route selector, package identity, or semantic authority.
- Must Not Be Used To Claim: a fresh recipient passed merely because it eventually found the Handoff after broad archaeology, or that successful invocation wording alone proves recipient-v2 should be default.
- Historical Meaning: this decision preserves the point where cold-start qualification was tightened so success must come from the package rather than from a legacy continuation hint in the chat message.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 9Ocp2Yi_AGr-TsjP5157nSL6yUXLjVGcRn2aVIONBLg
