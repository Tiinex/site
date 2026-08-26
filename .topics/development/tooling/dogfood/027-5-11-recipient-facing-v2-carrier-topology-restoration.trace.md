# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-25 09:57:00
  - Authors: Anchor
  - Why: Correct the recipient-facing carrier-v2 topology after Sigma rejected the first live candidate for retaining the legacy control-plane envelope around the new archive-backed Workspace representation.
  - Summary: Tooling 027-5-11 restores the agreed flat Tiinex-artifact-and-payload carrier surface, makes orientation/resolution work without exposed legacy control JSON, preserves accepted archive-backed Workspace mechanics and current/v1 behavior, and adds regressions that fail the exact 027-5-10 outer shape.
  - Status: open/local

---

# Tooling 027-5-11 recipient-facing v2 carrier topology restoration

## Objective

Implement the actual recipient-facing archive-backed Handoff carrier format that Sigma expected: a flat, human-readable outer tree of ordinary Tiinex artifacts and the payload archives they explicitly describe or target. Remove the legacy package-control envelope from the v2 recipient surface without weakening Handoff, Workspace, Parent, integrity, closure, provider, or archive-binding authority.

The first single-workspace/single-route shape should be structurally equivalent to:

```text
001-READ-BEFORE-PROCEEDING.trace.md
001-1-bootstrap.trace.md
001-1-bootstrap.zip                       # optional when bootstrap is carried
001-2-tiinex-site.workspace.md
001-2-tiinex-site.workspace.zip
001-2-1-handoff-pointer.trace.md
001-2-1-1-cache.trace.md                  # optional only when cache bytes are needed
001-2-1-1-cache.zip                       # optional only when cache bytes are needed
```

The names are human/pathing lineage and package placement, not semantic identity. Exact carried Tiinex artifact bytes and qualified artifact semantics remain authoritative; package names/adjacency/order do not mint Workspace, Handoff, Parent, acceptance, completion, or provider authority.

## Done Criteria

- The v2 outer root contains only qualified Tiinex Markdown artifacts and payload archives explicitly owned/referenced by those artifacts. No recipient-facing control directory is required for normal orientation.
- The exact first-live old-v2 surface is rejected by a dedicated regression: `context/`, `handoff.workspaces/`, `tiinex.bootstrap/`, `tiinex.package/`, and opaque generated `handoff-entrypoint-*` as the primary Start surface must not be accepted as the new human carrier topology.
- No outer package-control JSON is required or exposed in v2. `context/workspace.json`, `tiinex.package/*.json`, and equivalent legacy control files must not be necessary for v2 orientation, route selection, Workspace/archive correlation, closure inspection, or roundtrip verification.
- JSON/source files remain allowed inside explicit payload ZIPs such as bootstrap, Workspace snapshot, or optional cache. The rule is about the exposed carrier control surface, not payload contents.
- `001-2-tiinex-site.workspace.md` carries the exact qualified `tiinex.workspace.v1` artifact bytes used for Workspace identity. Its paired `.workspace.zip` is exact transport/material representation only. Filename, adjacency, and matching numeric pathing do not substitute for byte/integrity/schema qualification.
- `001-2-1-handoff-pointer.trace.md` is the obvious normal Start artifact and uses canonical `tiinex.pointer.v1` semantics to identify the selected Handoff/recipient route without embedding hidden carrier authority.
- `001-READ-BEFORE-PROCEEDING.trace.md` is a qualified Tiinex recovery/orientation artifact, not an untyped README or JSON projection. It tells a cold human/LLM how to use the visible Tiinex artifacts when preferred tooling is unavailable, while not duplicating route authority.
- Bootstrap, when needed, is represented by a qualified Tiinex artifact plus its referenced ZIP payload. Runtime/bootstrap code and internal JSON stay inside that payload rather than becoming an exposed directory tree.
- Optional cache is emitted only when exact required bytes are absent from the Workspace payload and otherwise unresolved. It is represented by a qualified Tiinex artifact plus ZIP payload and must not duplicate exact Workspace bytes.
- `orient-handoff-package`, selected-route resolution, context audit, roundtrip, tamper detection, and cold-consumer projection operate on the new v2 surface without first reconstructing legacy control files or doing arbitrary filename/content archaeology.
- Shared resolver/tooling remains representation-neutral: v1 continues to read the current exploded/control carrier unchanged; v2 reads the qualified artifact/payload topology. No provider name or package path gains semantic authority.
- Multi-workspace and multi-route behavior remains deterministic and recipient-relative. Pathing labels may extend deterministically but must not leak sibling routes into a selected cold delivery.
- Existing accepted archive-backed Workspace qualification, complete/partial truth, exact archive-entry digest checks, Required Context dedup, tamper rejection, direct-v2 scale behavior, and Workspace self-integrity validation remain green.
- Current/default v1 manufacture bytes/topology and its regression suite remain unchanged.
- A real Tiinex/site v2 candidate built from the retained full source completes within the accepted 120-second host window and its root tree satisfies the new outer-shape gate.
- Loom returns exactly one CURRENT/v1 route-scoped package to Anchor. Do not present the temporary v2 verification ZIP as a user-facing return candidate; Anchor owns independent manufacture/audit and Sigma owns the next personal inspection gate.

## Scope

- In scope: v2 recipient-facing serialization/topology, v2 artifact/payload orientation/resolution, v2-specific outer-shape conformance, representation-neutral shared readers where required, deterministic labels/pathing, tests/fixtures, and bounded refactors needed to keep static discipline.
- Preserve: Tooling 027-4 semantic disposition, 027-5 archive-backed Workspace mechanics, Workspace target conformance, c14n-v2 verification, direct-v2 performance corrections, package-local transport semantics, provider-neutral closure, and current/default v1 behavior.
- Do not introduce a generic semantic Handoff package schema merely to replace removed JSON controls.
- Do not mint transport-only Workspace identity or rewrite canonical Tiinex artifact bytes merely to fit package placement.
- Do not infer semantic edges from the numeric filename tree; pathing lineage and semantic Parent remain distinct.
- Do not perform publication, commit, push, authentication, credential use, or remote mutation.
- Do not begin fresh cold-start qualification in this tranche.

## Dependencies

- [Sigma first-live v2 carrier audit failure feedback](027-5-10-2-first-live-v2-carrier-sigma-audit-fail-feedback.trace.md)
- [Tooling 027-5-10 Anchor acceptance](027-5-10-full-source-v2-scale-anchor-acceptance.trace.md) as accepted plumbing/performance baseline but reopened only for recipient-facing topology.
- [Tooling 027-4 Workspace/archive binding Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md) for semantic ownership boundaries.
- [Tiinex Site workspace](../../../.workspaces/tiinex-site.workspace.md) for real Workspace identity/target qualification.
- Existing `tiinex.pointer.v1`, `tiinex.external.payload.v1`, `tiinex.workspace.v1`, Root/integrity, Handoff, and provider-neutral material-closure authorities must be reused where they truthfully fit. If one visible artifact role cannot be truthfully represented by existing canonical authority, stop at that exact semantic blocker and return it rather than inventing a local pseudo-schema.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: OwZAu-rm94lfemsEh73h3uGF-p1pB5795tV-SoyUjic