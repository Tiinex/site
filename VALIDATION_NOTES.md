# Tiinex Site v158 Validation Notes

v158 extends v157 with a source transport policy and request-budget guard.

## Root-cause hypothesis

Source transport diagnostics classify what happened after or around a request, but refactor parity also needs a testable way to prevent accidental request storms, hidden retries, or retry-during-cooldown behavior. This is especially important for GitHub discovery/raw reads after earlier 403/rate-limit findings.

## Change summary

- Added `tiinex.sourceTransport.policy.v1` and `tiinex.sourceTransport.authorization.v1`.
- Request budgets block over-budget operations before fetch.
- Offline/cooldown modes become explicit retryable degraded findings.
- GitHub raw file materialization uses the policy when provided through options.
- Policy findings are also transport events, so recoverability/source-transport reports can present them without owning fetch logic.

## Validation run

```bash
npm run test
```

Focused checks:

```bash
node src/sources/transport.policy.test.mjs
node src/adapters/github/github.adapter.test.mjs
node src/diagnostics/sourceTransport.report.test.mjs
```
