# Tiinex Site v235

Checkpoint: `v235`
Version: `0.2.55-v235`
Runtime: `react-v235-transport-badge-cycle`

## v235 focus

Milestone A transport-friction closure. Restore the useful PoC behavior where the source rail transport badge shows the active transport tier and clicking it retries the same saved source surfaces through the next explicit tier in the access ladder.

## What changed

- Source rail transport badge now shows the active tier directly, for example `cache`, `mirror`, `proxy`, or `direct`, instead of a vague `used: ...` label.
- Failed/unavailable transport tiers get a visible failed style instead of being buried only in the receipt.
- Clicking a refreshable transport badge retries the saved source plan through the next transport tier.
- Explicit transport refresh uses an exact one-tier plan, so `proxy` failure does not silently fall through to `direct`; direct remains the last fallback, not the first hidden fallback.
- Transport refresh input construction moved to `src/app/sourceTransportRefresh.js` so the app controller does not absorb more source semantics.

## Milestone A non-goals

- No artifact creation, transitions, or forms.
- No remote writes.
- No fake discussion reader.
- No background retry loop.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

Run:

```bash
npm run validate
npm run ui:shape
npm run architecture:shape
npm run typecheck
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run build:public
npm run public:check
```
