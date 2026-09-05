# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 08:58:24
  - Trace: [011-5-1-1-anchor-to-kodax-schema-factory-viewer-proof-workspace-role-grounding-handoff.trace.md](011-5-1-1-anchor-to-kodax-schema-factory-viewer-proof-workspace-role-grounding-handoff.trace.md)
  - Origin:
    - [relative](011-5-1-1-anchor-to-kodax-schema-factory-viewer-proof-workspace-role-grounding-handoff.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-04 09:49:10
  - Authors: Kodax
  - Why: Return exact Kodax implementation evidence to Anchor while preserving shared schema semantics, canonical transition authority, and Sigma acceptance boundaries.
  - Summary: Qualified bounded Viewer proof for shared factory read/create/validate consumption across Decision, Evidence, Handoff, and Validation Finding.
  - Status: ready/local

---

# Kodax Schema Factory Viewer Proof Implementation Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether the bounded Viewer product proof can read, create, and validate Decision, Evidence, Handoff, and Validation Finding through one shared schema-factory descriptor/capability/creation path without Viewer-private schema semantics.
- Evidence Role: supports technical qualification for Anchor reconciliation while leaving factory acceptance, remote Docs publication, and broad schema fan-out outside Kodax authority.

## Provenance

- Known Source: qualified Site workspace grounded from the current Anchor-to-Kodax carrier in explicit Kodax capacity, with the carried Loom factory re-verification Evidence, Axiom canonical repair disposition, controlling factory Task, and workspace-qualified Business Role endpoints available through Tiinex.
- Preservation Basis: local implementation bytes, permanent Foundation product case, shared schema-factory conformance case, canonical-transition acceptance sweep, exact schema-runtime projections, and the repository validation chain executed after the final implementation change.
- Provenance Limits: no remote write, merge, deploy, or remote Docs publication was performed; locally carried Docs candidates remain bounded input material rather than proof of remote canonical landing.

## Evidence Material

- Material: bounded Viewer implementation proving shared factory consumption for `tiinex.decision.v1`, `tiinex.evidence.v1`, `tiinex.handoff.v1`, and `tiinex.validation.finding.v1`.
- Material Kind: implementation snapshot plus deterministic validation receipts.
- Generic projection: `src/schemas/schema.factory.viewerProjection.js` derives Viewer create actions and authoring input shapes from `resolveSchemaCapabilities` plus the qualified Artifact Creation Contract. Product capability requires exact shared factory/contract readiness; the projection records canonical Transition authority as `not-invoked` rather than inferring applicability.
- Bounded proof selection: `src/app/schemaFactoryViewerProof.js` selects only the four task-authorized schemas. That list is a Viewer product-proof boundary, not schema semantics, transition applicability, companion policy, or catalog authority; Root is not selected or made creatable.
- Generic structured authoring primitive: `src/schemas/workspace/workspace.canonicalTaskDialog.views.jsx` now renders scalar fields, `ordinary-group` inputs, and repeatable `named-declaration-section` inputs from the shared factory projection. Required/optional declaration fields and literal-`none` behavior come from descriptor metadata; Handoff structured groups are not flattened into opaque JSON or free text.
- Shared create/validation command: `src/app/schemaFactoryLocalCreateCommand.js` re-projects the selected schema, rebuilds the exact creation contract, normalizes and checks the projected generic input structure, renders through `createArtifactDraftMarkdown`, validates with `validateArtifactCreationResult`, then commits only a local standalone record through existing workspace lifecycle mechanics. It refuses inherited source provenance and records `remoteWrite: false`, `sourceMutation: false`, and `transitionAuthority: not-invoked`.
- Product controller integration: `src/app/canonicalCreationProductController.js` dispatches factory actions to the shared factory-local command while preserving the existing canonical-transition create path unchanged for actual transition-backed actions. `src/app/TiinexApp.jsx` combines existing transition actions with the bounded four-schema proof actions.
- Shared read path: created proof artifacts are opened through the existing `schemaReadPresentation`/SchemaReadView path and resolve as `schema-owned`; no per-schema Viewer read renderer was added for the proof set.
- Builder-readiness seam: the Viewer projection carries the shared `tiinex.schema.factory.descriptor.v1` and exact contract-derived input descriptors, demonstrating that a future Builder can consume the same descriptor model rather than reverse-engineering schema rules from UI components. No full Builder UI was implemented.
- Handoff structural qualification: the permanent product case initially supplied an invalid `Transfers.Transfer Kind`; the shared validator correctly failed closed. The proof uses canonical `work-and-responsibility`, one of the exact allowed domain values, confirming that Viewer does not bypass factory field-domain authority.
- Permanent proof: `src/app/schemaFactoryViewerProof.case.mjs` creates all four bounded schemas, validates each creation, reads each through the shared schema-owned presentation, verifies structured Handoff rendering, Decision body-prose creation, exact transition-authority separation, local/source boundaries, and the task-bounded product scope. It is included in `tools/foundation-test-suite.contract.mjs`.
- Final validation receipt: `node src/app/schemaFactoryViewerProof.case.mjs` passed with 4 created artifacts, schema-owned read mode, 0 validation errors, structured Handoff true, and transition authority `not-invoked`; `node src/schemas/schema.factory.case.mjs` passed; Foundation suite contract reported 1 permanent entrypoint and 63 suite-owned cases; canonical-transition product acceptance sweep passed; `npm run typecheck`, `npm run ui:shape`, and `npm run architecture:shape` passed; schema-runtime projections passed 23/23; final `npm run validate` passed all chained guards and Foundation acceptance 63/63 in 13257.320 ms.

## Preservation And Fidelity

- Preservation State: implementation remains inside the grounded Site workspace and will be transported by the canonical Tiinex return carrier together with this qualified Evidence and its child Handoff.
- Fidelity Notes: schema semantics are consumed from the same shared descriptor/capability/creation/validation machinery already qualified by Axiom/Loom. Transition Definitions remain separate authority; the ordinary standalone factory create path does not synthesize transitions, Parent relations, companions, source provenance, or remote mutation.
- Known Losses: no human/browser acceptance session, Sigma factory acceptance, remote publication receipt, broad catalog fan-out, or complete Schema Builder UI is included. The proof covers read/create/validate for the bounded set; it does not claim generic editing of every schema.

## Interpretation Limits

- Not Yet Used As: Sigma acceptance, Anchor reconciliation disposition, remote publication authority, or permission to scale the factory across the full schema catalog.
- Does Not Prove: that Root is manually creatable; that ordinary artifact creation implies a canonical Transition Definition; that local UI behavior can override Axiom/Loom schema semantics; that repaired Docs candidates are remotely canonical; or that all schema shapes are now product-supported.
- Must Not Be Treated As: authorization for Viewer-private validators/writers, transition synthesis, companion invention, schema-id-specific semantic branching, broad schema fan-out, merge/deploy, or remote mutation.

## Review Notes

- Missing generic primitive resolved generically: the only product-layer gap exposed by the bounded proof was structured form projection for factory `ordinary-group` and `named-declaration-section` bindings. It was implemented from shared descriptor metadata rather than as Handoff-specific UI policy.
- No missing Loom semantic primitive remains for this bounded read/create/validate proof. Any future schema whose qualified factory binding cannot be represented by the generic projection must fail closed and return that missing primitive to Anchor/Loom rather than add private Viewer schema rules.
- Root remains abstract; canonical transition authority remains distinct; broad schema fan-out remains gated by Anchor reconciliation and Sigma acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-5-1-1-anchor-to-kodax-schema-factory-viewer-proof-workspace-role-grounding-handoff.trace.md](011-5-1-1-anchor-to-kodax-schema-factory-viewer-proof-workspace-role-grounding-handoff.trace.md)
  - Value: EdHWr5e_7kGnPGziLWNsGKdMTZ8s_QQ3AaVyP2xnryk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Emg8lJcDdZSUw3VxKBvF7RfDarmIq0TiLj8SGgtgVpM