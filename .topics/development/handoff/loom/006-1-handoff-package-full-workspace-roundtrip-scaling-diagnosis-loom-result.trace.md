# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 18:07:00
  - Trace: [006-handoff-package-full-workspace-roundtrip-scaling-diagnosis-and-bounded-correction-handoff.trace.md](006-handoff-package-full-workspace-roundtrip-scaling-diagnosis-and-bounded-correction-handoff.trace.md)
  - Origin:
    - [relative](006-handoff-package-full-workspace-roundtrip-scaling-diagnosis-and-bounded-correction-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 18:27:00
  - Authors: Loom
  - Why: Preserve Tooling 014's bounded full-workspace roundtrip diagnosis after the historical greater-than-300-second signal failed to reproduce under exact current-source controls, preventing an unproven performance correction from being mistaken for closure.
  - Summary: Loom diagnosis-only result for Tooling 014 full-workspace Handoff roundtrip scaling
  - Status: draft/local

---

# Loom diagnosis-only result for Tooling 014 full-workspace Handoff roundtrip scaling

## Objective

Reproduce and phase-profile the supplied full-workspace default Handoff manufacture roundtrip, identify any concrete work amplification with source-level evidence, and apply a portable Tooling correction only if the historical greater-than-300-second boundary can be causally bound to a locally owned implementation defect without weakening accepted Tooling 011-013 verification semantics.

## Done Criteria

Diagnosis-only disposition at the Loom implementation/evidence boundary; no Tooling source correction was justified and Anchor retains independent Tooling 014 disposition.

The controlling historical signal does not reproduce in the supplied 006 workspace on this Loom host. Using the exact Handoff that produced the original signal, `.topics/development/handoff/anchor/006-anchor-successor-condensed-continuity-handoff.trace.md`, the current deterministic Node/CLI manufacturer completed `--no-roundtrip` in 21.55 seconds wall time with 217,140 KB maximum resident memory and completed the normal default roundtrip in 25.85 seconds with 218,544 KB maximum resident memory. Both runs enumerated 1,347 workspace files / 9,506,218 workspace bytes and wrote a 15,647,135-byte package. The default run reported package/closure/carrier/START/companion/bootstrap verification `valid`, roundtrip `passed`, package status `ready`, and eight Required Context materials carried. The normal roundtrip therefore satisfies the previously imposed 300-second review window in this environment without any implementation mutation.

A second control using the incoming Tooling 014 Handoff itself produced the same shape: 21.41 seconds without roundtrip and 26.32 seconds with the normal roundtrip, both writing a 15,602,632-byte package with the default run reporting `roundtrip: passed`. A rerun of the prior Tooling 013 Loom return workspace/package source also completed its normal default roundtrip in 25.87 seconds. These controls materially contradict a claim that the unchanged current package engine deterministically requires more than 300 seconds for this workspace class.

Explicit phase profiling of the exact Anchor successor Handoff isolates the current additional roundtrip work. Node input preparation took 1.557 seconds; recipient-relative package construction took 15.015 seconds; the roundtrip's fresh package inspection took 4.226 seconds; import-plan construction took 0.014 seconds; apply-result construction took less than 0.001 seconds; closure reinspection took 1.045 seconds; carrier reinspection took 0.020 seconds; START reinspection took 0.019 seconds; and companion reinspection took 0.004 seconds. A separately repeated `roundTripPortableRuntimePackage` aggregate took 4.217 seconds and passed; that repeated aggregate was profiling instrumentation and is not an additional stage in the ordinary default CLI path.

The exact current package shape in that profile is 1,668 serialized files, of which 1,667 are file-map-governed and total 13,987,891 governed bytes: 1,347 workspace carriers, 300 embedded Tooling runtime files, eight carried Required Context materials, and generated package controls. The dominant current roundtrip phase is therefore the fresh package integrity inspection, not import/apply materialization. Source tracing shows that `roundTripRecipientRelativeHandoffTransportPackage` calls `roundTripPortableRuntimePackage`, which calls `inspectExportPackageBundle` before import-plan/apply/compare. `inspectExportPackageBundle` freshly reads every package file and verifies each file's byte count, SHA-256 and compatibility fingerprint, then `inspectExportPackageFileMap` freshly verifies the governed set against the durable file map. This is concrete repeated full-package integrity work, but it is linear in package bytes/files in the observed implementation and accounts for roughly four seconds here; no multiplicative traversal or reconstruction capable of explaining the historical greater-than-300-second observation was reproduced.

The relevant implementation source is unchanged from the Tooling 013 Loom return. Exact SHA-256 controls remain identical across the prior 005 return workspace and supplied 006 workspace for `src/export/package.bytes.js` (`41b20148af7ecabef317cabd6139be7d2cf27af80493953c1c3ef6cd2e439ca6`), `src/export/package.builder.js` (`180873a27631f761b19525afe5ed3e0f8b523e2b8f3e35c78db14145e2d371d0`), `src/export/package.apply.js` (`f650f33ed12d3adbf83c6abbe620d097e60258eb967e4d86bd296576a4106440`), `src/tooling/portable/package/runtime.package.js` (`3366b974bfba42eecec057cca8c62e3fe60454fd968bbe79ad916787f7cf73ea`), `src/tooling/portable/handoff/materialClosure.package.js` (`5d5a51b7eb8b400e61f4c8f1543f11aef73a0f0acd9c55587a037dd558cf5de7`), and `src/tooling/portable/adapters/node/handoff.manufacture.js` (`83a57963c195bf649804031b242490315e6dda36c3b4c418eae1003c6974215a`). No intervening Tooling correction can explain the recovered timing.

Because the historical greater-than-300-second behavior is not causally reproduced, Loom made no `src/`, `tools/`, package-engine, hash, comparison, or default-mode mutation. Reusing a prior inspection, skipping a fresh comparison, reducing governed coverage, changing the default to `--no-roundtrip`, or optimizing same-byte hash passes without evidence that they caused the historical boundary would violate the task's fail-closed verification requirement or turn a bounded diagnosis into speculative performance work. The exact historical cause therefore remains unresolved: it may have been host/run-specific contention or another transient execution condition, but this result does not claim such a cause without evidence.

Focused frozen-source regression gates pass: `handoff.manufacture.test.mjs`; `handoff.manufacture.scale.test.mjs` with 1,286 workspace carriers / 1,306 package files; `materialClosure.test.mjs`; `transportCompanion.test.mjs`; `carrierProjection.test.mjs`; `coldConsumerEntrypoint.test.mjs`; `runtime.package.test.mjs`; `operation.catalog.test.mjs`; and `bootstrap.test.mjs`. `node tools/validate-static.mjs` passes and `npm run portable:smoke` passes. Repository-wide `npm run validate` again passes through `src/app/emptyStageProductHierarchy.test.mjs` and then stops at the already transported-workspace boundary where `src/parity/poc.m1StartupRenderParity.test.mjs` reads absent `.old/app.js` and receives `ENOENT`; Tooling 014 does not reinterpret or repair that unrelated boundary.

Ordinary `validate-draft` on these newly authored local continuation artifacts reports one machine-contract error, `portable.contract.conditional.field.required.missing`, because the compiled Root contract requires `Parent Origin: browse + git` whenever Parent exists. The supplied workspace has no `.git` metadata and the controlling source-authority signal explicitly preserves local/package authority rather than established public source, so Loom preserves truthful relative Parent continuity and does not fabricate a Git repository/commit permalink merely to improve validation appearance. Both artifacts' `sha256-base64url-c14n-v2` self-integrity remains independently verified; this exact validation finding is therefore retained as an authority-boundary, not hidden or reclassified as a Tooling 014 defect.

The durable disposition is therefore: preserve the historical scale signal as not reproduced rather than falsely “fixed.” If Anchor can reproduce the greater-than-300-second behavior again, the next correction leaf should capture the exact command/Handoff, host/runtime state, phase timestamps, CPU/RSS, package file/byte counts, and the phase at which progress stops before authorizing an optimization. The current four-second fresh-inspection cost is a real bounded linear amplification and a future optimization candidate, but it is not proven to be the historical defect.

## Scope

Full-workspace Handoff manufacture control runs; exact Anchor-successor reproduction; phase/resource instrumentation; source-level roundtrip traversal analysis; prior-source identity comparison; Tooling 011-013 focused regressions; static/portable/repository validation; diagnosis-only durable result and recipient-relative return package. No canonical Handoff/schema redesign, Process semantics, Viewer/product work, generalized performance SLA, publication claim, verification weakening, or speculative package-engine optimization.

## Dependencies

Controlling work is `006-handoff-package-full-workspace-roundtrip-scaling-diagnosis-and-bounded-correction-handoff.trace.md` and Tooling 014 `../../tooling/dogfood/014-handoff-package-full-workspace-roundtrip-scaling-diagnosis-and-bounded-correction.trace.md`. The operational observation under review remains `../../architect/continuity/001-19-2-handoff-successor-package-roundtrip-scale-signal.trace.md`. Accepted semantics frozen during diagnosis remain Tooling 013 `../../tooling/dogfood/013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md`, Tooling 012 `../../tooling/dogfood/012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md`, and Tooling 011 `../../tooling/dogfood/011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md`.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:XsuMucuJRPuIzT6J1IRzCybXfE2u02DQFtu0vLpKtzQ
