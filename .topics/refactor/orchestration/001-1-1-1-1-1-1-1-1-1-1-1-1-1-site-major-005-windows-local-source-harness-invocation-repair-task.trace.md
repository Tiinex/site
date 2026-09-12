# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 22:43:09
  - Trace: [001-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-playthings-browser-host-execution-handoff.trace.md](handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-playthings-browser-host-execution-handoff.trace.md)
  - Origin:
    - [relative](handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-playthings-browser-host-execution-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Authors: Anchor
  - Why: Sigma executed the exact human gate and proved the Site harness fails before npm qualification on Windows despite npm working in the invoking shell.
  - Summary: Repair the Windows spawnSync npm ENOENT host invocation defect while preserving the existing local-source Playthings browser-harness contract and Major scope.
  - Status: ready/local

---

# Site Major 005 — Windows Local-Source Harness Invocation Repair

## Objective

Close the observed Sigma Windows host failure in the existing self-contained Playthings local-source browser harness without changing the Major's product scope: the harness must invoke the locally installed Node/npm toolchain portably on Windows and reach the same dependency/browser gates it already reaches on qualified non-Windows hosts.

## Reproduction

Sigma invoked the exact Site Major 005 local-source command from the Site repository. The harness failed before dependency qualification with:

`spawnSync npm ENOENT`

The surrounding shell could run `npm`, so this is a child-process executable resolution/host invocation defect inside the harness, not evidence that npm is absent from Sigma's environment.

## Done Criteria

- Reproduce or mechanically explain the Windows `spawnSync npm ENOENT` failure path.
- Resolve npm/Node invocation through an explicit portable host strategy that works on Windows without hardcoding Sigma-specific paths.
- Preserve exact local-source packaging of Core/App/Playthings and the no-first-party-publication boundary.
- Preserve bounded public third-party dependency acquisition and explicit browser-executable handling.
- Provide one front-door Sigma action with no ambiguous VS Code launch-profile choice.
- Add focused Windows-oriented regression/contract coverage that does not require a live network or browser to prove executable resolution.
- Run dependency-independent Site/harness qualification before return.
- If another blocker remains after npm invocation is repaired, preserve the smallest exact next blocker rather than widening scope.

## Dependencies

- Current Site Major 005 local-source browser harness and prior Kodax return.
- Exact Sigma browser-host execution Handoff and observed Windows `spawnSync npm ENOENT` receipt.
- Complete current Core, App, and Verse Playthings source as read-only first-party harness inputs.

## Scope

Site-owned local-source browser harness and launch/test ergonomics only. No Playthings feature work, no Core/App semantic changes, no Native Verse work, no npm publication, no hidden installation workaround.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-playthings-browser-host-execution-handoff.trace.md](handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-playthings-browser-host-execution-handoff.trace.md)
  - Value: dA37DI9WxXTAhhxg-mqBr-xoaa3NZolriW7TLhh0MYc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: GbqY6qd1ZxJAlp4dVO-IJZYbMmfgxvWRbry2bRvjAZs