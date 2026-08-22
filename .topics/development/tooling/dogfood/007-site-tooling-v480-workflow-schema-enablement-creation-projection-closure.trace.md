# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 03:05:11
  - Authors: Tiinusen; Architect
  - Why: v479 is a clean Site synchronization point and Tiinex/docs now publishes canonical Handoff plus the workflow artifact families needed to replace chat-heavy development coordination with durable Tiinex artifacts.
  - Summary: v480 workflow schema enablement and creation-contract projection closure
  - Status: draft/local

---

# v480 workflow schema enablement and creation-contract projection closure

## Objective

Enable the published workflow artifact vocabulary needed by the Site dogfood loop—Handoff, Decision, Feedback, Evidence, Discovery, and Discovery Finding—through the same generic canonical schema-source, material-identity, runtime-projection, validation, guide, planning, and authoring stack already qualified for Root, Task, and Topic. Correct the generic Artifact Creation Contract projection so creation-scope criteria are not misreported as ordinary artifact authoring inputs.

## Done Criteria

Use `Tiinex/docs@e713557f8be630967571d11a73f9ecd05ae329ce` as immutable external schema authority for this tranche. Add or migrate qualified Site schema modules for `tiinex.handoff.v1`, `tiinex.decision.v1`, `tiinex.feedback.v1`, `tiinex.evidence.v1`, `tiinex.discovery.v1`, and `tiinex.discovery.finding.v1`. Qualify only the direct ancestry needed for complete-to-Root interpretation: `tiinex.signal.v1` for Feedback and `tiinex.preservation.v1` for Evidence; Discovery Finding must resolve through Discovery. Verify actual loaded/bundled bytes against the published Git blobs before claiming material equivalence. Manifest/source metadata, semantic material identity, runtime projection and readable bundled Markdown must agree; stale `sourceBlobSha`, source-commit metadata, target equality, or schema ID alone may not stand in for loaded-byte proof. Preserve provider-neutral schema-id-only behavior for unknown/custom schemas.

For generic Artifact Creation Contract interpretation, reproduce the Architect/Schemer finding that corpus-established `Creation Scope -> Required Fields -> Create When / Do Not Create When` is currently projected as if those labels were ordinary authoring inputs. Fix the shared compiler/guide/planner owner rather than Handoff or any schema-specific adapter. Creation-scope criteria must remain creation/generation criteria; actual authoring inputs must continue to come from schema-declared input/creation-field semantics and validation/body requirements. Pressure this across Handoff and multiple pre-existing maintained schemas using the same contract parser, including a schema with `Creation Fields` and one with the `Creation Scope` pattern. `schema-guide` / `plan-artifact` must not ask callers to supply `Create When` or `Do Not Create When` merely because a schema uses that corpus pattern.

After enablement, ordinary read/audit/validate/schema-guide/plan-artifact must consume the new schemas through generic registry/source/compiler paths with complete truthful qualification. Handoff must preserve the published semantic boundary that only explicit Transfers move bounded work/responsibility; workspace/package membership, Authors, paths, Required Context and Reference Context must not imply transfer. Do not add a generic Handoff ZIP/package schema or package-membership ownership inference. Add focused v480 regression coverage and rerun v471-v480 dogfood pressure plus the complete available source/repository gate matrix. Return a durable Tooling result/evidence artifact and the entire updated repository/worktree ZIP.

## Scope

This tranche is schema-family enablement plus one generic creation-contract interpretation correction. Prefer generated/shared schema module and runtime-projection machinery; do not hand-maintain parallel validators, schema-ID switches, first-candidate authority, GitHub semantic special cases, filename/path inference, or per-schema Creation Scope exceptions. Existing exact Root/Task/Topic behavior and v475-v479 closures must remain intact. Do not redesign Handoff semantics, Handoff packaging/export machinery, Viewer product UI, workspace bootstrap behavior, fresh Dev execution, or pre-master legacy-doc cleanup here. If adding one requested schema exposes a missing direct parent-schema dependency, qualify only that dependency and prove why it is required rather than broad-migrating the docs corpus.

## Dependencies

Published docs authority is commit `e713557f8be630967571d11a73f9ecd05ae329ce`. Verified Git blobs at that commit are: Handoff `ce5305f943baee51762d07967dc43290dfc65fa1`; Decision `866ed2d1f2d213d13e68866fd51b5faad155a15c`; Feedback `7337a482400557ddece16c65a8ec60df441af22b`; Evidence `430367bb717d93e396a50c993dc011f8d129bf54`; Discovery `1e18d78521c6298d243f1c87a84155be040f032c`; Discovery Finding `e4f4b5caaf590ed3dc138b5bf2f25e2ece85e6b8`; Signal `d2c88bd0d1695efc828a3f718429d772aba4c9ca`; Preservation `0a2f653a7188defcdf8bd60d9b845c695438f6b4`. Handoff was accepted by Schemer with packaging mechanics explicitly outside the schema. Schemer also classified the Creation Scope behavior as cross-schema Site/compiler compatibility debt, not a Handoff schema defect. Current Site already bundles Evidence and Preservation but their authority metadata predates the exact source-coherence closure; verify bytes and migrate truthfully rather than assuming they need semantic rewrites. v479 historical dogfood repair is Architect-audited PASS and is the current Site source baseline.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:Yud0nDZ86JeXHG1KK8sjqDIOesjPXZ5CFlrcyqZG80g
