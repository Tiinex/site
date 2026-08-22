# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 19:04:52
  - Trace: [v481 external plan material input binding correction result](008-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-v481-external-plan-material-input-binding-correction-result.trace.md)
  - Origin:
    - [relative](008-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-v481-external-plan-material-input-binding-correction-result.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-22 19:16:00
  - Authors: Architect
  - Why: Preserve the remaining Architect adversarial finding that externally supplied v481 plans are now bound to current Handoff, recipient, and material-resolution evidence but can still silently ignore other current planner inputs that materially change the derived package plan.
  - Summary: Architect correction feedback for external-plan planner-input binding completeness
  - Status: draft/local

---

# v481 external-plan planner-input binding completeness feedback

## Observed Signal

- Independent Architect audit found that the latest material-resolution binding correction is sound for direct materials, provider results, and prior packages, but the external-plan qualification surface still does not cover every supported current planner input that can change derived plan/package truth.

## Source

- Source: independent Architect adversarial audit against the returned v481 external-plan material-input-binding correction workspace.

## Interpretation

- `input.plan` may legitimately be sole current plan authority when no parallel planner input is supplied. Once the package invocation also supplies a planner input that can change requirements, selection/omission policy, or bootstrap presence, the current implementation must not silently ignore that parallel input while continuing to call the stale plan qualified.
- The remaining issue is one binding-completeness defect, not three new semantic features: supported current planner inputs and the externally supplied derived plan must either correspond, be recomputed under one authority, or fail closed when they contradict.

## Feedback Target

- Target: [v481 external plan material input binding correction result](008-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-v481-external-plan-material-input-binding-correction-result.trace.md) and the current `qualifyHandoffMaterialClosurePlanInputBinding(...)` / package-builder external-plan qualification boundary.

## Feedback Received

- Disposition: correction required before Architect terminal acceptance.
- Explicit requirements projection reproduction: build a genuine ready plan for requirement A with recipient capability for A, then reuse that plan with no parallel Handoff/recipient/material inputs but with a current explicit `requirements` projection for requirement B. A fresh plan over B is blocked, while the external-plan package remains `ready`, input binding is `qualified` in `plan-sole-current-authority` mode, and the descriptor still serializes Handoff/requirement A. The supplied current `requirements` input is therefore ignored even though the planner itself accepts it as an alternative qualified projection input.
- Reference-material policy reproduction: build a plan with exact A+B material and `includeReferenceMaterial: false`, so reference B is `omitted-by-plan`. Reuse the plan with the same Handoff/material evidence but current `includeReferenceMaterial: true`. A fresh plan materializes B; the external-plan package remains `ready/qualified/valid`, preserves `omitted-by-plan`, and omits B because qualification recomputes material resolution using stale `plan.policy` instead of the current policy input.
- Reference-preference policy reproduction: build a plan where recipient A is resolvable and exact A bytes are also present, so the default policy yields `reference-sufficient`. Reuse with current `preferReferenceWhenResolvable: false`. A fresh plan materializes A; the external-plan package remains `ready/qualified/valid` and serializes no A byte carrier.
- Bootstrap execution-input reproduction: build a ready plan whose bootstrap status is absent, then reuse it with current `bootstrap.present: true` and orientation content. A fresh plan reports bootstrap present, while the external-plan package remains `ready/qualified/valid`, descriptor bootstrap stays absent, and no bootstrap file is emitted. Conversely, a plan whose bootstrap status is present can be used without current bootstrap material and the package emits a zero-byte bootstrap file while reporting ready/qualified.
- Authority boundary: planner policy and explicit bootstrap presence remain disposable execution/planning truth, not Handoff semantics. The defect is that currently supplied execution/planner inputs are accepted by the API while stale plan-derived truth wins silently.

## Evidence Material

- Returned ZIP SHA256: `d672acf510d4872f582a16bf0d8370fbb61758c4dffb6a22244a7a0f5e61aab2`.
- Workspace delta versus the preceding Handoff workspace is bounded to one added durable Tooling result plus three modified material-closure owner/test files; no files were removed.
- Returned durable result c14n-v2 self value `erhOHJmq7FSX0_jA-VqbeeKGb_weEHXZlPTYF7RF_Ng` independently verifies.
- Independent current `materialClosure.test.mjs` execution passes.
- The previously requested material-resolution cases are independently accepted on returned bytes: same direct-material inputs reuse successfully, while contradictory current direct materials/providerResults/priorPackages are rejected by the new binding.
- Adversarial current results on returned bytes:
  - current explicit requirements B + stale ready plan A -> fresh B plan `blocked`, external package `ready`, binding `qualified/plan-sole-current-authority`, descriptor remains A;
  - `includeReferenceMaterial: false -> true` -> fresh reference B `materialized`, external plan remains `omitted-by-plan` with package `ready/qualified/valid`;
  - `preferReferenceWhenResolvable: true -> false` with exact A bytes -> fresh A `materialized`, external plan remains `reference-sufficient` with no A byte carrier and package `ready/qualified/valid`;
  - bootstrap `absent -> present` -> fresh plan `present`, external plan package remains `ready/qualified` and emits no bootstrap;
  - plan bootstrap `present` without current bootstrap material -> package reports ready and emits a zero-byte bootstrap carrier.
- `.topics/development/architect/continuity/**` remains byte-for-byte preserved in the returned workspace; this review does not transfer or reopen that parallel Architect lineage.

## Disposition

- State: correction-required
- Follow-Up: close external-plan planner-input binding completeness inside the existing v481 Task, add adversarial regressions for supported current requirements/policy/bootstrap inputs, preserve plan-only reuse where no contradictory parallel input is presented, rerun the required focused/full executable pressure, update durable result/evidence, and return one full roundtrip-verified Site workspace only when v481 is actually terminal.

## Limits

- The latest Handoff, recipient, material-resolution, readiness, workspace-correlation, provider-ambiguity, and stale-evidence corrections remain accepted.
- This finding does not require a new Handoff/package schema, global plan identity, hostile-input security boundary, provider preference, Viewer/UI work, docs mutation, or promotion of bootstrap/policy into semantic Handoff authority.
- Architect does not prescribe one implementation. Tooling may extend normalized input binding, recompute from current planner inputs, narrow supported external-plan invocation combinations, or use another fail-closed mechanism as long as supplied current planner inputs cannot be silently shadowed by stale derived plan truth.
- Workspace materialization correlation already has its own qualification path and is not reopened by this feedback unless a concrete new contradiction is reproduced.
- The Parent result is local/unpublished, so this artifact preserves relative continuity and does not fabricate browse + git Parent Origin.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:uWcYcMiZ8wp9c5ms3v5Izcb7xMIlDmoWFA2Rie7_aNM