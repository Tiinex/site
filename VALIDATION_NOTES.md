# Validation Notes v238

## Root cause hypothesis

User testing on v237 showed that the transport badge could move between tiers, but GitHub issue snapshots still did not load through mirror/proxy in the browser. Cache/direct were the only paths that were practically useful.

The most likely root cause was a browser/runtime mismatch in `src/adapters/github/github.issueSurface.js`: the mirror/proxy issue wrappers tagged native Fetch `Response` values by creating an `Object.create(Response.prototype)` shell and assigning `transportTier`. Native response accessors are brand-checked, so the shell is not a real response. This can turn a successful mirror/proxy issue fetch into an unavailable/degraded issue surface in browsers. Existing tests used plain fake response objects, so they did not exercise this browser behavior.

## Fix

- Replaced the native-response prototype shell with a plain delegating transport response object.
- Preserved response semantics needed by issue discovery/materialization: `ok`, `status`, `statusText`, `url`, `headers.get`, `text`, `json`, `clone`, and `transportTier`.
- Added native `Response` coverage to `src/adapters/github/github.adapter.test.mjs` for explicit proxy issue snapshots.
- Added architecture guard coverage to prevent `Object.create(Object.getPrototypeOf(res))` from returning to the issue-surface transport wrapper.

## Guard coverage

- `src/adapters/github/github.adapter.test.mjs` now proves explicit proxy issue transport works with native Fetch `Response` objects.
- Existing v237 tests still prove:
  - explicit proxy issue refresh reads issue snapshots via the GitHub issue API tier;
  - explicit proxy does not silently fall through to direct;
  - explicit mirror reads hosted issue snapshots;
  - explicit mirror does not call `api.github.com`.
- `tools/check-architecture-shape.mjs` prevents native `Response.prototype` shell wrapping in the issue-surface transport layer.

## Known limits

- Mirror still requires hosted issue snapshots to exist at one of the configured/default mirror locations. If no snapshot exists, mirror should degrade honestly and the user can click onward to proxy/direct.
- Proxy uses bounded GitHub issue API reads; API/rate/network failures still degrade the issue surface rather than invalidating the registered source boundary.
- Discussions remain degraded/deferred.
- Public build must be verified in an environment with Vite installed.
