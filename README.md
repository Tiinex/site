# Tiinex Site v238

Checkpoint: `v238`
Version: `0.2.58-v238`
Runtime: `react-v238-issue-transport-response-fix`

## v238 focus

Milestone A transport hardening for GitHub issue snapshots. v237 restored the PoC-like cache → mirror → proxy → direct transport badge and added issue mirror/proxy branches, but browser testing showed mirror/proxy issue loads still behaved as unavailable while cache/direct were the only useful paths.

## Root cause

The issue-surface mirror/proxy fetch wrappers tried to tag native Fetch `Response` objects by creating a shell with `Object.create(Response.prototype)`. Native response fields such as `.ok`, `.status`, `.json()`, and `.text()` are brand-checked; reading them from that shell can fail or behave like an invalid response in real browsers. The tests used plain fake response objects, so v237 passed while browser mirror/proxy issue loading degraded.

## What changed

- `src/adapters/github/github.issueSurface.js` now wraps native responses with an ordinary delegating transport response object.
- Proxy issue API responses and hosted mirror responses preserve:
  - `ok`
  - `status`
  - `statusText`
  - `url`
  - `headers.get()`
  - `text()`
  - `json()`
  - `clone()`
  - `transportTier`
- Transport events now include the issue URL/resource for proxy and mirror issue attempts/success/failure.
- Tests now cover native `Response` objects, not only fake enumerable response doubles.
- Architecture guard blocks reintroducing the native `Response.prototype` shell wrapper.

## Milestone A non-goals

- No artifact creation, transitions, or forms.
- No remote writes.
- No fake discussion reader.
- No background retry loop.
- No broad recursive clone or arbitrary parent guessing.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

```bash
npm run validate
npm run ui:shape
npm run architecture:shape
npm run typecheck
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
```

Public build still needs an environment with local Vite installed:

```bash
npm run build:public
npm run public:check
```
