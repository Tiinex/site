# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 18:57:00
  - Authors: Architect
  - Why: The first Tiinex development dogfood lineage exposed a false-PASS in portable artifact authoring and validation: v471-v474 Task artifacts were accepted even though their Root header/footer representation diverged from current authority and a Q-approved concrete Tiinex artifact.
  - Summary: v475 canonical artifact envelope, reference, integrity, and validation closure

---

# v475 canonical artifact envelope, reference, integrity, and validation closure

## Objective

Make the Site-included portable authoring and validation seam produce and qualify Tiinex artifacts from current Root/descendant authority rather than from legacy/local convenience shapes. Preserve exact external reference authority independently from whichever resolver is available in the current execution environment.

## Done Criteria

- Root/Task authoring uses the exact current `Continuity Context` and `Continuity Integrity` shapes. A continued artifact uses a real Markdown-link or relative-path `Trace`; it must not serialize a synthetic `record:<id>` token as Root Trace authority.
- Parent `Origin` is represented as labeled Markdown-link entries under the `Origin` block. A local relative recovery target is computed relative to the child artifact's own directory, not repository root. Scalar `Origin: <path>` and undeclared Parent `Boundary` convenience fields must not be emitted as exact Root representation.
- Parent presence remains fail-closed against Root's Parent Origin contract. `browse + git` must identify the same Parent and should be commit-pinned when available. Tooling must not fabricate a Git permalink for unpublished material merely to obtain an exact PASS.
- Schema references preserve exact declared external authority. For built-in current Root/Task authority, use the commit-pinned Tiinex/docs representations identified by this task when materializing exact artifacts. A resolver may map an exact permalink to a verified local/cache representation for execution, but local material must not replace, erase, or weaken the declared external reference. If no resolver is available, retain the reference and report resolution as unavailable/unresolved rather than rewriting it to a sandbox-local basename/path.
- Reference resolution remains provider-neutral and capability-driven. Do not add schema-ID switches, GitHub-specific semantic branches, repository-global scanning, filename guessing, first-candidate selection, or local-path substitution that acts as hidden authority. GitHub connector access, verified local cache, or another explicit resolver are resolution mechanisms, not semantic identity.
- `Current -> Authors` supplied by the caller is preserved in the exact artifact representation. Do not add viewer/UI work in this tranche; first-class viewer author entry/presentation remains separate dogfood debt.
- Exact artifact integrity uses Root's Method Entry shape: the method identifier is the first-level footer entry and contains `Towards` plus `Value`. For locally created self-verifiable material, `sha256-base64url-c14n-v2` with `Towards: self` must be computed and independently verified from the final artifact bytes. `Draft Local Integrity / Method: browser-local-draft / pending-publication-or-export` must not qualify as exact Root integrity.
- Exact validation validates the concrete rendered artifact against Root plus descendant contract and the integrity method actually claimed. `exactRuntimeValidation=true` and equivalent exact/clean claims are impossible when the concrete header/footer is malformed, required Parent origin authority is absent, schema/reference authority is unresolved where exact qualification requires it, or self-integrity mismatches.
- Add explicit negative fixtures for the dogfood false-PASS shapes already present in v471-v474: `record:` Trace authority, scalar Origin path, broken schema-basename reference, undeclared Parent Boundary, and `Draft Local Integrity` pseudo-footer. These must no longer pass as exact canonical artifacts merely because portable helpers recognize their legacy shape.
- Add positive fixtures grounded in current Root/Task contracts and the Q-approved concrete representation at `https://github.com/Tiinex/docs/blob/master/.topics/odysseus/001-1-1.trace.md`. Treat that artifact as a concrete representation oracle, not a replacement for Root/schema semantic authority.
- Preserve v471-v474 Tooling implementation corrections unless this stronger oracle proves a concrete source contradiction. Keep the dimensions-normalized v471-v474 artifacts unchanged in this tranche as negative/historical dogfood evidence; do not silently rewrite or reseal them yet.
- Run focused authoring/validation/integrity/reference pressure plus portable aggregate and applicable repository guards. Before terminal delivery, open/inspect the actual generated Markdown result, verify its links and footer shape directly, and report proof levels accurately rather than inferring exactness from helper success.

## Scope

Primary ownership is `src/tooling/portable/**` plus the shared platform-neutral schema creation, parsing, integrity, and reference-resolution seams it already consumes. Reuse current Root/Task authority and existing generic resolver/material graph machinery. A shared owner may be corrected when the false-PASS demonstrably lives there, but do not create a second renderer/interpreter inside portable Tooling.

Do not modify canonical Tiinex/docs semantics, Schema Builder, Site product UI, Open Schema product behavior, provider/plugin architecture, remote-code policy, or the pending Dev schema-reading correction. Do not make sandbox reachability a semantic rule. Do not rewrite v471-v474 dogfood artifacts during this implementation tranche. If exact Root semantics for unpublished local Parent `browse + git` cannot be satisfied without new authority, preserve the blocker explicitly and hand the semantic question to Architect/Schemer rather than inventing a local exception.

## Dependencies

- Current source baseline is the dimensions-normalized v474 repository/worktree snapshot transported for dogfooding. The v474 implementation result remains source evidence, while its existing artifact representation is deliberately retained as a negative oracle until this closure qualifies a repair path.
- Immediate historical input: [v474 Tooling result](001-1-1-1-1-1-1-1-site-tooling-v474-loaded-parent-identity-evidence-closure-result.trace.md).
- Current Root semantic authority: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md).
- Current Task semantic authority: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md).
- Q-approved concrete header/footer example: [Odysseus 001-1-1](https://github.com/Tiinex/docs/blob/master/.topics/odysseus/001-1-1.trace.md). Its concrete shape demonstrates relative Parent Trace/Origin plus Method Entry footer structure; exact Root/Task contracts remain the semantic authority.
- Architect independently reproduced that current portable validation reports exact/clean on dogfood artifacts whose header/footer differs materially from those authorities. This false-PASS is the controlling reason fresh Dev remains HOLD.
- Publication/transport guard: this v475 controlling Task is intentionally a new local lineage root rather than pretending that the unpublished v474 result can already satisfy Root's required `browse + git` Parent Origin. After Q commits/pushes this v475 input snapshot, a Tooling result may continue this Task only by using the exact published task representation as its Parent `browse + git` authority; if that representation is unavailable, the result must not fabricate exact Parent qualification.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 1Q8eNHAi50ZhjQWBPRJ5nvvY9JXGL2Fe715pD9C30kE
