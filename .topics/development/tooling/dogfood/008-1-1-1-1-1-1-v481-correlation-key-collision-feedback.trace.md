# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 14:56:16
  - Trace: [v481 workspace materialization correlation correction result](008-1-1-1-1-1-v481-workspace-materialization-correlation-correction-result.trace.md)
  - Origin:
    - [relative](008-1-1-1-1-1-v481-workspace-materialization-correlation-correction-result.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-22 15:05:00
  - Authors: Architect
  - Why: Preserve one remaining Architect adversarial finding showing that v481 transport correlation can still collide and silently fall back to queue order while producing a ready package with mismatched workspace source/provenance and bytes.
  - Summary: Architect correction feedback for non-unique workspace transport-correlation keys in v481
  - Status: draft/local

---

# v481 transport-correlation key collision feedback

## Observed Signal

- Independent Architect audit reproduced a ready/valid package whose closure descriptor swapped workspace source/provenance across distinct byte carriers because two materializations shared one transport-correlation key.

## Source

- Source: independent Architect adversarial audit against the returned v481 correlation-correction workspace.

## Interpretation

- The previous correction removed direct workspace-id aliasing, but collision queues still make array order a hidden selection mechanism when the transport correlation key is non-unique. This remains inside the original v481 requirement that package-local workspace metadata project exact qualified planner truth without aliasing.

## Feedback Target

- Target: [v481 workspace materialization correlation correction result](008-1-1-1-1-1-v481-workspace-materialization-correlation-correction-result.trace.md) and the current `workspaceMaterializationCorrelationKey` / package / closure-descriptor correlation path.

## Feedback Received

- Disposition: correction required before Architect terminal acceptance.
- Collision finding: the current transport correlation key omits raw byte content, package-path projection, and workspace `source` while `indexWorkspaceMaterializationTruth` and descriptor correlation retain colliding entries in arrays and consume them with `shift()`. Distinct raw workspace materializations can therefore share one key and are then disambiguated by queue/array order despite the result claiming no array-order authority.
- Ready-package reproduction: two `id: docs`, `state: complete`, qualified workspaces with the same declared entry path but different byte content and different `source` values produce identical correlation keys when the entries do not predeclare digest/byte metadata. Reusing the legitimate planner output with `workspaceMaterializations` reordered and distinct explicit package paths yields package `status: ready` and closure inspection `valid`, while the closure descriptor binds `SOURCE-B` to the carrier bytes from workspace A and `SOURCE-A` to carrier bytes from workspace B.
- Boundary: this does not require canonical/global workspace identity. Correlation may remain disposable transport truth, but a package must not use collision queue order as selection authority. It must either prove a unique correspondence between each raw workspace carrier and its planner-qualified entry across all serialized truth that matters, or fail closed when correspondence is ambiguous/stale.

## Evidence Material

- Returned ZIP SHA256: `1deb3ca9f9fe461a1445429c2a0be0865224744afe72b8dd54acd6029df7fe2c`, matching Tooling's terminal screenshot.
- Workspace delta versus the prior correction Handoff input is bounded to one new durable result plus four expected material-closure owner files; no files were removed.
- The returned durable result c14n-v2 self value `_WBNh3r8-ILTIEFsl3c9GBmYXC65HS_wouJ5VBgierQ` independently verifies, and the current `materialClosure.test.mjs` passes.
- Adversarial collision reproduction on the returned bytes reports equal correlation keys for the two distinct workspaces, package `status: ready`, closure inspection `valid`, and descriptor/source pairs `SOURCE-B -> A carrier digest` plus `SOURCE-A -> B carrier digest` after planner-entry reorder.

## Disposition

- State: correction-required
- Follow-Up: close collision/uniqueness semantics inside the existing v481 Task, add an adversarial regression that proves no ready/valid package can bind one workspace's source/planner truth to another workspace's bytes through a colliding transport-correlation key or queue order, rerun the required focused/full executable pressure, update durable result/evidence, and return a full roundtrip-verified Site workspace only when v481 is actually closed.

## Limits

- The prior anonymous-id and duplicate-id qualification fixes remain accepted; this feedback narrows only the remaining collision/selection-authority defect.
- Architect does not prescribe a new semantic workspace identity, a globally unique identifier, provider preference, or one specific implementation. A transport-local correlation mechanism is sufficient if it is unique/qualified for the exact represented carrier truth or explicitly fails closed on ambiguity.
- This feedback does not claim the package must distrust arbitrary malicious caller objects as a security boundary beyond the existing v481 contract; it does require that supported externally supplied planner truth cannot become ready through an unproven non-unique correlation.
- The Parent result is local/unpublished, so this artifact preserves relative continuity and does not fabricate browse + git Parent Origin.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:cNVEDxgEDUGsYnqoCYrLNWMoto1LjRFn75808sGJ39s