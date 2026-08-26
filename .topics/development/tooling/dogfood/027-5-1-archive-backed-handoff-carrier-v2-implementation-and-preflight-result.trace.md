# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 00:21:00
  - Authors: Loom
  - Why: Close the Tooling 027-5 implementation tranche with exact implementation, validation, first-candidate preflight, and carried-environment limitation evidence while leaving v2 opt-in and returning through the current carrier.
  - Summary: Tooling 027-5 implementation result — archive-backed carrier v2 is implemented behind an opt-in path, downstream regressions are green where the carried environment supports them, and the real tiinex-site v2 first candidate fails closed because no truthful explicit `.workspace.md` instance target exists.
  - Status: complete/local

---

# Tooling 027-5 archive-backed Handoff carrier v2 implementation and preflight result

## Decision

- State: implementation-complete / independent-acceptance-pending / real-v2-candidate-blocked
- Subject: Tooling 027-5 archive-backed recipient-relative Handoff carrier v2 implementation and first-candidate preflight
- Decision: retain the implementation as an opt-in v2 manufacture path only. Preserve current/default v1 manufacture and use the current carrier for the Loom→Anchor return. Do not manufacture or designate a real tiinex-site v2 package until an exact truthful `tiinex.workspace.v1` `.workspace.md` instance target is explicitly available and independently qualified.
- Boundary: this result records local implementation and validation evidence only. It does not independently accept the migration, activate v2 by default, invent a Workspace artifact, authorize Sigma's first-new-format gate, publish, commit, push, authenticate, or perform any remote mutation.

## Controlling Context

- Controlling Task: [Tooling 027-5](027-5-archive-backed-handoff-carrier-v2-implementation-and-first-candidate-preflight.trace.md)
- Accepted semantic boundary: [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md)
- Axiom classification: [Tooling 027-4 semantic classification result](027-4-1-workspace-artifact-archive-binding-semantic-classification-result.trace.md)
- Selected-route acceptance: [Tooling 027-3-2 Anchor acceptance](027-3-3-full-source-material-closure-regression-anchor-acceptance.trace.md)
- Inbound Handoff: [Anchor→Loom Tooling 027-5 Handoff](../../handoff/loom/027-5-archive-backed-handoff-carrier-v2-implementation-and-first-candidate-preflight-handoff.trace.md)

## Implemented Boundary

- Added a versioned archive-backed workspace byte-provider abstraction keyed by carrier workspace identity plus normalized safe inner path.
- Added exact v2 workspace/archive binding manufacture and inspection in the existing Handoff material-closure/materialization control plane.
- V2 requires an explicit carrier workspace-id → exact Workspace artifact target. The target must be an actual carried `tiinex.workspace.v1` `.workspace.md` instance and is independently byte/schema qualified. No filename scan, Markdown-content scan, nearest-match fallback, adjacency rule, archive placement rule, or transport-only Workspace minting is permitted to create semantic identity.
- Archive qualification preserves exact representation locator, codec/media selection, byte size, digest and digest target, deterministic manufacture, exact included-entry map, per-entry size/digest, completeness evidence, path-normalization state, and provider qualification.
- Shared consumers now resolve workspace bytes representation-neutrally: current v1 exploded workspace leaves remain valid; v2 routes through the qualified archive provider.
- Required Context detached material is deduplicated only when an exact archive entry supplies equivalent fail-closed digest/provenance proof. Detached fallback remains when equivalence is unavailable.
- Outer `tiinex.package/file-map.json` authority remains preserved; inner archive proof does not replace package-wide exact-file tamper qualification.
- Bootstrap/runtime remains outside nested workspace archives. Pointer/START remain non-authoritative orientation projections.
- Default/current v1 manufacture remains the normal operation. The v2 operation is separately registered as `manufacture-handoff-package-v2` and is not self-activated.

## Exact Changed Source Paths

Compared against the exact carried tiinex-site baseline, the implementation tranche changes exactly these 14 source paths:

1. `src/tooling/portable/adapters/cli/cli.handoff-manufacture.js`
2. `src/tooling/portable/adapters/cli/cli.help.js`
3. `src/tooling/portable/adapters/cli/cli.run.js`
4. `src/tooling/portable/adapters/node/handoff.manufacture.js`
5. `src/tooling/portable/handoff/archiveCarrierV2.test.mjs` — new
6. `src/tooling/portable/handoff/carrierProjection.js`
7. `src/tooling/portable/handoff/carrierProjection.workspaces.js`
8. `src/tooling/portable/handoff/contextAudit.js`
9. `src/tooling/portable/handoff/manufacture.js`
10. `src/tooling/portable/handoff/materialClosure.archiveV2.js` — new
11. `src/tooling/portable/handoff/materialClosure.descriptor.js`
12. `src/tooling/portable/handoff/pointerEntrypoint.js`
13. `src/tooling/portable/handoff/workspaceByteProvider.js` — new
14. `src/tooling/portable/operation.catalog.js`

