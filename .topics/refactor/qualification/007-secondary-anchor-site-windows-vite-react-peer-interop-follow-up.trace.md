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
  - Created At: 2026-09-15 14:30:59
  - Authors: Anchor
  - Why: Preserve the observed post-repair browser failure and smallest Site-owned nested dependency interop correction without widening into App or Playthings mutation or claiming browser acceptance.
  - Summary: Qualified Site-only follow-up for Windows react-dom/client interop after excluding source-distributed @tiinex/app; App/Playthings unchanged and Sigma Windows confirmation remains pending.
  - Status: ready/local

---

# Secondary Anchor Site — Windows Vite React Peer Interop Follow-up Evidence

## Supported Claim Or Question

- Supported Claim Or Question: After excluding source-distributed `@tiinex/app` from Vite dependency pre-bundling, what is the smallest Site-owned correction for the subsequent Windows browser failure where `react-dom/client` is served without the expected `createRoot` ESM export?
- Evidence Role: Preserve the exact Sigma host observation, the nested CommonJS/ESM boundary, the minimal Site delta, focused qualification, and the remaining Windows confirmation gate.

## Provenance

- Known Source: Exact Tiinex-qualified carried Site/App/Core/Verse Playthings Workspace material from selected route `001-6-1-1-1-handoff-pointer.trace.md`, plus Sigma's observed Windows browser console failure after the previous Site Vite repair.
- Human Host Observation: `npm run dev` now starts successfully on Sigma's Windows checkout. On browser load, the module graph fails at `@tiinex/app/viewer` with `The requested module '/node_modules/react-dom/client.js?...' does not provide an export named 'createRoot'`.
- App Contract: `@tiinex/app@0.1.1` intentionally exports source (`./viewer` -> `./src/viewer.js`) and `src/viewer.js` imports `React` from `react` and `createRoot` from `react-dom/client`; React and ReactDOM are App peer dependencies supplied by Site.
- Vite Contract: Vite's dependency-optimization contract permits an excluded ESM dependency to keep normal source transforms while explicitly including nested CommonJS dependencies using the `esm-dep > cjs-dep` form.
- Scope: Site-owned Vite development composition only. App and Verse Playthings source remain unchanged.
- Provenance Limits: No Windows rerun with this follow-up correction, rendered Playthings interaction, automated Playwright PASS, or Sigma UX acceptance is claimed.
- Preservation Basis: Exact Tiinex-carried Workspace bytes, deterministic SHA-256 file comparison, Sigma Windows host observation, exact App package contract bytes, official Vite optimizer semantics, and focused/full Site TAP receipts using exact carried first-party Workspaces.

## Evidence Material

- Material: Site `vite.config.ts`, `test/vite-dev-contract.test.mjs`, README operator note, exact carried App package metadata/source, focused Site TAP receipt, and Sigma Windows browser-console observation.
- Material Kind: Exact Site source/test/documentation delta plus qualified carried first-party source and bounded Windows host execution evidence.
- `vite.config.ts` continues to exclude `@tiinex/app` from pre-bundling so App's source and `?raw` imports use normal Vite transforms.
- The same `optimizeDeps` block now explicitly includes `@tiinex/app > react` and `@tiinex/app > react-dom/client` so App's nested React peers receive dependency interop instead of being served raw through the excluded source-package path.
- The regression guard now verifies both the App exclusion and the two nested peer inclusions.
- README records the Windows dev interop contract and the `npm run dev -- --force` cache-reset confirmation command.

## Source Delta

- `vite.config.ts`: SHA-256 `c4cd16a13c290b0bea0dbb6cbbd95522733031403bcba3a06161a3b12e0ec8a8` -> `405dc9bec749137e853ee3b70f3218d7ea84338c932e9c8cd651b85006a81c06`.
- `test/vite-dev-contract.test.mjs`: SHA-256 `13f7291e87976d092e917a356da97c38d1b2284b9044e77fa8178188d1e90602` -> `35f1cc23e42806263d1cfe32a2c1cc7c2cd01f25d6663b9eca6649acfea28da8`.
- `README.md`: SHA-256 `d0c504defa9ca2dc5b169c8c92b621a96da2e6169ba45baa67c805578e31010e` -> `81d59a9de01d8f98540e47cbe88b004da55d99f58680587b48e547fe5a2659e3`.
- No App, Core, or Verse Playthings source delta was introduced.

## Qualification

- Focused Vite contract test: 1 passed, 0 failed.
- Full Site TAP suite was run with exact carried App/Core/Verse Playthings Workspaces wired only for Node module resolution; result: 13 passed, 0 failed.
- This execution host could not install the third-party dependency closure needed to execute the real Vite development server; `npm ci` did not complete before host transport timeout. No alternate dependency versions or synthetic browser result were substituted.
- Sigma's Windows host therefore remains the required runtime confirmation environment.


## Preservation And Fidelity

- Preservation State: App, Core and Verse Playthings source remain byte-unchanged; Site runtime composition remains unchanged except for the development-only dependency optimizer peer interop configuration and its regression/documentation guard.
- Known Losses: This execution host cannot complete installation of the exact third-party dependency closure, so the corrected Vite development server cannot be executed here. Windows browser confirmation remains external.
- Fidelity Notes: The correction preserves `@tiinex/app` as a normal Site dependency and source-distributed public entrypoint while restoring Vite pre-bundling only for App's nested React peers. No package ownership or public API is changed.

## Reconciliation Result

- The previous Site repair successfully moved the Windows frontier forward: Vite dev now starts and reaches browser module loading.
- The new failure is consistent with React peer interop through an excluded source-distributed App package, not with an incorrect Playthings package import and not with a need to rewrite App's public dependency contract.
- The smallest justified correction remains Site-only: keep `@tiinex/app` excluded while explicitly optimizing the nested React peer imports reached through App.

## Remaining Gate

- Sigma should land this Site delta and run `npm run dev -- --force` on Windows.
- If the browser renders, proceed with manual Site + Playthings observation from the actual UI frontier.
- A successful manual render remains separate from the automated Python/Playwright real-browser contract and from Sigma product/UX acceptance.

## Interpretation Limits

- Does Not Prove: Windows confirmation of this follow-up config, rendered browser success, Playthings behavior, automated `status: passed` / `realBrowser: true`, or Sigma acceptance.
- Not Yet Used As: a Sigma acceptance result, automated real-browser PASS, Playthings Major 003 closure, release/deployment approval, or App/Playthings mutation authority.
- Must Not Be Treated As: proof that the full Site/Playthings browser path is accepted, proof that automated browser qualification is unnecessary, or authority to alter App/Playthings semantics.
- Must Not Be Used To Claim: that App is not a dependency, that Playthings package registration was defective, that React peers should be moved into App dependencies, or that dependency optimization should be disabled globally.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-secondary-anchor-site-browser-gate-continuation-task.trace.md](../orchestration/003-secondary-anchor-site-browser-gate-continuation-task.trace.md)
  - Value: E5gVLUcIoKMTLq5yhu3bhDFeS6Kvk427zaWeozb8CuM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: T2VN10mrEl7FaL8L6HgB9QVm-2v1geZ-qmZStmpuz9Y