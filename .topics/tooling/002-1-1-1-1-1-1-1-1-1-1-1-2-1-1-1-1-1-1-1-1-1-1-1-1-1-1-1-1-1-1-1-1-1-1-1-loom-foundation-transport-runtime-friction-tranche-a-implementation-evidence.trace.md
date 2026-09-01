# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-01 07:46:00
  - Trace: [Foundation Transport Runtime Friction Tranche A — Anchor To Loom](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-foundation-transport-runtime-friction-tranche-a-handoff.trace.md)
  - Origin:
    - [relative](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-foundation-transport-runtime-friction-tranche-a-handoff.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-01 08:10:00
  - Authors: Loom
  - Why: Preserve the bounded three-owner transport refactor, exact static-debt movement, suite-owned qualification, and representative runtime measurements before returning to Anchor.
  - Summary: Loom evidence that the three selected inherited transport-path owners are now below 24,000 bytes through cohesive extraction, no new oversized owner was introduced, permanent acceptance and focused/tooling remain green, relevant carrier/cold-start cases remain green, static moved from seven inherited unresolved to four while resolved inherited increased from six to nine, and runtime measurements show a small orientation improvement but no manufacture improvement.
  - Status: ready/local

---

# Foundation Transport Runtime Friction Tranche A — Loom Implementation Evidence

## Preserved Material

- Material Description: the current qualified Site source after refactoring exactly `src/tooling/portable/adapters/node/handoff.manufacture.js`, `src/tooling/portable/handoff/recipientV2.inspect.js`, and `src/tooling/portable/handoff/recipientV2.topology.js` into smaller cohesive owners while preserving the accepted artifact-first carrier, Workspace, endpoint-Role, route, and cold-start behavior.
- Material Kind: Site-local Tooling source, suite-owned component/use-case qualification, regression-aware static receipt, and bounded local runtime timing receipts.

## Preservation Act

- Preservation Method: split manufacture requirement/material closure into `handoff.manufacture.requirements.js` and bounded Workspace scope projection into `handoff.manufacture.scope.js`; split recipient Workspace/payload/cache qualification into `recipientV2.inspect.workspaces.js`; split recipient topology Workspace/bootstrap construction into `recipientV2.topology.workspaces.js` and route/material utilities into `recipientV2.topology.materials.js`; keep the public entrypoints and exact carrier authority rules unchanged; remove one duplicated `packageFileBytes(...)` materialization per file in the roundtrip byte-comparison fallback; run only permanent acceptance, focused/tooling, relevant existing carrier/cold-start cases, regression-aware static, and bounded orientation/manufacture timing surfaces.
- Preservation Time Or State: captured after bounded qualification and timing comparison completed and before canonical non-major return manufacture.

## Supported Claim Or Question

- Supported Claim Or Question: whether the three Anchor-selected transport-path owners can be reduced below the 24,000-byte discipline without introducing new static regressions or breaking accepted carrier/cold-start behavior, and whether the resulting owner/runtime shape reduces ordinary orientation/manufacture friction.
- Evidence Role: supports Anchor review of source-owner reduction, exact file identities and sizes, static-debt movement, current acceptance/focused behavior, relevant use-case coverage, and representative before/after runtime observations.

## Provenance

- Known Source: the qualified Business, Docs, and Site Workspaces from the preferred-pass Anchor carrier `site-001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom.handoff-package.zip`; exact carried Site archive SHA-256 `6c5c43acebc99b0c398785af44868376613bd1a0437c8fc441c521c16fc84256`; exact carried Business archive SHA-256 `940229d5bbaff5fe5b1c708f8cefff7ac883fa82afbf229f944160455f3183c5`; exact carried Docs archive SHA-256 `e88aa83d06019e540eb1293c49b3183055a31426c8c3a66f4fdced796984a23f`.
- Preservation Basis: cold start qualified `preferred-pass`; the selected route, Business/Docs/Site Workspaces, endpoint Roles, and all three Required Context items resolved from exact carried bytes before materialization. An untouched extraction of the ingress Site archive was retained as the before-source for direct source and runtime comparison.
- Provenance Limits: no remote fetch, repository mutation, publication, release action, integration run, closure run, stable-major qualification, production deployment, hidden host-safety probing, keyword/trigger hunting, or hidden-control inference occurred. Timings are ordinary local process measurements and exclude model/client/host queue latency.

## Evidence Material

- Material: `src/tooling/portable/adapters/node/handoff.manufacture.js`; `src/tooling/portable/adapters/node/handoff.manufacture.requirements.js`; `src/tooling/portable/adapters/node/handoff.manufacture.scope.js`; `src/tooling/portable/handoff/recipientV2.inspect.js`; `src/tooling/portable/handoff/recipientV2.inspect.workspaces.js`; `src/tooling/portable/handoff/recipientV2.topology.js`; `src/tooling/portable/handoff/recipientV2.topology.materials.js`; `src/tooling/portable/handoff/recipientV2.topology.workspaces.js`.
- Material Kind: three reduced public/primary transport owners plus five cohesive support owners.
- Description: exactly eight canonical Site files differ from ingress for this tranche. `handoff.manufacture.js` moved from 37,415 to 10,051 bytes; `recipientV2.inspect.js` from 38,162 to 19,255 bytes; `recipientV2.topology.js` from 38,726 to 20,379 bytes. New support owners are 19,995; 8,404; 20,358; 8,301; and 11,775 bytes respectively, all below 24,000 bytes. Regression-aware static moved from seven inherited unresolved / six resolved inherited / zero introduced to four inherited unresolved / nine resolved inherited / zero introduced.
- Sample Reference: ingress permanent acceptance passed 54/54 in 10,619.857 ms suite time / 10.78 s measured wall; post-refactor acceptance passed 54/54 in 11,014.619 ms / 11.15 s wall. Ingress focused/tooling passed 4/4 in 4,311.988 ms / 4.34 s wall; post-refactor focused/tooling passed 4/4 in 4,607.465 ms / 4.65 s wall and reported static 4 inherited unresolved / 9 resolved inherited / 0 introduced. Existing `handoff.manufacture`, `multiRootManufacture`, `boundedWorkspaceRepresentation`, and `coldStartQualification` suite-owned cases all passed after the refactor. The repository remains exactly one standalone `*.test.mjs` entrypoint plus 54 suite-owned `*.case.mjs` cases.

## Preservation And Fidelity

- Preservation State: all three selected inherited oversized owners are resolved; the four explicitly excluded inherited owners remain unresolved and untouched except no import/reference adjustment was needed. Artifact-first clean-carrier behavior, full multi-root manufacture, bounded Workspace representation, and cold-start qualification remain green in existing cases.
- Fidelity Notes: helper extraction changes ownership, not semantic authority. No receipt, manifest, cache, or hash became semantic authority. The only repeated-byte reduction is inside the roundtrip fallback comparison: each compared file now materializes its bytes once before computing byte length plus SHA-256, while manifest-based exact identity comparison remains the preferred path when available.
- Known Losses: test/profile wall times were not improved in the single before/after runs and are treated as ordinary local variance, not as a regression or success signal. Runtime improvement is not inferred from source-size reduction alone.

## Fidelity And Loss

- Fidelity Notes: a five-pair interleaved `orient-handoff-package --phase-timing` comparison against the exact same ingress carrier produced median elapsed-before-final-serialization of 619.613 ms before and 593.307 ms after; median operation execution was 604.810 ms before and 580.388 ms after, a small local decrease of about four percent. A three-pair interleaved full manufacture comparison using the same Site Handoff, Business+Docs roots, endpoint Role bindings, roundtrip verification, and temporary output directories produced median total 3,413.241 ms before and 3,502.011 ms after; median operation execution was 2,988.291 ms before and 3,058.436 ms after. Manufacture therefore showed no runtime improvement in this local series.
- Known Losses: runtime measurements are representative engineering evidence only. They do not prove host mitigation, hidden host-control behavior, release readiness, or deterministic performance across machines. The tranche reduces source-owner/static friction and one local repeated-byte operation; it does not claim manufacture latency improved.

## Custody Or Storage Boundary

- Storage Or Custody State: canonical implementation source and this Evidence live in the current Site Workspace; unchanged Business and Docs Workspaces remain carried dependencies. Runtime `.tiinex/**` checkpoints created by focused qualification remain execution-local state and are not canonical source.
- Reuse Boundary: Anchor may review and continue from this non-major return. Integration, closure, stable-major qualification, the remaining four oversized owners, publication, release, and unrelated product work require separate progression authority.

## Interpretation Limits

- Does Not Prove: final Foundation closure, strict-static pass, manufacture speedup, stable-major readiness, release readiness, production deployment, Sigma human product acceptance, or knowledge of hidden host-safety mechanisms.
- Not Yet Used As: integration qualification, closure qualification, release qualification, stable-major qualification, remote publication, production acceptance, or authorization to enter the remaining four static owners.
- Must Not Be Treated As: permission to weaken carrier/Workspace/Handoff/Role qualification, promote cache/receipt/manifest/hash compatibility metadata into semantic authority, regrow standalone regression files, infer hidden host-safety triggers, or claim runtime improvement from owner-size reduction.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Foundation Transport Runtime Friction Tranche A — Anchor To Loom](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-foundation-transport-runtime-friction-tranche-a-handoff.trace.md)
  - Value: _05hFQfGgLzGL9Z3GUeZKmye5Ytmrr4i0cAUAr4_wu8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: jkwNqcWvBUFri8Mjg51zOa4DWZyo0Vf79aKnSX1hMDE
