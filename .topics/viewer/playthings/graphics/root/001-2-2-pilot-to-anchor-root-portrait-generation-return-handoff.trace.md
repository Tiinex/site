# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-07 23:22:00
  - Trace: [Root Portrait / Root Gate — Anchor To Pilot](001-2-anchor-to-pilot-root-portrait-generation-handoff.trace.md)
  - Origin:
    - [relative](001-2-anchor-to-pilot-root-portrait-generation-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-08 00:33:00
  - Authors: Pilot; Sigma
  - Why: Return the preserved current Root Gate portrait candidate and truthful execution evidence to Anchor without further image generation.
  - Summary: Root Portrait / Root Gate — Pilot To Anchor Return.
  - Status: ready/local

---

# Root Portrait / Root Gate — Pilot To Anchor Return

## Handoff Parties

- Purpose: return the exact preserved Root Gate portrait/state candidate plus truthful execution/process evidence for Anchor normalization, review, and acceptance/rejection
- From: Pilot
- From Kind: role
- From Reference: [Pilot Role](business::.topics/roles/001-7-pilot-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- root-portrait-candidate-return
  - Transfer Kind: work-and-responsibility
  - Description: receive the exact preserved generation candidate and its execution Evidence; perform the retained deterministic normalization/runtime reduction, source↔derivative comparison, visual/technical review, and accepted/rejected disposition
  - Controlling Artifact: [Complete Root Named Companion Suite](001-root-complete-named-companion-suite-task.trace.md)
  - Boundary: no further Pilot image generation; current returned PNG is source evidence and not automatically the canonical runtime companion

## Required Context

- root-portrait-generation-candidate
  - Material: exact current Root Gate generation candidate PNG
  - Material Reference: [Root Portrait generation candidate](001-2-1-generated-01.png)
  - Purpose: source pixels for retained Anchor normalization and review
  - Availability: available

- root-portrait-generation-evidence
  - Material: truthful Pilot execution/result Evidence including process deviations and exact byte identity
  - Material Reference: [Root Portrait generation evidence](001-2-1-pilot-root-portrait-generation-evidence.trace.md)
  - Purpose: preserve what was generated, what was approved for return, and where execution diverged from the intended process
  - Availability: available

- anchor-role
  - Material: generic Business Anchor Role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Purpose: recipient authority for retained review/normalization work
  - Availability: available

## Reference Context

- outbound-root-portrait-handoff
  - Material: original Anchor-to-Pilot Root Portrait generation Handoff
  - Material Reference: [Root Portrait / Root Gate — Anchor To Pilot](001-2-anchor-to-pilot-root-portrait-generation-handoff.trace.md)
  - Purpose: original transfer boundary, exact generation request, terminal token semantics, and retained responsibilities
  - Availability: available

- named-sheet-contract
  - Material: accepted six-channel named companion contract
  - Material Reference: [Named Sheet Contract](../001-playthings-named-sheet-companion-contract-decision.trace.md)
  - Purpose: portrait filename, fixed eight-column state grammar, and authority boundary
  - Availability: available

- root-suite-task
  - Material: active Root named-companion integration Task
  - Material Reference: [Complete Root Named Companion Suite](001-root-complete-named-companion-suite-task.trace.md)
  - Purpose: integration scope and done criteria
  - Availability: available

## Retained Responsibilities

- acceptance-and-normalization
  - Retained By: Anchor; Sigma
  - Responsibility: inspect exact source, perform deterministic type-specific normalization/runtime reduction, compare source↔derivative, and accept or reject for `root.playthings.portrait.png`
  - Boundary: this return package does not itself create accepted runtime authority

## Exclusions And Dependencies

- no-further-generation
  - Kind: excluded-scope
  - Description: do not invoke image generation again for this return; preserve the current candidate exactly
  - Responsible Party Or Role: Pilot

- no-runtime-acceptance-claim
  - Kind: excluded-scope
  - Description: do not claim resolver/runtime integration PASS or canonical portrait acceptance from the return alone
  - Responsible Party Or Role: Pilot

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one exact Root Gate candidate PNG plus qualified truthful execution Evidence and may continue retained normalization/review work from those carried bytes.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Root Portrait generation candidate](001-2-1-generated-01.png)

## Interpretation Limits

- Does Not Mean: Sigma's instruction to preserve the current approved output automatically makes the source PNG the accepted normalized runtime companion or proves the original execution process was followed without deviation.
- Must Not Be Used To Claim: Root integration PASS, production release qualification, remote publication, or any visual result beyond the exact carried PNG bytes.
- Authority Limits: Anchor/Sigma retain acceptance and normalization authority; generated pixels do not create Tiinex semantic authority.
- Transport Limits: the Handoff package is recipient-relative transport and does not rewrite durable source provenance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Root Portrait / Root Gate — Anchor To Pilot](001-2-anchor-to-pilot-root-portrait-generation-handoff.trace.md)
  - Value: tFnga_HvSsbHcOcCT8qPCur_b_Kq5UNEv1Kvjl9O7RE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:bVNxnA_VZQZHQctCqTGWdPdcpD_DEWQ32DfWWkUYKgs
