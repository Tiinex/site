# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 23:22:49
  - Authors: Architect
  - Why: v475-v478 closed the false-PASS authoring, integrity, runtime validation and schema-material identity seams; the intentionally deferred pre-v475 dogfood data repair can now be performed against trustworthy oracles.
  - Summary: v479 historical dogfood canonical repair closure
  - Status: draft/local

---

# v479 historical dogfood canonical repair closure

## Objective

Use the now-qualified v475-v478 authoring/validation/reference/integrity stack to repair the pre-v475 dogfood artifacts that were deliberately retained as historical negative evidence. Preserve their actual work/body meaning and lineage while replacing the known false-PASS envelope/footer representations with current canonical Root/Task/Topic representation and explicit repair provenance.

## Done Criteria

Repair exactly the dimensions-normalized v471-v474 Tooling Task/result lineage under `.topics/development/tooling/dogfood/001...` and the original collaboration Topic `.topics/development/collaboration/dogfood/001-tiinex-development-dogfood-collaboration-model.trace.md`. Keep every existing path/dimension stable and preserve each artifact body text/section meaning and original Current Created At. Do not silently turn this into new work or edit historical acceptance claims. For Tooling-lineage Tasks set truthful `Current -> Authors: Architect`; for Tooling results set `Current -> Authors: Tooling`; preserve `Tiinusen; Architect` authorship on the collaboration Topic. Replace obsolete Root/schema reference forms with the qualified current 053d Root and appropriate current Task/Topic references. For every continued artifact, render exact relative Trace and labeled Origin -> relative from the child location. Because the pre-repair v471-v474/collaboration artifacts are available in the published `Tiinex/site` snapshot at commit `32c7c291101b2a6a72c12241f3107d4a56af81fc`, use a commit-pinned `browse + git` Parent Origin only when that exact parent path is verified there; do not fabricate or infer another target. Add explicit structured `Repairs` disclosure to every rewritten historical artifact so readers can see that envelope/schema-reference/integrity representation was canonically repaired after the original dogfood run and can identify the pre-repair published representation. Use the maintained linked `sha256-base64url-c14n-v2` self-integrity method and independently verify final seals. Remove old `record:` Trace, scalar Origin, Parent Boundary, broken schema-basename references and Draft Local Integrity/pending pseudo-footer shapes from the repaired current artifacts. Re-open every repaired artifact through ordinary validate/audit, verify semantic contract + integrity, and verify the full 001 lineage has zero missing/ambiguous Parent edges. Preserve v475-v478 source/artifacts byte-for-byte except where a generic repair owner must be corrected to execute this migration; do not rewrite v475-v478 local-only continuity into fabricated exact publication. Preserve the newly added collaboration Topic `002-site-workspace-config-bootstrap-discovery-direction.trace.md` byte-for-byte and prove it remains exact-create + reopen clean. Add a bounded repair receipt/test that proves historical body preservation and repaired envelope/integrity validity rather than relying on filename or helper success. New v479 result creation must use runtime-owned current creation time unless restoring an existing historical `Created At`; do not invent a model-chosen future timestamp.

## Scope

This is primarily a data/canonical-representation repair over nine historical dogfood artifacts: eight v471-v474 Tooling Task/results plus collaboration Topic 001. Reuse existing canonical renderer, parser, machine-contract validation, schema-reference material authority, dimension/path logic and integrity engine. A generic repair helper may be corrected only if the repair cannot be performed truthfully through existing owners; do not add schema-ID switches, path-specific special cases, GitHub semantic branches, alternate validators or a second renderer. No repair of v475-v478, no product UI/viewer work, no Schema Builder feature work, no Open Schema behavior change, and no Dev schema-reading correction in this tranche.

## Dependencies

Current baseline is terminal v478 plus the new exact collaboration design Topic `002-site-workspace-config-bootstrap-discovery-direction.trace.md`. Architect independently verified v478 Topic source bytes now compute SHA-256 b6fe9893d9ce66734ab249a22796ca77de75f441a4b6eaa3352ad75a1c2405df and Git blob c36472b0d20ad97d01cc1ca78a50fc69ce35fdae, schema bindings/runtime projections pass, exact Topic creation reopens semantic-valid, v471-v478 focused/portable/validation/lineage pressure is green, and the v478 result remains truthful local-only continuity. The original pre-v475 dogfood set was intentionally left unrepaired until this point because prior validator/authoring oracles were not trustworthy. The published refactor snapshot commit `32c7c291101b2a6a72c12241f3107d4a56af81fc` is the known archive point for those historical paths; verify each exact target before using it as browse + git evidence. Fresh Dev remains HOLD only until this repair is audited by Architect/Tiinusen.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Y9TmdmUf5W4pR5yT6JqgvlNGdN3jzoferIeeDYIn2FY
