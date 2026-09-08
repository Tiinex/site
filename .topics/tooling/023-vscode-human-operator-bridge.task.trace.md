# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/a83baecea45c5863254397b9d84c6004b58d07ee/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-06 11:20:00
  - Trace: [022-8-anchor-major-011-durable-closure-decision.trace.md](022-8-anchor-major-011-durable-closure-decision.trace.md)
  - Origin:
    - [relative](022-8-anchor-major-011-durable-closure-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/a83baecea45c5863254397b9d84c6004b58d07ee/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-06 11:21:00
  - Authors: Anchor
  - Why: Major 011 is durably closed and early human dogfood of already-built Tiinex transport/Git mechanics can reduce Sigma friction and expose blind spots before the larger Viewer/schema-parity segment.
  - Summary: Build a thin VS Code operator bridge over shared Tiinex core behavior for Handoff ingress/landing and native Git commit workflow without duplicating semantic authority in the extension.
  - Status: ready/local

---

# Major 012 — VS Code Human Operator Bridge

## Objective

Make `Tiinex/vscode` the smallest useful native VS Code entrypoint over existing Tiinex core mechanics so a human operator can receive a Handoff package, safely land its qualified Workspaces into matching local repositories, generate Tiinex commit messages through the same existing derivation logic, and explicitly stage/commit/push without turning the extension into a second semantic core.

This is an intentional utility insertion before Viewer/schema parity. Its product value is early dogfood: Sigma should be able to use the real transport loop with materially less manual ZIP/repository friction and report human-facing blind spots while the deeper Viewer work is still ahead.

## Done Criteria

- `Tiinex/vscode` is a standalone thin VS Code extension repository with a durable `tiinex.workspace.v1` entrypoint and minimal host-adapter architecture.
- Core rule: if behavior is meaningful outside VS Code, semantic/qualification logic stays in shared Tiinex Tooling or another declared core owner. VS Code owns only host integration such as settings, filesystem watching, prompts, Source Control UI, progress, and local filesystem/Git execution.
- Handoff inbox auto-discovery is opt-in and can use a platform-aware default Downloads/inbox location or an explicit user-selected path. The watcher debounces partial downloads and ignores unrelated files.
- A detected Handoff package is first qualified through the package-declared Tiinex bootstrap/common carrier path. The extension does not invent a parallel package validator or infer authority from filename/ZIP placement.
- The extension projects the carried qualified Workspaces and matches each intended local target against explicit Workspace repository identity plus local Git repository identity. Ref/branch may be used as an operational safety constraint but never as semantic authority. Ambiguous/missing matches fail closed.
- Before landing, each target Git worktree must be clean except ignored material. Tracked modifications and non-ignored untracked files block the operation; the extension does not auto-stash or auto-merge.
- The confirmation UI shows every repository that will be affected and states that `.git` plus unrelated ignored local material are preserved and that no commit/push will occur. One explicit human confirmation is required before writes.
- Landing replaces the qualified non-ignored workspace source surface while preserving `.git`. Ignored paths not present in the incoming snapshot are retained; an incoming-path collision with preserved ignored local material fails visible rather than silently diverging. Safe path handling prevents traversal outside the target repository.
- Landing never commits or pushes. Handoff transport/landing does not imply acceptance, completion, or authority.
- Native `Generate Tiinex Commit Message` uses the repository's existing `tools/tiinex-commit-message.mjs` derivation rather than reimplementing commit semantics in the extension and fills the relevant VS Code Source Control input.
- A separate explicit `Stage, Commit & Push with Tiinex` command stages the selected repository, uses the same derivation path, commits, and pushes the current upstream. It fails closed on no changes, detached HEAD, unresolved repository selection, missing upstream, or commit-message derivation failure.
- Multi-root VS Code workspaces are supported with explicit repository selection/matching; no repository is guessed from terminal cwd or UI focus alone.
- The first utility build is installable as a local VSIX and has permanent automated tests around package detection/debounce, repo matching, dirty-tree blocking, confirmation-plan projection, ignored-path preservation boundaries, path traversal rejection, commit-message invocation, and Git failure cases.
- Sigma is invited only for bounded human UX observation after technical qualification; Windows is an observation host, not a normative platform gate.

## Scope

- In Scope: new `Tiinex/vscode` thin extension; package watcher/settings; package bootstrap invocation; qualified Workspace landing plan and local materialization; Source Control commit-message integration; explicit stage/commit/push command; multi-root repository matching; tests/build/VSIX; minimal Site/shared Tooling changes only when a portable core seam is genuinely missing.
- Preserve: Handoff/Workspace/Role/Task authority boundaries; same package/bootstrap semantics for humans and LLMs; `.git` and ignored-local safety; no automatic Git publication from landing.
- Excluded: migration of the old `ai-provenance` extension feature set; broad Viewer embedding; new canonical schema semantics unless a concrete contradiction forces Axiom review; destructive Reduction apply; Pages/deployment/release; Playthings transfer; Foundation exit; telemetry/monitoring unrelated to the bounded operator flow.
- Repository boundary: `Tiinex/vscode` should remain a thin adapter. Existing `ai-provenance` is evidence/reference only for reusable VS Code patterns, not the new product owner.

## Dependencies

- Current canonical Handoff Package, Workspace, Handoff, Role, and Root authority in Docs.
- Current Site portable bootstrap/common carrier implementation and existing `tools/tiinex-commit-message.mjs` behavior.
- `Tiinex/vscode` remote currently contains only `LICENSE` and `NOTICE`; this clean baseline is the intended implementation start.
- Human operator confirmation remains explicit for local workspace replacement.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [022-8-anchor-major-011-durable-closure-decision.trace.md](022-8-anchor-major-011-durable-closure-decision.trace.md)
  - Value: M-krt3CVOU_gNscR-5u87Q7wPLIpkqrN3OGLYa4L8Eo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:hEbMn8l102ed8y9-qQaUgBZzF5Y7QkMIixlLS7snkk4