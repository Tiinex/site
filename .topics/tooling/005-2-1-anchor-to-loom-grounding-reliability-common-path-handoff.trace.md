# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:30:00
  - Trace: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Origin:
    - [relative](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 12:48:00
  - Authors: Anchor
  - Why: Turn the observed Anchor partial-grounding failure into one bounded shared Tooling contract before broader CLI simplification or Viewer work, while establishing the human-first CLI path as the same path an LLM is taught.
  - Summary: Anchor To Loom — Grounding Reliability And Common Path Tranche A
  - Status: ready/local

---

# Grounding Reliability And Common Path Tranche A — Anchor To Loom

## Handoff Parties

- Purpose: implement and qualify the first shared grounding-reliability tranche, including one human-first `ground` common path for both humans and LLMs, then return to Anchor before broader CLI migration or Viewer implementation
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- compose-grounding-readiness
  - Transfer Kind: work-and-responsibility
  - Description: create the smallest shared Tooling projection that composes already-owned authority/routing evidence, exact loaded Parent-lineage leaf topology, declared current-work/frontier signals, blockers/gates, and explicit unresolved/ambiguous coverage into one bounded grounding readiness result
  - Controlling Artifact: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Boundary: compose existing canonical owners first; do not create a second lineage resolver, infer leaves from filename/carrier dimensions, or elevate projection output above owning artifacts

- make-readiness-fail-visible
  - Transfer Kind: work-and-responsibility
  - Description: expose a small readiness state equivalent to grounded-to-act, grounded-to-discuss, or insufficient-grounding with compact reasons, missing evidence, and known/inferred/unresolved/human-only distinctions where they affect the next action
  - Controlling Artifact: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Boundary: successful authority orientation alone must not produce act-ready when relevant current leaf/frontier coverage is missing or ambiguous

- encode-observed-grounding-regression
  - Transfer Kind: work-and-responsibility
  - Description: add the smallest durable regression proving that a recipient can correctly recover high-level authority yet still remain not-act-ready when current leaves required for the decision were not resolved; include a check that carrier/filename dimensions are not substituted for artifact Parent lineage
  - Controlling Artifact: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Boundary: test the invariant rather than reproducing this chat transcript or creating a large historical regression inventory

- establish-one-ground-cli-path
  - Transfer Kind: work-and-responsibility
  - Description: expose the new grounding result through one short human-first CLI intent such as `ground` and make that exact same invocation/output contract the path documented for LLM use; choose the final spelling only after checking consistency with the existing CLI grammar
  - Controlling Artifact: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Boundary: no separate LLM command language, hidden LLM alias, or second common CLI route; the internal portable operation catalog remains implementation substrate rather than a second taught user model

- preserve-grounding-progressive-disclosure
  - Transfer Kind: work-and-responsibility
  - Description: keep the default grounding output small enough for the next decision while retaining exact pointers/identities and an explicit route to request deeper bodies or diagnostics only when needed; record emitted byte/context burden in the return evidence
  - Controlling Artifact: [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
  - Boundary: do not solve reliability by dumping all Workspace artifacts, schema bodies, findings, or operation catalog output into ordinary grounding

- qualify-return-first
  - Transfer Kind: work-and-responsibility
  - Description: run focused/tooling and the relevant new regression first, then Foundation and integration/static gates that are dependency-independent; return a full Business+Docs+Site canonical Handoff carrier with exact evidence before opening broader CLI migration
  - Controlling Artifact: [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
  - Boundary: no Viewer implementation, broad CLI rewrite, strict dependency retry loop, commit/push, or remote mutation in this tranche

## Required Context

- grounding-cli-task
  - Material: revised current Site Task owning grounding reliability and the single human/LLM CLI common-path contract
  - Material Reference: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Purpose: exact Done criteria, package lock, one-path rule, measurement boundary, and downstream Viewer separation
  - Availability: available

- tooling-first-parent
  - Material: accepted Tooling-First Foundation Ergonomics Task
  - Material Reference: [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
  - Purpose: owns the Foundation ordering and requirement to keep the rich catalog underneath a dramatically smaller ordinary path
  - Availability: available

- branch-grounding-accepted
  - Material: locally accepted Site Branch Authority Grounding Task plus carried README and llms.txt projection
  - Material Reference: [Site Branch Authority Grounding](005-1-site-branch-authority-grounding-task.trace.md)
  - Purpose: closes the immediate current-versus-PoC first-contact prerequisite so this Loom turn can focus on shared grounding and CLI behavior
  - Availability: available

- foundation-readiness
  - Material: current Business Foundation Readiness operating reconciliation
  - Material Reference: [Foundation Readiness](business::.topics/initiatives/001-6-foundation-readiness-operating-reconciliation-task.trace.md)
  - Purpose: keeps this work Tooling-first, bounded, recoverable, and ahead of Viewer expansion
  - Availability: available

- viewer-poc-recovery
  - Material: Business Viewer PoC Parity Recovery outcome
  - Material Reference: [Viewer PoC Parity Recovery](business::.topics/initiatives/001-3-4-viewer-poc-parity-recovery-task.trace.md)
  - Purpose: demand evidence for later shared Tooling primitives while preserving the rule that Viewer implementation waits for qualified shared support
  - Availability: available

## Reference Context

- current-grounding-primitives
  - Material: existing cold-start grounding/qualification, operating overview, lineage resolver/search, bounded summary projection, operation catalog, and CLI adapter implementation in the carried Site source
  - Purpose: reuse/composition field; current code already contains most required primitives and should be preferred over a new subsystem
  - Availability: available

- observed-anchor-grounding-failure
  - Material: current human-reviewed Anchor retrospective
  - Purpose: acceptance scenario showing that correct high-level authority routing can coexist with missed current leaves and overconfident generic inference; durable tests should encode the invariant rather than chat-specific wording
  - Availability: available

## Retained Responsibilities

- architecture-and-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile Loom's return against the revised Task, decide whether this tranche is stable enough for the next carrier checkpoint, and route any genuine semantic contradiction to Axiom rather than letting implementation invent authority

- human-cli-quality
  - Retained By: Sigma
  - Responsibility: judge the ordinary human CLI/common-path quality after deterministic Tooling behavior is qualified, including whether the same path is understandable without learning internal operation names

- transport-operation
  - Retained By: Transport Operator
  - Responsibility: move the canonical carrier between Anchor and Loom exactly as routed; transport does not itself accept implementation or authorize remote writes

## Exclusions And Dependencies

- handoff-package-topology-change
  - Kind: excluded-scope
  - Description: recipient-facing Handoff package ZIP/Markdown topology and existing package artifact kinds are locked for this track; do not add a new package artifact kind or new recipient-facing package structure without explicit Sigma approval routed through Anchor

- second-cli-model
  - Kind: excluded-scope
  - Description: do not create separate human and LLM CLI syntaxes, hidden LLM-only aliases, or a second normal API-shaped invocation path; one human-first common path is the LLM path

- broad-cli-migration
  - Kind: excluded-scope
  - Description: do not migrate every existing specialist operation in this first tranche; establish the grounding common-path contract and return so Anchor can assess the pattern before widening it

- viewer-implementation
  - Kind: excluded-scope
  - Description: do not implement Viewer PoC parity or a Viewer-private grounding model; Viewer remains downstream of qualified shared Tooling

- schema-semantic-expansion
  - Kind: excluded-scope
  - Description: do not create or revise canonical Docs schemas merely to add a Tooling grounding projection unless a concrete semantic contradiction proves implementation-level composition insufficient

- remote-mutation
  - Kind: excluded-scope
  - Description: no commit, push, branch mutation, publication, or other remote write is authorized by this Handoff

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one canonical full-source Loom-to-Anchor Handoff carrier containing the bounded shared grounding-readiness implementation, one human/LLM grounding CLI common path, focused regression evidence for the partial-grounding failure mode, measured output/context burden, relevant qualification results, and explicit unresolved limits
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: this tranche completes the whole CLI simplification, proves universal grounding completeness, authorizes Viewer parity work, changes canonical schema semantics, changes Handoff package topology, accepts a public release, or authorizes commit/push
- Must Not Be Used To Claim: that roots/README/executive summaries alone establish current frontier, lifecycle labels or filename/carrier dimensions define artifact Parent lineage, one green regression proves all host/provider environments, internal operation names are the accepted user CLI, Sigma human quality has passed, or Foundation is complete
- Authority Limits: owning Business/Docs/Site artifacts remain semantic/organizational/implementation authority; this Tooling projection reports bounded readiness only; Loom owns implementation, Anchor owns architectural reconciliation, Sigma owns later human judgment
- Transport Limits: package delivery, qualification, or successful cold start does not itself accept implementation or create semantic transfer beyond this Handoff

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Grounding Reliability, Common CLI Surface And LLM Ergonomics](005-2-common-cli-surface-and-llm-ergonomics-task.trace.md)
  - Value: oc-F2HZIYWGxihsBjQZU4A95-Y5OGWP3ryuEL1jKMv0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: GLuMewH6-OYTXnmtriJif2Fouz-dOO7I6E-JDjnucp8
