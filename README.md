# Tiinex Site v270

Checkpoint: `v270`
Version: `0.2.90-v270`
Runtime: `react-v270-abortable-repo-proxy-transport`

## v270 focus

Repo-file proxy transport follow-up after v269: make slow browser Git proxy runs abortable when the user advances to direct, and expose low-throughput/timeouts as transport truth instead of letting stale proxy requests keep running.

## Changed in v270

- GitHub materialization now passes the active operation `AbortSignal` into repo-file proxy transport.
- Repo-file proxy passes a hard network budget, response-start timeout, idle timeout, low-throughput grace window, and minimum throughput floor into the browser Git runtime.
- Advancing the transport badge while proxy is pending aborts/ignores the old proxy run before direct can commit.
- Proxy timeout / low-throughput / abort conditions are diagnosed as proxy transport events instead of generic failures.
- No proxy endpoint was changed: `cors.isomorphic-git.org` remains a shared/free testing proxy, so throughput is not treated as production truth.

## Validation

See `VALIDATION_NOTES.md`.

## Supported local start

```bash
npm install
npm run dev
```

Common validation commands:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```
