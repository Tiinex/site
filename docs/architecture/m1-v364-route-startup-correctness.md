# M1 v364 route/startup correctness corrections

v364 preserves the v359-v363 structural recovery and closes the three bounded gaps found in architect review of v363.

## 1. Monotonic route/cache hydration

Explicit route membership remains authoritative. For matching identities, cache may hydrate an unavailable/material-light route shell, but must not downgrade richer route-owned material or its availability/cache state.

Regression proof covers a route-owned issue snapshot with Markdown and `available` state against a weaker metadata-only session-cache entry, plus an equivalent asset case.

## 2. Route decode owns initial render phase

`#state=` text alone is not proof of resolved route ownership. Initial product render is `resolved` only when persistence actually decoded a usable explicit route. Clean/default and malformed/unusable route starts remain `resolving`, so genuine EmptyStage does not masquerade as startup failure/intermediate state.

## 3. Async startup ownership generation

Startup transitions claim an ownership generation. Browser route/navigation invalidates the previous generation. Stale startup results may not commit, begin source materialization, rewrite startup phase or emit product notices. Route navigation also aborts any in-flight GitHub source operation; source-operation callbacks are owner-guarded.

## Nonclaims

v364 is an architect-review candidate, not M1/product/Q PASS. Browser/Vite proof depends on dependency availability in the execution environment. Public/runtime build remains separately qualified. M2 is not started.
