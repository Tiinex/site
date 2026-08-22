# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 20:30:00
  - Authors: Tiinusen & Architect
  - Why: v475 materially improved canonical artifact authoring, but Architect/Q dogfood audit found remaining exact-authority and lineage-placement false-PASSes before the dogfood handoff layer can be trusted as canonical Tiinex output.
  - Summary: v476 canonical authority binding, integrity method reference, and lineage allocation closure

---

# v476 canonical authority binding, integrity method reference, and lineage allocation closure

## Objective

Close the remaining v475 authoring/validation authority gaps without introducing schema-specific switches or transport-driven semantics. Exact creation must bind declared schema references to the same qualified schema material used for semantic validation, integrity method representation must follow current Root plus the maintained method authority, and dimensioned Parent continuity must allocate dimensioned child paths consistently.

## Done Criteria

- Exact semantic/schema-reference coherence: an exact artifact must not declare a Root/Current Schema permalink for representation A while validating/generating against different schema bytes or a stale registered binding B. The exact-creation proof must retain the qualified schema material identity used for Root and target semantics and prove that it corresponds to the declared external reference. If the declared representation cannot be resolved to the same bytes/material authority, exact creation fails closed while the external reference is preserved.
- Remove the current v475 built-in authority mismatch where default Task creation still exposes the bundled Root binding at Tiinex/docs commit 52ecdea0... and a schema-id-only/site-local Task binding while v475 exact output is explicitly declaring current Tiinex/docs 053d46ce... Root/Task permalinks. Do not solve this with hardcoded schema-id branches. Use the existing schema source/resolver/material authority model so built-in exact creation can consume current qualified representations and custom schemas remain provider-neutral/fail-closed.
- Root/Task current authority for this dogfood closure is the commit-pinned Tiinex/docs 053d46ce082d4ec261b82abc44ecca403d61e240 material. The local Task bytes already match Git blob e4d545ad45382a150351ead587339d8b43cc0fb2; the local registered Root snapshot/binding is older and must not be silently treated as the 053d46ce representation merely because the schema id matches.
- Integrity method reference fidelity: current Root allows a plain method identifier generally, but requires the method label to be a Markdown link when a maintained validator artifact has an available commit-pinned browse + git permalink. The maintained c14n-v2 validator exists at https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md. Exact newly authored artifacts using sha256-base64url-c14n-v2 must therefore render the canonical method identifier as link text targeting the qualified commit-pinned validator representation when that authority is available. Do not fabricate a link when it is not available.
- Preserve c14n-v2 method semantics from the maintained validator authority: self validation keeps the Continuity Integrity section in the canonical source and neutralizes only the active self Value. Root's generic hash-method wording and the maintained v2 validator's footer-preserving canonicalization are separate authority surfaces; if Tooling detects an irreconcilable semantic conflict, report it explicitly to Architect/Schemer rather than silently changing the algorithm. Do not regress the currently verified v2 self-seal implementation without authority.
- Dimensioned continuation allocation: a dimensioned Parent path must produce a child path whose lineage prefix extends the Parent dimension according to the existing transition-authoring contract. The v475 Task is 002-..., therefore its result continuation must be 002-1-... (or the next collision-safe 002-N child), not another 002-... artifact. The same rule must apply to Tooling/live/artifact-set authoring where a result/continuation path is allocated; do not add a Tooling-only filename convention.
- Repair the uncommitted v475 result in this workspace as part of this closure: regenerate/move it to a canonical dimensioned child path under the 002 lineage, update its concrete Parent Trace/relative Origin to the unchanged v475 Task, preserve Tooling authorship and source evidence, and render a qualified linked c14n-v2 Method Entry. Because the existing v475 result has not been published as authority, do not retain a duplicate malformed same-dimension result merely as history; the repaired artifact should become the single local v475 result representation. Preserve the published v475 Task Parent browse + git authority at commit 32c7c291101b2a6a72c12241f3107d4a56af81fc.
- Add adversarial tests proving: external schema permalink A + semantic material B cannot exact-PASS; stale same-schema-id material cannot substitute for the declared representation; exact local/cache resolution with byte-equivalent material can qualify without replacing the external reference; missing resolver preserves the reference but blocks exactness; a maintained validator permalink is linked when available; plain method identifier remains permissible only when no qualified maintained method target is available; dimensioned Parent -> child path extension is canonical and collision-safe; and the repaired v475 result resolves as the only 002 child.
- Preserve v471-v475 source corrections unless this stronger authority audit proves a concrete contradiction. Keep remote Schema/Companion/Transition material declarative; no remotely executable code. Preserve provider neutrality, bounded discovery, exact caller/reference fidelity, local-only continuation usability, and the distinction between local continuity and exact/export-ready qualification.
- Before terminal delivery, inspect the actual generated v475-repair and v476-result Markdown, run focused v471-v476 plus creation/reference/integrity/path/lineage tests and the full available repository gate matrix, and return one complete repository/worktree ZIP. No status-only terminal stop when the next deterministic step is locally actionable.

## Scope

Primary owners are the shared schema source/reference/creation/integrity representation seams already used by portable Tooling, plus canonical continuation path allocation and focused tests. A stale built-in schema snapshot/binding may be refreshed or re-bound only when exact source identity is proven against the declared authority. Do not redesign Schema Builder, Site UI, Open Schema product behavior, persistence, provider/plugin architecture, or remote-code policy. Do not encode tiinex.task.v1/tiinex.root.v1 as a switch vocabulary beyond existing Root envelope identity where Root is structurally intrinsic.

## Dependencies

- v475 implementation/result workspace: [002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure-result.trace.md](002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure-result.trace.md). The current v475 result is useful source evidence but is not Architect/Q accepted as canonical artifact output because its filename reuses the Parent's 002 dimension and its footer uses a plain c14n-v2 method identifier even though a qualified maintained validator permalink exists.
- Published controlling v475 Task authority: https://github.com/Tiinex/site/blob/32c7c291101b2a6a72c12241f3107d4a56af81fc/.topics/development/tooling/dogfood/002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md (Git blob 4292284e28d9237ead0d8d73d4e1938f3ef91291).
- Current Root authority: https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md. Current Root requires browse + git for exact Parent Origin, permits local relative continuity as recovery, and requires a maintained validation-method label to link to its commit-pinned permalink when available.
- Current Task authority: https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md. Task filename policy keeps lineage first; the existing transition-authoring contract already defines dimensioned Parent -> child allocation.
- Maintained c14n-v2 method authority: https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md. It explicitly preserves the footer and neutralizes only the active self Value for v2 self canonicalization.
- Architect independently reran focused v471-v475, creation contracts, v455/v457 acceptance, conformance, record transition, and portable aggregate tests successfully. Historical v471-v474 artifacts remained byte-identical. v475 worktree contains 1177 files, no .git, no nested ZIP, and no transport wrapper. Q remains HOLD pending this closure and subsequent Architect audit.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8xO4H_9y-6UGptl7UUMFKr9Ye20ewTuwNEiVhq0cs5w
