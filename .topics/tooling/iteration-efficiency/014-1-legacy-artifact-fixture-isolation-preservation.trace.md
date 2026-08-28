# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:48:00
  - Authors: Loom
  - Summary: Preserve exact fixture-byte equivalence and legacy-tree-independent focused validation for the bounded historical fixture isolation.
  - Status: preserved/local

---

# Legacy Artifact Fixture Isolation Preservation

## Preserved Material

- Material Description: exact copied fixture set, byte-equivalence evidence, focused consumer results, and a temporary whole-legacy-tree absence probe.
- Material Kind: test-fixture migration and cleanup-precondition evidence.
- Historical Source Surface: `.topics/development` contains approximately `388` files and `2.86 MB` from the prior workset baseline.
- Required Physical Fixture Set: `16` files totaling exactly `90,606` bytes.
- Byte Fidelity: all `16 / 16` copied fixtures were byte-identical to their historical source files at migration time; each physical fixture uses `.trace.fixture.txt` storage while tests retain the historical logical `.trace.md` identity where semantically relevant.
- Focused Green Consumers: material closure; route artifact conformance; workflow schema enablement closure; historical dogfood canonical repair closure; runtime validation contract unification closure; Party Role material authoring closure.
- Existing Baseline Consumer: `portable.loadedParentIdentityEvidenceClosure.test.mjs` returns `blocked` where it expects `created-local-continuity`; a temporary copy using the old direct `.topics/development` read reproduced the identical assertion failure.
- Legacy-Tree Absence Probe: with the entire `.topics/development` directory temporarily moved outside Site and restored by shell trap, all six green consumers remained green and the existing loaded-parent test failed with the same semantic assertion rather than `ENOENT`.
- Deletion State: not performed; this task establishes the precondition for a separately reviewable cleanup task.

## Preservation Act

- Preservation Method: copied exact bytes, compared SHA-256/length and byte equality for every selected fixture, rewired only physical fixture reads, then reran direct consumers both normally and with the legacy tree temporarily unavailable.
- Preservation Time Or State: captured on the warm Site state after iteration-efficiency task `013` and before any physical deletion of `.topics/development`.

## Provenance

- Known Source: current Site working tree and the 16 explicitly identified legacy files still consumed as physical test fixtures.
- Provenance Limits: the selected fixture set proves direct dependencies found in the current test/source scan; synthetic historical path strings remain intentionally unchanged because they do not require physical legacy bytes.

## Fidelity And Loss

- Fidelity Notes: copied fixture contents are exact; logical historical paths remain supplied to validation/materialization APIs when identity matters; only physical storage location and suffix changed.
- Known Losses: none in fixture bytes; filesystem location itself is intentionally no longer treated as historical semantic authority.

## Custody Or Storage Boundary

- Storage Or Custody State: exact fixture copies live under `src/tooling/portable/fixtures/legacy-artifacts/`; mapping logic is Node-only test support.
- Reuse Boundary: suitable for historical regression tests; not a source of current Site artifact authority or discovery grounding.

## Interpretation Limits

- Does Not Prove: that every legacy artifact may be deleted without a broader validation pass, that synthetic legacy path strings should be rewritten, or that legacy artifacts explain host-side review behavior.
- Not Yet Used As: Anchor acceptance or release qualification.
- Must Not Be Treated As: permission to erase repository history or to change historical logical identity inside contract tests.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:BB5XnDTIgHeG_Lsfsk2aKg6hdtYkFMK-juhCPQt1VYk
