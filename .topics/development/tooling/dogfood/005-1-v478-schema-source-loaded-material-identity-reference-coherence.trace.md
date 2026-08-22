# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 23:12:00
  - Trace: [005-site-tooling-v478-schema-source-loaded-material-identity-reference-coherence-closure.trace.md](005-site-tooling-v478-schema-source-loaded-material-identity-reference-coherence-closure.trace.md)
  - Origin:
    - [relative](005-site-tooling-v478-schema-source-loaded-material-identity-reference-coherence-closure.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 23:40:00
  - Authors: Tooling
  - Why: Records source-qualified completion evidence for the controlling v478 Tooling task without fabricating publication authority for the unpublished local Parent.
  - Summary: v478 schema-source loaded material identity and reference coherence closure result
  - Status: draft/local

---

# v478 schema-source loaded material identity and reference coherence closure result

## Objective

Close v478 by deriving semantic schema material identity from the bytes actually loaded/bundled, keeping external reference identity and resolver material evidence separate, and migrating tiinex.topic.v1 to the verified current Tiinex/docs@053d representation.

## Done Criteria

Pre-mutation oracle reproduced: bundled Topic SHA-256 d5fb337e126a1953967161b240dd18e8395bd9197f1f3c8f1b9b7c5b26ce77d4 and computed Git blob 1032ab61c04163da231b4e3a40e7186c33df9486 disagreed with binding sourceBlobSha c36472b0d20ad97d01cc1ca78a50fc69ce35fdae; explicit docs@053d+c364 creation returned created-clean/exactRuntimeValidation=true, while ordinary reopen reported schema.reference.unqualified. After v478, runtime projections carry Git-blob identity computed from loaded bytes; binding target exactness requires exact-canonical snapshot metadata plus computed byte coherence; explicit alternate references require target-qualified resolver material evidence; flat stale blob metadata cannot qualify. Site Topic is byte-exact to verified docs@053d blob c36472b0d20ad97d01cc1ca78a50fc69ce35fdae with SHA-256 b6fe9893d9ce66734ab249a22796ca77de75f441a4b6eaa3352ad75a1c2405df, and an exact 053d Topic root creates clean and reopens without schema.reference.unqualified. Focused v471-v478/schema-source/reference/reopen pressure passes; full source matrix is 283 total, 282 PASS, one dependency-bound missing-React non-pass, zero timeouts; checkpoint, icons, architecture, browser-import, package-lock, static, schema bindings/runtime projections, workspace schema, UI shape, typecheck, metrics, storage, portable smoke, and UC001 gates pass.

## Scope

Generic schema-source loaded-material identity, schema-reference material coherence, generated runtime projection identity, bounded tiinex.topic.v1 canonical snapshot migration, and focused regression fixtures. No migration of unrelated grounded/excerpt schemas, no schema-ID switches, provider-semantic special cases, filename guessing, first-candidate authority, UI redesign, or parallel schema interpreter.

## Dependencies

Tiinex/docs commit 053d46ce082d4ec261b82abc44ecca403d61e240 exposes tiinex.topic.v1 at Git blob c36472b0d20ad97d01cc1ca78a50fc69ce35fdae; the worktree canonical cache contains byte-exact same blob and is the migration source. Root/Task and maintained c14n-v2 authority remain pinned to the same docs checkpoint. Grounded/excerpt bindings without exact-canonical snapshot qualification remain external-reference-unresolved or schema-id-only according to their own authority. The controlling v478 Task is local/unpublished, so this result preserves relative continuity only and does not fabricate browse + git or claim exact Root Parent qualification/export readiness. Aggregate npm run validate stops at the inherited missing-react boundary after post-v461; the independent full source matrix covers all 283 source tests including v478.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: oNPZn0Qw13IoEHxbrV5aI9nUCaZyb_MXXgilDRsvTpE
