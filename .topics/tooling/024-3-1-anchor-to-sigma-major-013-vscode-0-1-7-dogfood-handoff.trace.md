# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.evidence.v1](../../src/schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-08 02:12:00
  - Trace: [024-3-anchor-major-013-vscode-0-1-7-dogfood-candidate-evidence.trace.md](024-3-anchor-major-013-vscode-0-1-7-dogfood-candidate-evidence.trace.md)
  - Origin:
    - [relative](024-3-anchor-major-013-vscode-0-1-7-dogfood-candidate-evidence.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-08 02:16:00
  - Authors: Anchor
  - Why: Preserve the exact candidate and invite human observation without conflating Sigma feedback with technical authority or Major closure.
  - Summary: Route the internally qualified 0.1.7 candidate to Sigma for natural UX dogfood with full-source recovery and explicit authority/qualification limits.
  - Status: ready/local

---

# Major 013 VS Code 0.1.7 — Anchor To Sigma Dogfood

## Handoff Parties

- Purpose: route the internally qualified Tiinex/vscode 0.1.7 candidate to Sigma for a natural human dogfood pass while preserving exact full-source recovery and keeping technical qualification, merge/publication decisions and Major 013 closure with Anchor.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- vscode-0.1.7-human-dogfood
  - Transfer Kind: work
  - Description: install and naturally exercise the separately delivered 0.1.7 VSIX, especially the actual-path Handoff/package flow shown in Sigma's first video: cancellation, operator error presentation, Role endpoint selection, Parent/Handoff discovery, package build completion, multi-root Workspace visibility and whether the UI feels understandable without knowing internal Tiinex mechanics.
  - Controlling Artifact: [0.1.7 Candidate Evidence](024-3-anchor-major-013-vscode-0-1-7-dogfood-candidate-evidence.trace.md)
  - Boundary: Sigma reports observed human-facing behavior only. Receiving, installing, liking or approving the UX does not create technical/canonical authority or automatically authorize merge/publication.

- durable-full-source-carrier
  - Transfer Kind: work
  - Description: preserve the exact current Business, Docs, Site and vscode Workspace snapshots together with the Major 013 lineage so this candidate can be recovered without the current chat/runtime.
  - Controlling Artifact: [Major 013 Task](024-validation-trust-thin-vscode-operator-consolidation.task.trace.md)
  - Boundary: standalone VSIX bytes remain separate build output; their exact version/size/SHA-256 are bound by Candidate Evidence rather than treated as canonical source.

## Required Context

- candidate-evidence
  - Material: exact 0.1.7 source/build identity, video-derived UX regressions, deterministic build receipt, 37/37 regression state and pinned-toolchain limitation.
  - Material Reference: [0.1.7 Candidate Evidence](024-3-anchor-major-013-vscode-0-1-7-dogfood-candidate-evidence.trace.md)
  - Purpose: define exactly what Sigma is testing and what must not be inferred from a successful human pass.
  - Availability: available

- major-013-task
  - Material: controlling Major 013 objective, Done Criteria and authority/scope boundaries.
  - Material Reference: [Major 013 Task](024-validation-trust-thin-vscode-operator-consolidation.task.trace.md)
  - Purpose: preserve the wider technical closure contract beyond this dogfood pass.
  - Availability: available

- recovery-frontier
  - Material: original Major 013 recovery boundary distinguishing durable 0.1.5 source from lost/replay-only post-0.1.5 work.
  - Material Reference: [Recovery Frontier](024-1-anchor-major-013-recovery-frontier-evidence.trace.md)
  - Purpose: preserve anti-hallucination provenance across the replay.
  - Availability: available

- current-business
  - Material: current carried Business Workspace and Role authority context.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: qualify Anchor/Sigma endpoint Role references and organizational boundaries.
  - Availability: available

- current-docs
  - Material: current carried Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: canonical schema/semantic contract context.
  - Availability: available

- current-site
  - Material: exact current Site Workspace with replayed shared operator-context/staged-validation mechanics and this Major 013 dogfood lineage.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: shared Tooling implementation source and continuity.
  - Availability: available

- current-vscode
  - Material: exact current Tiinex/vscode 0.1.7 full source Workspace, including generated pinned shared-core and compiled dist material but excluding standalone VSIX binaries from canonical source carriage.
  - Material Reference: [VS Code Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: exact thin-adapter source needed to reconstruct the candidate.
  - Availability: available

## Reference Context

- predecessor-cold-start-handoff
  - Material: Major 013 Anchor-to-Anchor recovery/cold-start Handoff received by this Anchor.
  - Material Reference: [Major 013 Cold Start](024-2-anchor-to-anchor-major-013-cold-start-handoff.trace.md)
  - Purpose: previous controlling route and source-recovery boundary.
  - Availability: available

- original-major-012-task
  - Material: original Major 012 VS Code Human Operator Bridge contract.
  - Material Reference: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: inherited human-product intent that remains relevant but was superseded for sequencing by Major 013.
  - Availability: available

## Retained Responsibilities

- technical-reconciliation-and-closure
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
  - Responsibility: reconcile Sigma observations, perform exact pinned typecheck when dependencies are available, decide implementation corrections, qualify merge/publication state and close or continue Major 013 through explicit evidence.

- canonical-semantic-authority
  - Retained By: Axiom
  - Responsibility: canonical semantics only when a concrete contradiction requires it; this dogfood route does not transfer that authority.

- human-observation
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)
  - Responsibility: natural UX observation and product judgment only; no technical/canonical authority is inferred.

## Exclusions And Dependencies

- exact-pinned-typecheck-unavailable
  - Kind: unresolved-dependency
  - Description: current host lacks the pinned `@types/node 22.10.2` and `@types/vscode 1.95.0`; candidate is dogfood-ready but not merge-qualified until the exact pinned typecheck can run successfully or a separately qualified decision changes that gate.
  - Responsible Party Or Role: Anchor

- no-automatic-publication
  - Kind: excluded-scope
  - Description: this Handoff does not itself authorize commit, push, merge, Marketplace release or deployment. Sigma may preserve/commit/push this carrier under the project's existing human repository process only after deciding the candidate is worth retaining; that transport act does not rewrite the semantic authority declared here.

- standalone-vsix-separate
  - Kind: excluded-scope
  - Description: the installable VSIX is delivered separately from canonical Workspace source. Candidate Evidence binds its exact bytes; the carrier is the durable full-source recovery object.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Sigma reports whether 0.1.7 is naturally usable and whether the first-video failure path is materially improved, or identifies the next concrete human-facing blocker; screenshots/video are sufficient when useful.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: Sigma has technical authority, installing/approving 0.1.7 closes Major 013, deterministic packaging proves semantic correctness, or the current Windows/VS Code host is normative authority.
- Must Not Be Used To Claim: exact pinned typecheck pass, merge/release/publication readiness, Marketplace readiness, Foundation exit or recovery of the original lost post-0.1.5 hand-authored source.
- Authority Limits: Sigma supplies human observation; Anchor retains implementation/reconciliation/technical closure; Docs/Axiom retain canonical semantic authority where applicable; transport/commit placement does not create authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [024-3-anchor-major-013-vscode-0-1-7-dogfood-candidate-evidence.trace.md](024-3-anchor-major-013-vscode-0-1-7-dogfood-candidate-evidence.trace.md)
  - Value: v6x960RwvVdGokYFQxhJMkJDilqul5G0eWZvMW4Efs0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3watI2Npg_GUQU_vQ09MBeQpQ-FKnQd4_dzKLVy4fe0