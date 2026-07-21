# Tiinex Site v173 Validation Notes

v173 continues closure repair after v172 audit support-material work.

Validated in this checkpoint:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

Presentation-specific guards now assert:

- visible lineage/audit trust signal outside tab navigation;
- Feed/Tree remain the Discovery view tabs;
- Lineage is not presented as a workspace tab;
- Display options are present;
- assets are hidden by default in Feed/Tree presentation.

`npm run test` includes public build/runtime checks and requires installed Vite/React dependencies.
