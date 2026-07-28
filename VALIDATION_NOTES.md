# Validation Notes v270

## v270 abortable repo proxy transport

Changed in v270:

- Repo-file proxy transport receives the active GitHub materialization abort signal.
- Repo-file proxy timeout now aborts the underlying browser Git runtime request, rather than only rejecting the outer promise.
- Browser Git runtime receives a response-start timeout, idle timeout, low-speed grace window, and minimum bytes/second threshold.
- Proxy abort/timeout/low-throughput are diagnosable as `github.repo.proxy.aborted`, `github.repo.proxy.timeout`, or `github.repo.proxy.low-throughput`.
- Added regression coverage that an already-aborted operation reaches the Git runtime as an aborted `transportSignal`.
- Added regression coverage that repo proxy runtime options include a hard network budget and low-throughput floor.

Validated locally in the sandbox:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Follow-up validation still needed outside the sandbox:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

Manual browser focus:

```txt
1. Start repo files via proxy.
2. While proxy is pending/slow, click the repo-files transport badge to direct.
3. The old proxy request should abort/stop committing stale material.
4. Direct should be the only transport allowed to commit after the click.
5. If the shared proxy stays below the throughput floor, the warning should be proxy low-throughput/timeout, not direct/mirror confusion.
```
