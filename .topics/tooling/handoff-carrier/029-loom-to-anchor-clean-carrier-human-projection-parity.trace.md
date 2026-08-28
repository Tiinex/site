# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 20:55:00
  - Trace: [Anchor To Loom — Clean-Carrier Human Projection Parity](028-anchor-to-loom-clean-carrier-human-projection-parity.trace.md)
  - Origin:
    - [relative](028-anchor-to-loom-clean-carrier-human-projection-parity.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 21:01:00
  - Authors: Loom
  - Summary: Restore clean recipient-v2 human projection parity after serialization without restoring compatibility JSON or promoting transport metadata into semantic authority.
  - Status: local

---

# Loom To Anchor — Clean-Carrier Human Projection Parity

## Handoff Parties

- Purpose: return the bounded human transport parity repair: an ordinary serialized clean recipient-v2 package independently regenerates its readable Workspace/checkpoint/from-to filename and exact Start plus one Continue-from routing from qualified package truth.
- From: Loom
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- projection-root-cause-and-repair
  - Transfer Kind: work-and-responsibility
  - Description: the blocking `portable.handoff-carrier.missing` path was caused by the human-output wrapper accepting only the base recipient-v2 format and therefore falling back to the legacy stored carrier JSON reader for qualified artifact-first clean packages. The wrapper now treats an already-detected recipient-v2 inspection as the controlling package surface; non-v2 inputs still fall back to the legacy reader, and invalid detected recipient-v2 surfaces remain fail-closed.
  - Boundary: detection comes from recipient-v2 qualification, not filename, adjacency, JSON absence, or host wrapper semantics.

- readable-filename-regeneration
  - Transfer Kind: work-and-responsibility
  - Description: artifact-first inspection now regenerates the disposable projected filename from already-qualified Workspace id, carrier dimension, and exact Handoff From/To parties. The filename remains explicitly non-authoritative and does not participate in Handoff, Workspace, Role, Parent, acceptance, or completion truth.
  - Boundary: no new schema field, stored compatibility JSON, filename authority, or semantic duplication was introduced.

- serialized-clean-return-proof
  - Transfer Kind: work
  - Description: extended the accepted Phase 2 clean-carrier regression so a real default-produced ZIP is reloaded from disk and passed through `project-handoff-carrier-output`. Before repair the command exited blocked with `portable.handoff-carrier.missing`; after repair it returns ready, reproduces `site-001-anchor-to-anchor.handoff-package.zip`, and reproduces the exact package Start plus the one selected Continue-from Pointer while the ZIP still carries no compatibility JSON.
  - Boundary: the proof is serialized package truth, not an in-memory manufacture-only projection.

- preservation-baseline
  - Transfer Kind: work
  - Description: all 21 portable Handoff tests are green after the repair, including clean-default manufacture, explicit Phase 1/legacy compatibility paths, detached-cache rehydration, participant Role grounding, human output presentation, and adversarial fail-closed coverage.
  - Boundary: no Operating Overview, Viewer, Business, Docs, schema, or unrelated application work was started.

- operating-overview-deferral-result
  - Transfer Kind: responsibility
  - Description: the Axiom-informed Operating Overview Tooling projection tranche remains queued and unstarted pending Anchor's independent acceptance of this human transport parity repair.
  - Boundary: no Project/frontier/blocker/resource projection work belongs to this return.

## Required Context

- initiating-human-parity-handoff
  - Material: exact Anchor delegation that defines this bounded repair and return contract.
  - Material Reference: [Anchor Human Projection Handoff](028-anchor-to-loom-clean-carrier-human-projection-parity.trace.md)
  - Purpose: scope, exclusions, and acceptance boundary.
  - Availability: available

- recipient-v2-human-output-repair
  - Material: repaired recipient-v2 package-to-human-output dispatch.
  - Material Reference: [recipientV2.humanOutput.js](../../../src/tooling/portable/handoff/recipientV2.humanOutput.js)
  - Purpose: proves clean detected recipient-v2 surfaces no longer fall through to stored carrier JSON.
  - Availability: available

- artifact-first-projection-repair
  - Material: repaired artifact-first carrier projection reconstruction.
  - Material Reference: [recipientV2.artifactFirstPhase1.js](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.js)
  - Purpose: regenerates non-authoritative readable filename from qualified visible package truth.
  - Availability: available

- serialized-clean-carrier-regression
  - Material: extended default clean carrier regression with real package human projection parity proof.
  - Material Reference: [Phase 2 Clean Regression](../../../src/tooling/portable/handoff/recipientV2.artifactFirstPhase2CleanCarrier.test.mjs)
  - Purpose: red-before/green-after proof and preservation of no-JSON clean manufacture.
  - Availability: available

## Reference Context

- accepted-detached-cache-return
  - Material: accepted repair immediately preceding this tranche.
  - Material Reference: [Detached Cache Repair Return](027-loom-to-anchor-detached-cache-cold-start-rehydration-repair.trace.md)
  - Purpose: preservation checkpoint for the 21-test baseline.
  - Availability: available

- queued-operating-overview
  - Material: deferred Operating Overview delegation.
  - Material Reference: [Operating Overview Tooling Projection](024-anchor-to-loom-operating-overview-tooling-projection.trace.md)
  - Purpose: remains the queued product tranche after Anchor accepts this transport repair.
  - Availability: available

## Retained Responsibilities

- parity-acceptance
  - Retained By: Anchor
  - Responsibility: independently verify the serialized clean return projects a ready readable human filename and exact normal routing while carrying no compatibility JSON and keeping the portable Handoff baseline green.

- operating-overview-resumption
  - Retained By: Anchor; Axiom
  - Responsibility: decide/reissue the queued Operating Overview projection only after accepting this clean human transport parity result.

## Exclusions And Dependencies

- no-compatibility-json-restoration
  - Kind: excluded-scope
  - Description: ordinary clean manufacture still omits stored recipient-v2 compatibility JSON; no JSON authority was restored.

- no-transport-metadata-authority
  - Kind: excluded-scope
  - Description: filename, carrier dimension, route label, attachment naming, and host copy wrapper remain non-authoritative human progress/navigation metadata.

- no-operating-overview-or-viewer-work
  - Kind: excluded-scope
  - Description: no Operating Overview, Viewer, Business, Docs, canonical schema, or unrelated application mutation was performed.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one clean-default complete Workspace-bearing Loom-to-Anchor package whose human primary filename and exact normal inline routing regenerate from serialized package truth, with no stored compatibility JSON and all 21 portable Handoff tests green.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: filenames become semantic authority, clean carriers need compatibility JSON, artifact-first transport changes Handoff semantics, or Operating Overview work is complete.
- Must Not Be Used To Claim: a generic attachment filename is the intended normal projection, host wrappers can select routes, or compatibility metadata may substitute for qualified visible artifacts and exact payload bytes.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor To Loom — Clean-Carrier Human Projection Parity](028-anchor-to-loom-clean-carrier-human-projection-parity.trace.md)
  - Value: 7s6YbmBuDYwJ68Tig7GaavVhLyKCqZMxjZaSa1CxRtI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:khZpjE0QdCWbxAqv41BYIq5HiWW1LAOtoJhsDeB08ts
