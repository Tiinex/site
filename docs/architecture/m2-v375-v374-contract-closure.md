# M2 v375 — v374 contract closure

This bounded closure keeps v374 architecture and fixes three ownership gaps plus one copy term.

## Source provenance action

Source-backed Workspace Artifacts present `Open | Merge | Open source`. The source action is visibly labeled on this primary surface only. Local Workspace Artifacts never gain guessed source provenance.

## Durable explicit file targets

`explicitFileRefs` is canonical GitHub source configuration, independent of `repoDiscovery`. It is deduped and preserved through source save/load, route/session source projection, continuation/edit and reload input. Operation `fileRefs` are a projection from this canonical source field, not a separate durable truth.

## Targeted schema provenance

A reading-contract recovered from an exact GitHub file remains source-backed and points to the exact source, but a `github.file` recovery source has `loadable:false` and therefore cannot advertise broad repository discovery. The loaded count reflects the recovered schema.

## Copy

The user-facing no-load operation is `Save source`; registration remains an internal boundary term only.

No M3 route/share redesign, M4 authoring, full M5 lineage taxonomy, transport redesign, or new Q gate is included.
