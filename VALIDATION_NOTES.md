# Validation Notes v449 — M0-F Exact Mutation Target Attestation Closure

Checkpoint: `v449`  
Version: `0.2.268-v449`  
Runtime: `react-v449-m0f-exact-mutation-target-attestation-closure`

## v449 bounded Site correction

- exact GitHub remote equality is treated as representation verification only; it does not independently prove that the current guided publication operation performed a write;
- Site exposes explicit human GitHub web mutation confirmation bound to exact `planSha256` **and** exact qualified GitHub issue/comment target;
- Copy/Open remain non-write evidence and cannot substitute for the human mutation attestation;
- `verifyWorkspaceGithubPublication(...)` qualifies the exact final target first, then fails closed before remote read/shared success when exact plan+target attestation is missing, stale, or mismatched;
- with valid attestation, exact target and exact payload verification still flow through the unchanged shared `buildPublicationResult(...)` success authority;
- qualified durable workspace receipts preserve Site-local execution-attestation type, exact plan SHA, exact target kind/canonical `inputTarget`, confirmation timestamp, and the boundary that Tiinex did not perform a hidden/API write;
- local input remains unchanged and attestation does not become source/artifact semantics;
- v446 exact social target parser/contract and shared `buildPublicationResult(...)`, Tree/Handoff/package/re-ingest, and Tooling portable remain byte-unchanged.

Known source-clean missing-React behavior at `src/app/useLocalMaterialIntake.test.mjs` remains explicit if dependencies are absent. Browser/public runtime is not claimed unless separately exercised.

---

# Validation Notes v447 — M0-F GitHub Social Publication Product Integration

Checkpoint: `v447`  
Version: `0.2.266-v447`  
Runtime: `react-v447-m0f-github-social-publication-product-integration`

## v447 bounded Site integration

- existing Export dialog now exposes guided GitHub issue/comment publication for preflight-qualified owned-local artifacts;
- current shared `buildPublicationPlan(...)`, v446 exact target authority, and `buildPublicationResult(...)` remain semantic/result owners;
- supported guided modes are create-new issue, create-comment, update-known issue, and update-known comment;
- copied bytes are exactly `plan.outboundPayload.content`; Site does not generate a second publication body;
- Open uses a bounded GitHub web destination and never performs provider mutation;
- exact final target is qualified by the shared v446 parser before the read-only GitHub body owner is invoked;
- issue/comment body SHA-256 must equal the shared plan payload SHA-256 before shared success/source binding can qualify;
- qualified receipts/source bindings persist in browser-local workspace delta state while local/source input records stay unchanged;
- product Copy/Open/Verify completion is tied to the exact current plan identity, and stale verification is cleared when product input changes;
- issue-snapshot parsing does not qualify publication targets; no GitHub credentials, write API, Parent inference, or local-draft pruning is introduced;
- Tree/Handoff/package/re-ingest and M0-A–E behavior remain regression-gated.

Known source-clean missing-React behavior at `src/app/useLocalMaterialIntake.test.mjs` remains explicit if dependencies are absent. Browser/public runtime is not claimed unless separately exercised.

---

# Validation Notes v446 — M0-F Exact GitHub Social Target Representation Closure

Checkpoint: `v446`  
Version: `0.2.265-v446`  
Runtime: `react-v446-m0f-exact-social-target-representation-closure`

## v446 bounded Tooling correction

- GitHub social `externalTarget`, `containerTarget`, and execution/result target aliases are preserved raw until `parseExactGithubIssueTarget(...)` qualification; shared publication code does not trim or structurally rewrite them first.
- Unsupported whitespace-wrapped observations remain blocked/failing and are preserved exactly in plan/result evidence.
- Accepted issue-number lexemes must be positive decimal integers that round-trip exactly through JavaScript safe-integer representation; `Number.MAX_SAFE_INTEGER` is accepted, larger lexemes fail closed.
- The parser exposes exact `issueNumber` string identity while retaining numeric `number` convenience for existing consumers; canonical issue URLs are built from the accepted lexeme, never from a rounded/exponent-formatted number.
- Shared publication comparisons use exact issue identity rather than lossy numeric coercion.
- v445's explicit normalization allowlist is unchanged; no query, case, percent-decoding, path normalization, backslash, whitespace, or alternate-host broadening is introduced.
- Repo-file behavior, GitHub snapshot/read surfaces, package/re-ingest, Site/React, credentials, host execution, Semantic Package, canonical schema cache, and Tiinex/docs remain unchanged.

