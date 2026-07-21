# Tiinex Site v172

v172 is a closure-repair checkpoint for the React/Vite refactor. It keeps the v171 source-identity boundary and makes Audit distinguish plain Markdown support material from invalid Tiinex leaves.

## v162-v172 batch

## Supported local start

This source tree is intended to be used with the Vite development loop:

```bash
npm install --no-audit --no-fund
npm run dev
```

Validation entry points:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run test
```

Local/session material must never be promoted to GitHub provenance by path guessing. Source-backed material must retain explicit source identity, ref/root boundary, and material availability state.
