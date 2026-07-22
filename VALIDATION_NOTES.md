# Validation Notes v192

Base: v191 schema-binding resync + Lineage focus/readability repair.

Scope: unify Lineage selected traversal with the Discovery `RecordCard` surface so Lineage changes only the displayed record set/order, not the card design.

## Commands run

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

Source-clean zip verification:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

## Known limits

Full `npm run test` requires installed Vite/React dependencies for runtime smoke and public build checks.
