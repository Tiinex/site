# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 22:12:31
  - Trace: [Cold-start validation-report schema material closure result](../../tooling/dogfood/009-1-cold-start-validation-report-schema-material-closure-result.trace.md)
  - Origin:
    - [relative](../../tooling/dogfood/009-1-cold-start-validation-report-schema-material-closure-result.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 00:21:00
  - Authors: Architect
  - Why: Preserve an independently reproduced provenance-spoofing defect in the returned Tooling correction before accepting the cold-start validation-report schema material closure.
  - Summary: Bundled validation-report bootstrap qualification can currently be minted by caller-supplied source metadata around self-consistent conflicting bytes.
  - Status: draft/local

---

# Validation-report bootstrap provenance spoofing feedback

## Observed Signal

- Ordinary `loaded-material` carrying deliberately modified but self-consistent `tiinex.validation.report.v1` bytes can declare bootstrap provider/source metadata and is then promoted to `bundled-canonical-self-verified` with `sourceQualified: true`.

## Source

- Independent Architect review of the returned Tooling workspace using the portable resolver, focused regressions, local `git hash-object`, and a fixed-commit GitHub file read of `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d`.
- The adversarial resolver probe was executed locally against the returned source without mutating the Tooling implementation.

## Interpretation

- The bundled snapshot currently present is byte-correct, but the qualification mechanism does not yet distinguish runtime-owned bootstrap provenance from candidate-controlled source assertions. Valid c14n-v2 self-integrity proves byte self-consistency, not that those bytes came from the declared bootstrap pack or cited Git commit.
- This is therefore an authority/provenance correction inside the existing Tooling Task, not a schema-semantics dispute and not a reason to require network access.

## Feedback Target

- Target: [Cold-start validation-report schema material closure result](../../tooling/dogfood/009-1-cold-start-validation-report-schema-material-closure-result.trace.md), specifically the new portable bootstrap schema pack and `qualifyPortableSchemaMaterial` / schema-provider selection path used to classify `tiinex.validation.report.v1` as `bundled-canonical-self-verified`.

## Feedback Received

- Independent Architect review reproduced the intended networkless happy path and confirmed that the bundled snapshot currently in this workspace has Git blob SHA `6637c34db3d4946a30560fd011ca71a1f5b9011c`, matching the fixed `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d` published file.
- The returned correction nevertheless permits an ordinary caller-supplied `loaded-material` candidate to self-assert `source.providerId: bootstrap-canonical-schema-pack` plus `source.qualification: bundled-byte-bound-canonical-snapshot`, canonical repository/commit/path metadata, and a valid self c14n-v2 value around different schema bytes.
- That adversarial candidate resolves successfully as `authority: bundled-canonical-self-verified`, `sourceQualified: true`, and `representationIntegrity: verified` even though the resolved material's actual provider lane remains `loaded-material` and the bytes are deliberately different from the fixed canonical snapshot.
- Therefore the current mechanism lets untrusted candidate metadata mint the runtime-owned bootstrap authority class. Self-integrity proves internal byte consistency; it does not prove that caller-supplied bytes are the runtime's bundled canonical snapshot or the cited Git blob.

## Evidence Material

- Focused returned regressions passed: validation-report material closure, general schema providers, v481 Handoff material closure, package ZIP roundtrip, browser import boundary, schema bindings, and runtime projections.
- Normal networkless CLI resolution passed with `remoteFetch: false`, `registered: false`, `exactSchemaIdentity: true`, `sourceQualified: true`, `representationIntegrity: verified`, and `authority: bundled-canonical-self-verified`.
- GitHub read of the fixed canonical file reports blob SHA `6637c34db3d4946a30560fd011ca71a1f5b9011c`; local `git hash-object` of the bundled snapshot reports the same SHA.
- Adversarial reproduction used the bundled readable schema as a base, changed body semantics, re-sealed c14n-v2 self-integrity, then supplied it through `files` as ordinary loaded material while setting source metadata to the bootstrap provider id, fixed docs commit/path, `authority: canonical-core`, and `qualification: bundled-byte-bound-canonical-snapshot`.
- Resolver output from that reproduction:
  - `status: resolved`
  - `providerId: loaded-material`
  - `sourceProviderId: bootstrap-canonical-schema-pack`
  - `authority: bundled-canonical-self-verified`
  - `sourceQualified: true`
  - `representationIntegrity: verified`
  - `remoteFetch: false`
  - `markdownHasForged: true`

## Disposition

- State: correction-required/open
- Follow-Up: keep the original `009-cold-start-validation-report-schema-material-closure.trace.md` Task open. Tooling should make bootstrap authority depend on provenance that is owned/bound by the bootstrap runtime/provider seam rather than on source fields a loaded candidate can declare for itself. The implementation design remains Tooling-owned; acceptable fixes may bind runtime-owned provider identity to the injected candidate, bind the fixed snapshot bytes/digest through runtime-owned data, or another equivalent fail-closed mechanism.
- Acceptance Effect: the returned `009-1` result is not yet accepted by Architect. The network-independent material objective is promising and the bundled bytes are currently correct, but the truthful authority/provenance done criterion is not satisfied while caller-controlled metadata can impersonate bundled canonical provenance.
- Regression Requirement: add an adversarial regression in which self-consistent conflicting bytes arrive as ordinary loaded material with forged bootstrap source metadata; those bytes must not resolve as `bundled-canonical-self-verified` or `sourceQualified: true`. The genuine runtime-owned bootstrap snapshot must continue to resolve networklessly, and absent/wrong/ambiguous/provider-enabled cases must remain fail-closed or correctly qualified.

## Limits

- This feedback does not claim the bundled snapshot currently stored in the workspace has wrong bytes; its local Git blob SHA matches the fixed canonical GitHub blob.
- It does not require network access at cold start, Git publication of the local workspace, registration of `tiinex.validation.report.v1` as a Site runtime companion, or a change to validation-report schema semantics.
- It does not invalidate the already accepted Architect `qualification-once / PASS-WITH-LIMITS` result; it blocks acceptance of this Tooling correction only.
- It does not require one specific cryptographic or provider architecture. The required property is narrower: caller-supplied schema material must not be able to mint runtime-owned bootstrap provenance/authority merely by declaring source metadata and valid self-integrity.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: orKbtxnMMicxAdzK2wCyMeT4lV5l-Iz8lcB1ooDJHM8