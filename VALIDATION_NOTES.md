# Tiinex Site v185 Validation Notes

v185 follows the v184 usage-video review and Q's transport feedback: current tests had mostly exercised direct GitHub raw/API transport, while the PoC uses an ordered source access model: cache first, then mirror, then proxy, and direct as last fallback when configured/available.

## Validation run in workspace

```txt
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/workspace/workspace.add.views.jsx src/sources/github/github.loader.js src/sources/github/github.transport.js src/adapters/github/github.adapter.js
```

All completed successfully in the workspace.

## Added/updated guards

```txt
node src/sources/github/github.transport.test.mjs
node src/adapters/github/github.adapter.test.mjs
```

These cover:

- configured transport order: cache → mirror → proxy → direct;
- cache hit before direct fallback;
- configured mirror hit before direct fallback;
- configured proxy without a browser raw reader is explicit skipped/unavailable state, not a silent proxy claim;
- GitHub adapter still materializes repo Markdown and reports per-surface diagnostics.

## Browser test focus

1. Add GitHub source from empty workspace. The dialog/receipt should describe cache → mirror → proxy → direct, not direct-only.
2. Load Tiinex/docs twice in the same browser/session. The second run should show cache-hit diagnostics and feel less direct/network dominated.
3. With configured mirror/proxy unavailable, the receipt should make skipped/unavailable tiers explicit and then fall back to direct.
4. Issue snapshots should remain a visible deferred/unavailable surface, not collapse into only a generic warning count.
5. Lineage from v184 should remain stable: selected/root/ancestor card stack without overlap.

## Known limits

- Full `npm run test` was not run here because the Vite/React build-smoke path requires installed dependencies.
- v185 does not implement partial record promotion during import; material may still become visible atomically after the materialization result is formed.
- v185 does not implement a real issue snapshot browser reader.
- v185 does not implement binary asset fetching.
