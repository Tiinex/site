# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 14:30:34
  - Trace: [013-1-2-axiom-to-anchor-party-role-specialization-return-handoff.trace.md](013-1-2-axiom-to-anchor-party-role-specialization-return-handoff.trace.md)
  - Origin:
    - [relative](013-1-2-axiom-to-anchor-party-role-specialization-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-05 08:27:33
  - Authors: Anchor
  - Why: Major 008 closure exposed that common author can emit a qualified artifact that the next common author operation cannot consume as Parent.
  - Summary: Repair common author so any qualified artifact can immediately serve as Parent for the next common-path author operation without manual schema-authority patching.
  - Status: ready/local

---

# Repair Common Author Continuation Schema Authority Projection

## Objective

Repair the shared common-path `author` flow so every artifact that it qualifies as a durable continuation can itself be used immediately as the Parent of the next common-path authored artifact without manual envelope editing, schema-ID special cases, remote lookup, or conversation convention.

The defect reproduced during Major 008 closure: current Site Tooling successfully authored and qualified `013-1-2-1-anchor-major-008-segment-qualification-decision.trace.md`, but the emitted envelope used a bare `Current -> Current Schema: tiinex.decision.v1` with no exact schema representation target. A subsequent ordinary `author ... --parent <that decision>` failed before rendering with `portable.cli.author.parent.schema-authority.required` because `parentRecordFromArtifact` requires both schema identity and a qualified schema target.

The command that qualified the Decision explicitly told Anchor that the next action was to author another result with that Decision as Parent. The common path therefore currently emits a qualified artifact that its own next-action contract cannot consume.

## Done Criteria

- Reproduce the generic sequence with the shared current Site Tooling: author one valid artifact, then author a different valid child using the first artifact as explicit Parent.
- A qualified common-path authored artifact is immediately reusable as Parent by the next common-path `author` call without manual mutation.
- Preserve the distinction between semantic schema identity and representation locator authority; do not invent a GitHub permalink, guess from schema filename/path, or weaken Root/Parent validation merely to make continuation pass.
- Choose one generic authority-preserving solution: either common author emits an exact qualified `Current Schema` representation target from already-resolved schema authority, or Parent resolution can recover the exact target from qualified local/carried schema authority when the artifact preserves only a schema ID. The solution must work across schema IDs rather than special-case Decision or Handoff.
- The solution must fail closed when exact schema representation authority genuinely cannot be resolved.
- Preserve existing valid historical artifacts that intentionally carry bare schema IDs where exact authority can be resolved generically; do not require broad source rewrites unless independently justified.
- Add regression coverage for at least Decision→Handoff continuation and one additional ordinary schema pair proving the behavior is schema-generic.
- Verify that the repaired common author still seals c14n-v2 self-integrity, audits before staging, retains no invalid artifact on failure, and updates continuation state only after qualification.
- Re-run focused/tooling, typecheck, architecture/UI shape where affected, integration, and Foundation/full validation as appropriate; report exact results and introduced static debt truthfully.
- Return one non-major full-source Business+Docs+Site Handoff Package to Anchor.
- Do not solve this through manual material bindings, schema-ID branches, prose parsing, hard-coded Docs URLs, GitHub connector mutation, or relaxed Parent authority.

## Scope

- shared `author` continuation envelope/schema-reference projection
- generic Parent record resolution used by common author
- schema authority carried by existing schema registry/descriptors/material providers
- regression fixtures for chained common authoring
- only the minimum adjacent CLI/help/receipt wording needed to keep next-action claims true

## Dependencies

- Reproduction artifact: `013-1-2-1-anchor-major-008-segment-qualification-decision.trace.md`.
- Repaired generic Party→Role inheritance override from Axiom remains accepted and must not be altered by this mechanical repair.
- Current qualified Anchor Role continuation in `business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md`.
- Major 008 remains blocked on this common-path continuation defect because the planned segment requires a stable cold-start/full-source recovery baseline, not a manual workaround.

## Exclusions

- No canonical schema semantic changes unless Loom proves a contradiction and returns it to Anchor/Axiom.
- No Reduction/Discovery Follow work from planned task 014.
- No broad schema-catalog fanout or Docs companion creation.
- No remote mutation, commit, push, merge, deployment, release, or carrier-major advancement.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [013-1-2-axiom-to-anchor-party-role-specialization-return-handoff.trace.md](013-1-2-axiom-to-anchor-party-role-specialization-return-handoff.trace.md)
  - Value: xIcBAqoRHnZckLfAjrkEZQVSgooFYluce36IdMAKEKo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: TnH8yX9rCtOjx6TdZcj9UpOda6c7Ep_mojZ0c-X0hLo