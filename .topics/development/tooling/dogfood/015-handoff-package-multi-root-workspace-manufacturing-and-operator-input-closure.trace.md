# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 21:42:00
  - Authors: Anchor
  - Why: Close the actual-path gap between the already plural core Handoff package model and the normal one-root Node/CLI manufacturing surface so a human operator can supply all required workspace bytes without caller-side per-file assembly.
  - Summary: Expose qualified 1..N workspace-root materialization in the normal portable Handoff manufacturer while preserving one-root ergonomics, deterministic enumeration, route-to-workspace binding, completeness evidence, and fail-closed collision behavior.
  - Status: open/local

---

# Tooling 015 — multi-root workspace manufacturing and operator input closure

## Objective

Extend the normal portable `manufacture-handoff-package` Node/CLI path so one invocation can accept and deterministically enumerate one or more complete workspace roots, append them to the existing plural `workspaceMaterializations[]` core contract, and manufacture one recipient-relative or shared-route package without ad-hoc caller-side file enumeration or ZIP assembly.

## Done Criteria

- Recover the existing plural core/package behavior first. Do not reimplement `workspaceMaterializations[]`, route qualification, closure, carrier projection, START correlation, Tooling bootstrap, or package serialization under a second model.
- Preserve the current single positional workspace-root path as the ergonomic single-workspace default.
- Add an explicit bounded CLI/input surface for additional workspace roots or workspace descriptors. Each added workspace must have an explicit workspace id; human title/source metadata may be supplied but must not self-authorize source semantics.
- Deterministically enumerate every supplied local workspace root with the same completeness-evidence rules, exclusion policy, file limits, binary preservation, and symlink behavior used by the current one-root adapter.
- Fail closed on duplicate workspace ids, ambiguous route membership, path/correlation collisions, incomplete enumeration, unavailable roots, or a request that cannot be represented without weakening existing package truth.
- Preserve route membership as `(workspaceId, workspace-relative Handoff path)`. A shared carrier may qualify routes in different workspaces and may also carry a workspace that has no route when it is explicit operator-supplied dependency/authoring material.
- Keep source availability separate from source authority. A supplied archive/directory snapshot may be carried and byte-qualified without claiming that a Git host default branch, remote head, or local directory is the intended authoring authority.
- Add focused Node/CLI regression coverage for at least: Site + Docs two-root manufacturing; one-route package with a secondary carried workspace; two routes bound across one or two workspaces; duplicate-id rejection; missing-root rejection; binary byte preservation; and normal one-root backward compatibility.
- Prove the resulting package through normal package, closure, carrier, cold-consumer, companion, Tooling-bootstrap, and full roundtrip inspection. No manual per-file package construction is accepted as completion evidence.
- Update portable help/bootstrap/docs so a fresh consumer can discover the new multi-root operator-input path without predecessor-chat knowledge.
- Return exact changed source, tests, timings, limitations, and a recipient-relative Loom return Handoff to Anchor. Do not claim generalized filesystem/source discovery beyond the implemented operator-supplied local-root boundary.
- Current-host dogfood reproduced an additional bounded scaling warning while preparing this task: a Tooling-owned plural-core Site + Docs build exceeded 180 seconds after both roots were enumerated, and a single-root build carrying the same ~30 MB Docs archive as explicit detached material also exceeded 180 seconds after preparation. Treat this as contradictory/current-host performance evidence, not a root-cause claim or universal SLA. Before declaring the operator-input path ergonomic, record exact timings on the same concrete fixture, preserve Tooling 014's no-speculation discipline, and return any unresolved variability explicitly.


## Scope

Portable Handoff manufacturing adapter/CLI, focused package tests, documentation/bootstrap discoverability, and only directly required shared core integration. Out of scope: canonical Workspace/Source/Handoff schema mutation, repository cloning, Viewer UX, Process semantics, publication, or automatic authority inference.

## Dependencies

- [Tooling 013 Anchor acceptance](013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md) is the accepted plural workspace/route representation that this task must expose rather than redesign.
- [Tooling 012 Anchor acceptance](012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md) preserves shared-route closure and human projection behavior.
- [Tooling 011 Anchor acceptance](011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md) preserves deterministic workspace enumeration, bootstrap, ZIP serialization, and full roundtrip.
- [Workspace source binding signal](../../architect/continuity/001-19-5-workspace-source-binding-and-lazy-discovery-signal.trace.md) requires source-neutral, fail-closed authority discipline.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:XoCmUudunEcJ5rbanSoQPRblSfhPM67a0EgBvrhhy5E
