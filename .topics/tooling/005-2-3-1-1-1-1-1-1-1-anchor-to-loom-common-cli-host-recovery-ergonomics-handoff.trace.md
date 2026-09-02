# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-02 16:04:00
  - Trace: [Sigma Common CLI Host-Recovery Ergonomics Feedback](005-2-3-1-1-1-1-1-1-sigma-common-cli-host-recovery-ergonomics-feedback.trace.md)
  - Origin:
    - [relative](005-2-3-1-1-1-1-1-1-sigma-common-cli-host-recovery-ergonomics-feedback.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 16:06:00
  - Authors: Anchor
  - Why: Route Sigma's observed common-path ergonomics failure back to Loom before fresh cold-role acceptance, without rejecting the underlying recursive continuity correction that exposed the seam.
  - Summary: Anchor-to-Loom correction Handoff to make host-assisted Parent recovery self-composing on the same public ground path, eliminating hand-authored protocol files and improvised glue from the normal human/LLM flow.
  - Status: ready/local

---

# Common CLI Host-Recovery Ergonomics — Anchor To Loom

## Handoff Parties

- Purpose: close the remaining isolated-sandbox common-path seam where correct host-assisted Parent recovery still requires the consumer to manually bridge Tooling protocol objects, then return a fresh-cold-testable full-source carrier
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- public-ground-host-recovery-self-composition
  - Transfer Kind: work-and-responsibility
  - Description: keep `ground` as the one taught human/LLM path, but make its host-assisted recovery continuation simple enough that a consumer does not hand-author host-profile/request/plan/receipt/prior-state files or write custom Python/Node glue merely to execute the exact host action Tooling already selected and resume the same grounding operation
  - Controlling Artifact: [Sigma Ergonomics Feedback](005-2-3-1-1-1-1-1-1-sigma-common-cli-host-recovery-ergonomics-feedback.trace.md)
  - Boundary: the rich `plan-host-action` and `accept-host-receipt` primitives may remain internal/advanced substrate; do not create a second LLM CLI or weaken their receipt semantics

- simple-host-result-return-surface
  - Transfer Kind: work-and-responsibility
  - Description: provide one normal supported way for the caller to return the selected host-tool result directly to the same grounding flow without knowing Tiinex's normalized receipt schema; stdin, a Tooling-owned continuation token/state, or an equally simple mechanism is acceptable if it preserves explicit inspectable state and works for both humans and LLMs
  - Controlling Artifact: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Boundary: Tooling owns serialization, request/plan identity, accepted receipt normalization, prior accepted ancestor accumulation, integrity checks, and resume state; no hidden chat/session memory or unqualified cache authority

- exact-host-action-and-lineage-safety-preservation
  - Transfer Kind: work-and-responsibility
  - Description: preserve the returned correction's exact repository/ref/path recovery, deterministic relative Parent resolution inside accepted pinned source context, cumulative accepted recovery, bounded ancestor-body projection, and fail-closed act-readiness until required continuity reaches a qualified root or valid compact proof
  - Controlling Artifact: [Loom Correction Return](005-2-3-1-1-1-1-1-loom-to-anchor-cold-start-recovery-dogfood-correction-return-handoff.trace.md)
  - Boundary: no search broadening, semantic replacement, FETCHED == VERIFIED shortcut, filename/carrier ancestry, eager full-history body loading, or premature operator escalation

- representative-no-glue-regression
  - Transfer Kind: work-and-responsibility
  - Description: turn the observed Anchor/Sigma workflow into a maintained common-path acceptance case: blocked `ground` with a bound exact repository-read capability -> exactly scoped host call -> direct supported result return -> same `ground` resumes; the normal case must require no handcrafted protocol JSON files and no custom glue script, including repeated ancestor recovery
  - Controlling Artifact: [Sigma Ergonomics Feedback](005-2-3-1-1-1-1-1-1-sigma-common-cli-host-recovery-ergonomics-feedback.trace.md)
  - Boundary: count ordinary user-visible commands/steps separately from internal operation composition; advanced diagnostic escape hatches do not count as the accepted normal path

- fresh-cold-acceptance-readiness
  - Transfer Kind: work-and-responsibility
  - Description: return the tranche in a state suitable for a genuinely new zero-precontext role conversation to receive only the canonical carrier/routing instruction and demonstrate the same recovery behavior without relying on prior Loom chat memory
  - Controlling Artifact: [Sigma Ergonomics Feedback](005-2-3-1-1-1-1-1-1-sigma-common-cli-host-recovery-ergonomics-feedback.trace.md)
  - Boundary: Loom implementation may remain in the existing warm role thread; the fresh cold-role run is retained by Anchor after Loom returns

## Required Context

- sigma-ergonomics-feedback
  - Material: Sigma Common CLI Host-Recovery Ergonomics Feedback
  - Material Reference: [Sigma Feedback](005-2-3-1-1-1-1-1-1-sigma-common-cli-host-recovery-ergonomics-feedback.trace.md)
  - Purpose: direct human observation, accepted ergonomics threshold, fresh-cold distinction, and provenance visibility requirement
  - Availability: available

- loom-correction-return
  - Material: Cold-Start Recovery Dogfood Correction — Loom To Anchor Return
  - Material Reference: [Loom Return](005-2-3-1-1-1-1-1-loom-to-anchor-cold-start-recovery-dogfood-correction-return-handoff.trace.md)
  - Purpose: exact recursive recovery implementation/result that this ergonomics correction must preserve
  - Availability: available

- loom-correction-evidence
  - Material: Cold-Start Recovery Dogfood Correction — Loom Implementation Evidence
  - Material Reference: [Loom Evidence](005-2-3-1-1-1-1-loom-cold-start-recovery-dogfood-correction-implementation-evidence.trace.md)
  - Purpose: exact source changes, dogfood progression, maintained regression results, and interpretation limits
  - Availability: available

- grounding-cli-task
  - Material: Grounding Reliability, Common CLI Surface And LLM Ergonomics
  - Material Reference: [Current Task](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Purpose: one public human/LLM invocation model, progressive disclosure, isolated-sandbox quality bar, package lock, and Viewer deferral
  - Availability: available

## Reference Context

- anchor-observed-glue-path
  - Material: transient Anchor runtime showing host-profile/request/plan/receipt files and improvised Python needed around the otherwise exact recovery primitives
  - Purpose: concrete reproduction of the human-observed ergonomics failure
  - Availability: available

- current-host-capability-example
  - Material: ChatGPT-like host with an exact GitHub file connector plus isolated local Tooling runtime
  - Purpose: representative environment where Tooling cannot invoke the connector directly but can project the exact action the LLM must execute
  - Availability: available

## Retained Responsibilities

- architecture-progression-and-fresh-cold-test
  - Retained By: Anchor
  - Responsibility: independently review the returned common-path correction, then explicitly request a NEW fresh role conversation for zero-precontext cold acceptance before carrier-major promotion

- human-quality-and-provenance
  - Retained By: Sigma
  - Responsibility: remain the human common-path quality authority; this feedback is already accepted as the reason for the correction, while later final CLI recognizability/quality acceptance remains a separate Sigma gate

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: no active semantic work; intervene only if Loom demonstrates a genuine schema/Parent/authority contradiction rather than an implementation-level composition problem

- exact-material-fallback
  - Retained By: Transport Operator
  - Responsibility: provide exactly requested missing material only when Tooling establishes that no bounded host capability can recover it; no semantic judgment is implied

## Exclusions And Dependencies

- package-topology-or-artifact-type-change
  - Kind: excluded-scope
  - Description: Handoff package ZIP/Markdown purity remains locked; add no new recipient-facing package artifact kind or topology without explicit Sigma approval through Anchor

- second-cli-or-provider-specific-semantic-fork
  - Kind: excluded-scope
  - Description: do not create separate human/LLM CLIs, provider-specific semantic commands, or a connector-owned authority path; same public intent and semantic result must remain shared

- hidden-recovery-state
  - Kind: excluded-scope
  - Description: convenience must not become hidden model/session memory; any Tooling-owned continuation state/token must be explicit, bounded, inspectable/recoverable, and non-authoritative beyond its qualified receipt facts

- viewer-connected-runtime-and-tl-expansion
  - Kind: excluded-scope
  - Description: do not broaden into Viewer TL0-TL4 behavior, Copilot/IDE convenience, local connected-runtime automation, or Viewer parity until isolated-sandbox Tooling is stable

- broad-history-or-search
  - Kind: excluded-scope
  - Description: do not solve ergonomics by searching wider ancestry; exact declared Parent and accepted pinned relative resolution remain the only recovery scope for this tranche

- remote-mutation
  - Kind: excluded-scope
  - Description: no GitHub write, commit, push, merge, release, deployment, or other remote/source-origin mutation is authorized

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns one canonical non-major full-source Business+Docs+Site child carrier with unchanged Business+Docs and corrected Site where the ordinary public `ground` host-recovery path no longer requires handcrafted request/plan/receipt/prior JSON files or custom glue scripts, repeated exact Parent recovery remains cumulative and fail-closed, advanced primitives remain available without becoming required user knowledge, the observed no-glue acceptance case and existing recovery/Foundation/static/package gates are green, and the result is explicitly ready for Anchor to route to a brand-new zero-precontext role conversation
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: the returned recursive recovery correction is rejected, advanced Tooling operations must be deleted, connector results become trusted automatically, every host has identical transport mechanics, Sigma has completed final CLI acceptance, Viewer/connected-runtime work is authorized, release is qualified, carrier-major promotion is automatic, or remote writes are allowed
- Must Not Be Used To Claim: permission for hidden LLM memory, search-based ancestry, semantic authority from host/tool names, weaker lineage integrity, package topology changes, separate LLM semantics, eager full-history loading, or remote mutation
- Authority Limits: Anchor routes the accepted Sigma ergonomics correction; Loom owns bounded shared Tooling implementation/qualification; Sigma owns the human feedback and later common-path acceptance; Axiom retains canonical semantics; Transport Operator remains last exact-material fallback

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Sigma Common CLI Host-Recovery Ergonomics Feedback](005-2-3-1-1-1-1-1-1-sigma-common-cli-host-recovery-ergonomics-feedback.trace.md)
  - Value: eNoH10W65XpdouwH0YKyXYGlbNoTlOOoZbkyM_WWoGg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: nrVvSh6z2JrN_0FrOWUS3OVSNit_gcH79koqQP76dSA
