# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 13:55:18
  - Trace: [023-3-1-anchor-to-axiom-major-012-pointerless-carrier-semantics-handoff.trace.md](023-3-1-anchor-to-axiom-major-012-pointerless-carrier-semantics-handoff.trace.md)
  - Origin:
    - [relative](023-3-1-anchor-to-axiom-major-012-pointerless-carrier-semantics-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-06 14:29:04
  - Authors: Axiom
  - Why: Major 012 needs an explicit No Handoff pointer builder choice without inventing Handoff endpoints or weakening existing exact-route behavior.
  - Summary: Keep tiinex.handoff.package.v1 as the carrier owner and add one explicit pointerless complete-Workspace Package Role with an all-none Route Discovery triplet; From/To remain Handoff-owned.
  - Status: ready/local

---

# Major 012 Pointerless Handoff-Carrier Mode Semantics Decision

## Decision

- State: resolved-smallest-canonical-change-required
- Subject: `No Handoff pointer` semantics for the Major 012 human package-builder flow
- Decision: preserve `tiinex.handoff.package.v1` as the owning receiver-facing carrier schema and make one backward-compatible canonical v1 extension: add an explicit pointerless complete-Workspace carrier mode. Existing exact-Handoff-route behavior remains unchanged. Pointerless mode must be represented by a distinct Package Role plus an all-`none` Route Discovery triplet, never by guessing, omission, a placeholder Handoff, or an inferred route.

## Basis

- The qualified current contract already owns Start/bootstrap exposure, complete package-local Workspace Snapshot Bindings, carrier-only continuity, receiver requalification, and fail-closed interpretation boundaries.
- The contradiction is isolated to Route Discovery: current `Package Role: recipient-facing-handoff-carrier` requires `Route Placement Rule: authoritative-workspace-descended`, `Continue-From Rule: exact-package-local-handoff-pointer`, and `Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors`.
- `tiinex.handoff.package.v1` is explicitly transport/discovery authority rather than Handoff transfer authority. Therefore a second narrow package role can represent pointerless complete-Workspace transport without moving `From`, `To`, Transfers, Required Context, Role participation, acceptance, or completion semantics into the package.
- Creating a second near-duplicate carrier schema would duplicate the same Start/bootstrap, complete Workspace binding, carrier continuity, qualification, and interpretation machinery. The minimum semantic change is one explicit mode inside the existing carrier contract.
- `tiinex.semantic.package.v1` is not the answer: its qualified job is schema/Transition package discovery rather than complete Workspace receiver transport.
- Generic Workspace Representation and External Payload authority remain valid for independently meaningful representation/payload semantics, but they do not by themselves replace the receiver-facing Start/bootstrap/carrier contract used by this operator flow.

## Exact Canonical Delta

### Package Identity

Extend `Package Role` with one additional closed value:

- `recipient-facing-handoff-carrier`
- `recipient-facing-workspace-carrier`

Rules:

- `recipient-facing-handoff-carrier` means the package exposes one explicit selected Handoff route and retains all current route semantics.
- `recipient-facing-workspace-carrier` means the package carries one or more qualified complete Workspace snapshots for recipient inspection/landing without selecting any Handoff route.
- Package Role is carrier semantics only. Neither role creates Handoff transfer, endpoint, acceptance, completion, Workspace identity, current-work, or Role-holder authority.

### Route Discovery

Keep all three Route Discovery fields required so the mode remains machine-explicit.

Extend their closed domains as follows:

- `Route Placement Rule`
  - `authoritative-workspace-descended`
  - `none`
- `Continue-From Rule`
  - `exact-package-local-handoff-pointer`
  - `none`
- `Pre-Handoff Closure Rule`
  - `selected-pointer-carrier-ancestors`
  - `none`

Add these rules:

- `Package Role: recipient-facing-handoff-carrier` requires the existing exact triplet:
  - `Route Placement Rule: authoritative-workspace-descended`
  - `Continue-From Rule: exact-package-local-handoff-pointer`
  - `Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors`
- `Package Role: recipient-facing-workspace-carrier` requires the exact pointerless triplet:
  - `Route Placement Rule: none`
  - `Continue-From Rule: none`
  - `Pre-Handoff Closure Rule: none`
- Mixed triplets are invalid and fail closed.
- In Handoff-carrier mode, all existing selected-route qualification and Handoff Pointer rules remain unchanged.
- In Workspace-carrier mode, no package-local selected Handoff Pointer route may be exposed. Authoritative Handoff artifacts may still exist incidentally inside a carried complete Workspace snapshot, but package membership does not select or activate them.
- `none` means absence of package-level Handoff route semantics. It must not be interpreted as an unknown Handoff, empty Handoff, implicit current Handoff, or permission to infer a route later.

### Bootstrap And Recipient Grounding

- Start/bootstrap exposure remains required in both modes.
- Handoff-carrier mode continues from Start into exact selected-route grounding exactly as today.
- Workspace-carrier mode transfers from Start/bootstrap into carrier and Workspace qualification only. It has no Handoff `ground` continuation target, no recipient Role binding, no Required Context closure, and no current-work authority.
- Workspace-carrier mode may support qualified Workspace inspection, explicit selection, and landing-plan projection, but those actions remain transport/host operations and do not become Handoff acceptance or work transfer.

### Generation And Qualification

- Keep one or more qualified complete Workspace Snapshot Bindings required in both modes.
- In Handoff-carrier mode, generation continues to fail closed when the selected route cannot be qualified.
- In Workspace-carrier mode, generation fails closed if a selected Handoff route or package-local Handoff Pointer route is supplied.
- A package generator must not silently switch modes because a route fails qualification. The operator-selected Package Role controls the intended carrier mode; route inconsistency is an error.
- Existing Handoff Package artifacts remain valid without rewriting because their current Package Role and exact route triplet continue to satisfy the expanded contract.

### Interpretation Limits

Add explicit pointerless boundaries:

- Workspace-carrier mode is not a Handoff and does not transfer work or responsibility.
- Workspace-carrier mode does not establish `From`, `To`, recipient capacity, Role holder, acceptance, completion, current Task, current Workspace, or continuation target.
- Package creator, transport sender/receiver, repository actor, selected Workspace, UI account, and file placement must not be promoted into Handoff endpoint or participation semantics.
- If bounded work/responsibility transfer, Handoff Required Context, recipient Role grounding, or a completion-facing continuation is needed, the operator must create or select a qualified `tiinex.handoff.v1` artifact and use Handoff-carrier mode.

No new generic transport ontology, carrier lifecycle, endpoint model, acceptance state machine, or Handoff semantics are authorized by this decision.

## UI-Facing Boundaries

### Handoff Leaf Selection

- The package builder may show only qualified `tiinex.handoff.v1` leaves available from the currently qualified source material intended for packaging.
- Selecting a Handoff leaf selects Handoff-carrier mode and requires one exact package-local Handoff Pointer route to that authoritative Handoff.
- If multiple qualified leaves are available, the UI must require explicit human selection. It must not guess from filename, newest timestamp, editor focus, repository focus, authorship, package order, or transport position.
- Explicit Workspace inclusion is a separate transport choice and must not itself select a Handoff.

### No Handoff Pointer

- `No Handoff pointer` is an explicit selection of `Package Role: recipient-facing-workspace-carrier`.
- The UI should communicate the consequence directly, for example: `Workspace transport only — no Handoff semantics`.
- In this mode the package builder sets the all-`none` Route Discovery triplet and emits no selected Handoff Pointer route.
- The builder must not create a placeholder Handoff, synthetic `unknown` endpoint pair, hidden default Handoff, or fallback route.
- A pointerless carrier may be qualified for Workspace inspection/landing only. It must not be projected as handed-off, accepted, current-work-grounded, recipient-role-bound, or completion-bearing.

### From / To Ownership

- `From` and `To` remain owned exclusively by the authoritative `tiinex.handoff.v1` artifact.
- Package UI may display From/To read-only from the selected qualified Handoff.
- If native Handoff creation is offered, editable From/To inputs belong to the Handoff-authoring flow and are validated/sealed as part of that Handoff before package manufacture.
- In `No Handoff pointer` mode there are no Handoff From/To endpoints to collect.
- `tiinex.handoff.package.v1` must not infer, default, copy as authority, or rewrite Handoff From/To from package creator, transport sender/receiver, repository actor, Role holder, selected Workspace, or UI account.

## Loom Implementation Contract

- Shared Tooling should expose two explicit manufacture modes backed by the same canonical `tiinex.handoff.package.v1` contract:
  - Handoff carrier: existing exact selected-Handoff route behavior.
  - Workspace carrier: pointerless complete-Workspace behavior with the all-`none` route triplet.
- VS Code remains a host adapter: it chooses a qualified Handoff leaf or `No Handoff pointer`, chooses Workspaces, previews the qualified carrier plan, and invokes shared Tooling manufacture.
- The extension must not implement route-mode semantics independently.
- Existing landing safety, Git behavior, diagnostics, Quick Fixes, watcher behavior, settings policy, branch switching, and after-landing commit/push policy remain outside this Axiom semantic turn.
- Until the canonical schema and shared Tooling accept Workspace-carrier mode, the VS Code `No Handoff pointer` option must fail closed rather than emitting a nonconforming package.

## Boundaries

- This decision does not implement VS Code UI or shared Tooling.
- This decision does not change `tiinex.handoff.v1`.
- This decision does not make package transport own From/To, transfer, Required Context, acceptance, completion, or Role semantics.
- This decision does not close Major 012.
- This decision does not authorize destructive Reduction apply, publication, deployment, release, or remote writes.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-anchor-to-axiom-major-012-pointerless-carrier-semantics-handoff.trace.md](023-3-1-anchor-to-axiom-major-012-pointerless-carrier-semantics-handoff.trace.md)
  - Value: FRCwzLCmXG6Zb1GS5W3EuQg6K4zuhgnILDmXu1fVLwU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: vMCmbKhzqSksHO92SKInQtcxgYRT7eqEDaT1fjA1mXM