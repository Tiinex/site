# Continuation Guide

## Current checkpoint

v171 is a React/Vite refactor closure-repair checkpoint. `.old/` is an optional ignored behavior reference when present, not a build input and not runtime. The active runtime starts from `index.html` through `src/main.jsx` and requires the supported Vite local loop.

## Supported local loop

Use:

```bash
npm install --no-audit --no-fund
npm run dev
```

The source `index.html` is not a raw file-local runtime because it loads JSX through `src/main.jsx`. Public output is produced by:

```bash
npm run build:public
npm run public:check
```

## Discipline

- Do not develop new architecture inside `.old/` or legacy `app.js`.
- Treat `.old/` as behavior evidence only; validation and build must pass without it.
- Do not infer GitHub source authority from local, pasted, draft, static fixture, route-only, or package material.
- Keep audit as a domain operation in `src/audit/`, not as per-schema presentation code.
- Keep Verse human-first: a bounded arrangement/experience of artifacts, not a framework component or hidden truth engine.
- Keep UX fast: clarity should come from layout, affordance, color, position, rhythm, and consistency before explanatory prose.
- Show only implemented verses as primary UI actions; planned verses belong in context docs until a concrete implementation slice exists.

## Current visible workspace modes

Implemented and visible:

- Feed
- Tree
- Lineage, loaded-only
- Audit, loaded-only/degraded-aware

Planned or partial:

- remote lineage traversal
- actual issue/discussion fetching
- package download UX
- remote publish/re-ingest
- Map/Atlas/Gallery/rendering experiments

## Legacy behavior reference discipline

During the refactor, `.old/` is not runtime and must not be imported. It is still behavior evidence. For every rebuilt feature slice, inspect the corresponding legacy flow first, identify which behavior existed for a reason, and carry that lesson into the new owner structure without copying the monolith.
