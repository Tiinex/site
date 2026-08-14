# M1 v365 route truth / semantic resolution corrections

v365 preserves the v359–v364 recovery and closes the two bounded route-boundary gaps found in architect review of v364.

## 1. Route compaction is truthful about carried material

Ordinary source-backed record Markdown is omitted from the route and is therefore serialized as `material-unavailable` / `route-shell-material-unavailable`. Bounded issue snapshots that actually embed Markdown remain `available`. Asset bytes/previews are omitted from route state and cannot retain runtime `available` claims. Durable local payload remains local-delta-owned.

Regression proof starts from materialized runtime records/assets, calls the real `makeRouteState()` / `writeState()` path and verifies the serialized/restored shell.

## 2. Semantic route ownership

`workspace.persistence.resolveInitialState()` is the single explicit route-resolution contract used by both initial React startup and popstate/hashchange. Resolution is:

```text
decode
→ validate supported route version/shape
→ hydrate matching cache/local boundaries
→ { requested, resolved, state, reason }
```

Canonical v2 routes and recognized legacy v1 route state are supported. Arbitrary parseable JSON, unknown route versions and malformed encoding are unresolved. A correctly shaped v2 route with `workspaces: []` is explicitly treated as a legitimate resolved empty route.

## 3. Startup ownership hardening

The startup ownership generation also guards config diagnostics. A stale async startup cannot rewrite diagnostic truth after a newer route owner wins.

## Qualification boundary

v365 is an architect-review candidate, not M1/product/Q PASS. Browser/Vite/public proof remains separately qualified. M2 is not started.
