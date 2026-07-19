# Validation Notes v92

## Scope

v92 is a Verse scope hygiene and context availability pass.

It removes future placeholder verse directories and keeps only implemented runtime-visible verses:

- Universe
- Column
- Feed
- Tree

Map and Atlas are documented as planned contexts, not visible ready actions.

## Validation Commands

```bash
node --check src/main.js
node --check tools/validate-static.mjs
node --check tools/validate-schema-bindings.mjs
node --check tools/check-public-build.mjs
node --check tools/build-public.mjs
npm run validate
npm run build:public
npm run public:check
node --check .site-publish/src/main.js
npm run metrics
npm run storage:scan
npm test
unzip -tq tiinex-site-v92-source.zip
```

## Expected Result

All commands should pass. The source zip must not include `.site-publish`, `.git`, `node_modules`, `desktop.ini`, or unimplemented verse directories such as `src/verses/node-graph`, `src/verses/timeline`, or `src/verses/gantt`.