## Validation model

Run the combined parser + publication target-representation closure matrix, all issue-target/social-publication tests, adjacent GitHub snapshot/adapter/transport and portable publication regressions, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v445 — M0-F Raw GitHub Social Target Lexical Hardening

Checkpoint: `v445`  
Version: `0.2.264-v445`  
Runtime: `react-v445-m0f-raw-social-target-lexical-hardening`

## v445 bounded Tooling correction

- exact GitHub issue/comment authority is qualified from an explicit raw positive lexical grammar before any structural URL normalization;
- exact supported web forms are lowercase `https://github.com/<owner>/<repo>/issues/<positive-integer>` with optional single trailing slash and optional exact `#issuecomment-<digits>` fragment;
- exact supported API issue-body form is lowercase `https://api.github.com/repos/<owner>/<repo>/issues/<positive-integer>` with optional single trailing slash;
- literal/encoded dot-segments, backslashes, doubled separators, encoded structural delimiters, queries, unsupported prefixes/suffixes, case-normalized host/scheme variants, and surrounding whitespace fail closed;
- WHATWG path normalization is no longer used as qualification authority;
- publication-result pressure preserves hostile raw observations as failure evidence, emits `publication.result.social-target.invalid`, keeps `sourceBinding = null`, and never manufactures a nominal canonical permalink;
- adjacent issue/comment/pull/discussion/hosted-direct snapshot behavior remains independently regression-qualified;
- no React/UI, host write, credentials, workspace lifecycle, Handoff package/export/re-ingest, Semantic Package, canonical schema cache, or Tiinex/docs mutation is introduced.

## Validation model

Run the exact raw lexical matrix, publication-result hostile observation matrix, adjacent GitHub reader regressions, portable publication regression, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v444 — M0-F Exact GitHub Social Target Hardening

Checkpoint: `v444`  
Version: `0.2.263-v444`  
Runtime: `react-v444-m0f-exact-github-social-target-hardening`

## v444 bounded Tooling correction

- exact GitHub web issue/comment authority is restricted to `https://github.com/<owner>/<repo>/issues/<number>` with an optional exact `#issuecomment-<digits>` fragment;
- arbitrary `*.github.com` hosts, query-derived comment tokens, unsupported trailing path segments, malformed comment anchors, credentials/ports/non-HTTPS input, and unrelated raw-string token matches fail closed;
- unsupported observations are preserved as failure evidence and are never rewritten into a different supported permalink;
- one trailing slash is the only web-path normalization accepted;
- the separately explicit `https://api.github.com/repos/<owner>/<repo>/issues/<number>` issue-body read surface remains supported;
- v443 create-new issue intent, create-comment parent issue intent, update-known matching, repo/container mismatch detection, payload SHA-256 verification, mutable social binding, immutable repo-file binding, package/Handoff behavior, and portable facade remain unchanged;
- ordinary issue/comment/pull/discussion/hosted-direct issue snapshot behavior remains regression-qualified;
- no React/UI, credentials, host write, workspace lifecycle, Semantic Package, canonical schema cache, or Tiinex/docs mutation is introduced.

## Semantic authority

Current `Tiinex/docs` head was re-checked before mutation and remained `053d46ce082d4ec261b82abc44ecca403d61e240`. No semantic escalation was required.

## Validation model

Run exact parser pressure, Architect's three publication-result reproductions, adjacent GitHub issue snapshot/readers, package/re-ingest/portable regressions, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v443 — M0-F GitHub Social Publication Contract Reconciliation

Checkpoint: `v443`  
Version: `0.2.262-v443`  
Runtime: `react-v443-m0f-github-social-publication-contract-reconciliation`

## v443 shared publication contract

