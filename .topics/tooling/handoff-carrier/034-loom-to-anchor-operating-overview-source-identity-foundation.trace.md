# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 21:34:00
  - Trace: [Anchor To Loom — Operating Overview Loaded-Source Identity Foundation](033-anchor-to-loom-operating-overview-source-identity-foundation.trace.md)
  - Origin:
    - [relative](033-anchor-to-loom-operating-overview-source-identity-foundation.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 21:43:00
  - Authors: Loom
  - Summary: Return the bounded loaded-source identity foundation for Operating Overview after preserving existing node-file/node-zip locator facts on readable text records, carrying them through portable normalization, and projecting them as non-authoritative consumer evidence without repository or permalink inference.
  - Status: local

---

# Loom To Anchor — Operating Overview Loaded-Source Identity Foundation

## Handoff Parties

- Purpose: return the smallest provider-neutral source/locator preservation needed for Operating Overview consumers to distinguish same-authored-path material from multiple explicitly supplied roots or archives while keeping authored identity and semantic authority unchanged.
- From: Loom
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- source-identity-gap-repair
  - Transfer Kind: work-and-responsibility
  - Description: readable Node directory text and ZIP text now retain the existing `node-file` and `node-zip-entry` locator shapes already used for metadata-only assets. Portable normalization carries that locator onto parsed records instead of dropping it.
  - Boundary: locator retention is loaded-material transport evidence only; local paths and archive entries do not create repository identity, publication authority, Parent, Origin, Source semantic authority, or public permalinks.

- overview-loaded-source-basis
  - Transfer Kind: work-and-responsibility
  - Description: every Operating Overview item now exposes `loadedSourceBasis` with source mode, locator class, retained locator, separately supplied non-local source metadata when present, explicit non-authoritative authority, and unavailable durable repository/permalink state when it is not explicitly qualified.
  - Boundary: `loadedSourceBasis` is consumer evidence only. It does not replace the owning artifact's authored id/path, schema identity, lifecycle status, qualification, or canonical provenance semantics.

- adversarial-same-path-proof
  - Transfer Kind: work
  - Description: focused CLI proof loads two explicit directory roots containing the same authored relative Project path and identical authored Project material. Both overview items retain the same authored path while their two `node-file` locator paths remain distinct. Additional focused checks cover archive-entry and separately supplied source-metadata classification.
  - Boundary: the proof does not prefix authored paths, invent synthetic repository names, or infer a repository from host directories.

- preservation
  - Transfer Kind: work
  - Description: `node.input.test.mjs`, `portable.input.test.mjs`, and `operatingOverview.test.mjs` are green after the repair. The complete accepted portable Handoff baseline remains 21-of-21 green.
  - Boundary: no Handoff transport module, Viewer code, Business artifact, Docs schema, repository crawler, remote provider, or unrelated application module changed.

## Required Context

- initiating-source-identity-handoff
  - Material: exact Anchor delegation authorizing this loaded-source identity tranche.
  - Material Reference: [Loaded-Source Identity Foundation](033-anchor-to-loom-operating-overview-source-identity-foundation.trace.md)
  - Purpose: scope, source-semantics boundary, adversarial proof requirement, and completion contract.
  - Availability: available

- node-portable-input
  - Material: Node file/directory/ZIP loader with readable-text locator preservation.
  - Material Reference: [node.input.js](../../../src/tooling/portable/input/node.input.js)
  - Purpose: exact local-file and archive-entry locator acquisition boundary.
  - Availability: available

- portable-input-normalization
  - Material: provider-neutral record normalization with retained loaded locator.
  - Material Reference: [portable.input.js](../../../src/tooling/portable/input/portable.input.js)
  - Purpose: source/locator preservation without authored-id rewriting.
  - Availability: available

- operating-overview-projection
  - Material: accepted overview projection extended only with non-authoritative loaded-source basis.
  - Material Reference: [operatingOverview.js](../../../src/tooling/portable/overview/operatingOverview.js)
  - Purpose: consumer-facing source-basis projection and unavailable durable-identity boundary.
  - Availability: available

- focused-source-identity-regression
  - Material: input and overview regressions including same-relative-path multi-root proof.
  - Material Reference: [Operating Overview Projection Test](../../../src/tooling/portable/overview/operatingOverview.test.mjs)
  - Purpose: adversarial distinction proof plus locator-class projection.
  - Availability: available

## Reference Context

- node-input-regression
  - Material: Node input adapter regression.
  - Material Reference: [Node Portable Input Test](../../../src/tooling/portable/input/node.input.test.mjs)
  - Purpose: proves readable directory and ZIP text retain the existing locator contracts.
  - Availability: available

- portable-input-regression
  - Material: provider-neutral input normalization regression.
  - Material Reference: [Portable Input Test](../../../src/tooling/portable/input/portable.input.test.mjs)
  - Purpose: proves record normalization preserves locator while existing source boundaries remain intact.
  - Availability: available

- complete-portable-handoff-baseline
  - Material: accepted 21-test portable Handoff regression directory.
  - Material Reference: [Portable Handoff Tests](../../../src/tooling/portable/handoff/)
  - Purpose: transport non-regression gate.
  - Availability: available

## Retained Responsibilities

- source-semantics-review
  - Retained By: Anchor
  - Responsibility: decide whether this non-authoritative loaded-source basis is accepted as the correct Tooling material boundary for the next Operating Overview tranche.
  - Boundary: acceptance of locator preservation does not promote local/archive facts into canonical Source/provenance semantics.

- schema-authority
  - Retained By: Axiom
  - Responsibility: re-enter only if a future requirement needs maintained Source, Workspace, Relation, Discovery, or provenance semantics beyond this loaded-material evidence.
  - Boundary: this return found no schema contradiction and makes no schema change.

- viewer-and-remote-usefulness
  - Retained By: Sigma; Anchor
  - Responsibility: later decide how human Viewer navigation and any qualified cross-repository/provider traversal should consume source identity.
  - Boundary: this tranche adds no Viewer integration, remote traversal, Monitoring freshness, or public permalink derivation.

## Exclusions And Dependencies

- no-repository-inference
  - Kind: excluded-scope
  - Description: filesystem roots, local absolute paths, ZIP names, archive placement, package names, and nearby Workspace declarations are never promoted into GitHub repository/ref identity.

- no-public-permalink-fabrication
  - Kind: excluded-scope
  - Description: local file and archive-entry locators are not public permalinks; the projection reports durable repository/permalink identity unavailable unless separately supplied and qualified.

- no-authored-id-or-path-rewrite
  - Kind: excluded-scope
  - Description: authored artifact path/id remains exactly as loaded and is not prefixed with transport roots for disambiguation.

- no-remote-traversal-or-freshness
  - Kind: excluded-scope
  - Description: repository crawling, network fetch, provider state, Monitoring freshness, and remote cross-repository traversal remain deferred.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one exact complete Workspace-bearing Loom-to-Anchor package containing the provider-neutral loaded-source/locator preservation, same-path multi-root adversarial proof, accepted Operating Overview semantics unchanged, explicit no-repository-inference boundaries, and all 21 portable Handoff tests green.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: a local path is a canonical source, an archive entry is a repository permalink, two supplied roots are one semantic Workspace, same-path authored artifacts have new canonical ids, remote repositories were traversed, or Viewer integration is complete.
- Must Not Be Used To Claim: that loaded-source transport evidence replaces Source/Origin/Parent semantics, that separately supplied unverified metadata proves durable repository identity, or that local locator distinction authorizes public provenance claims.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor To Loom — Operating Overview Loaded-Source Identity Foundation](033-anchor-to-loom-operating-overview-source-identity-foundation.trace.md)
  - Value: 94J1xrTVJ9qZzJ3Sxk1lpOuvqCUeI5SU1C3EA5hR2kQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:3bElkSlv-u-k-bU0mUzGx-Op_SV2-eAj_FsDwky1cls
