# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:04:00
  - Authors: Loom
  - Summary: Preserve the deterministic Site repository workset baseline and cleanup-decision evidence for iteration efficiency.
  - Status: preserved/local

---

# Site Grounding Workset Baseline Preservation

## Preserved Material

- Material Description: exact repository inventory output and legacy hotspot decomposition from the current Site working tree after task 001, before any legacy cleanup.
- Material Kind: deterministic file-count/byte-count measurements plus focused test observation.
- Focused Test: `node tools/measure-tooling-workset.test.mjs` passed and printed `repository workset measurement is deterministic and excludes dependency/build trees`.
- Baseline Command: `node tools/measure-tooling-workset.mjs --json` completed in external elapsed `0.05 s`.
- Repository Total: 1,657 files; 12,904,603 bytes.
- Current Iteration Efficiency: 3 files; 10,308 bytes; 0.18% of files; 0.08% of bytes at measurement time.
- Legacy Topics Development: 388 files; 2,856,963 bytes; 23.42% of files; 22.14% of bytes.
- Legacy Topics Continuity: 1 file; 3,198 bytes; 0.06% of files; 0.02% of bytes.
- Docs: 67 files; 145,399 bytes; 4.04% of files; 1.13% of bytes.
- Tooling Source: 234 files; 2,585,678 bytes; 14.12% of files; 20.04% of bytes.
- Tooling Tools: 23 files; 116,805 bytes; 1.39% of files; 0.91% of bytes.
- Legacy Development Hotspots By First Segment: `tooling` 166 files / 1,241,539 bytes; `handoff` 119 / 990,678; `architect` 95 / 579,496.
- Legacy Development Hotspots By Second Segment: `tooling/dogfood` 165 files / 1,234,642 bytes; `architect/continuity` 95 / 579,496; `handoff/loom` 66 / 549,752; `handoff/anchor` 20 / 167,081; `handoff/tooling` 15 / 113,218; `handoff/axiom` 12 / 108,645.

## Preservation Act

- Preservation Method: copied numeric output from the deterministic read-only Site inventory tool and a read-only directory hotspot aggregation.
- Preservation Time Or State: captured after completion of Site task 001 and before any cleanup or workset-reduction mutation.

## Provenance

- Known Source: `/mnt/data/tiinex-site-reviewed-turn-work`, the warm Loom working state containing task 001 plus this task's two diagnostic tool files.
- Provenance Limits: these numbers measure repository presence only; they do not prove which files a Tiinex operation actually opens, parses, projects, hashes, validates, or sends into model context.

## Fidelity And Loss

- Fidelity Notes: file counts and byte totals are exact for the measured tree under the tool's documented exclusions (`.git`, `node_modules`, `.site-publish`).
- Known Losses: archive/compressed size, filesystem metadata cost, parse cost, semantic relevance, model-context cost, host review latency, and actual runtime access frequency are not represented.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact under `.topics/tooling/iteration-efficiency/`.
- Reuse Boundary: suitable as a before-cleanup baseline and as input to a later actual-access/grounding measurement task.

## Interpretation Limits

- Does Not Prove: that legacy `.topics/development` causes slow execution or host additional review; that docs are irrelevant; or that deleting any measured material is safe.
- Not Yet Used As: cleanup authorization, operation-level access evidence, Anchor acceptance, or transport closure.
- Must Not Be Treated As: authorization to remove legacy material, a substitute for actual operation-level access measurements, or evidence about internal host safety-review causes.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: hY63TBshQW4HjaN8uAmcb-QSx8L7adiIE2Lrw2xx38I