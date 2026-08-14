# M2 v382 — dead candidate helper removal

## Boundary

v381 established the canonical quarantine:

```text
legacy candidate
→ explicit compatibility / I/O normalization
→ canonical Workspace Artifact record
──────────────── canonical runtime boundary
→ no candidate runtime model
```

v382 removes the unused candidate reconciliation/restoration graph that remained inside `workspace.sourceRecords.js` despite having no consumers.

Canonical source-record ownership now contains only source-record insertion/reconciliation and receipt behavior.

## Explicit compatibility retained

`workspace.candidates.js` and later package/export/reingest/storage/tooling compatibility are not broadened or purged here. If a future real compatibility consumer requires candidate conversion, that boundary must be established explicitly rather than reintroducing candidate helpers into the canonical source-record owner.

## Gate

No broad audit follows this cleanup. Targeted architect review is the next gate; if clean, the process may proceed to M2 Q acceptance #2.
