# Validation Notes v266

## v266 repo-file proxy/mirror parity

Changed in v266:

- Repo files keep cache-first restore from v265, but proxy is no longer only an unavailable placeholder.
- Repo-file proxy uses the browser Git runtime bridge plus configured git-proxy/CORS proxy to acquire a repository snapshot and read Markdown without GitHub tree API discovery.
- Repo-file proxy success writes source cache entries and a repo discovery manifest so later F5/default restore can use `cache` without network materialization.
- Repo-file proxy unavailable is still explicit when runtime/proxy configuration is missing and exact proxy reload does not fall through to direct.
- Hosted repo mirrors now try both `.mirrors/github.com/<owner>/<repo>.json` and `mirrors/github.com/<owner>/<repo>.json` candidates.
- Regression tests cover repo mirror, repo cache restore, proxy unavailable, and proxy success via a fake browser Git runtime.

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
