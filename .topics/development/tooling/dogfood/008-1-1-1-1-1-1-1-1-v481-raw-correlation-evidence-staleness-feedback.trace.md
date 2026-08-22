# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 15:22:46
  - Trace: [v481 correlation-key collision correction result](008-1-1-1-1-1-1-1-v481-correlation-key-collision-correction-result.trace.md)
  - Origin:
    - [relative](008-1-1-1-1-1-1-1-v481-correlation-key-collision-correction-result.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-22 16:34:00
  - Authors: Architect
  - Why: Preserve one remaining Architect adversarial finding showing that caller-supplied or stale raw workspace transport-correlation evidence can bypass recomputation from the actual current byte carrier while still producing ready/valid closure.
  - Summary: Architect correction feedback for stale or injected raw workspace transport-correlation evidence in v481
  - Status: draft/local

---

# v481 raw workspace transport-correlation evidence staleness feedback

## Observed Signal

- Independent Architect audit reproduced a ready package whose workspace correlation remains `qualified` even though the correlation evidence claims one carrier digest while the packaged raw workspace contains different bytes.

## Source

- Source: independent Architect adversarial audit against the returned v481 correlation-key collision correction workspace.

## Interpretation

- The latest correction correctly removes queue/array-order selection for non-unique computed correlation keys, but the raw workspace input can still supply `transportCorrelationEvidence` and thereby replace the evidence that should be derived from the current raw carrier. This defeats the result's claim that transport correlation includes the actual carrier SHA-256/byte length and that stale externally supplied correlation evidence fails closed.

## Feedback Target

- Target: [v481 correlation-key collision correction result](008-1-1-1-1-1-1-1-v481-correlation-key-collision-correction-result.trace.md) and the current `workspaceMaterializationCorrelationEvidence` / raw workspace correlation path used by planner and package building.

## Feedback Received

- Disposition: correction required before Architect terminal acceptance.
- Stale-evidence finding: `workspaceMaterializationCorrelationEvidence(item)` returns `item.transportCorrelationEvidence` unchanged whenever that field is present. The planner therefore does not necessarily recompute carrier evidence from the current raw `entries`, and package-side `workspaceMaterializationCorrelationKey(workspace)` accepts the same supplied evidence again.
- Ready-package reproduction: create qualified workspace evidence from `a.txt = AAA`, reuse that evidence on an otherwise identical raw workspace whose current `a.txt` bytes are `BBB`, then build a recipient-relative Handoff package. Current behavior reports package `status: ready`, plan `status: ready`, closure inspection `valid`, descriptor correlation `qualified`, and no closure findings even though the evidence carrier digest is `cb1ad2119d8fafb69566510ee712661f9f14b83385006ef92aec47f523a38358` while the actual packaged carrier digest is `dcdb704109a454784b81229d2b05f368692e758bfa33cb61d04c1b93791b0273`.
- Boundary: this does not require treating callers as hostile or adding global workspace identity. It requires the correlation truth used to qualify a raw current carrier to be derived from or checked against that carrier's current bytes/source/projection rather than accepting a stale/injected evidence object as its own proof.

## Evidence Material

- Returned ZIP SHA256: `bf45ff8c0ec8c50bf76892b2bb1e246746a1f757bd2378f7a115498536cdf915`.
- Workspace delta versus the prior collision-correction Handoff input is bounded to one new durable result plus four expected material-closure owner files; no files were removed.
- The returned durable result c14n-v2 self value `V4J0gzMyFlpk9FAE_O8ead2Krn4-uWWzIRdYXxABMoc` independently verifies, and current `materialClosure.test.mjs` passes.
- Independent archive rehydration of the returned workspace is 1249/1249 byte-exact with zero missing, extra, or changed files.
- The adversarial stale-evidence reproduction on returned bytes produces `ready / ready / valid / qualified` with no closure findings while the correlation evidence carrier SHA-256 differs from the actual packaged workspace carrier SHA-256.

## Disposition

- State: correction-required
- Follow-Up: close stale/injected raw workspace correlation-evidence acceptance inside the existing v481 Task, add an adversarial regression proving that supported raw workspace input cannot carry stale transport-correlation evidence into a ready/valid package without qualification against the actual current carrier, rerun the required focused/full executable pressure, update durable result/evidence, and return a full roundtrip-verified Site workspace only when v481 is actually closed.

## Limits

- The prior provider ambiguity, qualified workspace truth projection, anonymous-id, duplicate-id, and correlation-key collision fixes remain accepted; this feedback narrows only the remaining raw correlation-evidence staleness bypass.
- Architect does not prescribe one implementation. Raw-input correlation evidence may be ignored and recomputed, or accepted only after exact qualification against current raw carrier truth, provided stale/mismatched evidence fails closed and no hidden selection authority is introduced.
- This feedback does not define a hostile-input security boundary, new package schema, new semantic workspace identity, provider preference, or Viewer/UI behavior.
- The Parent result is local/unpublished, so this artifact preserves relative continuity and does not fabricate browse + git Parent Origin.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:Am35fmry5IHkIU28B-u4u7lNj3GRL-r--h-iijTQ-TE