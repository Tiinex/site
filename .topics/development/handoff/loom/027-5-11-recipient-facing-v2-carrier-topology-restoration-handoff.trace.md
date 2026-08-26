# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-25 10:00:00
  - Authors: Anchor
  - Why: Route Sigma's rejected first-live v2 carrier surface back to the existing Loom implementation dialogue as one bounded recipient-facing topology correction while retaining the accepted v2 plumbing and current/v1 return boundary.
  - Summary: Anchor-to-Loom Handoff for Tooling 027-5-11 — replace the legacy exposed v2 control envelope with the agreed flat Tiinex-artifact-and-payload surface, add exact outer-shape regressions, preserve accepted archive-backed Workspace semantics/performance and v1 behavior, then return once through current/v1 for independent Anchor audit.
  - Status: open/local

---

# Tooling 027-5-11 recipient-facing v2 carrier topology restoration Handoff

## Handoff Parties

- Purpose: correct the first-live v2 recipient surface after Sigma's personal audit rejected the legacy control-plane envelope
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- tooling-027-5-11-carrier-topology-restoration
  - Transfer Kind: work
  - Description: implement and regress the bounded v2 recipient-facing artifact/payload topology defined by Tooling 027-5-11, including a regression that rejects the exact 027-5-10 outer shape, while preserving accepted v2 Workspace/archive mechanics, performance, provider-neutral closure, and current/default v1 behavior
  - Controlling Artifact: [Tooling 027-5-11 task](../../tooling/dogfood/027-5-11-recipient-facing-v2-carrier-topology-restoration.trace.md)
  - Boundary: recipient-facing v2 topology and required representation-neutral resolver changes only; no fresh cold-start qualification, no default activation, no schema invention to hide a semantic blocker, and no remote mutation

## Required Context

- tooling-027-5-11-task
  - Material: exact target tree, outer-surface allow/deny rules, resolver requirements, regressions, performance requirement, and return boundary
  - Material Reference: [Tooling 027-5-11 task](../../tooling/dogfood/027-5-11-recipient-facing-v2-carrier-topology-restoration.trace.md)
  - Purpose: controlling correction contract
  - Availability: available

- sigma-first-live-v2-audit-fail
  - Material: Sigma's direct FAIL disposition for the first live v2 candidate and Anchor's accepted correction interpretation
  - Material Reference: [Sigma first-live v2 carrier audit failure feedback](../../tooling/dogfood/027-5-10-2-first-live-v2-carrier-sigma-audit-fail-feedback.trace.md)
  - Purpose: prevent implementation from reclassifying archive-backed plumbing as sufficient recipient-facing carrier completion
  - Availability: available

- tooling-027-5-10-anchor-acceptance
  - Material: independently accepted archive-backed v2 plumbing, full-source performance, Workspace conformance, downstream test baseline, and retained Sigma gate
  - Material Reference: [Tooling 027-5-10 Anchor acceptance](../../tooling/dogfood/027-5-10-full-source-v2-scale-anchor-acceptance.trace.md)
  - Purpose: preserve already-qualified implementation/performance work while reopening only the recipient-facing topology
  - Availability: available

- tooling-027-4-anchor-acceptance
  - Material: accepted semantic ownership boundary between Workspace identity, archive representation, disposable transport correlation, External Payload, and typed non-parent relations
  - Material Reference: [Tooling 027-4 Workspace/archive binding Anchor acceptance](../../tooling/dogfood/027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md)
  - Purpose: prevent the flat tree from accidentally making filename/adjacency/package placement semantic authority
  - Availability: available

- tiinex-site-workspace
  - Material: exact durable `tiinex.workspace.v1` artifact used for real full-source v2 Workspace identity/target qualification
  - Material Reference: [Tiinex Site workspace](../../../.workspaces/tiinex-site.workspace.md)
  - Purpose: real candidate and scale qualification; no fixture-only or transport-minted Workspace identity
  - Availability: available

## Reference Context

