# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 08:57:45
  - Trace: [011-5-1-anchor-to-kodax-schema-factory-viewer-proof-endpoint-role-qualified-handoff.trace.md](011-5-1-anchor-to-kodax-schema-factory-viewer-proof-endpoint-role-qualified-handoff.trace.md)
  - Origin:
    - [relative](011-5-1-anchor-to-kodax-schema-factory-viewer-proof-endpoint-role-qualified-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 08:58:24
  - Authors: Anchor
  - Why: The prior external Role URLs were truthful but the local manufacture closure correctly required exact carried workspace-qualified Role resolution.
  - Summary: Reissued Kodax Viewer-proof Handoff using exact workspace-qualified Business Role references for endpoint carriage and cold grounding.
  - Status: ready/local

---

# Anchor → Kodax Schema Factory Viewer Proof Handoff — Endpoint Role Qualified

## Handoff Parties

- Purpose: reissue the bounded Schema Factory Viewer proof with explicit workspace-qualified Anchor and Kodax Role references so recipient grounding can resolve exact carried Role material without inference.
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- viewer-factory-proof
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify one bounded Viewer product proof for Decision, Evidence, Handoff, and Validation Finding using the shared factory machinery already qualified by Axiom and Loom.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: do not broaden to catalog-wide schema fan-out; prove generic consumption first.

- schema-builder-readiness-proof
  - Transfer Kind: work
  - Description: expose only the reusable Viewer seams needed to demonstrate that a future Schema Builder can consume the same descriptor/capability model rather than reverse-engineering schema semantics from UI components.
  - Boundary: do not build the full Schema Builder UI in this tranche.

## Required Context

- loom-factory-reverification
  - Material: Loom schema-factory re-verification and transport-closure implementation evidence.
  - Purpose: provides the mechanically qualified shared descriptor, inheritance override, body-prose primitive, Validation Finding scale proof, and transport/grounding fixes that Viewer must consume rather than duplicate.
  - Availability: available
  - Material Reference: [Loom Factory Re-verification Evidence](011-4-1-loom-schema-factory-reverification-transport-closure-implementation-evidence.trace.md)

- axiom-factory-semantics
  - Material: Axiom schema-factory canonical repair disposition.
  - Purpose: preserves the semantic boundaries for Evidence inheritance, Decision body shape, Root abstractness, transition authority, and asymmetric companions.
  - Availability: available
  - Material Reference: [Axiom Factory Canonical Repair Disposition](011-3-1-axiom-schema-factory-canonical-repair-disposition-decision.trace.md)

- factory-task
  - Material: controlling factory qualification task.
  - Purpose: defines Done Criteria, Builder-readiness constraints, and the Sigma acceptance gate.
  - Availability: available
  - Material Reference: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)

## Reference Context

- node-graph-viewer-baseline
  - Material: existing Kodax Node Graph Verse projection evidence and current Viewer architecture.
  - Purpose: preserve the derived-projection/product architecture baseline while extending authoring capability.
  - Availability: available
  - Material Reference: [Kodax Node Graph Verse Projection Evidence](../viewer/005-1-1-kodax-node-graph-verse-projection-implementation-evidence.trace.md)

- local-docs-candidates
  - Material: carried Decision and Evidence/Inheritance Docs candidate bytes used by Loom re-verification.
  - Purpose: exact local semantic material for this bounded proof only.
  - Availability: available
  - Notes: these bytes are not remote-publication authority and must not be described as remotely landed canonical Docs.

## Retained Responsibilities

- anchor-reconciliation
  - Retained By: Anchor
  - Responsibility: reconcile Kodax product proof against Axiom semantics and Loom mechanics, stop private or duplicated logic, and prepare Sigma factory acceptance.

- sigma-factory-acceptance
  - Retained By: Sigma
  - Responsibility: accept or reject the factory pattern after actual Viewer use; broad multi-wave schema scaling remains gated until acceptance.

## Exclusions And Dependencies

- no-viewer-private-schema-policy
  - Kind: excluded-scope
  - Description: do not add schema-id-specific semantic validators, Markdown writers, transition rules, inheritance rules, or companion policy in Viewer merely to make the proof pass.

- root-remains-abstract
  - Kind: excluded-scope
  - Description: do not make Root manually creatable or synthesize Root transitions/companions for UI symmetry.

- remote-docs-publication
  - Kind: unresolved-dependency
  - Description: the repaired Docs bytes are locally carried and mechanically qualified but are not remotely published canonical authority in this tranche.
  - Responsible Party Or Role: Anchor

- broad-schema-fanout
  - Kind: excluded-scope
  - Description: do not scale beyond the bounded proof set until Anchor reconciliation and Sigma factory acceptance.

- playthings-merge
  - Kind: excluded-scope
  - Description: do not merge the Playthings branch or import Playthings-specific world semantics; only already-shared generic Viewer mechanics may be reused.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return a qualified Kodax Evidence + Handoff package showing whether Decision, Evidence, Handoff, and Validation Finding can be read/created/validated through one shared Viewer path, with exact tests and any missing generic primitive surfaced instead of privately implemented.
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: this Handoff accepts the factory, authorizes broad schema fan-out, publishes Docs remotely, or permits Viewer to redefine schema semantics.
- Must Not Be Used To Claim: Sigma product acceptance, remote canonical publication, full Schema Builder completion, broad schema coverage, or semantic authority from UI behavior.
- Authority Limits: Axiom-owned semantic boundaries and shared Tooling contracts remain authoritative; Viewer is a consumer/projection surface.
- Transport Limits: carried package filenames, dimensions, and workspace placement are transport/readability aids only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-5-1-anchor-to-kodax-schema-factory-viewer-proof-endpoint-role-qualified-handoff.trace.md](011-5-1-anchor-to-kodax-schema-factory-viewer-proof-endpoint-role-qualified-handoff.trace.md)
  - Value: mH1Vq1VoOgEFW1Y8jUFXD_79siVmOOlyb_e0J5fwnT4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: EdHWr5e_7kGnPGziLWNsGKdMTZ8s_QQ3AaVyP2xnryk