# M2 v374 — Q acceptance #1 product-contract correction

## Status

Bounded correction after Q acceptance #1 and architect re-discovery. Preserve all previously passing M1 and M2 Workspace Spine ownership.

## A — Workspace insertion order

Canonical workspace creation appends. Open/Merge workspace-entrypoint sets consume declared order directly; no reverse-loop compensation remains. Create focuses the appended workspace; Open focuses the first declared workspace while preserving durable local work per M1 semantics.

## B — GitHub broad discovery vs exact targets

`source.issueDiscovery` means broad/bounded public issue discovery only. `source.issueUrls` contains exact durable targets. The issue snapshot surface is requested when either dimension requires materialization, but requested materialization never infers broad discovery. Broad + explicit materialization is union + dedupe; explicit-only survives route/source continuation and refresh with broad discovery still false.

## C — Workspace Artifact provenance action

A source-backed Workspace Artifact exposes truthful `Open source` in the primary action row with Open/Merge. Local/session Workspace Artifacts expose no external source action unless explicit provenance exists. Details/Markdown/Share remain secondary.

## D — Reading-contract recovery

Schema navigation resolves in this order: already-loaded exact schema; explicit declared reading-contract target recoverable from truthful source/origin context; bundled viewer fallback; unavailable. Absolute declared GitHub/raw targets are authoritative. Relative targets require verified source repo/ref/path context. Recovered schema records retain source-backed provenance and may reuse the existing bounded lineage-parent recovery; no second lineage engine is introduced.

## E — Receipt currentness

Import/materialization receipts remain diagnostic history. A source-scoped receipt may drive current material/empty-state presentation only while its source remains configured. Closing source A does not delete A history and does not prevent current source B receipts from representing current state.

## F — Source dialog hierarchy

The primary GitHub source form uses neutral readable field hierarchy, explicit broad-discovery checkboxes, independent exact-target inputs, and Save source vs Load/Reload material commands. Transport/cache/proxy/direct internals are secondary Technical details; operation results belong to receipts rather than a competing pre-operation panel.

## Explicit nonclaims

No M3 share/deep-link semantics, M4 authoring/transitions, full M5 lineage/status presentation redesign, transport redesign, export/publication redesign, or new Q gate is included in v374.
