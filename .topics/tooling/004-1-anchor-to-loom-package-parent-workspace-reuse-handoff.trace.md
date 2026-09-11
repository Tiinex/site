# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/8435cd46a3773a38301659da716785dc6465072c/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.reduction.v1](https://github.com/Tiinex/docs/blob/8435cd46a3773a38301659da716785dc6465072c/.topics/.schemas/reduction/tiinex.reduction.v1.schema.md)
  - Created At: 2026-09-01 20:46:00
  - Trace: [Iteration Friction Tranche Reduction](004-iteration-friction-tranche-reduction.trace.md)
  - Origin:
    - [relative](004-iteration-friction-tranche-reduction.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/8435cd46a3773a38301659da716785dc6465072c/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-01 20:56:00
  - Authors: Anchor
  - Why: Repair the remaining recipient-return plumbing seam exposed by the pre-send gate: `--package-parent` preserves carrier lineage but does not currently expose unchanged qualified parent-carrier Workspaces as manufacture providers for a modified primary Workspace return.
  - Summary: Anchor-to-Loom bounded package-parent Workspace-provider reuse repair before the remaining static closure debt tranche.
  - Status: ready/local

---

# Package-Parent Workspace Provider Reuse — Anchor To Loom

## Handoff Parties

- Purpose: make a fresh recipient able to manufacture a full-source return from the received carrier plus its modified primary Workspace without re-supplying unchanged Business/Docs roots as separate operator inputs
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](https://github.com/Tiinex/business/blob/13f72c62cd4f476abc2e277358293f852394c127/.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](https://github.com/Tiinex/business/blob/13f72c62cd4f476abc2e277358293f852394c127/.topics/roles/001-3-loom-role.trace.md)

## Transfers

- parent-workspace-provider-reuse
  - Transfer Kind: work-and-responsibility
  - Description: when `manufacture-handoff-package` receives a qualified `--package-parent`, make unchanged complete Workspaces carried by that parent available as exact manufacture providers; an explicitly supplied current Workspace root with the same id represents the current modified source and must not be silently replaced by parent bytes
  - Boundary: this is provider/materialization reuse only; package-parent remains carrier progress/recovery input and does not become semantic authority

- inherited-context-and-role-resolution
  - Transfer Kind: work-and-responsibility
  - Description: endpoint Role references and Required Context bindings must be able to resolve from inherited qualified parent-carrier Workspaces during manufacture preparation, so a Loom→Anchor return can use carried Business Role bytes and carried Docs/Business context without external checkout or duplicate cache material
  - Boundary: exact ids/paths/digests must qualify; no filename, label, adjacency, network, or role-name guessing

- return-self-containment-regression
  - Transfer Kind: work-and-responsibility
  - Description: add the smallest regression proving a fresh received full-source carrier plus a modified Site root can manufacture a full Business+Docs+Site child return using only `--package-parent`, Site root, route, and exact bindings; physical roundtrip and fresh return ingress must pass

- return-first
  - Transfer Kind: work-and-responsibility
  - Description: after focused qualification, manufacture the canonical full-source Loom→Anchor return before broad closure; do not consume the role turn on the two unrelated source-size findings

## Required Context

- post-major-reduction
  - Material: current Site iteration-friction reduction
  - Material Reference: [Iteration Friction Tranche Reduction](004-iteration-friction-tranche-reduction.trace.md)
  - Purpose: accepted transport/iteration carry-forward and post-major reduction boundary
  - Availability: available

- accepted-iteration-result
  - Material: retained Anchor iteration-friction acceptance Decision
  - Material Reference: [Iteration Friction Reduction — Anchor Acceptance](003-1-1-1-1-1-1-anchor-iteration-friction-acceptance-decision.trace.md)
  - Purpose: accepted fail-closed, full-source, physical-roundtrip and host-evidence boundaries
  - Availability: available

- business-portable-handoff
  - Material: Business Portable Handoff Cold-Start Ingress task
  - Material Reference: [Portable Handoff Cold-Start Ingress](business::.topics/initiatives/001-2-2-portable-handoff-cold-start-ingress-task.trace.md)
  - Purpose: Foundation full-source and recipient-only recovery requirement
  - Availability: available

- business-iteration-efficiency
  - Material: Business Tooling And Workflow Iteration Efficiency task
  - Material Reference: [Tooling And Workflow Iteration Efficiency](business::.topics/initiatives/001-2-6-tooling-workflow-iteration-efficiency-task.trace.md)
  - Purpose: reduce repeated operator plumbing without weakening qualification
  - Availability: available

## Reference Context

- pre-send-failure
  - Material: Anchor pre-send reproduction where carrier `003-1` cold-start qualified but a synthetic Loom→Anchor manufacture with only modified Site + `--package-parent` attempted to open the Loom Role path under Site because inherited Business was not present in the manufacture provider set
  - Purpose: exact behavioral failure to reproduce; chat wording is not authority and the implementation/test must own the durable fix
  - Availability: available

- static-debt-next
  - Material: two inherited v119 source-size findings in `cli.run.js` and `carrierProjection.js`
  - Purpose: explicitly queued next tranche, not scope for this repair
  - Availability: available

## Retained Responsibilities

- architecture-and-acceptance
  - Retained By: Anchor
  - Responsibility: qualify the return-only behavior, keep semantic/carrier boundaries intact, and route the two static debts next

- semantic-authority
  - Retained By: Axiom
  - Responsibility: no active work; this repair must not require new schema meaning

- human-checkpoint
  - Retained By: Sigma
  - Responsibility: inspect/accept/commit only at the next stable major

## Exclusions And Dependencies

- package-semantic-redesign
  - Kind: excluded-scope
  - Description: do not change Handoff Package, Workspace Representation, Role Pointer, Required Context, carrier-lineage or operational-grounding semantics

- remote-source-substitution
  - Kind: excluded-scope
  - Description: do not fetch GitHub or another remote source to replace a carried parent Workspace; the received carrier is the provider boundary

- stale-parent-masking
  - Kind: excluded-scope
  - Description: parent-carrier reuse must not overwrite or hide an explicitly supplied modified Workspace with the same id

- static-debt-cleanup
  - Kind: excluded-scope
  - Description: leave `cli.run.js` and `carrierProjection.js` source-size debt for the next bounded tranche unless the minimal provider repair necessarily touches one and still preserves the separate debt disposition

- host-safety-analysis
  - Kind: excluded-scope
  - Description: host checkpoint/false-flag behavior remains external workflow evidence only

- remote-mutation
  - Kind: excluded-scope
  - Description: work on carried source and return through canonical transport; commit/push remains Sigma's human boundary

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns a focused implementation where a fresh received full-source carrier plus modified Site root can manufacture a qualified full Business+Docs+Site Loom→Anchor child using the received package as `--package-parent` without separately supplied Business/Docs roots; exact carried Role/context bytes resolve, modified Workspace precedence is explicit, physical roundtrip and fresh return cold-start pass, Foundation 54/54 and focused/tooling remain green, and a canonical return carrier is produced before broad closure
- Return To: Anchor
- Return To Reference: [Anchor Role](https://github.com/Tiinex/business/blob/13f72c62cd4f476abc2e277358293f852394c127/.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: parent-carrier bytes become semantic authority, a lost Workspace may be replaced by remote checkout, or the remaining static/closure debt is solved
- Must Not Be Used To Claim: package redesign, Role inference, hidden source recovery, strict closure PASS, or Sigma acceptance

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Iteration Friction Tranche Reduction](004-iteration-friction-tranche-reduction.trace.md)
  - Value: PPBaSRWjOkyTTx0vKl08BCgTZdfrISgQx7VJhsnGlbE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: rWuHbi0_2pJKyyFoPWvYQMVzc4-0-u3Bgsazhbq-yCg
