# Tiinex Site v185

v185 is a source-transport checkpoint for the React/Vite refactor. It builds on v184's selected-Lineage layout/read-card repair and moves GitHub workspace file intake away from a direct-first mental model toward the PoC-shaped transport ladder:

```txt
cache → mirror → proxy → direct
```

## v185 batch

- GitHub materialization now builds an explicit transport plan per source.
- Reads try cache first, then configured mirror, then configured proxy, then direct raw/API fallback.
- Browser/source cache hits are first-class diagnostics, not hidden provenance.
- Configured mirrors/proxies are honored only when a usable browser reader is available; unavailable proxy/mirror tiers are recorded as skipped rather than silently claimed.
- GitHub dialog/source state no longer describes the operation as direct-only.
- GitHub receipts and diagnostics include transport tier events alongside per-surface results.
- Existing repo/issue/asset surface receipts from v184 remain in place.

## Source/material boundaries

Canonical source identity is unchanged by transport. A cache hit, mirror snapshot, proxy read, or direct raw fallback is only the material access route; it must not rewrite Parent, Origin, repository identity, or local/source boundaries.

v185 still does not implement a real browser issue snapshot reader and does not introduce automatic binary asset fetching. Those remain explicit deferred/referenced-unloaded states.

## Supported local start

Use the React dev server:

```txt
npm run dev
```

The old static runtime is archived under `.old/` for behavioral reference only.
