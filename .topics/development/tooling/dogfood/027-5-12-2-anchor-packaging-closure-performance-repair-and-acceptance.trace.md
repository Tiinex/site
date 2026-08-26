# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 14:56:00
  - Authors: Anchor
  - Why: Close the packaging blocker Anchor explicitly took over after Loom's finalized recipient-v2 specimen path exceeded 300 seconds despite a prior 1,519-file benchmark passing near 112 seconds.
  - Summary: Anchor packaging-closure repair and bounded acceptance — the runtime cliff came from redundant large Workspace-archive requalification plus avoidable large-byte copies in the recipient-v2 verification path; exact serialized bytes remain independently inspected once, manufacture-local internal closure reuses already-qualified provider state, and the larger reconstructed 1,551-file state now produces the flat v2 package in about 29 seconds with zero findings.
  - Status: accepted-bounded/local

---

# Tooling 027-5-12.2 Anchor packaging-closure performance repair and acceptance

## Decision

- State: accepted-bounded / packaging-closure-machine-gates-green / Sigma-personal-audit-pending
- Subject: final recipient-facing v2 manufacture-path performance blocker after Anchor ownership takeover
- Decision: retain the Tooling 027-5-11 flat recipient-facing topology and apply the smallest cohesive verification-path repair needed to remove the finalized-specimen runtime cliff. Internal manufacture-time closure inspection may reuse the already-qualified exact Workspace provider created by the same direct manufacture operation; recipient-facing inspection independently parses and qualifies the exact visible Workspace archive once and then constructs its in-memory provider from that already-inspected byte evidence instead of reparsing the same archive again. Read-only recipient-v2 byte access may use non-copying Uint8Array views where the caller performs no mutation.
- Boundary: no Handoff/Workspace/Parent/provider semantics change, no weaker archive integrity rule, no omitted final serialized-byte inspection, no current/v1 behavior change, no default-v2 activation, and no remote mutation are authorized.

## Controlling Context

- Ownership Transition: [Anchor packaging-closure ownership takeover](027-5-12-1-anchor-packaging-closure-ownership-takeover-decision.trace.md)
- Loom Result: [Tooling 027-5-12 recipient-facing v2 result](027-5-12-recipient-facing-v2-carrier-topology-restoration-result.trace.md)
- Sigma First Candidate Rejection: [Sigma first-live v2 carrier audit failure](027-5-10-2-first-live-v2-carrier-sigma-audit-fail-feedback.trace.md)
- Workspace/Archive Semantics: [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md)
- Real Workspace: [Tiinex Site workspace](../../../.workspaces/tiinex-site.workspace.md)

## Root Cause

The finalized recipient-v2 path retained semantically correct but operationally redundant verification work around one large complete Workspace archive:

1. Manufacture had already qualified the exact complete Workspace source and constructed the deterministic archive.
2. The internal disposable closure graph re-opened/requalified that same archive even though a qualified direct provider already existed for the manufacture-local projection.
3. Recipient-facing inspection independently parsed the exact visible serialized archive, which is required.
4. The same recipient inspection then rebuilt its Workspace provider by reparsing that already-inspected archive a second time.
5. `packageFileBytes(...)` also defensively copied large Uint8Array payloads in several read-only recipient-v2 paths.

At the final source size this repeated archive hashing/parsing/copying produced a memory/GC cliff: behavior could move from the earlier ~112-second benchmark to a >300-second specimen timeout without a meaningful semantic-size change.

The correction removes the redundant passes, not the independent verification boundary.

## Corrected Implementation Surface

- `src/tooling/portable/handoff/materialClosure.descriptor.js`
  - accepts an already-qualified Workspace byte provider for internal inspection while preserving the old default reconstruction behavior for ordinary callers.
- `src/tooling/portable/handoff/materialClosure.archiveV2.js`
  - supplies its exact manufacture-local direct provider to the internal disposable closure inspection instead of reparsing its newly constructed archive.
- `src/tooling/portable/handoff/recipientV2.inspect.helpers.js`
  - constructs the recipient inspection provider from the archive bytes/entries already independently parsed and qualified from the visible recipient surface;
  - computes visible ZIP payload digest once per inspection rather than twice.
- `src/tooling/portable/handoff/recipientV2.inspect.js`
  - uses that already-inspected recipient provider rather than performing a second archive parse.
- `src/export/package.bytes.js` and `src/tooling/portable/handoff/recipientV2.topology.js`
  - expose/use a read-only byte-view helper so recipient-v2 inspection/topology code does not clone large immutable Uint8Arrays merely to read them.

The ordinary copying `packageFileBytes(...)` contract is unchanged for existing callers.

## Independent Anchor Evidence

- Focused `archiveCarrierV2.test.mjs`: PASS.
- Material closure, current/v1 manufacture, route-artifact conformance, carrier projection, Pointer, cold consumer, context audit, Tooling 026 cold-start, multi-root, 1,286-workspace scale, human-output, transport companion: PASS.
- Architecture shape, browser import boundary, schema bindings, runtime schema projections: PASS.
- TypeScript `tsc -p tsconfig.json --noEmit`: PASS.
- Static baseline: exactly the same five historical oversized source files; zero new source-size finding.
- Larger reconstructed full working state used by Anchor: `1,551` regular files before this acceptance/Handoff material is added.
- Direct final-state profiling against the real `tiinex-site.workspace.md` and the exact Loom→Anchor 027-5-12 Handoff:
  - preparation: about `2.20 s`
  - direct semantic baseline: about `6.02 s`
  - recipient-v2 upgrade/qualification: about `20.46 s`
  - deterministic v2 ZIP write: about `0.14 s`
  - process elapsed: `28.98 s`
  - peak RSS: about `282,408 KB`
  - result: `ready`, zero findings
  - output bytes: `16,322,443`
  - root topology: exactly eight expected flat artifact/payload entries and no legacy envelope directories.

This reproduces the accepted semantics on a source state larger than the Loom benchmark and leaves substantial margin under the prior 120-second host gate.

## Acceptance Boundary

- Machine-level packaging closure is accepted for manufacture of one new Sigma audit specimen.
- Anchor must inspect the actual final audit ZIP after manufacture, including exact root tree, artifact header/footer conformance, payload ownership, orientation, context audit, selected-Handoff qualification, and roundtrip/exact bytes.
- Sigma must then perform the retained personal product/UX audit of the exact ZIP.
- Fresh cold-start qualification remains blocked until both Anchor and Sigma accept the specimen.
- Current/v1 remains default until later explicit activation disposition.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qVeW3vEIRKbsEDTpR0sXkjb4iPn9a4qp_6VJVKYuUso
