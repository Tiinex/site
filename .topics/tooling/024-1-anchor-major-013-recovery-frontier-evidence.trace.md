# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-07 20:09:00
  - Trace: [024-validation-trust-thin-vscode-operator-consolidation.task.trace.md](024-validation-trust-thin-vscode-operator-consolidation.task.trace.md)
  - Origin:
    - [relative](024-validation-trust-thin-vscode-operator-consolidation.task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-07 20:09:22
  - Authors: Anchor
  - Why: Prevent the new Anchor from confusing remembered transient work with source bytes actually present in the handoff.
  - Summary: Bind exact carrier/workspace hashes, 0.1.5 baseline, dogfood defects, VSIX identity and replay-only post-0.1.5 frontier.
  - Status: ready/local

---

# Major 013 Recovery Frontier — Anchor Evidence

## Supported Claim Or Question

- Supported Claim Or Question: what exact source state is durably available for the new Anchor, what later work is only a replay specification, and what the next qualified implementation frontier is.
- Evidence Role: cold-start recovery boundary and anti-hallucination guard for Major 013.

## Provenance

- Known Source: supplied/recovered `tiinex-site-009-1-1-2-1-1-1-1-1-1-3-2-4-1-2-1-2-2-3-1-1-anchor-to-sigma` full-source carrier; current conversation's explicit Sigma dogfood observations and Anchor decisions; separately re-uploaded 0.1.5 VSIX used only for byte comparison.
- Preservation Basis: carrier/bootstrap/context qualification plus exact SHA-256 bindings below. The outgoing handoff adds only recovery/major-transition artifacts to Site and deliberately omits the stale VSIX build artifact from the vscode Workspace snapshot.
- Provenance Limits: post-0.1.5 Anchor implementation attempts that were not transported in a surviving full-source package are not source evidence and must not be treated as already implemented.

## Evidence Material

- Material Kind: exact carrier recovery receipts, byte identity, dogfood frontier and replay specification.
- Material: qualified 0.1.5 full-source carrier, four Workspace archive identities, re-uploaded VSIX byte identity, Sigma dogfood defect frontier, and explicitly replay-only post-0.1.5 implementation specification.
- Recovery Carrier: SHA-256 `f6a5068450d3a302295598cca54e794cdd79ce3b007d2674de009124e695ab40`; carrier context audit status `ready`, zero findings.
- Business Workspace archive SHA-256: `6be00de60c1034c5e19a3a3da85baea1bf22270c59af7f00b3d47104d97fba37`.
- Docs Workspace archive SHA-256: `6674015f617f37e776345316e48f2da92d5f774d8457be3de5d0526e12b7e9da`.
- Site Workspace archive SHA-256: `c648981bc08dcd8d16a4a09cbac8fd01ffc4340fc2f20af5e4ab3f2030e3d7aa`.
- vscode Workspace archive SHA-256: `d86366b8de0906b47e626a5ac8a5198b7ad0fe44ac8fb3246b715c38264ca4fc` before deliberate omission of the stale VSIX build artifact.
- Re-uploaded VSIX: version `0.1.5`, 5,693,674 bytes, SHA-256 `d95c8a7d3dcb989511e362a2d4c5c62b5937c54c8f36ec3cf003016a4f4abdec`; byte-identical to the carried 0.1.5 VSIX and therefore no newer source/recovery value. It is not included as canonical material in the outgoing handoff.
- Last Durable Product State: Site carries Major 012 through the Anchor→Sigma 0.1.5 dogfood Handoff. That dogfood is the exact source frontier, not an acceptance/closure claim.
- Human Dogfood Defects To Preserve: permalink Quick Fix failed; diagnostics/repair intent were unclear or mis-anchored; Handoff authoring/package flows failed; Role/Party endpoint dropdowns were empty/incomplete; active artifact could not be used reliably as Parent; package preview/manufacture exposed opaque internal errors; multi-root Workspace selection missed open roots such as vscode; cross-workspace catalog/cache behavior could not be trusted; Sigma reasonably declined destructive unpack/discovery testing after these failures.
- Replay Specification From Lost Post-0.1.5 Work: schema-definition-vs-instance separation; Docs-first exact fixtures; immutable-vs-mutable schema locator guardrails; locator-first Parent resolution; self/target integrity trust; CLI/editor parity; multi-root operator-context projection; staged-only validation; validation queue coalescing/latest-wins; generated shared-core boundary; contextual multi-root schema authority. These are implementation goals backed by prior transient work, not source bytes present in this carrier.
- Efficiency Findings: local deterministic tests were repeatedly measured in seconds/tens of seconds while model/tool orchestration consumed much longer wall time. Whole-workspace/per-file repeated audits and unbounded external fetches are specifically rejected as the default iteration strategy.

## Preservation And Fidelity

- Preservation State: exact 0.1.5 source plus Major 012→013 transition artifacts are carried. No commit/push or remote mutation is claimed.
- Fidelity Notes: Playthings is not imported into this source. It remains an external/parallel host setup and later selective evidence source only.
- Known Losses: all untransported later Anchor source bytes after the 0.1.5 carrier; any transient 0.1.6+ candidate/build not present in a surviving full-source carrier; exact host/model latency traces outside local process receipts.

## Interpretation Limits

- Does Not Prove: Major 012 completion, 0.1.5 usability, recovery of later implementation bytes, release readiness, or that every remembered transient test remains valid after replay.
- Must Not Be Treated As: permission to reconstruct source from chat prose and call it recovered, permission to commit VSIX/build outputs as semantic source, or permission to weaken validation to reduce latency.
- Not Yet Used As: Sigma dogfood acceptance, publication, Playthings sync, remote landing or Major 013 closure.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [024-validation-trust-thin-vscode-operator-consolidation.task.trace.md](024-validation-trust-thin-vscode-operator-consolidation.task.trace.md)
  - Value: p0xV27-Re-z5ETWyN7L2GTvNCrD_iv67uiVaHZrQr04

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MKD1CRTC-qqNrcf0V1EHTybe22BaTGpK8vB0WfyA6Fg