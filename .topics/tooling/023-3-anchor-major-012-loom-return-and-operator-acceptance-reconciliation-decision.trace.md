# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 13:44:33
  - Trace: [023-2-1-1-loom-to-anchor-major-012-vscode-operator-implementation-return-handoff.trace.md](023-2-1-1-loom-to-anchor-major-012-vscode-operator-implementation-return-handoff.trace.md)
  - Origin:
    - [relative](023-2-1-1-loom-to-anchor-major-012-vscode-operator-implementation-return-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-06 13:54:29
  - Authors: Anchor
  - Why: Loom returned a qualified bounded implementation, while later Sigma operator criteria expose implementation gaps plus one canonical pointerless-package contradiction that Anchor must reconcile before dogfood.
  - Summary: Accept Loom's returned VS Code operator bridge as a qualified implementation foundation but keep Major 012 open for human-operator acceptance follow-through and one pointerless-carrier semantic reconciliation.
  - Status: ready/local

---

# Major 012 Loom Return And Human-Operator Acceptance Refinement — Anchor Decision

## Decision

- State: accepted-as-qualified-foundation-not-major-closure
- Subject: Major 012 — VS Code Human Operator Bridge after Loom implementation return and Sigma acceptance refinement
- Decision: accept Loom's returned Site shared landing-plan seam, thin `Tiinex/vscode` host adapter, deterministic VSIX, and technical qualification as a valid implementation foundation, but do not route Sigma dogfood or close Major 012 yet. The current return implements the earlier bounded operator bridge and explicitly excludes or omits several later human-operator acceptance requirements that Anchor now adopts for this utility Major.

## Basis

- The returned carrier cold-starts cleanly with Business, Docs, Site, and vscode Workspaces qualified and the Loom-to-Anchor route grounded-to-act.
- Loom preserved the core/host boundary: package-declared ingress performs initial qualification, current shared Site Tooling owns landing-plan projection, and VS Code performs only host filesystem/Git/UI execution.
- Loom reports focused/tooling 4/4 with 17/17 focused cases, integration 12/12 with 47/47 integration cases, Foundation acceptance 69/69, VS Code TypeScript plus 12/12 bridge cases, real-carrier no-write landing-plan dogfood, and a byte-deterministic local VSIX.
- Source review confirms the returned extension currently exposes only Land Handoff Package, Generate Tiinex Commit Message, Stage/Commit/Push, and Select Handoff Inbox plus three settings (`handoffInbox.enabled`, `handoffInbox.path`, `nodePath`). Landing itself always stops before commit/push and wrong-branch state is a blocking landing-plan condition rather than an interactive branch-switch flow.
- Sigma's later operator acceptance refinements are high-signal human workflow evidence, not semantic authority by themselves. Anchor independently judges them appropriate for Major 012 because the purpose of this inserted utility Major is to expose enough of the already-qualified Tiinex core to a human operator to reduce transport friction and surface blind spots before Viewer/schema parity resumes.
- Current canonical `tiinex.handoff.package.v1` requires Route Discovery with `Continue-From Rule: exact-package-local-handoff-pointer` and instructs generation to fail closed when a required binding or selected route cannot be qualified. Therefore VS Code must not invent a pointerless `tiinex.handoff.package.v1` mode locally.

## Acceptance Gap Disposition

- Implementation follow-through required before Sigma dogfood:
  - native schema-driven diagnostics that select the applicable qualified validator(s) and place Error/Warning diagnostics on the relevant document line where deterministic location evidence exists;
  - native deterministic Quick Fixes for bounded hygiene, with envelope/footer integrity hygiene the first priority and no LLM-only repair hidden behind a quick fix;
  - compact, sensible Tiinex settings categories rather than a flat/bloated settings surface;
  - Handoff discovery policy supporting `manual` and opt-in `auto`, with conservative defaults;
  - after-landing commit policy `no | ask | yes`, default `no`;
  - after-landing push policy `no | ask | yes`, default `no`, evaluated only after a successful landing-created commit and never as force-push/upstream invention;
  - branch mismatch flow that shows the expected ref/branch as an operational safety constraint, offers an explicit branch switch only when Git can safely perform it, and aborts the whole landing if the user declines or checkout cannot qualify;
  - selected Handoff opening policy `no | ask | yes`, default `no`, using the qualified route target rather than filename guessing;
  - native Handoff artifact creation through the same shared schema creation/authoring/validation/integrity path used by Tiinex Tooling, with no manual Markdown/envelope/footer work required from the operator;
  - native Handoff package builder UX that shows only currently qualified Handoff leaves as selectable route candidates, allows explicit Workspace inclusion, excludes `.git`/ignored/runtime/generated material according to the qualified package-manufacture boundary, previews the resulting carrier plan, and invokes shared manufacture rather than implementing ZIP semantics in VS Code.
- The existing explicit Stage/Commit/Push command may remain as a separate manual action even after after-landing policies are added.
- Settings must default to the least destructive behavior. Core safety invariants such as package qualification, repository identity matching, dirty-tree blocking, path traversal rejection, confirmation before replacement, and no force publication remain fixed behavior rather than optional toggles.
- From/To endpoint semantics belong to the authoritative `tiinex.handoff.v1` artifact, not to `tiinex.handoff.package.v1`. VS Code may collect From/To while creating a Handoff artifact or display them from a selected qualified Handoff, but package UI must not manufacture endpoint meaning merely because a carrier is being built.

## Next Bounded Work

- Axiom / declared semantic authority must first resolve the one genuine semantic/core gap: Sigma wants package creation to always permit `No Handoff pointer`, while current `tiinex.handoff.package.v1` requires an exact selected Handoff Pointer route. Determine whether pointerless human transport should use an already-authorized different carrier/artifact shape or requires the smallest canonical Handoff Package/core contract change. Preserve the rule that package transport itself does not own Handoff From/To semantics.
- After that semantic return, Loom should perform one bounded implementation follow-through covering the implementation acceptance gaps above and consuming the exact Axiom disposition for pointerless package UX.
- Major 012 remains open. Sigma dogfood should begin only after Anchor independently reconciles that follow-through into an installable VSIX whose native operator path no longer requires tasks.json/manual scripts for the accepted Handoff workflows.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-2-1-1-loom-to-anchor-major-012-vscode-operator-implementation-return-handoff.trace.md](023-2-1-1-loom-to-anchor-major-012-vscode-operator-implementation-return-handoff.trace.md)
  - Value: qnPJNCV5ikmIvRJOv4bOvW3ksCJLrtToG_8ISyybKjw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: x0uUpX6gBcDjZzc9l9wkvhOU-Qjd5_Rii5kfasqCmuA