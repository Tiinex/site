# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.decision.v1](../../src/schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-07 20:08:42
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-supersession-recovery-decision.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-supersession-recovery-decision.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-supersession-recovery-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-07 20:09:00
  - Authors: Anchor
  - Why: Carry forward unfinished Major 012 objectives under a fresh Anchor and latency-aware execution discipline.
  - Summary: Replay the lost trust-spine work into shared Site Tooling and make Tiinex/vscode a thin qualified adapter before new Sigma dogfood.
  - Status: ready/local

---

# Major 013 — Validation Trust + Thin VS Code Operator Consolidation

## Objective

Continue the unfinished Major 012 work from the exact durable 0.1.5 full-source base and restore one trustworthy shared continuity/authoring/operator spine before asking Sigma to dogfood again. Reimplement and qualify the lost post-0.1.5 trust work in Site shared Tooling, then make `Tiinex/vscode` a thin native adapter over those same projections. Optimize the implementation loop for bounded active-lineage/staged work rather than repository-wide audits.

## Done Criteria

- Recovery truth is explicit: the carried Business/Docs/Site/vscode source is the 0.1.5 durable base; later untransported source is replayed/reimplemented rather than inferred as present.
- Schema-definition validation is separated from schema-instance validation. Representative exact Docs schema definitions validate through the shared path without false body-instance errors.
- Published schema reference validation distinguishes immutable commit-pinned locators from mutable branch locators; valid historical pins are not called stale merely because newer material exists.
- Ordinary trace continuity validates declared Parent locator first, then Parent Schema coherence, primary self integrity and targeted Parent/Origin integrity. A checksum match must never silently override a contradictory declared Parent locator.
- Quick Fixes remain fail-closed and holistic: only deterministic shared-core repairs are offered, and a self reseal is withheld when another known guardrail would remain broken.
- Shared editor/CLI findings include deterministic semantic location metadata sufficient for native VS Code Problems/CodeActions without the adapter inventing Tiinex meaning.
- Multi-root operator context is projected once in shared core from explicit host roots and exposes qualified Workspace identities, Role/Party endpoints, Handoff leaves and explicit `No Handoff pointer` independently from later package selection. Business + Docs + Site/playthings + vscode is a permanent adversarial fixture.
- Workspace identity stays distinct from repository basename/repository identity. Multiple Workspace artifacts may share one physical repository without being collapsed semantically; unsupported cross-root snapshot semantics fail visible rather than guessing.
- Staged-only validation accepts explicit staged Tiinex paths and uses non-staged material solely as required schema/Parent closure context. Unrelated non-staged defects do not block; required closure defects do.
- Commit-message and `Stage, Commit & Push with Tiinex` paths invoke staged validation before message generation/commit. No full-repository audit is introduced as the default pre-commit behavior.
- `Tiinex/vscode` consumes the shared operator-context, editor-assistance, authoring-parent and staged-validation projections. VS Code owns only host behavior: native diagnostics/CodeActions, panel/webview, filesystem watcher, prompts, SCM/Git invocation and scheduling/coalescing.
- Validation events are coalesced/latest-wins so repeated edits to the same document do not start an unbounded queue of child processes.
- The vscode repository does not own an independently evolving semantic core. Any `shared-core` material in a VSIX is generated/pinned build material from Site and excluded from canonical hand-authored source ownership.
- Package preview is trustworthy before destructive landing: eligible Workspaces are enumerated from host context, Handoff route selection is explicit/pointerless-capable, and raw internal error codes are translated into actionable human explanations without hiding the underlying finding.
- Fresh VSIX is built deterministically from current source. Permanent Site focused/tooling and vscode adapter/build/runtime/package tests pass before Sigma receives the candidate.
- Sigma dogfood is a natural UX pass only after internal qualification. Windows is an observation host, not normative authority.

## Scope

- In Scope: Site shared validation/resolution/integrity/editor/authoring/operator/staged mechanics; permanent trust and multi-root fixtures; CLI parity; thin vscode adapter; build/generated-core boundary; deterministic VSIX; human-readable operator errors; watcher/package preview corrections needed to reach usable dogfood.
- Preserve: Docs canonical meaning; Site shared mechanics; Role/Handoff/Workspace authority; fail-closed historical/reference semantics; `.git`/ignored-local landing safety; no automatic Git publication from package landing; Playthings isolation.
- Excluded: broad Viewer/schema parity except dependencies genuinely required by this Major; Playthings→Refactor merge/sync; destructive Reduction apply; deployment/Marketplace release; Foundation exit; bulk Docs repair; schema meaning changes unless a concrete contradiction is separately routed to Axiom.
- Default Audit Boundary: validate the active artifact/lineage or explicitly staged set plus required closure. Whole-workspace audit is explicit/on-demand only.
- Efficiency Boundary: external/network fetches are never allowed to become unbounded implementation blockers. Use hard timeouts, pinned/cached local material or fail-visible `unavailable`; checkpoint after each substantial green gate.

## Dependencies

- Recovered qualified full-source carrier from 0.1.5 with Business, Docs, Site and vscode Workspaces.
- Current Docs Root/Handoff/Role/Workspace/integrity authority carried in that snapshot.
- Current Site shared portable Tooling and Handoff package/bootstrap mechanics.
- Historical `ai-provenance` may be consulted as mechanical/reference evidence for permalink/Git/checksum/editor behavior only; it is not a second semantic authority.
- Sigma has no action requirement until a newly built candidate passes the internal gates above.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-supersession-recovery-decision.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-supersession-recovery-decision.trace.md)
  - Value: JPmXR4PTg2fAsineROSKvLy6NumHWJQkW4IX_n33pUk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: p0xV27-Re-z5ETWyN7L2GTvNCrD_iv67uiVaHZrQr04