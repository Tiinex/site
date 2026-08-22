# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 21:55:00
  - Authors: Tiinusen & Architect
  - Why: Dogfood audit of v476 proved that the shared reopened-artifact validator can still report clean on a local-only child that current Root does not consider contract-complete.
  - Summary: v477 runtime validation contract unification and local continuity disclosure closure
  - Status: draft/local

---

# v477 runtime validation contract unification and local continuity disclosure closure

## Objective

Unify ordinary artifact validation with the same current Root/descendant machine-contract authority used by canonical creation so reopened Tiinex artifacts cannot be reported clean merely because a hand-written readability validator recognizes a subset of the envelope. Preserve the useful distinction between readable local continuity and exact/canonical validity without duplicating Root semantics in Site code.

## Done Criteria

The shared validateArtifact/audit/validate-draft path evaluates current Root machine-contract obligations from the qualified Root material rather than relying on the current hand-coded rootValidate subset as semantic authority. The concrete v476 local result `003-1-v476-canonical-authority-binding-integrity-method-lineage-alloca.trace.md` remains readable and traversable but MUST surface the missing required Parent Origin `browse + git` obligation and MUST NOT report semantic `clean`/exact/canonical validity merely because relative Trace/Origin and self-integrity are readable. The repaired published-parent v475 result `002-1-v475-canonical-artifact-envelope-reference-integrity-validation.trace.md` must satisfy the applicable Root + Task contract and linked c14n-v2 integrity under the same validation path. Historical v471-v474 legacy record/scalar-Origin/pseudo-footer shapes remain negative exact/canonical oracles and expose specific contract findings instead of being silently accepted by a shallow Root validator. Keep readability, local-continuity usability, semantic contract validity, exact creation proof, integrity verification, and export readiness as separate machine truths; do not collapse them into one boolean or make `Status: draft/local` an exemption from Root semantics. Generic validation must preserve unknown/extension material according to Root policy and remain schema/provider neutral. Reuse the existing compiled contract / instance-validation machinery and current schema material identity; do not create another hard-coded Root field checklist, Task switch, GitHub special case, filename heuristic, or second interpreter. Add regression coverage for re-opened local-only Parent continuity, exact published Parent continuity, missing/duplicate/alternate Parent Origin labels, malformed Trace/schema/method-reference shapes already identified by v475, and fallback/custom schema behavior. Ensure audit and portable validate-draft expose actionable findings at the real proof level so a human validator/viewer can distinguish `readable local continuity` from `canonical contract-valid`. Run focused v471-v477 + validation/contract/compiler/integrity/lineage pressure and the full available repository gates before terminal delivery. Do not rewrite the historical dogfood artifacts in this tranche; their repair is the next data-migration step after the validator oracle is trustworthy.

## Scope

Primary ownership is the shared artifact validation pipeline and the existing generic contract compiler/instance-validation projection it consumes, with portable audit/validate-draft adapters only where they misproject shared validation truth. `rootValidate` may remain as a readability/fallback diagnostic helper only if it is no longer treated as complete Root semantic validation. Do not modify canonical Tiinex/docs semantics, Schema Builder, Site product UI, remote-code policy, Open Schema behavior, persistence, or the historical dogfood artifact bytes. Do not solve the issue by requiring Git publication as workflow policy; current Root contract truth may make an unpublished child non-canonical while Tiinex still preserves it as readable local continuity.

## Dependencies

Current source baseline is the v476 Tooling worktree. Architect independently verified the v476 Root and Task local schema bytes are byte-identical to Tiinex/docs commit 053d46ce082d4ec261b82abc44ecca403d61e240 (Git blobs 7078e4832872be0df0df4ee944ee1bcd1d886f12 and e4d545ad45382a150351ead587339d8b43cc0fb2), the maintained c14n-v2 link/algorithm and all three v475/v476 self seals, and reran the focused v471-v476 creation/transition/conformance/portable suites green. Concrete remaining false-PASS: `node tools/tiinex-portable.mjs validate-draft .topics/development/tooling/dogfood/003-1-v476-canonical-authority-binding-integrity-method-lineage-alloca.trace.md . --schema tiinex.task.v1` currently returns `status: clean`, zero errors/warnings and only generic readability info even though current Root `Parent Origin` requires `browse + git` whenever Parent exists. Its `exactRuntimeValidation` is false, so the creator knows the artifact is non-exact, but the re-opened shared validator does not reconstruct or disclose the actual Root contract failure. Q remains HOLD for fresh Dev until this validation oracle is trustworthy; canonical repair of v471-v474 follows after this source closure.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Oux-cFS6DbBlhixhMHXH-b3XC_X3gqKWA9kM2ibCRQM
