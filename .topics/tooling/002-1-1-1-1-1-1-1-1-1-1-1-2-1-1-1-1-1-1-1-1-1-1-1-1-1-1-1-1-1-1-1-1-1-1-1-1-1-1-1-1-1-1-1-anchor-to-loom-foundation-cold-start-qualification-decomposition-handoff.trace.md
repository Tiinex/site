# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-01 08:55:00
  - Trace: [Foundation Cold-Start Qualification Decomposition](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Origin:
    - [relative](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-01 08:55:00
  - Authors: Anchor
  - Why: Decompose the largest remaining ordinary cold-start owner while preserving exact qualification semantics, compact use-case tests, and bounded runtime evidence.
  - Summary: Foundation Cold-Start Qualification Decomposition — Anchor To Loom

---

# Foundation Cold-Start Qualification Decomposition — Anchor To Loom

## Handoff Parties

- Purpose: decompose one oversized cold-start qualification owner, reduce repeated ordinary qualification work where exact identity can be safely reused, preserve current component/use-case contracts, and return before entering the remaining two oversized owners or closure
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](https://github.com/Tiinex/business/blob/5fa225bbba1fafec91a9a9b948dcd1163037dfa0/.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](https://github.com/Tiinex/business/blob/5fa225bbba1fafec91a9a9b948dcd1163037dfa0/.topics/roles/001-3-loom-role.trace.md)

## Transfers

- cold-start-qualification-owner-decomposition
  - Transfer Kind: work-and-responsibility
  - Description: refactor exactly `src/tooling/portable/handoff/coldStartQualification.js` into cohesive smaller owners while preserving the public one-shot qualification behavior and exact Workspace/Handoff/Role/Required Context authority
  - Controlling Artifact: [Foundation Cold-Start Qualification Decomposition](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Boundary: do not enter `src/tooling/portable/adapters/cli/cli.run.js` or `src/tooling/portable/handoff/carrierProjection.js` except unavoidable import/reference adjustments

- repeated-work-reduction
  - Transfer Kind: work-and-responsibility
  - Description: remove repeated carrier inspection, archive parsing/hash derivation, route/Role/Required Context reconstruction, or duplicate projection work only where the same call-local exact qualified identity can truthfully be reused
  - Controlling Artifact: [Foundation Cold-Start Qualification Decomposition](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Boundary: no receipt, cache, manifest, hash, or timing shortcut may become semantic authority; changed-byte and closure/stable boundaries remain intact

- suite-owned-contract-preservation
  - Transfer Kind: responsibility
  - Description: preserve the permanent Foundation acceptance spine, focused/tooling gate, and existing cold-start/recipient suite-owned use-case cases; update an existing suite case only if a distinct current invariant changes
  - Controlling Artifact: [Foundation Cold-Start Qualification Decomposition](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Boundary: do not add standalone regression/unit/acceptance test files

- bounded-runtime-evidence
  - Transfer Kind: work
  - Description: record representative before/after one-shot `qualify-cold-start --summary --phase-timing` timings against the same qualified carrier and route, separating Tooling timing from host/client/model wall time
  - Controlling Artifact: [Foundation Cold-Start Qualification Decomposition](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Boundary: performance improvement is useful evidence but not a correctness gate; do not infer hidden host rules, scanning, classifiers, keywords, or bypass mechanisms

- full-source-return
  - Transfer Kind: responsibility
  - Description: return one canonical non-major full-source Business+Docs+Site child carrier with the current modified Site Workspace, unchanged carried Business and Docs Workspaces, exact endpoint Role bytes, Loom implementation evidence, and Loom→Anchor Handoff
  - Controlling Artifact: [Foundation Cold-Start Qualification Decomposition](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Boundary: return before broad `validate`, integration, closure, release, publication, stable-major qualification, or entry into the remaining two oversized owners

## Required Context

- cold-start-decomposition-decision
  - Material: Foundation Cold-Start Qualification Decomposition
  - Material Reference: [Anchor Decision](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Purpose: exact scope, authority boundaries, test discipline, runtime-evidence boundary, and remaining-owner exclusions for this turn
  - Availability: available

## Reference Context

- previous-recipient-decomposition-return
  - Material: Foundation Recipient Artifact-First Decomposition — Loom To Anchor
  - Material Reference: [Loom Return](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-foundation-recipient-artifact-first-decomposition-return-handoff.trace.md)
  - Purpose: accepted previous full-source progression, exact static/runtime evidence, and current three-owner frontier
  - Availability: available

- previous-recipient-decomposition-evidence
  - Material: Foundation Recipient Artifact-First Decomposition — Loom Implementation Evidence
  - Material Reference: [Loom Evidence](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-foundation-recipient-artifact-first-decomposition-implementation-evidence.trace.md)
  - Purpose: exact source and qualification state inherited by this turn
  - Availability: available

- current-source
  - Material: complete carried Business, Docs, and Site Workspaces
  - Purpose: use exact current source and do not rediscover or reconstruct carried dependencies
  - Availability: available

- test-strategy
  - Material: `docs/architecture/foundation-test-strategy.md`
  - Purpose: preserve the permanent component/use-case acceptance spine and temporary-regression absorption discipline
  - Availability: available

## Retained Responsibilities

- architecture-and-progression
  - Retained By: Anchor
  - Responsibility: accept or reject the cold-start decomposition, static movement, runtime evidence, and next Foundation frontier

- human-observation-and-acceptance
  - Retained By: Sigma
  - Responsibility: retain human observation and product acceptance authority; Sigma's observed safety-check contamination may be recorded as host observation without hidden-root-cause inference

## Exclusions And Dependencies

- remaining-two-static-owners
  - Kind: excluded-scope
  - Description: `src/tooling/portable/adapters/cli/cli.run.js` and `src/tooling/portable/handoff/carrierProjection.js` remain outside this tranche except unavoidable import/reference adjustments

- broad-validation-and-closure
  - Kind: excluded-scope
  - Description: broad `validate`, integration, closure, release, stable-major qualification, remote publication, and unrelated product work remain outside this bounded turn

- host-safety-internals
  - Kind: excluded-scope
  - Description: hidden host scanning, classifier rules, trigger conditions, keyword heuristics, telemetry, and bypass mechanisms are unknown and must not be probed or inferred as fact

- test-corpus-regrowth
  - Kind: excluded-scope
  - Description: do not regrow standalone regression/acceptance/unit test files; durable current behavior belongs in existing component/use-case suites

- semantic-authority-shortcuts
  - Kind: excluded-scope
  - Description: do not promote receipt/cache/manifest/hash/timing metadata into semantic authority or weaken exact Workspace/Handoff/Role/Required Context qualification to gain speed

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Anchor receives one canonical non-major full-source Business+Docs+Site return where `coldStartQualification.js` is decomposed into cohesive smaller owners without behavior drift or test-corpus regrowth, permanent acceptance remains 54/54, focused/tooling remains 4/4, relevant cold-start/recipient use-case coverage remains green, static has zero introduced regressions and ideally moves from three inherited unresolved toward two, bounded before/after one-shot cold-start timing evidence is preserved, and no integration/closure/host-root-cause claim is made
- Return To: Anchor
- Return To Reference: [Anchor Role](https://github.com/Tiinex/business/blob/5fa225bbba1fafec91a9a9b948dcd1163037dfa0/.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: source-size reduction alone proves host mitigation, faster timings permit weaker integrity, static owner count is more authoritative than behavior, or this tranche completes Foundation
- Must Not Be Used To Claim: permission to skip changed-byte qualification, permission to alter canonical Docs/Business semantics, permission to regrow the historical test corpus, permission to enter the remaining two owners, or permission to enter closure without a new Anchor boundary
- Authority Limits: Loom owns this bounded implementation and evidence; Anchor retains architecture/progression acceptance; Sigma retains human observation/acceptance authority

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Foundation Cold-Start Qualification Decomposition](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-cold-start-qualification-decomposition-decision.trace.md)
  - Value: BBbSBLHQk6M_Qi6MegtnAIQHlPsKV76p9VFEM8RQ23Q

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:3NWYwP1nLVYwo5cWlMI6LxtQgnbad9VcwFsSfq-0UIM
