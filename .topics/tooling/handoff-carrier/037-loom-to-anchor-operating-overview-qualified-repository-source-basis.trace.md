# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 22:06:00
  - Trace: [Anchor To Loom — Operating Overview Qualified Repository Source Basis](036-anchor-to-loom-operating-overview-qualified-repository-source-basis.trace.md)
  - Origin:
    - [relative](036-anchor-to-loom-operating-overview-qualified-repository-source-basis.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 22:20:00
  - Authors: Loom
  - Summary: Return the bounded Operating Overview repository-source composition repair: accepted host repository-read receipt facts now remain explicitly qualified through portable normalization and Overview projection, while moving-ref and unverified lookalike material remain weaker and no provider URL or canonical provenance is inferred.
  - Status: local

---

# Loom To Anchor — Operating Overview Qualified Repository Source Basis

## Handoff Parties

- Purpose: return the smallest provider-neutral composition repair needed for already-accepted repository-read material to retain explicit repository/ref/commit/path receipt evidence through portable input normalization and Operating Overview projection without elevating that evidence into canonical Source or provenance authority.
- From: Loom
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- accepted-repository-receipt-qualification
  - Transfer Kind: work-and-responsibility
  - Description: accepted `repositoryRead` host receipts now stamp an explicit Tooling-owned receipt qualification on normalized repository source material, distinguishing pinned commit material from moving-ref material while preserving repository, ref, commit, path, authority, `remoteFetch: true`, and any explicitly returned durable locator/permalink.
  - Boundary: the qualification is created only inside accepted host-receipt normalization. Familiar repository-shaped fields supplied elsewhere do not acquire it.

- portable-source-composition
  - Transfer Kind: work-and-responsibility
  - Description: portable input normalization now recognizes only the accepted receipt qualification when preserving repository source facts. Qualified repository/ref/commit/path evidence survives normalization; unqualified lookalike metadata without an existing non-local adapter remains on the local/unverified path and does not become repository evidence.
  - Boundary: portable normalization performs no repository fetch, provider traversal, canonical ownership inference, or URL construction.

- overview-repository-source-basis
  - Transfer Kind: work-and-responsibility
  - Description: Operating Overview `loadedSourceBasis` now projects accepted repository receipt evidence separately from local-file, archive-entry, and separately supplied unverified source metadata. Pinned accepted material reports `pinned-commit`; accepted material without a commit reports `moving-ref`; unverified lookalike metadata reports repository identity unavailable.
  - Boundary: `loadedSourceBasis` remains non-authoritative consumer evidence and does not replace authored artifact identity, Parent/Origin, Source semantics, publication authority, or schema qualification.

- explicit-permalink-boundary
  - Transfer Kind: work
  - Description: if an accepted host receipt explicitly carries a permalink or durable locator, portable normalization and Overview preserve that exact value. If none is explicitly carried, Overview reports permalink/durable locator unavailable.
  - Boundary: no GitHub, provider, repository, ref, commit, or path URL is synthesized from field combinations.

- adversarial-proof
  - Transfer Kind: work
  - Description: focused host receipt, portable input, and Operating Overview regressions now cover pinned accepted repository material, moving-ref accepted repository material, and repository-shaped unverified supplied metadata. The pinned specimen preserves an explicitly supplied permalink unchanged; the moving and lookalike specimens acquire no stable permalink.
  - Boundary: no local path, archive placement, package name, Workspace adjacency, or source-field resemblance can strengthen qualification.

- preservation
  - Transfer Kind: work
  - Description: `tool.bindings.test.mjs`, `portable.input.test.mjs`, and `operatingOverview.test.mjs` are green after the repair. The complete accepted portable Handoff baseline remains 21-of-21 green.
  - Boundary: no Handoff transport module, Viewer code, Business artifact, Docs schema, repository crawler, Monitoring freshness logic, remote provider traversal, or unrelated application module changed.

## Required Context

- initiating-repository-source-handoff
  - Material: exact Anchor delegation authorizing this repository-source composition tranche.
  - Material Reference: [Qualified Repository Source Basis](036-anchor-to-loom-operating-overview-qualified-repository-source-basis.trace.md)
  - Purpose: scope, qualification boundary, adversarial proof requirement, and completion contract.
  - Availability: available

- host-receipt-normalization
  - Material: host action receipt normalization with accepted repository qualification.
  - Material Reference: [tool.bindings.js](../../../src/tooling/portable/host/tool.bindings.js)
  - Purpose: Tooling-owned qualification point for accepted repository-read material.
  - Availability: available

- portable-input-normalization
  - Material: provider-neutral portable source normalization preserving accepted repository receipt facts.
  - Material Reference: [portable.input.js](../../../src/tooling/portable/input/portable.input.js)
  - Purpose: composition seam carrying qualified source basis without inference.
  - Availability: available

- operating-overview-projection
  - Material: Operating Overview loaded-source projection with accepted repository receipt basis.
  - Material Reference: [operatingOverview.js](../../../src/tooling/portable/overview/operatingOverview.js)
  - Purpose: consumer-facing pinned/moving/unverified distinction and permalink-unavailable boundary.
  - Availability: available

- host-receipt-regression
  - Material: focused accepted repository receipt normalization regression.
  - Material Reference: [tool.bindings.test.mjs](../../../src/tooling/portable/host/tool.bindings.test.mjs)
  - Purpose: proves accepted pinned/moving receipt qualification and explicit permalink preservation.
  - Availability: available

- portable-input-regression
  - Material: focused portable normalization regression.
  - Material Reference: [portable.input.test.mjs](../../../src/tooling/portable/input/portable.input.test.mjs)
  - Purpose: proves accepted receipt qualification survives while lookalike repository metadata does not strengthen.
  - Availability: available

- operating-overview-regression
  - Material: focused Overview adversarial source-basis regression.
  - Material Reference: [operatingOverview.test.mjs](../../../src/tooling/portable/overview/operatingOverview.test.mjs)
  - Purpose: proves pinned, moving-ref, lookalike, and explicit-permalink projection behavior.
  - Availability: available

## Reference Context

- complete-portable-handoff-baseline
  - Material: accepted 21-test portable Handoff regression directory.
  - Material Reference: [Portable Handoff Tests](../../../src/tooling/portable/handoff/)
  - Purpose: transport non-regression gate.
  - Availability: available

- accepted-loaded-source-foundation
  - Material: prior accepted loaded-source identity foundation.
  - Material Reference: [Loaded-Source Identity Foundation](034-loom-to-anchor-operating-overview-source-identity-foundation.trace.md)
  - Purpose: retained local-file/archive-entry distinction and authored-path preservation boundary.
  - Availability: available

## Retained Responsibilities

- repository-source-review
  - Retained By: Anchor
  - Responsibility: decide whether the returned accepted-receipt source basis is sufficient for the next Operating Overview tranche.
  - Boundary: accepting this Tooling projection does not promote receipt evidence into canonical Source/provenance semantics or publication authority.

- schema-authority
  - Retained By: Axiom
  - Responsibility: re-enter only if a later requirement needs maintained Source, Workspace, Relation, Discovery, Project, Task, Monitoring, or provenance semantics beyond this accepted Tooling receipt evidence.
  - Boundary: this tranche found no schema contradiction and makes no schema change.

- human-reference-usefulness
  - Retained By: Sigma
  - Responsibility: later judge whether repository/source references are understandable and useful in Viewer or Operations presentation.
  - Boundary: this tranche adds no Viewer integration or provider navigation.

## Exclusions And Dependencies

- no-network-fetch
  - Kind: excluded-scope
  - Description: repository read/search, network fetch, remote provider traversal, and repository crawling are not performed by this tranche.

- no-repository-inference
  - Kind: excluded-scope
  - Description: repository/ref/commit/path qualification is preserved only from accepted Tooling receipt evidence; filesystem roots, archive names, package names, nearby Workspace declarations, prose URLs, and lookalike metadata cannot create it.

- no-public-url-invention
  - Kind: excluded-scope
  - Description: public permalink and durable locator remain unavailable unless explicitly carried by accepted receipt evidence. Provider URLs are never synthesized from repository/ref/commit/path fields.

- no-canonical-provenance-promotion
  - Kind: excluded-scope
  - Description: accepted receipt qualification is not Parent, Origin, Source semantic authority, canonical repository ownership, publication authority, or proof that a ref without commit is immutable.

- no-unrelated-operating-overview-expansion
  - Kind: excluded-scope
  - Description: Monitoring freshness, remote cross-repository traversal, Viewer integration, Business mutation, Docs mutation, and application work remain deferred.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one exact complete Workspace-bearing Loom-to-Anchor package in which accepted repository-read material preserves explicit repository/ref/commit/path qualification through portable normalization and Operating Overview projection; pinned and moving-ref material remain distinguishable; unverified lookalike material remains weaker; explicit permalink evidence is preserved without URL synthesis; focused receipt/input/overview regressions and all 21 portable Handoff tests are green.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: a host receipt is canonical Source truth, a repository ref without commit is immutable, repository-shaped metadata is trusted by resemblance, an explicit receipt permalink was generated by Tooling, remote traversal occurred, or Viewer integration is complete.
- Must Not Be Used To Claim: that Tooling receipt qualification replaces Parent/Origin/Source/provenance semantics, that moving-ref material has a stable permalink, or that repository identity proves publication or ownership.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor To Loom — Operating Overview Qualified Repository Source Basis](036-anchor-to-loom-operating-overview-qualified-repository-source-basis.trace.md)
  - Value: qQupRyAezbXvC3UXdBeBU3a0XIZ51JFj4rKNi9MKK8M

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:SIVeSm46s3VUCPDDz63O97jwlx7AyoFimxvPhJOARmU