The Tooling 027-5 result and Loom→Anchor return Handoff are finalization artifacts and are not counted as implementation-source changes.

## Positive And Adversarial V2 Evidence

The focused archive-backed v2 regression passed. It exercises:

- deterministic archive manufacture and package roundtrip;
- exact Workspace target/archive binding;
- Pointer and selected-route resolution through the archive-backed provider;
- archive-backed Required Context deduplication plus detached fallback;
- two workspaces sharing the same inner relative path without identity collision;
- missing and ambiguous Workspace target rejection;
- unsafe/traversal and duplicate inner-path rejection;
- wrong archive digest rejection;
- wrong inner-entry digest rejection;
- stale archive binding/index and completeness rejection;
- unavailable provider/decoder rejection;
- invalid selected Handoff rejection;
- outer file-map tamper rejection; and
- package-wide Continuity Integrity recomputation/roundtrip qualification.

The focused success marker observed was:

`✓ Tooling 027-5 archive-backed Handoff carrier v2 qualification, isolation, dedup, tamper, and fail-closed regressions passed`

## Downstream Validation Evidence

The carried environment supported and passed the following downstream checks after the v2 implementation and after tightening Workspace target discovery to explicit exact target binding:

- Handoff manufacture regression;
- selected-route artifact conformance regression;
- carrier projection regression;
- Pointer entrypoint regression;
- cold-consumer entrypoint regression;
- Tooling 026 cold-start qualification regression;
- context audit regression;
- multi-root / multi-workspace manufacture regression;
- scale regression;
- normal human-output emission regression;
- copyable human-output presentation regression;
- transport companion regression;
- architecture-shape static guard;
- browser import-boundary static guard;
- schema-bindings/runtime-projection checks; and
- offline TypeScript check.

The scale observation remained green at `1,286` workspace carriers and `1,306` package files. Timing observations are non-authoritative.

## Carried-Environment Test Limitations

Exactly two pre-existing validation prerequisites were unavailable in the supplied Handoff snapshot. They were recorded as unavailable rather than fabricated as PASS:

1. `src/tooling/portable/handoff/materialClosure.test.mjs` could not start because `.topics/development/handoff/tooling/002-v481-tooling-recipient-relative-handoff-material-closure-planner-foundation-handoff.trace.md` is absent from the supplied carrier.
2. `tools/validate-static.mjs` could not start because the supplied carrier omitted `.gitignore`.

No repository material was invented, fetched, reconstructed, or weakened merely to make either unavailable check appear green.

## First Real tiinex-site V2 Candidate Preflight

The real carried tiinex-site workspace contains no `.workspace.md` instance. Therefore there is no truthful explicit package-carried `tiinex.workspace.v1` Workspace artifact target that can satisfy the accepted Tooling 027-4 identity boundary.

The real opt-in v2 preflight consequently failed closed before changing representation with:

- Finding code: `portable.handoff-v2.workspace-target.missing`
- Migration mode: `archive-backed-v2-opt-in`
- Migration state: `blocked-before-representation-switch`
- Baseline current/v1 state: ready

This result is intentional and correct. The implementation must not substitute `src/schemas/workspace/tiinex.workspace.v1.schema.md`, infer identity from filename/content, or mint a transport-only Workspace artifact. No real tiinex-site v2 candidate ZIP is manufactured or returned in this tranche.

## Opt-In Invocation Retained For Anchor

After independent acceptance, and only when a truthful exact `.workspace.md` instance target exists, the supported CLI shape is:

```text
node tools/tiinex-portable.mjs manufacture-handoff-package-v2 <workspace-dir> --handoff <workspace-relative-handoff.trace.md> --workspace-id <id> --workspace-target <exact-workspace-relative-.workspace.md> --output <candidate-v2.zip>
```

The positive CLI path was exercised with a qualified disposable fixture Workspace artifact and completed with v2 verification gates valid. That fixture success does not authorize a real tiinex-site candidate in the absence of a truthful target.

## Return And Retained Gates

- Loom returns this implementation using exactly one current/v1 recipient-relative Handoff package.
- No v2 candidate package is designated, attached, or substituted as human transport.
- Anchor retains independent diff/replay/acceptance and first human-deliverable v2 generation.
- Sigma with Anchor retains personal inspection of the first human-deliverable new-format package before onward routing or default activation.
- Default carrier activation remains explicitly out of scope.
- No publication, remote mutation, authentication, commit, push, or credential flow occurred.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:tV9iMkovNRasUXRmADDBlfT41pcpH1iTNu-mSCxxbIg
