# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 21:36:51
  - Trace: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Origin:
    - [relative](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 09:00:18
  - Authors: Anchor
  - Why: Fresh Kodax carrier manufacture proved the prior endpoint-role fix still depends on previous endpoint targeting rather than generic complete-workspace resolution.
  - Summary: Repair exact workspace-qualified endpoint Role carriage so any explicitly referenced Role in a complete carried Workspace can bind without manual material rebinding.
  - Status: ready/local

---

# Anchor → Loom Generic Cross-Workspace Endpoint Role Carriage Repair Handoff

## Handoff Parties

- Purpose: close the remaining generic carrier defect where an explicit workspace-qualified endpoint Role reference cannot bind to exact bytes in a complete carried sibling Workspace unless that Role was already targeted by the parent carrier.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- generic-workspace-qualified-endpoint-role-resolution
  - Transfer Kind: work-and-responsibility
  - Description: make explicit `workspaceId::workspace-relative-path` endpoint Role references resolve deterministically to one exact qualified entry in the corresponding complete carried Workspace provider during Handoff manufacture, without requiring manual material bindings or prior endpoint targeting.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: the declared workspace-qualified reference is authority for the requested target; directory scanning, filename guessing, Role-label matching, parent-carrier endpoint history, or provider array order must not become authority.

- permanent-kodax-carrier-regression
  - Transfer Kind: work
  - Description: preserve the exact current failure as a permanent regression: Site Handoff `To Reference: business::.topics/roles/001-6-kodax-role.trace.md`, complete qualified Business workspace containing that exact Role artifact, manufacture currently reports `portable.handoff-material.endpoint-role.unresolved`.
  - Boundary: prove both successful exact binding and fail-closed behavior for missing/ambiguous workspace/path targets.

## Required Context

- failed-kodax-handoff
  - Material: exact Anchor-to-Kodax Viewer-proof Handoff whose workspace-qualified Kodax Role reference currently fails package manufacture.
  - Purpose: reproduce the defect with real carried Site + Business + Docs material rather than a synthetic-only assumption.
  - Availability: available
  - Material Reference: [Failed Kodax Endpoint Role Fixture](011-5-1-1-anchor-to-kodax-schema-factory-viewer-proof-workspace-role-grounding-handoff.trace.md)

- loom-factory-reverification
  - Material: Loom factory re-verification and transport closure implementation Evidence.
  - Purpose: preserve the existing carrier fixes and avoid regressing endpoint Role carriage, sibling allocation, filename projection, Required Context grounding, blocker negation, and factory mechanics.
  - Availability: available
  - Material Reference: [Loom Factory Re-verification Evidence](011-4-1-loom-schema-factory-reverification-transport-closure-implementation-evidence.trace.md)

- factory-task
  - Material: controlling factory qualification Task.
  - Purpose: retain the no-private-logic, Builder-readiness, Root-abstract, and Sigma acceptance boundaries while repairing the transport seam.
  - Availability: available
  - Material Reference: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)

## Reference Context

- prior-kodax-manufacture-attempts
  - Material: preceding local Handoffs that exposed absent endpoint references and externally truthful but non-carried-resolution references before the workspace-qualified fixture.
  - Purpose: useful diagnostic history only; the final regression authority is the exact workspace-qualified failure above.
  - Availability: available
  - Material Reference: [Prior Kodax Role-qualified Handoff](011-5-1-anchor-to-kodax-schema-factory-viewer-proof-endpoint-role-qualified-handoff.trace.md)

## Retained Responsibilities

- viewer-proof
  - Retained By: Kodax
  - Responsibility: perform the actual Viewer factory proof only after Anchor can cold-qualify a proper Kodax carrier through the repaired generic transport path.

- anchor-reconciliation
  - Retained By: Anchor
  - Responsibility: verify Loom's mechanics return, manufacture/cold-test the Kodax carrier, and route product proof without manual per-Role binding.

- factory-acceptance
  - Retained By: Sigma
  - Responsibility: accept or reject the factory after Viewer proof; this transport repair is not product acceptance.

## Exclusions And Dependencies

- no-manual-material-binding-as-normal-path
  - Kind: excluded-scope
  - Description: do not close this defect by requiring Anchor/Kodax/LLMs to supply `--material-bindings`, `--reference-targets`, hidden request JSON, or chat-only knowledge for an exact Role already present in a complete carried Workspace.

- no-role-label-inference
  - Kind: excluded-scope
  - Description: do not search all carried Role artifacts for a matching human label; resolve only the exact declared workspace-qualified target and verify the resulting Role bytes.

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no repository push, merge, publish, deploy, or connector mutation is part of this repair.

- no-broad-schema-fanout
  - Kind: excluded-scope
  - Description: factory schema scaling remains gated behind Kodax Viewer proof and Sigma acceptance.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified implementation Evidence and a Loom-to-Anchor Handoff package proving the exact Kodax workspace-qualified Role fixture now manufactures through the ordinary common path and remains fail-closed for missing/ambiguous targets.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: workspace placement itself creates Role authority, Role material proves holder identity, or a successful carrier proves recipient acceptance.
- Must Not Be Used To Claim: filename/path heuristics may replace explicit workspace-qualified references, broad schema fan-out is accepted, Kodax Viewer proof is complete, or remote publication occurred.
- Authority Limits: Handoff endpoint declarations plus qualified Workspace/Role artifacts remain semantic authority; the repaired mapper is transport mechanics only.
- Transport Limits: `workspaceId::path` resolution must remain exact, deterministic, byte-qualified, and fail-closed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Value: k-972tR9t7s3QQpQ13Id5oG5qHVIqK05f_LEIr_MM5k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: OWPTptl5h9sD0x2gtm-4ESYw5giZi1qDu9zuW8L2xYU