- shared GitHub target qualification is surface-specific: `github.repo.file`, `github.issue.body`, and `github.issue.comment`;
- the existing exact GitHub issue/comment URL parser is centralized as a pure shared source owner and consumed by both publication and issue-snapshot materialization;
- repo-file publication still requires exact repository/path plus a 40-character materialized commit before qualified success;
- create-new issue plans may be ready without a final issue permalink;
- create-comment plans may be ready with an exact parent issue container before the final comment permalink exists;
- update-known issue/comment plans require the exact known remote target before execution;
- social publication result qualification requires matching target kind/repository/container, exact remote issue/comment identity, explicit execution success, verification state `verified`, and exact payload SHA-256 equality;
- successful social source bindings remain mutable remote representations and carry no fake repo-file path or materialized commit;
- the local draft remains distinct and unchanged; publication targets never imply Continuity Parent;
- shared/portable publication remains planning/result normalization only: no fetch, credentials, write execution, or Site/React dependency;
- v442 Handoff export/re-ingest behavior remains regression-qualified;
- no Tiinex/docs, canonical schema cache, Semantic Package, Site publication UI, OAuth/token, or GitHub host-write implementation is introduced.

## Semantic authority

Current `Tiinex/docs` head was re-checked before mutation and remained `053d46ce082d4ec261b82abc44ecca403d61e240`. No newer semantic authority changed this tranche and no Schemer escalation was required.

## Validation model

Run focused publication/social target tests, GitHub issue-source regression, package/re-ingest/portable regressions, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable; it is not a runtime/product PASS claim.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v442 — M0-F Handoff Freshness + Archive Intake Scaling Correction

Checkpoint: `v442`  
Version: `0.2.261-v442`  
Runtime: `react-v442-m0f-handoff-freshness-archive-scaling-correction`

## v442 bounded correction

- Handoff render/read-model planning is cheap configuration only; it stores no package bundle or exact inspection.
- Explicit execution builds and inspects exactly once from the latest current workspace passed to the execution command.
- Single selected ZIP intake performs one archive decode ownership pass, then reuses decoded entries for Handoff detection or ordinary archive qualification.
- Invalid claimed Handoff packages still fail closed; ordinary Tree ZIP remains ordinary intake.
- v441 publication Case C remains unchanged.

---

# Validation Notes v441 — M0-F Product Execution Integration

Checkpoint: `v441`  
Version: `0.2.260-v441`  
Runtime: `react-v441-m0f-product-execution-integration`

## v441 bounded Site integration

- Tree export remains the default ordinary envelope-free ZIP.
- Handoff package is explicit opt-in and only builds/qualifies the shared operational package after selection.
- Valid Handoff ZIP intake rehydrates/inspects/imports/applies through accepted shared package owners and canonical workspace lifecycle.
- Claimed invalid operational packages fail closed and do not fall through to generic archive leaves.
- Source-backed package members remain reference-only; local package-owned records/assets remain local. Shared `Uint8Array` asset bytes are normalized only at the Site lifecycle boundary to JSON-safe byte arrays so exact bytes survive clone/persistence/reopen and remain reusable by shared package byte owners.
- GitHub publication is intentionally held as Case C: current shared GitHub publication requires exact repository/ref/path + verified commit, while the PoC product target is issue/comment shaped.
- The historical source-clean missing-React exception at `src/app/useLocalMaterialIntake.test.mjs` remains explicit; `npm run validate` is not labeled PASS when it occurs.

---

# Validation Notes v440 — M0-F Control-Set Completeness Correction

Checkpoint: `v440`  
Version: `0.2.259-v440`  
Runtime: `react-v440-m0f-control-set-completeness-correction`

## v440 bounded Tooling correction

- current operational package control topology is owned once by `src/export/package.controlTopology.js`;
- required controls are `index.json`, `manifest.json`, `receipt.json`, `build-receipt.json`, `contract.json`, `findings.json`, and `file-map.json`;
- every required control must exist physically and be readable JSON;
- the serialized index must point every declared control role at its exact current canonical operational path;
- blank, redirected, or duplicate control pointers fail closed;
- removing build receipt, contract, or findings and rebuilding only the durable file map remains invalid;
- unreadable index/build-receipt/contract/findings remain invalid even when outer byte metadata and file-map integrity are rebuilt;
- v439 material SHA/byte checks, collision cardinality, build-receipt material representation, manifest/receipt/contract consistency, source projection, asset bytes, workspace context, publication contracts, and Semantic Package separation remain unchanged;
- no React/UI/Site product execution, remote publication execution, credentials, canonical schema cache, or Tiinex/docs mutation is introduced.

## Validation model

Run the v440 control-topology adversarial matrix, v439 transport/publication regressions, all `src/**/*.test.mjs` individually, and repository gates. The historical source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable; it is not a product/runtime PASS claim.

Browser/public runtime remains unclaimed unless separately exercised.
