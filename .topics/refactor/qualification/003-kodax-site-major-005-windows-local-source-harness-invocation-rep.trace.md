# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Trace: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md](../orchestration/handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md)
  - Origin:
    - [relative](../orchestration/handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-12 00:30:36
  - Authors: Kodax
  - Why: Preserve the bounded Site-owned Windows invocation repair and truthful remaining host boundary without manufacturing browser or Sigma acceptance.
  - Summary: Site now resolves npm portably through npm_execpath plus the current Node executable; focused Windows regressions pass 8/8, exact first-party pack phases pass, and this host still stops only at the third-party install boundary before build/browser.
  - Status: ready/local

---

## Supported Claim Or Question

- Supported Claim Or Question: Has the Site Major 005 local-source harness repaired the observed Windows `spawnSync npm ENOENT` invocation defect without widening scope or mutating sibling first-party source, and what remains unqualified on this execution host?
- Evidence Role: Preserve the exact Site-owned Windows invocation repair, focused regression qualification, real npm-script front-door receipts, unchanged-source boundary, and smallest remaining host blocker without manufacturing a browser PASS or Sigma acceptance.

## Provenance

- Known Source: Tiinex-qualified Carrier Dimension `005-1-1-1`, selected route `001-6-1-1-1-handoff-pointer.trace.md`, explicitly bound to recipient Role `Kodax` and reported `grounded-to-act` before local mutation.
- Required Context: Tiinex materialized exact carried `site`, `app`, `core`, and `verse-playthings` Workspaces through the qualified workspace byte provider. The outer carrier was not natively enumerated or unpacked.
- Delegated Scope: Site-owned local-source harness invocation and operator ergonomics only. No Core/App/Playthings source mutation, first-party publication, product-feature work, deployment, release, or Sigma acceptance was authorized or performed.
- Source Delta: relative to a second untouched Tiinex materialization of the exact carried Site Workspace, the durable delta is limited to `README.md`, `tools/local-source-browser-harness.mjs`, and `test/local-source-browser-harness.test.mjs`.
- Source Delta Hashes:
  - `README.md`: `ca3eecc4037af0cd77bf0ccd852121edbedec67f7dcdb87dfdf88eaad89613e1` -> `afd93c062c57e7c81806301b0b8272aa18964209cbc99800fdd34a59748b1af6`.
  - `tools/local-source-browser-harness.mjs`: `72ef75b9ec4a24632afba5c946cb9c11d62619e90c8b157ec368d2657367993a` -> `adffb7998616ccef1b04def464bbd88cbcc5378d0448e22393e600fba96018a7`.
  - `test/local-source-browser-harness.test.mjs`: `cba26e7e4124f83305e60bc87b42642a7a86b59d26b32ec10779b4461b442a29` -> `283e434f26dd1cc65feb71b9f79e6e2b4e70d99b3d085ee5a8742491409c073a`.
  - `package.json`: unchanged at `004c5d853617dbf01de3719f8e17a475b678924ff14247512d63c0174ccfc9b6`.
  - `package-lock.json`: unchanged at `ffa1657dca353326e95619506aa8765bffef6c13efa46e79cb8cac7971debc4c`.
- Preservation Basis: exact Tiinex-materialized carried source bytes; deterministic SHA-256 comparison against an untouched second Site materialization; focused dependency-independent TAP qualification; actual npm-script execution receipts against exact carried Core/App/Playthings source; cache-only install evidence; and post-run `sourceStateUnchanged: true`.
- Provenance Limits: No successful public npm install, Site Vite build, React mount, real-browser interaction, Prism readiness disposition, Sigma observation, or Sigma acceptance is claimed.

## Evidence Material

- Material: repaired `tools/local-source-browser-harness.mjs`, strengthened Windows-focused `test/local-source-browser-harness.test.mjs`, README front-door contract, focused TAP output, npm-script probe receipts, exact first-party pack hashes, cache-only install result, and current host DNS diagnostic.
- Material Kind: Exact Site source/test/documentation delta plus local machine qualification receipts and explicit execution-host dependency boundary.
- Windows Invocation Repair:
  - every npm subprocess now resolves through one invocation contract instead of shell-free `spawnSync("npm", ...)`;
  - when invoked through the supported `npm run test:browser:local-source -- ...` front door, npm's `npm_execpath` is executed through the already-running `process.execPath`, so Windows does not need to execute the `npm.cmd` shim directly;
  - paths containing spaces remain ordinary child-process arguments rather than shell text;
  - direct Windows `node tools/local-source-browser-harness.mjs ...` execution without `npm_execpath` fails closed at `host-toolchain` and returns the supported npm-script front door instead of silently falling back to the broken shim path;
  - non-Windows direct invocation retains the existing PATH-based `npm` fallback;
  - the resolved npm strategy is included in the disposable composition evidence and all npm receipts record the exact Node + npm CLI command used.
- Focused Qualification: `node --check tools/local-source-browser-harness.mjs` passes; `node --test test/local-source-browser-harness.test.mjs test/browser-smoke-contract.test.mjs` passes `8/8`, including two Windows-specific invocation tests; Python compilation of `tools/browser-smoke.py` passes.
- Real Front-Door Probe: invoking the harness through `npm run test:browser:local-source -- ... --offline` against the exact carried Core/App/Playthings roots succeeds through the former failure boundary. Receipt `01-npm-version` exits `0` using `/opt/nvm/versions/node/v22.16.0/bin/node /opt/nvm/versions/node/v22.16.0/lib/node_modules/npm/bin/npm-cli.js --version`; Core, App, and Playthings pack phases all exit `0` through the same resolved invocation strategy.
- Exact First-Party Pack Result:
  - Core `@tiinex/core@0.1.1`: 1,027,729-byte tarball, SHA-256 `d1bccb35ea0da0813a828b847ecf9034f01977709d88f9388299462eeb55f7ad`.
  - App `@tiinex/app@0.1.1`: 573,396-byte tarball, SHA-256 `072d5d54acba06063c28d9b892c36a97bc25c1d21025d1889d9c28c93dc244f6`.
  - Playthings `@tiinex/verse-playthings@0.1.0`: 76,629-byte tarball, SHA-256 `e40f881121ad0775579f5ee336e8d78e8420af3bcf6fdd04cc3e23639d3d7114`.
- Toolchain Receipt: Node `v22.16.0`, npm `10.9.2`; `/usr/bin/chromium` reports Chromium `144.0.7559.96`; Python Playwright imports successfully.
- Current Host Result: the deterministic cache-only probe exits `1` at `failureStage: install`, with `sourceStateUnchanged: true` and `tempRetained: false`.
- Exact Remaining Local Blocker: npm reports `ENOTCACHED` for `https://registry.npmjs.org/vite/-/vite-8.1.5.tgz`; `getent hosts registry.npmjs.org` exits `2` on this host. Build/browser phases therefore remain unexecuted here.
- Normal-Network Probe Boundary: a non-offline probe again completed npm-version and all first-party pack phases but the host did not produce an install receipt before the external execution timeout. This is not promoted into a product/browser finding; the deterministic cache-only result above is the qualified local stop point.

## Reconciliation Result

- The observed `spawnSync npm ENOENT` path is mechanically explained by direct shell-free invocation of Windows's npm shim and is removed from the supported front door.
- The repaired supported front door is: `npm run test:browser:local-source -- --core <core-root> --app <app-root> --playthings <playthings-root> --browser <chrome-or-chromium-executable>` from the Site checkout.
- The repair preserves exact local-source packaging, no-first-party-publication, exact dependency/version validation, disposable composition, structured receipts, and source-state integrity.
- Exact carried Core/App/Playthings packaging still succeeds after the repair, proving the invocation change does not require sibling source surgery.
- This execution host still cannot qualify install/build/browser because exact third-party `vite@8.1.5` is not cached and public registry DNS is unavailable. That is an execution-host dependency boundary, not evidence that the Windows invocation repair failed and not a browser/product failure.
- The smallest next action is for Anchor to route the returned full-source carrier to Sigma's dependency-capable Windows host and have Sigma run the single documented npm-script front door; return genuine `status: passed` / `realBrowser: true` or the next smallest structured failure stage.

## Preservation And Fidelity

- Preservation State: Viewer/Playthings behavior, Core/App/Playthings source, Site package versions, and Site lockfile are unchanged. The delta is limited to Site invocation mechanics, focused regression coverage, and operator documentation.
- Known Losses: no build/browser PASS or Sigma observation is present because this host cannot materialize the exact public third-party dependency closure.
- Fidelity Notes: the fix intentionally uses npm's own runtime-provided CLI path and the current Node executable rather than machine-specific paths, shell quoting, registry-published first-party packages, or a Windows-only hardcoded shim.
- Network Boundary: no registry mirror, alternate dependency version, first-party publication, browser download, or remote write workaround was used.

## Interpretation Limits

- Does Not Prove: a successful temporary Site install/build, genuine browser PASS, Playthings Major 003 closure, Sigma-test readiness, deployment/release readiness, or Sigma acceptance.
- Not Yet Used As: a Sigma acceptance result, Prism readiness decision, release/deployment approval, or authority to mutate Core/App/Playthings source.
- Must Not Be Treated As: a synthetic Windows browser PASS or a product failure. The qualified claim is narrower: the Site-owned npm/Node invocation defect is repaired and regression-covered; full dependency/browser execution remains for a dependency-capable host.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md](../orchestration/handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md)
  - Value: 7yBlqZ6eKwNrLz8TCfsRzOGoJWLTVb2FUmzIB9v9hpU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: QaQEkSunN-KO40sMGZjlPHi725ps05Bl-MzTkJX10kA