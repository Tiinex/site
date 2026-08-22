# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 23:12:00
  - Authors: Architect
  - Why: A fresh v477 dogfood Topic creation/reopen probe exposed a same-family schema material identity false-PASS that must close before historical repair or fresh Dev.
  - Summary: v478 schema-source loaded material identity and reference coherence closure
  - Status: draft/local

---

# v478 schema-source loaded material identity and reference coherence closure

## Objective

Close the remaining create-versus-reopen schema-reference authority gap by binding semantic schema material identity to the bytes actually loaded/bundled, not to unverified sourceBlobSha metadata copied from a binding. Preserve provider-neutral external-reference resolution and make exact creation and ordinary reopen agree on the same reference/material truth.

## Done Criteria

Reproduce the concrete Topic false-PASS before mutation. Current Site Topic binding declares sourceCommit 52ecdea0..., sourceBlobSha c36472b0..., permalink at 52ec and snapshotCompleteness grounded-contract-excerpt-snapshot, while the actual bundled Topic Markdown bytes have SHA-256 d5fb337e... and a computed Git blob identity different from c36472b0 because the bundled representation contains Site-local Parent Origin/integrity bytes. Nevertheless, createPortableLocalDraft can currently be given the Tiinex/docs@053d Topic permalink plus resolver evidence gitBlobSha c36472b0 and return created-clean/exactRuntimeValidation=true because semanticMaterialIdentity inherits binding.sourceBlobSha instead of proving it from loaded bytes. Reopening that exact artifact through ordinary validate-draft then reports schema.reference.unqualified because registered target authority still points at 52ec. This create/reopen disagreement is the primary oracle.

Make schema material identity truthful and generic. The semantic material identity used by creation/validation must carry SHA-256 and, when used, Git-blob identity computed from the actual loaded/bundled schema bytes (or an equivalently generated runtime projection from those exact bytes). Binding/source metadata may describe an external target, but must not be copied into loaded-material identity as proof unless independently coherent. A stale or contradictory binding sourceBlobSha must not make external reference material look byte-equivalent. Keep external target identity, loaded semantic material identity, and resolver material identity as separate truths.

An exact external schema reference qualifies only when the declared target is itself qualified and its resolved material identity is proven coherent with the semantic material used by creation/validation. Exact target-string equality to a registered binding is sufficient only when that binding is proven material-bound to the loaded bytes. A different immutable permalink/commit may qualify when an explicit resolver/cache/connector result proves byte-equivalent material; do not rewrite the caller's reference to the registered target. Without such material proof, preserve the declared reference and report unresolved/unavailable rather than exact. A resolver evidence object that merely repeats a stale binding blob id without actual target/material qualification must not bypass the check.

Bring tiinex.topic.v1 onto one truthful current authority needed for dogfood Topic authoring: verify the intended current canonical Topic representation at Tiinex/docs commit 053d46ce082d4ec261b82abc44ecca403d61e240, blob c36472b0d20ad97d01cc1ca78a50fc69ce35fdae. If verified, replace the Site bundled Topic snapshot with those exact canonical bytes and update its binding/manifest/runtime projection metadata to the same 053d authority, including canonical-core origin/exact-canonical-docs-snapshot semantics consistent with Root/Task. Prove the final local Topic bytes are byte-exact to the resolved canonical target, then prove an exact 053d Topic root can be created and later reopened clean by ordinary validation using the same authority. Do not migrate unrelated grounded/excerpt schemas merely to make tests green; after the generic guard, any such schema must remain truthful local/schema-id-only or external-reference-unresolved until its own canonical snapshot is explicitly qualified.

Preserve v471-v477 source corrections, custom/provider-neutral schema-id-only authoring, exact Task authoring, external reference preservation, and current local-continuity semantics. Add adversarial coverage for stale binding blob metadata versus actual loaded bytes, explicit resolver material mismatch, different permalink with proven byte-equivalent material, unresolved external target without material proof, and custom schema-id-only fallback. Do not introduce schema-ID switches, GitHub-specific semantic branches, filename guessing, repository-wide first-candidate lookup, or a second schema interpreter. Run focused v471-v478 + schema source/reference/creation/reopen/runtime-projection pressure and the full available repository gate matrix. The v478 result may be a local 005-1 continuation and must not fabricate browse + git for the unpublished v478 task.

## Scope

Primary ownership is shared schema source/material identity, schema-reference authority/coherence, generated runtime projection identity, and the bounded Topic snapshot/binding migration needed to establish one exact current Topic authority. Portable creation/reopen adapters may change only where they project those shared truths incorrectly. No historical v471-v474 artifact repair in this tranche, no viewer/UI redesign, no Schema Builder feature work, no Open Schema behavior change, no remote executable material, and no publication-policy change.

## Dependencies

Current baseline is the terminal v477 worktree. Architect independently reran validateArtifact, audit traversal, publication preflight, v471-v477 focused closures, conformance, creation contracts, lineage resolution, portable aggregate and post-v470 schema-reading acceptance green. v477 correctly unifies machine-contract validation, but a fresh Architect dogfood probe exposed the Topic reference/material gap: exact Topic creation with explicit 053d reference is accepted, while the same bytes reopen invalid because the registered Topic binding is still 52ec. The local Topic binding claims sourceBlobSha c36472b0 while its actual bundled bytes differ from that canonical blob, so stale binding metadata is currently masquerading as semantic material identity. Historical dogfood canonical repair and the new hosted-workspace collaboration Topic remain HOLD until this generic reference/material oracle is truthful.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: W07ggNf-d_eSX2cFkC7nrhlbWtbncYT0aQt-8sCKYcM
