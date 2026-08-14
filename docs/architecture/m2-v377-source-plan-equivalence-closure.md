# M2 v377 — source-plan equivalence closure

## Boundary

Configured source stable identity remains owned by the existing configured-source identity (`repo/ref/root`-based source id). v377 only corrects **plan equivalence/completeness** used by workspace entrypoint merge decisions.

Current source-plan equivalence includes:

```text
repo / ref / root
repoDiscovery
issueDiscovery
normalized issueUrls
normalized set-like explicitFileRefs
```

`requestedSurfaces` remains materialization/history state and is not current configuration authority.

## Exact targets

`explicitFileRefs` uses the existing target normalizer. For equivalence, the normalized set is sorted so ordering is not semantically significant.

A changed exact target set is not already loaded. Explicit-only plans are material-bearing and must have corresponding loaded exact material (or legacy count evidence when no explicit surface ledger exists) before the lifecycle may skip materialization.

## Nonclaims

This closure does not alter GitHub dialog UX, transport policy, reading-contract recovery, workspace ordering, M2 window/session presentation, M1 Open/Merge durability, or M3 route/share semantics.
