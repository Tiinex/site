# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 14:52:00
  - Authors: Anchor
  - Why: Audit whether current Handoff carrier structure exposes unnecessary native-indexing surface or redundant control boilerplate, and test a Tiinex-native workspace-artifact plus archive-snapshot representation before changing package truth.
  - Summary: Tooling 027 — classify current package control/material responsibilities, evaluate lineage-bearing `tiinex.workspace.v1` artifacts paired with exact workspace archives, and produce a migration/no-change disposition with cold-start and size/performance evidence.
  - Status: open/local

---

# Tooling 027 — Handoff package workspace archive and control-plane minimality audit

## Objective

Determine the smallest transparent Handoff carrier structure that preserves exact route/material/integrity truth while making Tiinex Tooling the natural cold-consumer ingress and avoiding unnecessary package boilerplate or exposed workspace-tree indexing.

## Done Criteria

- Inventory every current top-level/control surface used by manufactured Handoff packages: root Pointer, `tiinex.bootstrap`, `handoff.workspaces`, `handoff.material`, `context/workspace.json`, and each `tiinex.package` document including START, carrier, closure, file-map, contract, build receipt, findings, index, manifest, receipt and companion.
- For each surface classify exact responsibility, authority, consumers, integrity dependency, compatibility need and whether its information is unique, duplicated, derived/projection-only, stale/legacy or still required.
- Explicitly investigate the current generic manifest/receipt language that can describe a future unbuilt export package while already embedded inside a manufactured Handoff carrier; decide whether this is valid layered semantics, misleading projection reuse or removable boilerplate.
- Explain `handoff.material` precisely as Required Context material closure and test when exact bytes must be duplicated versus when a fail-closed binding to already-carried workspace archive bytes by qualified workspace/path/hash can preserve equivalent closure.
- Evaluate a candidate `tiinex.workspaces/` layout where every carried workspace has a normal `tiinex.workspace.v1` artifact plus an exact archive snapshot, for example `tiinex-site.workspace.md` + `tiinex-site.workspace.zip` and `tiinex-docs.workspace.md` + `tiinex-docs.workspace.zip`.
- Treat the workspace artifact as semantic/lineage-bearing and the paired archive as transport/material representation. Do not make archive filename or directory placement semantic identity.
- Determine whether existing `tiinex.workspace.v1` can truthfully bind a package-local exact workspace snapshot using existing semantics or whether Axiom classification/schema extension is required. Do not silently overload unrelated Workspace Entrypoint/Repository Transport fields.
- Keep bootstrap/runtime Tooling outside nested workspace archives so a cold consumer can orient/open workspaces before extracting them. Evaluate persistent-host bootstrap reuse only with exact version/source/integrity qualification and explicit unavailable/retrieval behavior.
- Do not use encryption or opaque compression as a behavioral enforcement mechanism. Truth must remain independently inspectable when Tooling is broken; nested archives may reduce accidental indexing but not hide semantics.
- Measure archive-size and manufacture/orientation performance including double-compression effects. Prefer storing already-compressed workspace archives without redundant recompression where the carrier format supports it.
- Run or specify an A/B cold-start fixture comparing current exploded workspace carriage with the workspace-artifact/archive candidate. Measure native actions/files inspected before Tiinex orientation and whether Tooling can consume the nested tree without arbitrary extraction.
- Preserve deterministic file-map/tamper/context-audit guarantees and multi-workspace routing. A new layout must prove semantic equivalence across at least single-workspace and multi-workspace carriers.
- Return an explicit disposition: keep current structure, simplify in place, or open a bounded implementation task. Do not mutate production carrier format merely because the candidate is aesthetically cleaner.

## Scope

Handoff carrier/control-plane responsibility audit, workspace artifact/archive representation investigation, material-deduplication analysis, bootstrap placement and cold-start/size/performance comparison.

Out of scope: encryption, remote bootstrap publication/authentication, new canonical workspace semantics without Axiom classification, Viewer/VS Code UI implementation, Tooling 021 repair application, or changing active Axiom publication semantics.

## Dependencies

- [Cold-start consumer grounding, provider capability and carrier ingress feedback](../../architect/continuity/001-37-cold-start-consumer-grounding-provider-capability-and-carrier-ingress-feedback.trace.md)
- Existing `tiinex.workspace.v1` schema and current Handoff carrier/manufacturing contracts.
- Tooling 026 remains the separate preferred-path behavioral qualification boundary.

## Scheduling Boundary

- Investigation may begin after the active Axiom semantic route returns, but any carrier-format implementation must wait for exact responsibility audit and any required Axiom workspace-binding classification.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:69L82rqQfMJ_O0xGPtbwH1nj3_H2smyGvMYj_sEVZjQ