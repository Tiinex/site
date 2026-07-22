# Tiinex Site v177 Validation Notes

v177 is a large presentation-read-model batch after the semantic action/label truth work.

Validated in the working tree:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
```

Also checked:

```bash
node --check src/workspaces/workspace.discoveryProgress.js
```

Full `npm run test` was not completed in this sandbox because the runtime/build smoke requires installed Vite/React dependencies. Run it locally/CI after `npm install`.

Manual browser focus for Q:

1. Feed should show valuable Tiinex/work leaves before support/schema docs.
2. Display options can turn supporting docs/assets back on.
3. Tree branches should remember expansion across Feed/Tree switches and refreshable route state.
4. GitHub explicit paths/discovery should show an accepted/loading receipt before the import result lands.
5. Source pill should remain a boundary/control point with visible state and a Load action.
6. Lineage should show selected artifact status first, with workspace diagnostics collapsed/secondary.
7. Logo should look optically centered while the dock/button size stays compact.
