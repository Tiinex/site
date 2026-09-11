# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 20:21:49
  - Trace: [001-1-1-1-1-kodax-to-anchor-viewer-major-003-qualification-ownership-repair-return.trace.md](handoffs/001-1-1-1-1-kodax-to-anchor-viewer-major-003-qualification-ownership-repair-return.trace.md)
  - Origin:
    - [relative](handoffs/001-1-1-1-1-kodax-to-anchor-viewer-major-003-qualification-ownership-repair-return.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 20:54:04
  - Authors: Anchor
  - Why: Playthings Major 003 proved Verse-local gates green but real browser readiness is blocked by stale Site smoke assumptions and host dependency availability.
  - Summary: Reconcile the Site-owned Playthings browser smoke with the current Root Gate, visible-moment and navigation contract so the existing candidate can reach genuine real-browser qualification.
  - Status: ready/local

---

# Site Major 004 — Playthings Browser Smoke Reconciliation

## Objective

Make the Site-owned Playthings browser qualification surface match the current Playthings/App host contract so a genuine real-browser execution can test the existing product candidate instead of failing on stale smoke assumptions.

## Done Criteria

- Reconcile `tools/browser-smoke.py` with the current Playthings DOM contract, including current visible-moment reporting, Root Gate interaction, Fullscreen reachability, and the current App/Verse back-navigation labels.
- Preserve the current product behavior; this Major is a Site qualification/host repair, not a Verse feature tranche.
- Make browser executable selection explicit and bounded enough to use an already available compatible Chromium/Chrome executable without downloading or probing aggressively.
- Run all dependency-independent Site/package checks and, when the exact dependency-capable host is available, execute the real Site React/Vite Playthings browser smoke against the current App/Core/Playthings source set.
- If the real browser smoke cannot execute because the host lacks the locked dependency tree, return the exact remaining host dependency blocker without fabricating PASS.
- Return either a genuine real-browser PASS that is sufficient to route Playthings Major 003 back to Prism for Sigma-test readiness, or one smallest exact remaining blocker.

## Scope

Site-owned browser-smoke and browser-qualification host mechanics only. Small supporting Site test/fixture changes are allowed when required by the current declared contract.

## Dependencies

- Viewer/Site Major 003 completed current qualification baseline.
- Playthings Major 003 Prism evidence proving Verse-local/package/adapter qualification is green and identifying stale Site smoke assumptions.
- Exact current App/Core/Verse Playthings source snapshots.

## Exclusions

- No Native Verse extraction.
- No Playthings visual/product feature work.
- No Core semantic/Tooling changes.
- No App product redesign.
- No automatic package installation, registry workarounds, aggressive polling, or hidden browser automation beyond the bounded smoke test.
- No Sigma human acceptance claim.

## Acceptance Boundary

A machine browser PASS proves only the current bounded Site/Playthings smoke path. Sigma acceptance remains a separate human gate, and Playthings Major 003 remains open until Prism consumes the result and returns a genuine Sigma-test candidate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-kodax-to-anchor-viewer-major-003-qualification-ownership-repair-return.trace.md](handoffs/001-1-1-1-1-kodax-to-anchor-viewer-major-003-qualification-ownership-repair-return.trace.md)
  - Value: FUfYv802tYSIEUWFWMs5BpSqmk32tvBqo6TStgAJjv8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 58SXfe_4yIT5vgylbIXY7bTITqvl-uQztHNqf__5EDw