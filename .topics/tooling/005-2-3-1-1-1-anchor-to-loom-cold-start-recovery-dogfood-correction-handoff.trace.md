# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 14:40:00
  - Trace: [Cold-Start Continuity Proof And Recovery — Loom To Anchor Return](005-2-3-1-1-loom-to-anchor-cold-start-continuity-recovery-return-handoff.trace.md)
  - Origin:
    - [relative](005-2-3-1-1-loom-to-anchor-cold-start-continuity-recovery-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 14:59:00
  - Authors: Anchor
  - Why: Return a real cold-start Anchor dogfood finding that validates the new root-continuity gate but exposes two recovery-orchestration gaps before Tranche C can be accepted as a reliable isolated-sandbox common path.
  - Summary: Anchor-to-Loom correction Handoff for source-aware recursive Parent recovery and cumulative accepted-recovery state on the one public ground path.
  - Status: ready/local

---

# Cold-Start Recovery Dogfood Correction — Anchor To Loom

## Handoff Parties

- Purpose: repair the remaining cold-start recovery orchestration gap exposed by Anchor using the exact returned carrier, while preserving the successful root-continuity blocker, one human/LLM ground path, package lock, and progressive disclosure
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- source-aware-recursive-parent-recovery
  - Transfer Kind: work-and-responsibility
  - Description: make recovery continue through an accepted pinned repository Parent when that recovered artifact declares a deterministic relative Parent in the same repository/ref context; the current implementation correctly offers host repository-read for the first commit-pinned GitHub Parent, but after acceptance projects the next relative sibling Parent as operator-required even though the accepted source metadata supplies an exact repository, commit/ref, and base path
  - Controlling Artifact: [Loom Tranche C Return](005-2-3-1-1-loom-to-anchor-cold-start-continuity-recovery-return-handoff.trace.md)
  - Boundary: derive only exact relative target resolution from already accepted pinned source context; do not broaden search, guess repository identity, substitute semantically similar material, or weaken FETCHED != VERIFIED

- cumulative-recovery-state
  - Transfer Kind: work-and-responsibility
  - Description: make repeated recovery resumptions preserve all previously accepted Parent material automatically or through one explicit Tooling-owned cumulative mechanism; Anchor had to manually merge providerResponses from multiple accepted receipts because replacing `--recovery` with only the newest accepted receipt drops earlier recovered ancestors from the next ground input
  - Controlling Artifact: [Loom Tranche C Return](005-2-3-1-1-loom-to-anchor-cold-start-continuity-recovery-return-handoff.trace.md)
  - Boundary: keep one public `ground` path and explicit receipt acceptance; do not create a second LLM-only CLI, hidden memory, or unqualified cache authority

- exact-dogfood-regression
  - Transfer Kind: work-and-responsibility
  - Description: preserve the exact `004-1-1-1-1-1-1` Loom-to-Anchor carrier as the real acceptance specimen: initial ground must remain insufficient-grounding, first missing commit-pinned Parent must remain exact host-action recoverable, accepted recovery must remain candidate material until lineage qualification, and subsequent exact relative Parent recovery must not falsely escalate to the operator while a bound exact-read path remains deterministically available
  - Controlling Artifact: [Loom Tranche C Return](005-2-3-1-1-loom-to-anchor-cold-start-continuity-recovery-return-handoff.trace.md)
  - Boundary: the cold-start LLM must still refuse substantive act-readiness until required continuity reaches a qualified root or a separately valid compact proof

- bounded-recursive-recovery-ergonomics
  - Transfer Kind: work-and-responsibility
  - Description: keep ancestor bodies out of default LLM context while allowing Tooling to iteratively qualify as many exact required Parent edges as necessary; operator/Transport escalation remains the final recovery route only when exact host recovery is genuinely unavailable
  - Controlling Artifact: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Boundary: optimize proof and recovery mechanics, not semantic ancestry; rootReached/grounded-to-act must never mean merely reached the end of locally loaded material

## Required Context

- loom-tranche-c-return
  - Material: Cold-Start Continuity Proof And Recovery — Loom To Anchor Return
  - Material Reference: [Loom Return](005-2-3-1-1-loom-to-anchor-cold-start-continuity-recovery-return-handoff.trace.md)
  - Purpose: controlling returned implementation scope, evidence claims, recovery boundary, and progression disposition
  - Availability: available

- loom-tranche-c-evidence
  - Material: Cold-Start Continuity Proof And Recovery — Loom Implementation Evidence
  - Material Reference: [Implementation Evidence](005-2-3-1-loom-cold-start-continuity-recovery-implementation-evidence.trace.md)
  - Purpose: implementation details, exact false-green reproduction, current host-action recovery behavior, regressions, and qualification receipts
  - Availability: available

- grounding-cli-task
  - Material: Grounding Reliability, Common CLI Surface And LLM Ergonomics
  - Material Reference: [Current Task](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Purpose: one-path rule, progressive disclosure, Parent-only topology, package lock, isolated-sandbox quality bar, and common human/LLM surface
  - Availability: available

- anchor-cold-start-policy
  - Material: Anchor Cold-Start Continuity And Recovery Review Decision
  - Material Reference: [Anchor Review](005-2-2-1-2-anchor-cold-start-continuity-review-decision.trace.md)
  - Purpose: accepted threshold that a cold LLM must prove required continuity to a qualified root or valid compact proof before substantive work
  - Availability: available

## Reference Context

- anchor-runtime-dogfood-receipts
  - Material: transient Anchor host profiles, host-action plans, accepted repository-read receipts, cumulative recovery receipt, and repeated ground outputs produced from the exact returned carrier
  - Purpose: reproduce the observed orchestration defect; transient runtime JSON is diagnostic evidence only and is not canonical Workspace authority
  - Availability: available

- exact-recovered-history
  - Material: commit-pinned Tiinex/site Parent artifacts fetched only from exact declared targets or deterministic relative siblings during recovery
  - Purpose: demonstrate that the lineage itself remains recoverable while the current recovery orchestration incorrectly falls back to operator-required between relative siblings
  - Availability: available

## Retained Responsibilities

- architecture-and-acceptance
  - Retained By: Anchor
  - Responsibility: independently cold-dogfood the returned correction, decide Tranche C acceptance/progression, and keep the broader Tooling/CLI sequence bounded

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: no active work is transferred; intervene only if Loom demonstrates a genuine schema/semantic contradiction rather than solving this as shared Tooling composition

- human-common-path-quality
  - Retained By: Sigma
  - Responsibility: later judge ordinary human CLI quality; no Sigma action is required for this deterministic isolated-sandbox recovery correction

- exact-material-fallback
  - Retained By: Transport Operator
  - Responsibility: provide exact missing required material only when Tooling truthfully determines no exact host capability can recover it; no semantic judgment is implied by that transport action

## Exclusions And Dependencies

- package-topology-or-artifact-type-change
  - Kind: excluded-scope
  - Description: do not add a new Handoff-package artifact type, change the locked package purity/topology, or use package placement as semantic ancestry

- schema-or-parent-redesign
  - Kind: excluded-scope
  - Description: do not redefine Parent, qualified root semantics, artifact lineage, carrier lineage, filename/path lineage, or canonical schema authority to avoid implementing exact recovery correctly

- broad-cli-migration
  - Kind: excluded-scope
  - Description: keep this correction inside the existing one public ground/common-path seam; broader human-facing command simplification remains a later bounded tranche

- viewer-and-connected-runtime-work
  - Kind: excluded-scope
  - Description: do not broaden into Viewer TL0-TL4 behavior, local CLI/Copilot integration, or connected-runtime convenience until isolated-sandbox Tooling is reliable

- broad-history-search
  - Kind: excluded-scope
  - Description: do not use repository search, web search, filename similarity, or content similarity when an exact Parent target can be resolved from qualified accepted source context

- remote-mutation
  - Kind: excluded-scope
  - Description: no GitHub write, commit, push, merge, release, deployment, or other source-origin mutation is authorized

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns one canonical full-source child carrier preserving unchanged Business+Docs and current corrected Site source, with durable evidence that the exact Anchor dogfood carrier still blocks false-green cold-start work, recursively retains accepted Parent material across repeated recovery, resolves deterministic relative Parents through accepted pinned repository context without false operator escalation, preserves exact receipt qualification and bounded context projection, and keeps focused/integration/Foundation/static/package qualification green
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: the Tranche C root gate failed, every historical Parent must be eagerly body-loaded, operator fallback is removed, a repository connector is mandatory, a compact-proof design is authorized, package purity is reopened, broad CLI simplification is complete, Viewer work is authorized, or Sigma acceptance is requested
- Must Not Be Used To Claim: permission to infer ancestry from path/filename/carrier dimensions, permission to auto-search for missing Parents, permission to treat accepted host bytes as semantic truth before lineage qualification, permission to persist hidden LLM memory, release readiness, carrier-major promotion, or remote mutation authority
- Authority Limits: Anchor returns a bounded real-world acceptance defect and correction scope; Loom owns implementation/qualification inside shared Tooling; Axiom retains canonical semantics; Sigma retains later human-quality acceptance; Transport Operator remains the last exact-material fallback

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Cold-Start Continuity Proof And Recovery — Loom To Anchor Return](005-2-3-1-1-loom-to-anchor-cold-start-continuity-recovery-return-handoff.trace.md)
  - Value: 9FJ8a6YhtsK8xmeHf3ovV7I5x85scj0lkZPo75U-m80

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:VvirHIAjHh00Q9btw0k3t49wYqo15gn7qK6gXXITIpU
