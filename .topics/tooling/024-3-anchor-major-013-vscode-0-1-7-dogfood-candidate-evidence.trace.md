# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-07 20:09:23
  - Trace: [024-2-anchor-to-anchor-major-013-cold-start-handoff.trace.md](024-2-anchor-to-anchor-major-013-cold-start-handoff.trace.md)
  - Origin:
    - [relative](024-2-anchor-to-anchor-major-013-cold-start-handoff.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-08 02:12:00
  - Authors: Anchor
  - Why: Preserve a durable full-source recovery checkpoint before Sigma dogfood so the candidate can be reconstructed without relying on this conversation or runtime.
  - Summary: Bind the exact 0.1.7 source/build candidate, video-derived UX regressions, qualification gates and remaining pinned-toolchain boundary.
  - Status: ready/local

---

# Major 013 — VS Code 0.1.7 Dogfood Candidate Evidence

## Supported Claim Or Question

- Supported Claim Or Question: what exact source/build state is being handed to Sigma for natural 0.1.7 dogfood, what was recovered versus replayed, what internal checks passed, and what remains explicitly unqualified.
- Evidence Role: candidate qualification and durable recovery checkpoint for Major 013 before human observation.

## Provenance

- Known Source: qualified Major 013 0.1.5 full-source carrier; recovered 0.1.6 VSIX used as forensic/replay evidence only; Sigma's two supplied silent screen recordings used as human actual-path UX evidence; current Anchor replay/reimplementation in Site shared Tooling and Tiinex/vscode source.
- Preservation Basis: exact current Site/vscode source bytes are carried in the successor Handoff package; unchanged Business/Docs workspaces are inherited from the qualified parent carrier; the dogfood VSIX remains a separate build artifact whose exact identity is bound below.
- Provenance Limits: the missing hand-authored post-0.1.5 TypeScript source from the failed conversation was not recovered. Where 0.1.6 compiled/shared bytes were usable as evidence, they were replayed into current source and re-tested; that distinction remains explicit.

## Evidence Material

- Material Kind: exact current source snapshot, deterministic build identity, focused regression receipts, recovered UX observations and explicit qualification boundary.
- Material: current Site/vscode source snapshots, deterministic 0.1.7 VSIX identity, 37/37 bridge regression receipt, shared-runtime qualification, video-derived UX regressions and the explicit pinned-toolchain limitation.
- Candidate Version: `0.1.7`.
- Candidate VSIX: 5,731,519 bytes; SHA-256 `dc75bc9ece1da9194090182e717caf71924b4f4abdd06be2bc4ec12b2628300f`.
- Deterministic Build: two independent VSIX package writes from the same candidate source were byte-identical and produced the same SHA-256 above.
- VS Code Regression Gate: `37/37 Tiinex VS Code bridge core cases passed`.
- Shared Runtime Gate: bundled shared runtime executed the real operator-context and staged-only validation projections rather than mock-only CLI shapes.
- Site Replay Gate: the shared Site mechanics required by the recovered 0.1.6 candidate were restored into current Site source, including operator-context projection, staged validation, CLI operator bridge, package source projection and operation registration; the focused operator bridge case passed.
- First-Video UX Regression: authoring cancellation is neutral and must not surface `tiinex.authoring.cancelled` as an operator error; raw internal command/stack detail is kept out of the toast and available through explicit Tiinex Output/details; normal Handoff authoring derives endpoint kind from the selected qualified Role/Party rather than asking the human for redundant From Kind/To Kind; package completion offers reveal/copy-path behavior rather than encouraging a binary ZIP to open in the text editor.
- Conversation-Recovery UX Regression: operator context is projected across all explicit/open Workspaces; Workspace identity is not collapsed into physical repository basename; Handoff route selection and endpoint choices remain qualified shared projections; staged-only validation and latest-wins scheduling remain part of the adapter contract.
- Canonical Source Boundary: this package carries full current Site and vscode source/workspace snapshots but deliberately does not embed the `.vsix` binary as canonical source material. Generated `shared-core` remains pinned build material derived from Site and is carried for exact recovery.
- Exact Typecheck Boundary: exact pinned TypeScript qualification remains blocked in the current host because `@types/node 22.10.2` and `@types/vscode 1.95.0` are unavailable. A surrogate transpilation with available TypeScript was used only to execute the regression/runtime suite; this is not represented as pinned typecheck pass.
- Candidate State: dogfood-ready; not merge-qualified; not release-qualified; not Major-013 closure.

## Preservation And Fidelity

- Preservation State: successor full-source Handoff carrier contains current Business, Docs, Site and vscode Workspaces, the Major 013 controlling lineage, this evidence and the dogfood route.
- Fidelity Notes: unchanged Business and Docs bytes may be package-parent reused by Tooling; Site and vscode snapshots are newly enumerated from the current candidate source. Runtime-only `.tiinex` continuation state and standalone VSIX binaries are excluded from canonical Workspace snapshots.
- Known Losses: exact original post-0.1.5 hand-authored transient source from the failed runtime remains lost; the recovered 0.1.6 VSIX is evidence, not a source-of-truth replacement.

## Interpretation Limits

- Does Not Prove: Sigma acceptance, technical authority, exact pinned typecheck pass, merge readiness, release readiness, Marketplace readiness, Major 013 completion or Foundation exit.
- Must Not Be Treated As: permission to infer authority from Sigma's test result, permission to publish/merge automatically, or proof that a deterministic VSIX build is semantically correct merely because its bytes repeat.
- Human Observation Boundary: Sigma is invited only to exercise the candidate naturally and report comprehension/friction/behavior. Anchor retains implementation coordination and technical closure responsibility; canonical semantic authority remains with Docs/Axiom where applicable.
- Not Yet Used As: Sigma acceptance, technical closure, merge qualification, release qualification, publication evidence or Foundation exit evidence.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [024-2-anchor-to-anchor-major-013-cold-start-handoff.trace.md](024-2-anchor-to-anchor-major-013-cold-start-handoff.trace.md)
  - Value: DBksUv4qJZCWfXA-iig2g7dPtkojNketOpEUwZlLf2s

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: v6x960RwvVdGokYFQxhJMkJDilqul5G0eWZvMW4Efs0