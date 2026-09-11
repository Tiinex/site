# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:32:00
  - Trace: [Viewer PoC Parity Recovery — Site Implementation](001-viewer-poc-parity-recovery-implementation-task.trace.md)
  - Origin:
    - [relative](001-viewer-poc-parity-recovery-implementation-task.trace.md)
- Current
  - Current Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-02 02:36:00
  - Authors: Anchor
  - Why: Turn PoC product demand into explicit Tooling prerequisites so Viewer cannot become a privileged semantic path and Tooling simplification can optimize the operations Viewer genuinely needs.
  - Summary: Viewer PoC Tooling Prerequisite Matrix
  - Status: draft/local

---

# Viewer PoC Tooling Prerequisite Matrix

## Discovery Intent

- Intent: identify the shared portable capabilities that must be inspectable/qualified before each Viewer recovery group is implemented or called parity-ready.
- Starting Question: what must Tooling be able to represent, inspect, validate, or execute so Viewer remains a presentation/interaction surface over the same authoritative behavior?

## Discovery Outcome

| PoC recovery group | Tooling prerequisite | Viewer later consumes |
| --- | --- | --- |
| Ingress and Workspace | local/archive intake result, explicit conflicts/password/degraded state, Workspace artifact identity, Open/Merge lifecycle, source-over-import reconciliation | add/drop/import and Workspace opening UX |
| Read and Navigate | bounded inspect/read, Root fallback, qualified schema identity, path tree, search, Parent/Trace/Origin resolution and loaded-lineage traversal | Feed, Tree, Lineage, filters, detail |
| Act and Author | schema capability/creation contract resolution, canonical planning/materialization, draft validation, Continue/Reference/Use-as distinctions | create/action dialogs and generated artifact review |
| Persist and Recover | explicit local-delta/source-cache/route-shell authority, serialization/recovery diagnostics, no stale unrelated bootstrap | refresh, local recovery, share/session UX |
| History and Source | source registration/materialization distinction, exact ref/commit representation, transport diagnostics, immutable historical read intent | GitHub source UX and Time Portal |
| Export and Publish | ordinary tree export versus qualified Handoff package, exact file map/manifest/receipt, publication preflight/verify and re-ingest boundary | export/share/publication controls |
| Truthful Presentation | stable capability/status/finding projections with partial/unavailable/degraded states and bounded summaries | labels, badges, actions, browser diagnostics |

## Tooling-First Gate

- A Viewer slice may begin presentation implementation when its semantic/runtime prerequisite already exists and focused deterministic qualification can exercise it cheaply.
- If the prerequisite is missing, the gap becomes a Site/Tooling Task first; Viewer does not invent a private semantic implementation.
- If the prerequisite exists but its common CLI path is unnecessarily verbose, the `005` common CLI ergonomics task may simplify access without changing semantic ownership.
- Human-only presentation concerns may proceed after their underlying data/read model is qualified; they do not require CLI visual equivalence.

## Interpretation Limits

- Tooling parity means equivalent semantic access and reproducibility, not identical UI/CLI interaction. This matrix does not require every Viewer control to have a one-to-one command, nor every advanced Tooling operation to receive a Viewer control.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Viewer PoC Parity Recovery — Site Implementation](001-viewer-poc-parity-recovery-implementation-task.trace.md)
  - Value: 6buMgvvatcMH-Cij-_v03JoapUlb_Cj8YGLmkSxXUtM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:-nKQXe2KKUfrbihk37EcVLyAlLJZMEvqg0NgC9UnEro