- surviving-loom-027-5-working-tree
  - Material: same-dialog Loom working tree that already contains the accepted Tooling 027-5-9 implementation/source state plus later bounded carrier corrections
  - Purpose: preferred implementation checkpoint for this bounded correction; verify it before editing, but do not treat chat/session persistence as semantic or package authority
  - Availability: available

- tooling-027-5-9-result
  - Material: full-source scale correction result and downstream validation baseline
  - Material Reference: [Tooling 027-5-9 result](../../tooling/dogfood/027-5-9-full-source-v2-scale-correction-result.trace.md)
  - Purpose: retain direct-v2 performance/scale design while changing outer serialization
  - Availability: available

## Retained Responsibilities

- independent-technical-acceptance
  - Retained By: Anchor
  - Responsibility: independently diff returned source against accepted baseline, audit every new Tiinex artifact, replay focused and downstream suites, manufacture a real v2 candidate, inspect its exact root tree/bytes/tooling behavior, and return any blind spot before Sigma sees it
  - Boundary: Loom implementation/test success is evidence, not self-acceptance

- next-personal-carrier-audit
  - Retained By: Sigma with Anchor
  - Responsibility: personally inspect the next real v2 candidate only after Anchor independently passes the target-tree and tooling gates
  - Boundary: temporary Loom v2 fixtures or verification ZIPs must not be routed to Sigma as the candidate

- fresh-cold-start-qualification
  - Retained By: Anchor
  - Responsibility: reintroduce fresh recipient dialogues only after the revised tooling/carrier passes Anchor and Sigma gates
  - Boundary: continued use of the existing Loom dialogue in this tranche is implementation continuity, not cold-start evidence

- default-carrier-activation
  - Retained By: Anchor with Sigma
  - Responsibility: keep current/v1 as default until human audit and later independent cold-start qualification pass

- publication-and-remote-state
  - Retained By: qualified human authority
  - Responsibility: authorize publication, commit, push, authentication, credential use, or remote mutation

## Exclusions And Dependencies

- legacy-envelope-as-v2-success
  - Kind: excluded-scope
  - Description: archive-backed Workspace carriage inside `context/`, `handoff.workspaces/`, `tiinex.bootstrap/`, `tiinex.package/`, or an opaque generated entrypoint is not sufficient to satisfy this correction

- package-path-authority
  - Kind: excluded-scope
  - Description: the flat numeric/pathing tree is human navigation only and must not become Workspace identity, Parent, Handoff transfer, route, provider, acceptance, or completion authority

- schema-invention
  - Kind: unresolved-dependency
  - Description: if a required visible artifact role cannot truthfully use existing canonical Tiinex authority, stop and return the exact schema/semantic gap rather than introducing a local pseudo-schema

- remote-mutation
  - Kind: excluded-scope
  - Description: no publication, commit, push, authentication, credential flow, or other remote write is authorized

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns exactly one CURRENT/v1 recipient-relative route-scoped package carrying the implementation/result/Handoff after all focused topology, artifact conformance, resolver/orientation, roundtrip/tamper, direct-v2 scale, downstream Handoff, static, architecture/browser/schema, and TypeScript gates are green or explicitly unavailable without fabrication
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the corrected carrier is accepted merely because Loom can manufacture it; v2 becomes default; Sigma's next audit is optional; or the visible numeric tree creates semantic lineage.
- Must Not Be Used To Claim: package layout replaces Root/Pointer/Workspace/Handoff/integrity authority, archive adjacency proves Workspace binding, hidden legacy JSON may remain necessary but merely concealed, or resumed Loom context counts as fresh cold-start qualification.
- Authority Limits: Loom owns the bounded implementation correction only; Anchor retains independent technical acceptance and first real candidate manufacture; Sigma retains personal carrier inspection; qualified human authority retains remote/publication authority.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: esMpV5B9NZeAI8haS4TkdcLCX0Fe3RV5ZCJClGpRJ0g