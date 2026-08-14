# M1 v363 route/cache + startup render parity corrections

v363 preserves the v359-v362 structural recovery and closes the two M1 gaps found by the architect in v362.

## 1. Explicit route membership authority

An explicit `#state` route owns workspace/source/record/asset membership and identity. Session/source cache may hydrate matching identities only; it may not add stale cache-only members or remove route members.

Implementation owner:
- `src/workspaces/workspace.persistenceRouteCache.js`
- `src/workspaces/workspace.persistence.js`

Regression proof uses the same workspace id with deliberately different route/cache sources, records and assets. The route membership survives unchanged.

Durable local deltas remain a separate augmentation authority and are not folded into source/session-cache membership.

## 2. Startup resolving is not EmptyStage

Clean/default/query/host startup begins in an explicit `resolving` render phase. The product stage is withheld until startup ownership resolves or fails.

Implementation owner:
- `src/app/startupRenderPhase.js`
- `src/app/TiinexApp.jsx`

Contract:

```text
startup resolving
!=
resolved workspace count = 0
```

A normal embedded/default startup therefore cannot flash the genuine no-workspace MOTD while ownership/materialization is still being established. No bootstrap panel or debug UX is introduced.

## Nonclaims

v363 is an architect-review candidate, not M1/product/Q PASS. Public Vite/runtime build remains separately qualified. M2 is not started.
