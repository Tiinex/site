# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.evidence.v1](../../src/schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-07 20:09:22
  - Trace: [024-1-anchor-major-013-recovery-frontier-evidence.trace.md](024-1-anchor-major-013-recovery-frontier-evidence.trace.md)
  - Origin:
    - [relative](024-1-anchor-major-013-recovery-frontier-evidence.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-07 20:09:23
  - Authors: Anchor
  - Why: Preserve lineage integrity across conversation hard limit and resume from a truthful recoverable source frontier.
  - Summary: Cold-start a new Anchor on exact durable 0.1.5 full source plus explicit Major 013 recovery/replay contract.
  - Status: ready/local

---

# Major 013 Cold Start — Anchor To Anchor Handoff

## Handoff Parties

- Purpose: cold-start a new Anchor on exact durable source, explicitly supersede unfinished Major 012 into Major 013, and continue the validation-trust/thin-VS Code consolidation without repeating the prior hours of exploratory latency or hallucinating lost source.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Transfers

- major-013-direct-anchor-ownership
  - Transfer Kind: work-and-responsibility
  - Description: own Major 013 from the exact recovered 0.1.5 full-source base. Replay/reimplement the lost trust-spine work in shared Site Tooling, then integrate `Tiinex/vscode` as a thin adapter and qualify a fresh candidate before involving Sigma.
  - Controlling Artifact: [Major 013 Task](024-validation-trust-thin-vscode-operator-consolidation.task.trace.md)
  - Boundary: later transient source mentioned in Recovery Evidence is replay specification only. Do not claim it is present until reimplemented and tested in this carried source.

- latency-aware-execution-discipline
  - Transfer Kind: responsibility
  - Description: optimize for qualified value per bounded turn: active-lineage/staged validation by default, batched deterministic operations, hard timeout on network/external fetches, and durable checkpoint after each substantial green gate. Do not use broad workspace audits as a comfort behavior.
  - Controlling Artifact: [Recovery Evidence](024-1-anchor-major-013-recovery-frontier-evidence.trace.md)
  - Boundary: efficiency never authorizes bypassing fail-closed semantics or skipping required closure evidence.

## Required Context

- major-012-supersession-decision
  - Material: exact disposition of unfinished Major 012 and why Major 013 is a continuation rather than a functional closure.
  - Material Reference: [Supersession Decision](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-supersession-recovery-decision.trace.md)
  - Purpose: prevent false Major-012 closure claims and define source-recovery boundary.
  - Availability: available

- major-013-task
  - Material: new Major 013 objective, Done Criteria, scope, efficiency and authority boundaries.
  - Material Reference: [Major 013 Task](024-validation-trust-thin-vscode-operator-consolidation.task.trace.md)
  - Purpose: controlling work contract for the new Anchor.
  - Availability: available

- recovery-frontier
  - Material: exact carrier/workspace hashes, 0.1.5 dogfood defects, lost-source replay frontier and VSIX byte disposition.
  - Material Reference: [Recovery Evidence](024-1-anchor-major-013-recovery-frontier-evidence.trace.md)
  - Purpose: distinguish carried fact from replay specification.
  - Availability: available

- current-business
  - Material: carried Business Workspace.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Anchor/Role/Party authority and endpoint context.
  - Availability: available

- current-docs
  - Material: carried Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: canonical semantic contracts and Docs-first trust fixtures/source.
  - Availability: available

- current-site
  - Material: carried Site Workspace plus Major transition/recovery artifacts.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: shared Tooling source of truth and current lineage.
  - Availability: available

- current-vscode
  - Material: carried vscode 0.1.5 source Workspace with stale VSIX binary deliberately omitted.
  - Material Reference: [VS Code Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: exact thin-adapter source baseline to rebuild; next Anchor must produce a fresh VSIX from source.
  - Availability: available

## Reference Context

- original-major-012-task
  - Material: original Major 012 — VS Code Human Operator Bridge contract.
  - Material Reference: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: inherited product/safety intent; superseded for sequencing by Major 013, not declared satisfied.
  - Availability: available

- 0-1-5-dogfood-handoff
  - Material: last exact durable human dogfood source frontier.
  - Material Reference: [0.1.5 Dogfood Handoff](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-0-1-5-dogfood-handoff.trace.md)
  - Purpose: exact baseline implementation and retained dogfood boundary.
  - Availability: available

## Retained Responsibilities

- major-planning-and-technical-closure
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
  - Responsibility: direct implementation/reconciliation, specialist delegation if justified, technical qualification, fresh VSIX candidate, eventual landing/closure sequencing.

- canonical-semantic-authority
  - Retained By: Axiom
  - Responsibility: answer only concrete canonical contradictions; do not pull Axiom into ordinary implementation mechanics.

- optional-specialist-mechanics
  - Retained By: Loom
  - Responsibility: none by default. Re-enter only via bounded Handoff if the new Anchor decides specialist implementation is materially more efficient.

- human-observation
  - Retained By: Sigma
  - Responsibility: no action until Anchor explicitly returns a newly built internally qualified candidate; then natural UX observation only.

## Exclusions And Dependencies

- lost-source-replay-required
  - Kind: unresolved-dependency
  - Description: post-0.1.5 trust/operator/staged/queue work is not carried as source and must be replayed/reimplemented and requalified.
  - Responsible Party Or Role: Anchor

- fresh-build-required
  - Kind: unresolved-dependency
  - Description: outgoing package intentionally omits the stale 0.1.5 VSIX. Build a fresh deterministic VSIX only after Site/vscode source and generated shared-core are synchronized and tests pass.
  - Responsible Party Or Role: Anchor

- playthings-isolation
  - Kind: excluded-scope
  - Description: do not merge/sync Playthings into Refactor during this recovery. Playthings may be used as a legitimate multi-root host/adversarial test fixture and later selective evidence source.

- no-publication-or-human-test
  - Kind: excluded-scope
  - Description: no commit/push, Marketplace release, package landing/unpack dogfood or Sigma test is authorized merely by this handoff.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: next Anchor cold-starts from this package, performs only a bounded after-handoff sanity discovery, replays the trust/operator/staged work into carried source with frequent checkpoints, builds/qualifies a fresh VSIX, then returns either a genuinely testable Sigma candidate or one exact blocker.
- Return To: Sigma
- Return To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Interpretation Limits

- Does Not Mean: Major 012 was completed, transient later source was recovered, 0.1.5 is acceptable, or Major 013 should repeat the previous broad discovery loops.
- Must Not Be Used To Claim: publication/release readiness, Playthings merge authority, historical-pin upgrade authority, acceptance from transport, or permission to commit VSIX/generated build artifacts as canonical source.
- Authority Limits: new Anchor owns implementation/coordination; Docs/Axiom retain canonical semantic authority; Sigma remains human observation only until explicitly re-invited.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [024-1-anchor-major-013-recovery-frontier-evidence.trace.md](024-1-anchor-major-013-recovery-frontier-evidence.trace.md)
  - Value: MKD1CRTC-qqNrcf0V1EHTybe22BaTGpK8vB0WfyA6Fg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: DBksUv4qJZCWfXA-iig2g7dPtkojNketOpEUwZlLf2s