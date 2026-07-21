# Tiinex Site v171

v171 is a closure-repair checkpoint for the React/Vite refactor. It follows the v161 delivery-truth repair and tightens schema creation, Audit epistemics, GitHub transport wiring, and lineage ambiguity handling.

## v162-v171 batch

- Continue creation is schema-honest only for `tiinex.topic.v1` until additional create renderers are implemented.
- Reference creation produces an Evidence-shaped body with the required Evidence sections.
- Creation validation now runs the target schema module validator, not only Root validation.
- Audit treats metadata-only/source-backed material as `pending-unavailable`, not invalid.
- Audit uses registered schema module validators and reports Root fallback/validator fallback explicitly.
- GitHub materialization can be governed by a transport policy for discovery and raw file loads.
- GitHub UI submissions have an in-flight lock and adapter diagnostics are stored in workspace import/recoverability state.
- Loaded Lineage detects ambiguous multi-source targets and avoids guessed edges.

## Supported local start

## Local development

The supported local loop is:

```bash
npm install --no-audit --no-fund
npm run dev
```

The source `index.html` intentionally loads `src/main.jsx` and requires a dev/build server with JSX transpilation. Double-clicking the source `index.html` as a raw file is not a supported runtime path.

## Validation

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run test
```

`.old/` may exist as a local behavior reference, but validation/build must not require it.
