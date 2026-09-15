# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 21:41:15
  - Trace: [003-secondary-anchor-site-browser-gate-continuation-task.trace.md](../orchestration/003-secondary-anchor-site-browser-gate-continuation-task.trace.md)
  - Origin:
    - [relative](../orchestration/003-secondary-anchor-site-browser-gate-continuation-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-15 13:35:08
  - Authors: Anchor
  - Why: Preserve the observed Sigma host failure, exact source-package boundary and smallest Site-owned repair without widening into App or Playthings mutation or claiming browser acceptance.
  - Summary: Qualified Site-only Vite dev correction for the Windows @tiinex/app ?raw dependency-optimizer failure; App/Playthings remain unchanged and Sigma Windows confirmation remains pending.
  - Status: ready/local

---

# Secondary Anchor Site — Windows Vite Dev Dependency-Optimizer Repair Evidence

## Supported Claim Or Question

- Supported Claim Or Question: Does the current thin Site compose the source-distributed `@tiinex/app` package correctly for local Vite development on Windows, and what bounded Site-owned correction is justified by the observed Sigma host failure?
- Evidence Role: Preserve the exact observed failure, package-boundary qualification, minimal Site delta, focused tests, and remaining Windows confirmation gate without claiming a browser/product PASS.

## Provenance

- Known Source: Exact Tiinex-qualified carried Site/App/Core/Verse Playthings Workspace material from selected return route `001-6-1-1-1-handoff-pointer.trace.md`, plus Sigma's observed Windows `npm run dev` failure from this conversation.
- Qualified Source Basis: Tiinex materialized exact carried `site`, `app`, `core`, and `verse-playthings` Workspace bytes from the selected Site/Playthings secondary-Anchor carrier. Site was independently materialized a second time as an untouched comparison baseline.
- Human Host Observation: Sigma started the qualified Site with `npm run dev` on Windows after the carried thin-Site frontier was landed. Vite reached dependency optimization and failed while resolving query-bearing App source paths ending in `?raw`, reporting Windows OS error 123 (`The filename, directory name, or volume label syntax is incorrect`).
- Package Contract Qualification: `@tiinex/app@0.1.1` exports `@tiinex/app/viewer` directly to `./src/viewer.js`; its npm `files` contract ships `src`; an actual `npm pack --json --ignore-scripts` produces the previously qualified 573,396-byte App tarball with SHA-256 `072d5d54acba06063c28d9b892c36a97bc25c1d21025d1889d9c28c93dc244f6`, including `src/viewer.js` and the Markdown assets consumed by App source. App source contains 21 `?raw` asset-query imports. This proves the current package is intentionally source-distributed rather than a precompiled browser bundle.
- Scope: Site-owned Vite development composition only. App and Playthings source are unchanged.
- Provenance Limits: No Windows rerun with the corrected config, rendered browser interaction, Playwright execution, remote repository state, publication state, or Sigma UX acceptance is claimed by this evidence.
- Preservation Basis: Exact Tiinex-carried Workspace bytes, second untouched Site materialization, deterministic SHA-256 file comparison, actual App `npm pack --json --ignore-scripts` output, and a dependency-independent Site TAP run against exact carried first-party package bytes.

## Evidence Material

- Material: Site `vite.config.ts`, `README.md`, new `test/vite-dev-contract.test.mjs`, exact carried App package metadata/source, actual App pack receipt, focused Site TAP receipt, and Sigma Windows dev-server failure observation.
- Material Kind: Exact Site source/test/documentation delta plus qualified carried first-party source and bounded host execution evidence.
- Site entrypoint remains `src/main.jsx` importing `mountTiinexApp` from `@tiinex/app/viewer`.
- Site deployment config remains `tiinex.config.js` importing `createPlaythingsVerse` from `@tiinex/verse-playthings/app`.
- Production build contract is unchanged; the correction is under Vite's development-only dependency optimizer configuration.
- `vite.config.ts` now excludes `@tiinex/app` from `optimizeDeps`, allowing the normal Vite transform pipeline to process App's valid ESM source and asset queries instead of dependency pre-bundling that source.
- New regression guard `test/vite-dev-contract.test.mjs` verifies that the official Site Vite config preserves this source-package treatment.
- README now records the local-development reason and boundary.

## Source Delta

- `vite.config.ts`: SHA-256 `294db3dfc757ab30c83ab97fde3fc2ca1fb6fb754240caf97d26bbcb5dc55e8c` -> `c4cd16a13c290b0bea0dbb6cbbd95522733031403bcba3a06161a3b12e0ec8a8`.
- `README.md`: SHA-256 `9adf42f964c2869a6e18801ab12c5475fb85bf7d0e88958d17d0e69654e0e7cf` -> `d0c504defa9ca2dc5b169c8c92b621a96da2e6169ba45baa67c805578e31010e`.
- New `test/vite-dev-contract.test.mjs`: SHA-256 `13f7291e87976d092e917a356da97c38d1b2284b9044e77fa8178188d1e90602`.
- No App, Core, or Verse Playthings source delta was introduced.

## Qualification

- Focused/local Site test suite was run with exact carried first-party Workspaces wired only for Node module resolution; result: 13 tests passed, 0 failed.
- The passing suite includes the existing thin-Site deployment boundary, real Playthings package registration, local-source browser harness contracts, current browser-smoke contract, and the new Vite dev source-package regression guard.
- This execution host cannot run the dependency-equipped Vite server/build because public npm DNS is unavailable and exact third-party Vite dependencies are not cached. No alternate dependency version or synthetic Vite implementation was substituted.

## Preservation And Fidelity

- Preservation State: App, Core and Verse Playthings source remain byte-unchanged; Site runtime composition and production-build settings remain unchanged except for the development-only dependency optimizer exclusion.
- Known Losses: This host cannot execute the dependency-equipped Vite dev server because public npm DNS is unavailable and exact third-party packages are not cached. Windows confirmation therefore remains external.
- Fidelity Notes: The correction preserves App as a normal Site dependency and preserves the package's source-distributed public entrypoints; it changes only how Vite treats that package during development pre-bundling.

## Reconciliation Result

- The observed Windows failure is consistent with a Site development-host composition defect, not a Playthings import defect and not evidence that App should stop being a dependency.
- The current App package is correctly a dependency and intentionally distributes ESM source. Site therefore owns the bounded browser-host choice to avoid pre-bundling this first-party source package during development.
- The smallest justified correction is Site-only: exclude `@tiinex/app` from Vite dependency optimization. No App or Playthings implementation change is currently justified.

## Remaining Gate

- Sigma should land this Site delta and rerun `npm run dev` on Windows.
- A successful dev-server start only clears this Windows local-development blocker; it does not constitute the separate automated real-browser gate, Playthings Major 003 closure, or Sigma product/UX acceptance.
- If `npm run dev` reaches the browser after this correction, Sigma may perform the intended manual Site + Playthings product observation while the automated Playwright/Python gate remains a separate technical contract to reconcile later.

## Interpretation Limits

- Does Not Prove: Windows confirmation of the new Vite config, rendered browser success, Playthings behavior, automated `status: passed` / `realBrowser: true`, or Sigma acceptance.
- Not Yet Used As: a Sigma acceptance result, automated real-browser PASS, Playthings Major 003 closure, release/deployment approval, or App/Playthings mutation authority.
- Must Not Be Treated As: proof that the full Site/Playthings browser path is accepted, proof that automated browser qualification is unnecessary, or authority to alter App/Playthings semantics.
- Must Not Be Used To Claim: that App is not a dependency, that Playthings package registration was defective, or that dependency optimization should be disabled globally.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-secondary-anchor-site-browser-gate-continuation-task.trace.md](../orchestration/003-secondary-anchor-site-browser-gate-continuation-task.trace.md)
  - Value: E5gVLUcIoKMTLq5yhu3bhDFeS6Kvk427zaWeozb8CuM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: UbsXIpdnw36eplDM6HqVZCb5f3VO7l8gOhfXwG4Ysu8