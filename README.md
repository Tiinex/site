# Tiinex Site v266

Checkpoint: `v266`
Version: `0.2.86-v266`
Runtime: `react-v266-repo-proxy-mirror-parity`

## v266 focus

Repo-file transport parity after v265 proved F5/cache restore but still fell straight to direct for repo files.

## Changed in v266

- Repo-file proxy now has a real browser Git runtime path instead of being hard-coded unavailable.
- The browser Git runtime is shipped as a public runtime bridge and only used by the repo-file proxy transport.
- Repo-file proxy reads repository Markdown through the Git proxy/runtime, writes raw markdown + discovery manifest to Tiinex source cache, and reports `proxy` as the repo-files surface transport.
- Repo-file proxy unavailable remains explicit when the runtime or proxy URL is missing; it still does not silently fall through to direct during exact proxy tests.
- Hosted repo mirror candidate discovery now checks both `.mirrors/github.com/...` and `mirrors/github.com/...` metadata locations to match source/dev and public mirror layouts.
- Existing issue transport/badge behavior from v264/v265 is preserved.

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
