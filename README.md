# Tiinex Site v158

React/Vite refactor checkpoint for Tiinex Site on the PoC-parity track.

`.old/` remains the behavior reference for the public PoC monolith. v158 adds source transport policy/request-budget guards so source adapters can be bounded without hidden retries or provenance inference.

## v158 batch

- Added `src/sources/transport.policy.js` for source transport authorization.
- Supports request budgets, offline mode, and cooldown windows as explicit blocked/degraded findings.
- GitHub adapter now honors transport policy before raw file fetches.
- Budget-blocked GitHub operations produce warnings/transport events but no file failures and no fetch calls.
- Source transport diagnostics from v157 continue to surface these policy events in recoverability/conformance.

## Validation

```bash
npm run test
```

Focused checks:

```bash
node src/sources/transport.policy.test.mjs
node src/diagnostics/sourceTransport.report.test.mjs
node src/adapters/github/github.adapter.test.mjs
node src/conformance/conformance.run.test.mjs
```
