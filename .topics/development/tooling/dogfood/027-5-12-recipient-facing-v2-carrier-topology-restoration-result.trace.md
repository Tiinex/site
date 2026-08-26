# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 12:05:00
  - Authors: Loom
  - Why: Close Tooling 027-5-11 after restoring the agreed recipient-facing flat v2 topology, recovering accepted current/v1 byte behavior, correcting bounded conformance/static/performance regressions, and resolving the final TypeScript acceptance ambiguity by controlled baseline/current comparison.
  - Summary: Tooling 027-5-11 result — recipient-facing v2 exposes only qualified Tiinex artifacts and explicit payload ZIPs at a flat root; accepted current/v1 bytes/topology remain preserved; Required Context fail-closed projection and static discipline are restored; the exact supplied 1,519-file v2 path completes under 120 seconds; the final full TypeScript gate passes on both accepted baseline and current checkpoint at essentially identical times.
  - Status: complete/local

---

# Tooling 027-5-11 recipient-facing v2 carrier topology restoration result

## Decision

- State: implementation-and-acceptance-complete / independent-anchor-acceptance-pending / next-v2-human-audit-not-manufactured
- Subject: bounded restoration of the recipient-facing archive-backed Handoff carrier-v2 topology without changing current/default v1 transport
- Decision: retain the corrected recipient-facing v2 implementation. The v2 root is a flat Tiinex-facing artifact/payload surface; package filenames and numeric lineage remain locators only. Workspace identity, archive representation, selected Handoff routing, Required Context closure, and payload correlation remain qualified by canonical artifact semantics plus exact bytes/digests. Current/default v1 remains the return and default transport.
- Boundary: this result is Loom implementation/acceptance evidence for Anchor. It does not activate v2 by default, manufacture or return the next human-facing v2 candidate, treat package placement as semantic authority, invent a Workspace artifact, publish, commit, push, authenticate, or mutate remote state.

## Controlling Context

- Controlling Task: [Tooling 027-5-11 recipient-facing v2 carrier topology restoration](027-5-11-recipient-facing-v2-carrier-topology-restoration.trace.md)
- Inbound Handoff: [Tooling 027-5-11 Anchor-to-Loom Handoff](../../handoff/loom/027-5-11-recipient-facing-v2-carrier-topology-restoration-handoff.trace.md)
- Sigma Rejection: [Sigma first-live v2 carrier audit failure feedback](027-5-10-2-first-live-v2-carrier-sigma-audit-fail-feedback.trace.md)
- Accepted Plumbing/Scale Baseline: [Tooling 027-5-10 Anchor acceptance](027-5-10-full-source-v2-scale-anchor-acceptance.trace.md)
- Accepted Workspace/Archive Boundary: [Tooling 027-4 Workspace/archive binding Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md)
- Real Workspace Target: [Tiinex Site workspace](../../../.workspaces/tiinex-site.workspace.md)

## Exact Corrected Implementation Surface

Relative to the exact accepted pre-027-5-11 1,519-file baseline, the final source/test implementation delta is fifteen paths:

1. `src/tooling/portable/adapters/cli/cli.handoff-manufacture.js`
2. `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`
3. `src/tooling/portable/handoff/archiveCarrierV2.test.mjs`
4. `src/tooling/portable/handoff/coldConsumerEntrypoint.js`
5. `src/tooling/portable/handoff/contextAudit.js`
6. `src/tooling/portable/handoff/manufacture.js`
7. `src/tooling/portable/handoff/materialClosure.archiveV2.js`
8. `src/tooling/portable/handoff/materialClosure.archiveV2.indexes.js`
9. `src/tooling/portable/handoff/materialClosure.archiveV2.projectionProvider.js`
10. `src/tooling/portable/handoff/recipientV2.artifacts.js`
11. `src/tooling/portable/handoff/recipientV2.delivery.js`
12. `src/tooling/portable/handoff/recipientV2.inspect.helpers.js`
13. `src/tooling/portable/handoff/recipientV2.inspect.js`
14. `src/tooling/portable/handoff/recipientV2.topology.js`
15. `src/tooling/portable/output/recipientV2.zip.js`

The previously accepted 027-5-9 copy/collision implementation bytes were recovered exactly from the surviving accepted return package and remain unchanged in the final checkpoint:

- `src/tooling/portable/output/node.zip.js` SHA-256 `1d1d24626b3e873fb7dd4ae20a5f2d59a8863d1c26465dbf4f0b808e34e04e34`
- `src/tooling/portable/output/deterministic.zip.js` SHA-256 `45b99b769f3f0eaea4bf5b3000e3d8e5b2cf2787287e108dfa535ebbbbfffa8a`

## Recipient-Facing V2 Surface

The verified serialized root is exactly:

```text
001-READ-BEFORE-PROCEEDING.trace.md
001-1-bootstrap.trace.md
001-1-bootstrap.zip
001-2-tiinex-site.workspace.md
001-2-tiinex-site.workspace.zip
001-2-tiinex-site-workspace-payload.trace.md
001-2-tiinex-site-workspace-representation.trace.md
001-2-1-handoff-pointer.trace.md
```

The exposed root does not contain or require legacy recipient control surfaces:

- no `context/`
- no `handoff.workspaces/`
- no `tiinex.bootstrap/`
- no `tiinex.package/`
- no opaque generated `handoff-entrypoint-*` primary Start path

