# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 21:07:51
  - Trace: [001-1-1-1-1-1-1-1-kodax-to-anchor-site-major-004-playthings-browser-smoke-reconcil.trace.md](handoffs/001-1-1-1-1-1-1-1-kodax-to-anchor-site-major-004-playthings-browser-smoke-reconcil.trace.md)
  - Origin:
    - [relative](handoffs/001-1-1-1-1-1-1-1-kodax-to-anchor-site-major-004-playthings-browser-smoke-reconcil.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 22:13:18
  - Authors: Anchor
  - Why: Site Major 004 fixed stale smoke semantics; the remaining human-test blocker is deterministic dependency composition, especially avoiding registry dependence on unpublished current Tiinex source.
  - Summary: Make current Playthings browser qualification reproducible from exact carried first-party source without requiring @tiinex package publication.
  - Status: ready/local

---

# Site Major 005 — Self-Contained Playthings Local-Source Browser Harness

## Objective

Remove the remaining first-party publication/dependency ambiguity from the Playthings human-test gate by giving Site one reproducible local-source browser harness that composes the exact carried Core, App and Verse Playthings source into a temporary Site installation, fetches only declared public third-party npm dependencies when needed, and runs the current real browser smoke without requiring `@tiinex/*` packages to be committed, pushed or published first.

## Done Criteria

- Add one Site-owned command/script that can be run from a normal Tiinex multi-repository checkout and locate/accept explicit local source roots for `Tiinex/core`, `Tiinex/app`, `Tiinex/verse-playthings`, and `Tiinex/site` without hardcoding Sigma's absolute machine paths.
- Validate the expected first-party package identities and exact versions before composing them. Fail closed on missing/ambiguous roots or package-name/version mismatch.
- Create all install/build state in a disposable temporary directory. Do not modify tracked source files, package manifests, lockfiles, Git indexes, `.release`, or source-repository `node_modules` as part of the test composition.
- Materialize exact local first-party packages using their own package boundaries (for example deterministic `npm pack`/file-tarball inputs) and rewrite only the temporary Site install descriptor so `@tiinex/core`, `@tiinex/app`, and `@tiinex/verse-playthings` resolve from those local package bytes rather than the public registry.
- Keep Site's declared public third-party dependency versions exact. Public npm network access may be used for those third-party packages on the execution host; no `@tiinex/*` publication is required for the human test.
- Run the current Site package/build gate and the repaired Site Major 004 `tools/browser-smoke.py` against that temporary composition, with explicit browser executable support suitable for Sigma's installed Chrome/Chromium.
- Preserve exact stdout/stderr/result evidence sufficient to distinguish install failure, first-party package mismatch, Vite startup failure, browser launch failure, smoke assertion failure, and genuine PASS.
- Clean the temporary composition on normal completion; when a failure is useful to debug, support an explicit keep-temp/debug option rather than silently leaving state.
- Provide one concise Sigma run instruction that starts from a full Handoff-carried current source set and does not require manual first-party npm publishing or ad-hoc symlink surgery.

## Dependencies

- Completed Site Major 004 browser-smoke reconciliation and its contract guard.
- Exact current Core, App, Site and Verse Playthings source Workspaces.
- Node/npm compatible with current package engine constraints.
- A compatible installed Chrome/Chromium executable on the human-test host.
- Public npm access only for exact declared third-party dependencies, unless the host already has a suitable npm cache.

## Scope

Site-owned test/composition tooling, focused tests and documentation. Small reusable process helpers are allowed when they stay host/test focused.

## Exclusions

- No Playthings product/visual feature work.
- No App/Core semantic changes.
- No publication of `@tiinex/*` packages.
- No Git commit/push automation.
- No Native Verse extraction.
- No hidden browser polling or general web automation beyond the bounded existing browser smoke.
- No claim of Sigma acceptance merely because the harness runs.

## Acceptance Boundary

Major 005 closes when the first-party source dependency boundary is reproducible and a full current source carrier can tell Sigma exactly one bounded command to execute. A genuine browser PASS is preferred when the role host can execute it; otherwise the return must preserve the smallest environment-only blocker and the harness must still make Sigma's later execution deterministic.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-1-1-kodax-to-anchor-site-major-004-playthings-browser-smoke-reconcil.trace.md](handoffs/001-1-1-1-1-1-1-1-kodax-to-anchor-site-major-004-playthings-browser-smoke-reconcil.trace.md)
  - Value: xI7PpF2pDtlafJRcT49fjXEBBcLmYxmSaDvTjJl1BYs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: mEcidGcjUIRZP1gi_faKWF6zN0K18O6tWNhYMgY5J3Q