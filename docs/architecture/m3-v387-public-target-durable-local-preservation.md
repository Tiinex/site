# M3 v387 — public-target durable-local preservation

## Boundary

A public target owns rendered/runtime membership without owning unrelated durable browser-local work.

```text
public runtime membership
!=
durable local recovery membership
```

The route-level persistence owner is the authority for writes while a public target remains active. It supplies a single persistence policy to immediate, deferred and scroll writes.

## Storage policy

`preserve-existing` means:

```text
session/route cache -> write allowed
localDeltas.v1 -> unchanged
localRecoveryIndex.v1 -> unchanged
```

No merge is inferred between hidden local recovery and public runtime state.

## Ownership release

Only an explicit route-owner transition (for example browser navigation to semantic `#state` or clean route) releases public-target persistence ownership. A later automatic state write is not treated as user intent to leave the public route.
