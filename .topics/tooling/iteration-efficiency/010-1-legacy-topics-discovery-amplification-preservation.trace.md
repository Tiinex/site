# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:30:00
  - Authors: Loom
  - Summary: Preserve A/B evidence showing legacy development artifacts primarily amplify broad projection size and stale findings rather than local CPU time.
  - Status: preserved/local

---

# Legacy Topics Discovery Amplification Preservation

## Preserved Material

- Material Description: full-versus-development-filtered broad `audit` and `inspect` measurements over the current Site `.topics` tree.
- Material Kind: wall-clock, record counts, output byte counts, finding counts, and cleanup-triage evidence.
- Audit Full: `0.93 s`; 405 audits; `6,679,104` output bytes; 129 errors; 52 warnings; 2167 info findings.
- Audit Without `.topics/development`: `0.27 s`; 23 audits; `357,188` output bytes; 0 errors; 0 warnings; 135 info findings.
- Audit Amplification: legacy development material contributes about `18.7x` output-byte amplification relative to the filtered result while adding only about `0.66 s` observed local wall time.
- Inspect Full: `0.52 s`; 411 files; 405 records; `3,026,005` output bytes.
- Inspect Without `.topics/development`: `0.24 s`; 23 files; 23 records; `129,477` output bytes.
- Inspect Amplification: legacy development material contributes about `23.4x` output-byte amplification relative to the filtered result while adding about `0.28 s` observed local wall time.
- Interpretation: legacy development artifacts are a materially stronger context/projection amplifier than a CPU bottleneck for these two broad operations.
- Original Workspace: unchanged; filtered material existed only as a temporary copy outside the Site workspace.

## Preservation Act

- Preservation Method: timed maintained portable `audit` and `inspect` commands against the current `.topics` tree and a copy differing only by removal of `.topics/development`.
- Preservation Time Or State: current warm Site working tree after tasks 001-009.

## Provenance

- Known Source: current Site `.topics` bytes and temporary copy `/mnt/data/topics-audit-filtered`.
- Provenance Limits: these measurements establish broad-operation amplification only; they do not prove that every cold-start path invokes full `.topics` audit/inspect.

## Fidelity And Loss

- Fidelity Notes: the filtered copy retains current schemas, Workspace markers, current iteration-efficiency artifacts, and all non-development `.topics` bytes.
- Known Losses: output formatting and filesystem cache effects can shift exact byte/time observations; ratios are host-local baselines.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact; temporary A/B copy remains outside source authority.
- Reuse Boundary: suitable as evidence for a dependency-discovery and possible legacy-cleanup child task.

## Interpretation Limits

- Does Not Prove: that legacy artifacts caused any platform review event, that all legacy material is semantically unused, or that deletion is safe without dependency analysis.
- Not Yet Used As: deletion authority, Anchor acceptance, release qualification, or host-review causality.
- Must Not Be Treated As: permission to remove referenced artifacts blindly or as evidence that docs are a comparable amplification source.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: f0gdTZXOel2l9KeufuU89E0cY6FXehHzk7JLxWqh3f0