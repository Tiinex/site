# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 14:08:55
  - Trace: [002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Origin:
    - [relative](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 14:10:58
  - Authors: Anchor
  - Why: The active Viewer navigation major is implementation-ready and Kodax has now been migrated as the bounded Implementation Engineer role for this work.
  - Summary: Transfer bounded Viewer navigation implementation and technical qualification to Kodax with selective playthings optimization reuse.
  - Status: ready/local

---

# Viewer Navigation Parity Recovery — Anchor To Kodax

## Handoff Parties

- Purpose: transfer bounded Viewer Navigation Parity implementation and technical qualification to Kodax now that the navigation slice and shared semantic prerequisites are sufficiently discovered and activated
- From: Anchor
- From Kind: role
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](002-1-1-kodax-role.trace.md)

## Transfers

- viewer-navigation-implementation
  - Transfer Kind: work-and-responsibility
  - Description: implement and technically qualify the active Viewer Navigation Parity Recovery slice across Feed, Tree, artifact opening, Lineage, search/filtering, selection, and return context on `refactor`.
  - Controlling Artifact: [Viewer Navigation Parity Recovery — Active Major](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Boundary: implementation and technical qualification only; preserve shared semantic authority and return reviewable Evidence rather than self-accepting product parity.

- bounded-optimization-reuse
  - Transfer Kind: work
  - Description: inspect useful Viewer/projection optimization work on `playthings` and selectively port only bounded techniques or implementation pieces that improve the active navigation slice without changing semantic behavior.
  - Controlling Artifact: [Viewer Navigation Parity Recovery — Active Major](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Boundary: `playthings` is optimization/reference evidence only; do not merge the branch wholesale, import unrelated Playthings world/placement experiments, or treat it as product/semantic authority.

## Required Context

- active-major
  - Material: current Viewer Navigation Parity Recovery implementation task and its exact done criteria/boundaries
  - Material Reference: [Viewer Navigation Parity Recovery — Active Major](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Purpose: controls the implementation slice, machine proof, optimization boundary, and Sigma/Anchor completion gates
  - Availability: available

- kodax-role
  - Material: current durable Kodax Implementation Engineer role boundary
  - Material Reference: [Kodax Role](002-1-1-kodax-role.trace.md)
  - Purpose: establishes implementation responsibilities, exclusions, remote-write boundary, and return-handoff expectation
  - Availability: available

- product-contract-inventory
  - Material: technical PoC product-contract inventory recovered from `master` and `poc-monolith`
  - Material Reference: [PoC Product Contract Inventory](001-1-poc-product-contract-inventory-discovery.trace.md)
  - Purpose: provides interaction/product evidence without making the PoC monolith architecture authoritative
  - Availability: available

- tooling-prerequisite-matrix
  - Material: Viewer PoC Tooling prerequisite matrix
  - Material Reference: [Viewer PoC Tooling Prerequisite Matrix](001-2-tooling-prerequisite-matrix-discovery.trace.md)
  - Purpose: preserves the rule that Viewer consumes shared qualified semantics and surfaces missing primitives rather than inventing private semantic authority
  - Availability: available

- current-site-workspace
  - Material: current carried Site implementation workspace representing the accepted `refactor` implementation baseline and qualified Tooling/runtime code available in this carrier
  - Purpose: supplies the bounded implementation target and existing Feed/path-tree/lineage/read-model primitives
  - Availability: available

## Reference Context

- historical-navigation-plan
  - Material: earlier Viewer Navigation Parity planning task
  - Material Reference: [Viewer Navigation Parity](001-3-navigation-parity-task.trace.md)
  - Purpose: historical planned contract useful for comparison; the active `002` task controls current work
  - Availability: available

- playthings-reference
  - Material: `Tiinex/site` `playthings` branch, especially earlier Viewer/projection optimization work before later world/placement experiments accumulated
  - Purpose: optional implementation/performance reference only; identify reusable ideas by file/history rather than treating branch HEAD as a merge target
  - Availability: available

- poc-source-branches
  - Material: `Tiinex/site` `master` and `poc-monolith` branches
  - Purpose: optional interaction/recognizability evidence when current durable discovery is insufficient; do not transplant monolith architecture or infer current semantics from old code
  - Availability: available

## Retained Responsibilities

- progression-and-scope
  - Retained By: Anchor
  - Responsibility: reconcile technical evidence, decide whether defects require Loom/Axiom routing, control scope/progression, and decide whether the candidate may proceed to Sigma
  - Boundary: Kodax may report gaps and recommendations but does not expand or accept the major unilaterally

- shared-tooling-semantics
  - Retained By: Loom
  - Responsibility: shared portable Tiinex mechanics and semantic Tooling changes when an actual missing/incorrect shared primitive is identified
  - Boundary: Kodax consumes existing qualified primitives for this Viewer tranche and should surface semantic Tooling gaps instead of replacing them privately

- human-browser-acceptance
  - Retained By: Sigma
  - Responsibility: fresh human/browser judgment of first-use comprehension, Feed/Tree/Lineage recognizability, navigation fit, and return-context behavior after deterministic qualification
  - Boundary: machine checks should be green before Sigma is asked to exercise the normal Viewer path

## Exclusions And Dependencies

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no remote push, branch mutation, release, publication, deployment, or Pages operation is authorized by this Handoff
  - Responsible Party Or Role: Anchor

- no-private-semantics
  - Kind: excluded-scope
  - Description: do not invent Viewer-private lineage, provenance, source-authority, schema, or path semantics to satisfy UI behavior
  - Responsible Party Or Role: Loom

- no-wholesale-playthings-merge
  - Kind: excluded-scope
  - Description: do not merge `playthings` wholesale or import unrelated world/placement experiments; selectively reuse only evidence-backed implementation/optimization work relevant to this major
  - Responsible Party Or Role: Kodax

- deferred-viewer-slices
  - Kind: excluded-scope
  - Description: Create/Continue/Reference/Use-as authoring UI, Workspace/source takeover, Time Portal, export/Handoff manufacture, Extension/Host Bridge, and broad visual redesign remain outside this major
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one self-contained carrier to Anchor containing qualified technical Evidence for the implemented navigation slice plus a Handoff that states what changed, how it was validated, known risks or unresolved prerequisites, and the exact recommended next action
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Kodax has accepted the Handoff merely because the carrier is delivered; Viewer product parity is complete; `playthings` is authoritative; remote mutation is authorized; missing shared semantics may be bypassed; or Sigma human acceptance has occurred
- Must Not Be Used To Claim: final product acceptance, Foundation completion, release readiness, shared Tooling semantic changes, remote deployment success, or authority beyond the bounded Viewer Navigation Parity implementation transfer

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Value: _1hg8FfUIZNcbM5xsBry72mLYmUz0rPbTl0yvCybRos

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: IwlpAhDQOIeiV9cmNCnR8FaA821z28mhEBFGpimYbQM