# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-07 23:21:00
  - Trace: [Complete Root Named Companion Suite](001-root-complete-named-companion-suite-task.trace.md)
  - Origin:
    - [relative](001-root-complete-named-companion-suite-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-07 23:22:00
  - Authors: Anchor; Sigma
  - Why: Produce the animated Root Gate portrait/state row for Root visual identity.
  - Summary: Root Portrait / Root Gate — Anchor To Pilot.
  - Status: ready/local

---

# Root Portrait / Root Gate — Anchor To Pilot

## Handoff Parties

- Purpose: execute exactly one fresh-conversation bounded Root visual generation, preserve the exact result/deviations, manufacture a Pilot-to-Anchor return package, and stop
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Pilot
- To Kind: role
- To Reference: [Pilot Role](business::.topics/roles/001-7-pilot-role.trace.md)

## Transfers

- root-generation
  - Transfer Kind: work-and-responsibility
  - Description: expose all declared IMAGE inputs as actually human-accessible attachments in exact order and present the exact generation request below unchanged
  - Controlling Artifact: [Complete Root Named Companion Suite](001-root-complete-named-companion-suite-task.trace.md)
  - Boundary: fresh conversation, one bounded generation candidate unless Sigma explicitly requests a correction

- terminal-return
  - Transfer Kind: work-and-responsibility
  - Description: before generation, present the exact terminal token in its own fenced Markdown code block; after Sigma replies exactly `continue to return`, author truthful Evidence + Pilot-to-Anchor return Handoff, manufacture the return package, and stop
  - Boundary: after the token, do not invoke image generation or continue creative work

## Exact Human-Visible Generation Request

Pilot MUST render the following text unchanged in one fenced Markdown code block:

```text
Use IMAGE 1 only as the established Playthings steampunk architectural style reference.

Create one clean transparent horizontal 8-frame portrait/state row of the Root Gate: a massive cast-iron arch with brass mechanisms, copper pipes, pressure gauges, concentric mechanical rings or iris, and warm amber light.

Column 1 neutral/closed.
Column 2 active/open.
Column 3 warning/unstable.
Column 4 dormant/unpowered.
Columns 5-8 form a subtle ambient loop with gears, steam, and glow.

Keep the exact same gate identity in every frame.
Leave clear empty space between all 8 frames.
No text, labels, UI, scenery, or neighboring-frame overlap.
```

Pilot MUST separately render this exact terminal control token in its own fenced Markdown code block before generation:

```text
continue to return
```

The token means preserve the current result, create return Evidence/Handoff/package, and stop. It is not visual acceptance.

## Required Context

- place-style-seed
  - Material: IMAGE 1 — accepted Workspace place seed
  - Material Reference: [IMAGE 1 — accepted Workspace place seed](001-root-place-style-reference.png)
  - Purpose: steampunk architectural style authority
  - Availability: available

- pilot-role
  - Material: generic Business Pilot Role
  - Material Reference: [Pilot Role](business::.topics/roles/001-7-pilot-role.trace.md)
  - Purpose: bounded recipient authority
  - Availability: available

- human-mediated-execution
  - Material: generic Human-Mediated External Execution process
  - Material Reference: [Human-Mediated External Execution](business::.topics/processes/004-human-mediated-external-execution-process.trace.md)
  - Purpose: Prepare → Guide → Receive → Report → Return boundary
  - Availability: available

## Retained Responsibilities

- acceptance-and-normalization
  - Retained By: Anchor; Sigma
  - Responsibility: inspect exact source, run deterministic type-specific normalization/runtime reduction, compare source↔derivative, and accept or reject
  - Boundary: Pilot return is not acceptance

## Exclusions And Dependencies

- no-ambient-continuation
  - Kind: excluded-scope
  - Description: do not continue into another Root channel or runtime integration after return manufacture
  - Responsible Party Or Role: Pilot

- no-pilot-generation-substitution
  - Kind: excluded-scope
  - Description: Pilot must guide the human external generation rather than silently substituting a Pilot-held generation action
  - Responsible Party Or Role: Pilot



## Interaction Limit

- Interaction Mode: human-mediated-external-execution
- Execution Expected: yes
- Max Execution Attempts: 1
- Awaiting State: awaiting-human-execution-result
- Terminal Control Token: `continue to return`
- Silence Or Generic Acknowledgement: wait

## Completion Expectation

- Signal Kind: return
- Signal Meaning: one exact candidate PNG or blocker plus truthful execution Evidence and Pilot-to-Anchor return package
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Reference Context

- named-sheet-contract
  - Material: accepted six-channel named companion contract
  - Material Reference: [Named Sheet Contract](../001-playthings-named-sheet-companion-contract-decision.trace.md)
  - Purpose: filename/type/resolver grammar
  - Availability: available

- tiles-template
  - Material: accepted dynamic Tiles family template
  - Material Reference: [Tiles Template](../001-1-playthings-tiles-dynamic-family-template-decision.trace.md)
  - Purpose: Root tile row/column contract where relevant
  - Availability: available

## Interpretation Limits

- Does Not Mean: generated pixels create Tiinex semantics or that a successful return is accepted runtime authority.
- Must Not Be Used To Claim: Root integration PASS before Anchor/Sigma review and resolver/runtime qualification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Complete Root Named Companion Suite](001-root-complete-named-companion-suite-task.trace.md)
  - Value: -bjlRr4UNzBaTgFpRXwdPgF2DNpr0_6kI3WosKTfAow

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:tFnga_HvSsbHcOcCT8qPCur_b_Kq5UNEv1Kvjl9O7RE
