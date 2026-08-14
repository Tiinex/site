# M1 Import / Bootstrap / Local Storage Gate — v369

Status: **M1 closed/requalified at v369; M2 Workspace Spine opened in v370.** This document remains the historical M1 readiness record.

## Acceptance evidence already consumed

The v366 human acceptance flow exposed enough evidence to stop the original milestone attempt without another debug round:

1. Workspace Artifact `Open` kept the origin/source workspace visibly open, unlike PoC replacement semantics.
2. Hosted/config startup produced a different first useful workspace set than the PoC.
3. The Add surface promoted bootstrap/config plumbing to primary product actions instead of preserving the PoC hierarchy.

At least one automated v366 test explicitly protected the wrong Open behavior. Green checks therefore cannot erase the failed acceptance result.

## v367 recovery evidence already architect-verified

Architect independently verified v367 against `.old/`:

- Open/merge now encode PoC replacement vs retention semantics.
- Startup creates/materializes all configured `Workspace Entrypoints` marked `Open On Apply` in declared order.
- Primary Add choices match the PoC hierarchy.

That review found no new blocker in the intended v367 correction itself. Subsequent Q recovery feedback plus bounded architect discovery nevertheless failed the recovery gate by showing that workspace/app config still lived in the wrong product domain and that schema/type inference could incorrectly grant Workspace Open/Merge capability.

## v368 recovery evidence

v368 consolidates those concerns behind one workspace-entrypoint lifecycle:

- hosted/default startup, Workspace Artifact Open/Merge and page/global workspace-file intake consume the same workspace-set lifecycle semantics;
- page/global workspace-file intake uses Open/Merge, while a workspace file dropped onto a concrete workspace remains artifact/material intake;
- `Tiinex app config` is absent from Add-to-workspace;
- Workspace Open/Merge capability is owned by actual workspace-artifact path/explicit canonical role, not `schema.includes("workspace")` or `kind.includes("workspace")`;
- `tiinex.workspace.v1.schema.md` is a schema definition and has no Workspace Open/Merge capability;
- primary cards no longer explain internal source/local role architecture.

## v369 contract-closure evidence

- default startup uses the shared workspace-entrypoint Open lifecycle rather than a duplicate state machine;
- record Open/Merge actions consume the canonical capability result per action;
- legacy candidate migration emits the canonical workspace-artifact role schema and separate flags.

## Historical gate outcome

Architect independently verified the v369 contract closure and requalified/closed M1 before opening M2 in v370. The original failed acceptance attempt remains part of the evidence history; closure does not rewrite it as a first-pass success.

Q was not used as an ordinary implementation debugger during the recovery. v370 proceeds from the closed M1 contract and does not reopen its import/bootstrap/Open/Merge model.
