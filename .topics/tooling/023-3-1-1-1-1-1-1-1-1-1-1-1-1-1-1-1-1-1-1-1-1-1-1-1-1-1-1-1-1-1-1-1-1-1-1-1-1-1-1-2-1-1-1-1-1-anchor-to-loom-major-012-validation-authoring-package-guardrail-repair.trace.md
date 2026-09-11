# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-06 23:37:23
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-anchor-major-012-validation-authoring-guardrail-discovery.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-anchor-major-012-validation-authoring-guardrail-discovery.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-anchor-major-012-validation-authoring-guardrail-discovery.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 23:37:36
  - Authors: Anchor
  - Why: Sigma fifth dogfood showed enough related guardrail gaps that another narrow one-bug repair would force unnecessary human debugging; Loom should reconcile the shared core coherently.
  - Summary: Route one broader shared-core correctness tranche covering permalink/Parent integrity, holistic Quick Fix, Role/Party endpoint selection, and Workspace package identity.
  - Status: ready/local

---

# Major 012 Validation, Authoring And Package Guardrail Repair — Anchor To Loom

## Handoff Parties

- Purpose: repair the remaining fifth-dogfood correctness gaps in shared Tiinex Tooling and the thin VS Code adapter so Sigma no longer has to manually discover malformed schema references, Parent integrity defects, endpoint-reference omissions, or Workspace identity collisions.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- shared-validation-guardrail-composition
  - Transfer Kind: work-and-responsibility
  - Description: audit and strengthen the shared editor-assistance/audit path so exact schema-reference fidelity, Parent artifact/schema coherence, targeted Parent/self integrity, and deterministic holistic repair are evaluated together before returning clean or Quick Fix state.
  - Boundary: reuse current shared lineage/integrity mechanics where possible; historical ai-provenance is implementation evidence only and must not become authority or a parallel validator.

- native-handoff-endpoint-authoring
  - Transfer Kind: work-and-responsibility
  - Description: expose qualified Role/Party endpoint choices through the thin VS Code authoring surface, automatically preserving exact references; use free text only for `Kind: unknown`.
  - Boundary: do not invent `other`, holder identity, delegation, acceptance, or new Handoff semantics.

- workspace-package-selection-identity
  - Transfer Kind: work-and-responsibility
  - Description: repair package-source projection so multiple qualified Workspace artifacts associated with the same repository remain distinct selectable Workspaces and do not fail merely because repository basenames collide.
  - Boundary: semantic Workspace identity and physical repository snapshot deduplication must remain separate concerns.

- focused-regression-and-vsix-return
  - Transfer Kind: work
  - Description: add realistic regressions for the fifth-dogfood malformed/reference/integrity/package cases, run the appropriate shared focused qualification plus VS Code tests/build, and return one installable VSIX candidate with exact evidence.
  - Boundary: do not claim Sigma acceptance, Major closure, publication, or remote landing.

## Required Context

- sigma-fifth-dogfood-feedback
  - Material: fifth-dogfood validation/authoring/package feedback artifact
  - Material Reference: [Sigma Feedback](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-sigma-major-012-fifth-dogfood-validation-authoring-package-guardrail-feedback.trace.md)
  - Purpose: exact human-observed acceptance defects and required behavior.
  - Availability: available

- anchor-guardrail-discovery
  - Material: Anchor current-state and ai-provenance harvest discovery
  - Material Reference: [Anchor Discovery](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-anchor-major-012-validation-authoring-guardrail-discovery.trace.md)
  - Purpose: separates current canonical/shared mechanics from historical implementation evidence and bounds the required repair.
  - Availability: available

- current-major-task
  - Material: Major 012 controlling task and accepted dogfood lineage already present in the carried Site Workspace.
  - Material Reference: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: preserve operator-bridge boundaries and human dogfood closure gate.
  - Availability: available

- current-docs-authority
  - Material: carried Docs Workspace including current Root, Handoff, Party/Role and continuity/integrity contracts.
  - Purpose: canonical semantic authority for all guardrails; use current contracts rather than historical ai-provenance wording when they differ.
  - Availability: available

- current-vscode-candidate
  - Material: carried vscode Workspace containing the 0.1.4 thin adapter and its tests/build surface.
  - Purpose: exact implementation baseline to repair without redesigning unrelated UX.
  - Availability: available

## Reference Context

- historical-ai-provenance
  - Material: `Tiinex/ai-provenance` historical VS Code continuity-validation implementation.
  - Purpose: proven implementation reference for permalink parsing/local Git resolution, Parent coherence, targeted checksum validation and fail-visible continuity states; not current semantic authority.
  - Availability: available

## Retained Responsibilities

- architecture-and-closure
  - Retained By: Anchor
  - Responsibility: reconcile the returned tranche, decide whether any semantic gap remains, and route another Sigma dogfood candidate or withhold acceptance.

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: resolve only a concrete contradiction/insufficiency in current Docs authority if Loom cannot implement the required guardrail without inventing meaning.

- human-dogfood
  - Retained By: Sigma
  - Responsibility: observe the next VSIX naturally; Sigma is not required to debug or provide technical qualification.

## Exclusions And Dependencies

- no-parallel-validator
  - Kind: excluded-scope
  - Description: do not copy ai-provenance wholesale into VS Code or create a second semantic validator beside shared Site core.

- no-network-assumption
  - Kind: excluded-scope
  - Description: do not require arbitrary outbound network access for correctness. Use carried/current Workspace providers and local Git immutable history where qualified; otherwise fail visibly as unresolved.

- no-major-closure
  - Kind: excluded-scope
  - Description: this implementation return cannot close Major 012 without Anchor reconciliation and subsequent Sigma human dogfood.

- no-playthings-sync
  - Kind: excluded-scope
  - Description: Playthings remains a deferred evidence/harvest track and must not be merged or synchronized in this tranche.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one qualified Loom result where the shared guardrail composition catches the fifth-dogfood reference/Parent/integrity defects, deterministic repairs cannot produce false-clean state, Role/Party endpoint selection is qualified and reference-preserving, Workspace package choices no longer collapse by repository basename, and the rebuilt VSIX passes focused technical qualification.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: historical ai-provenance becomes canon, every relative schema link is invalid, unresolved remote material may be guessed, technical PASS equals Sigma acceptance, or package snapshot identity becomes Workspace semantic identity.
- Must Not Be Used To Claim: Major 012 closure, publication, remote landing, Playthings parity/sync, deployment/release readiness, or new schema authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-anchor-major-012-validation-authoring-guardrail-discovery.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-anchor-major-012-validation-authoring-guardrail-discovery.trace.md)
  - Value: srR2pIH5OhC7Vpucgq20yPApfxBgYvP0sTpKDHJtWlg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: aq4_-kFvMvH_2ZENzAhQEUVYFQMkVAbArd8KJIc4Pqg