Canonical Pointer, External Payload, Relation, and Workspace artifacts carry the visible semantic evidence. ZIP filenames and numeric pathing remain human navigation/locators only and do not mint Workspace identity, Parent, route, provider, acceptance, or completion authority.

## Correctness Corrections Preserved

- Current/v1 deterministic topology and bytes are preserved. A fixed synthetic accepted-baseline/current comparison produced identical topology, per-file identities, package representation, and ZIP bytes; both ZIPs SHA-256 to `96eecb6eff1e3ff14e961d11f1b77ad13e0aa9b59104928abaf2bebfd79656d9`.
- The accepted Required Context fail-closed reason `required-workspace-entry-missing` is preserved at the carrier projection boundary; no legacy topology or sibling-route leakage was reintroduced.
- `materialClosure.archiveV2.js` is `23,985` bytes, below the repository `24,000`-byte source guard after one cohesive extraction. The static over-limit set remains exactly the five historical files and Tooling 027-5-11 introduces zero new static finding.
- Flat-v2 ZIP serialization is isolated from the accepted v1 serializer. Current/v1 ZIP implementation bytes remain exact; the v2 serializer verifies the recipient-v2 inspection and exact finalized file byte-count/digest identities before deterministic serialization.

## Exact Full-Source Performance Evidence

The accepted exact supplied full-source input contains `1,519` regular workspace files. The final recipient-v2 gate was run under a real `120 s` process bound with roundtrip disabled for the performance measurement, preserving exact Workspace/archive qualification.

Observed final timings:

- preparation: `9,072.04 ms`
- direct recipient-v2 manufacture: `102,542.16 ms`
- recipient-v2 deterministic serialization: `242.52 ms`
- total prepare + manufacture + serialization: `111,856.72 ms`
- manufacture status: `ready`
- findings: `0`
- serialized bytes: `15,933,673`

The performance correction reuses already-qualified exact Workspace provider state only inside the manufacture-time disposable projection seam; final serialized-byte closure/provider verification remains independent. The 1,519-file benchmark was not rerun after the final TypeScript-only acceptance work because no source mutation occurred on that performance path.

## Acceptance Evidence

Checkpoint acceptance already established the following as green after the final source corrections:

- focused recipient-v2 archive/carrier conformance and adversarial/tamper behavior
- current/v1 manufacture, deterministic serialization, carrier projection, selected-route artifact conformance, Pointer, cold consumer, and Tooling 026 cold-start behavior
- selected-route delivery and sibling-route isolation
- recipient-v2 orientation and bootstrap guidance
- context audit
- recipient-v2 roundtrip and serialized flat-topology inspection
- material closure and Required Context qualification
- multi-root behavior and existing 1,286-workspace scale pressure
- human-output/copyable presentation and transport companion
- architecture shape and browser-import boundary
- schema bindings and runtime projections
- static baseline delta: exactly five historical oversized source files, zero new findings

Historical source-size findings remain:

1. `src/tooling/portable/adapters/cli/cli.run.js`
2. `src/tooling/portable/handoff/carrierProjection.js`
3. `src/tooling/portable/handoff/coldStartQualification.js`
4. `src/tooling/portable/host/tool.bindings.js`
5. `src/tooling/portable/operation.catalog.js`

### Final TypeScript disposition

The previously unresolved `tsc -p tsconfig.json` timeout was classified by an exact same-environment baseline/current comparison using Node `22.16.0` and TypeScript `5.8.3` with the same `180 s` bound. `package.json`, `package-lock.json`, and `tsconfig.json` are byte-identical between baseline and current.

Exact acceptance command results:

- accepted pre-027-5-11 baseline: exit `0` in `33.3175 s`
- current corrected 027-5-11 checkpoint: exit `0` in `33.6170 s`

Extended diagnostics, run separately without weakening the acceptance command:

- baseline: `1,071` files; `547,735K` memory; `26.22 s` check; `31.88 s` compiler total
- current: `1,079` files; `562,281K` memory; `27.68 s` check; `33.17 s` compiler total

Classification: **current PASS / gate closed**. The earlier 180-second timeout is not reproducible under the controlled pair and is not evidence of a Tooling 027-5-11 TypeScript regression or a continuing environment limitation. No TypeScript-related source correction, tsconfig weakening, file exclusion, `skipLibCheck`, suppression, or narrow substitute check was used.

## Retained Gates And Non-Actions

- Anchor retains independent technical replay/acceptance of this return.
- Anchor with Sigma retains manufacture and personal inspection of the next real recipient-facing v2 candidate.
- Anchor/Sigma retain any decision to activate v2 as the normal/default transport.
- Current/default v1 remains active and is the only return transport used here.
- No v2 candidate package is returned or attached.
- No Workspace artifact was invented or transport-minted.
- No publication, commit, push, authentication, credential use, fetch-for-green-tests, or remote mutation occurred.

## Return Contract

Return exactly one recipient-relative CURRENT/v1 route-scoped **partial** Handoff carrier containing this result, the bounded Tooling 027-5-11 implementation delta, this tranche's controlling Required Context, and the sealed Loom-to-Anchor Handoff. The return must not claim workspace completeness and must not manufacture, retain, or attach a v2 candidate as the primary return.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:_rhfrwXPHJx7HbbdGgFetP37heWhiWoIfiQdwrTXhaI
