# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/a83baecea45c5863254397b9d84c6004b58d07ee/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-06 11:21:00
  - Trace: [023-vscode-human-operator-bridge.task.trace.md](023-vscode-human-operator-bridge.task.trace.md)
  - Origin:
    - [relative](023-vscode-human-operator-bridge.task.trace.md)
- Current
  - Current Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/a83baecea45c5863254397b9d84c6004b58d07ee/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-06 11:22:00
  - Authors: Anchor
  - Why: Bound the utility Major against actual current Site Tooling, the new VS Code repository, and the older provenance extension before implementation.
  - Summary: Current source supports a thin bootstrap-driven VS Code adapter without moving Tiinex semantic authority into the editor extension.
  - Status: ready/local

---

# Major 012 VS Code Operator Bridge — Anchor Current-State Discovery

## Discovery Intent

- Intent: determine the smallest technically useful VS Code surface that reuses current Tiinex core/transport mechanics and materially reduces Sigma's landing/commit friction before Viewer/schema parity.
- Starting Question: can VS Code remain a thin host adapter while Handoff qualification/bootstrap and commit-message meaning continue to come from existing shared Tooling?

## Discovery Field

- Field: current Site `refactor` at `e011ca41c8f974b148ae7a31605dd2728f115a71`; current Docs `master` at `a83baecea45c5863254397b9d84c6004b58d07ee`; new `Tiinex/vscode` `master` containing only `LICENSE` and `NOTICE`; current `Tiinex/ai-provenance` VS Code extension as historical implementation evidence; current Site VS Code tasks and `tools/tiinex-commit-message.mjs`.
- In Scope: package/bootstrap qualification path; Workspace identity; local Git repo matching; safe local materialization; VS Code Source Control integration; extension settings/watcher/prompt/build architecture.
- Out Of Scope: provenance feature migration, Viewer parity, new schema families, destructive apply, deployment/release, remote Git mutation by the landing action.

## Discovery Method

- Method: inspect current remote repository state and the existing portable Tooling contracts rather than assume old extension ownership. Verify that Handoff packages already carry a declared bootstrap and that current orientation can qualify complete Workspace snapshots/routes; inspect the existing commit-message helper and VS Code task surface; inspect the old provenance extension only for host-integration patterns and size pressure.
- Repository Receipt: `Tiinex/vscode` exists as an independent public repository with `master` and only `LICENSE` plus `NOTICE` at the current baseline.
- Core Receipt: current portable Handoff tooling supports recipient orientation, package-carried bootstrap, complete Workspace snapshot qualification, multi-root carriers, and explicit non-authority boundaries.
- Commit Receipt: current repositories expose `tools/tiinex-commit-message.mjs`, which derives messages from staged Tiinex artifacts; the Site task currently surfaces it only as terminal output.
- Legacy Extension Receipt: `Tiinex/ai-provenance` is explicitly provenance-focused and its VS Code `extension.ts` has accumulated a very large host+product surface. Reusing patterns is reasonable; making it the permanent owner of generic Handoff/Git operator UX is not.

## Discovery Boundaries

- Core Boundary: Handoff/package/Workspace qualification remains owned by shared Tiinex Tooling and package-declared bootstrap. The extension may invoke and present those results but must not invent a second semantic validator.
- Host Boundary: file watching, Downloads/inbox discovery, VS Code settings, local repository enumeration, human confirmation, Source Control input, progress UI, and filesystem writes are legitimate VS Code adapter concerns.
- Landing Boundary: package qualification is not landing acceptance; repository/ref matching is an operational safety gate, not semantic authority; local replacement is never commit/push.
- Git Boundary: commit-message semantics remain in the existing repository helper. The extension may orchestrate stage/commit/push only through an explicit separate command.
- Migration Boundary: old provenance features are not automatically migrated. The new repository starts narrow and may later become the single Tiinex VS Code product only through separately qualified work.

## Discovery Outcome

- Outcome: no Axiom semantic turn is required before implementation. Current authority is sufficient for a thin VS Code adapter because the requested behavior composes existing Handoff/Workspace/Role boundaries and explicit local host actions without changing their meaning.
- Implementation Owner: Loom should implement the bounded cross-repository tranche, adding only the smallest shared Site Tooling seam that the extension cannot safely express as host IO.
- Preferred Architecture: `Tiinex/vscode` contains VS Code-native settings/watcher/prompts/SCM adapters and invokes the exact package-declared Tiinex bootstrap/common tooling for carrier qualification. It should not vendor or fork semantic core logic merely for convenience.
- Handoff Ingress Shape: opt-in watcher -> stable-file debounce -> Start/bootstrap qualification -> qualified Workspace projection -> local Git identity/clean-tree checks -> one explicit multi-repo confirmation -> safe replacement preserving `.git` and non-colliding ignored local material -> no commit/push.
- Git UX Shape: native generate-message command fills SCM input using existing helper; separate explicit stage+commit+push command uses the same helper and fails closed on repository/upstream/state ambiguity.
- Human Dogfood: after technical qualification, Sigma should receive one installable VSIX and the smallest test script/steps needed to observe actual operator friction; observations become evidence, not automatic product authority.

## Interpretation Limits

- Limits: this Discovery does not authorize a new schema, remote publication from the landing action, provenance migration, broad editor orchestration, automatic acceptance, automatic commit/push after Handoff landing, or destructive repository mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-vscode-human-operator-bridge.task.trace.md](023-vscode-human-operator-bridge.task.trace.md)
  - Value: hEbMn8l102ed8y9-qQaUgBZzF5Y7QkMIixlLS7snkk4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:Kzp9iqV9h2dj4XPUqnyNBJaO9pxIEh9i3vGY3rmXZd8