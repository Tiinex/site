# Validation Notes v208

v208 is a runtime-startup and lineage ready-control hotfix.

## Changed

- Checkpoint/version moved from `0.2.27-v207` to `0.2.28-v208`.
- `src/build.identity.js` now exports `tiinexBuildIdentity()` again, matching the import used by `src/main.jsx`.
- `tools/check-checkpoint-identity.mjs` now calls `tiinexBuildIdentity()` so this startup contract is guarded.
- Selected Lineage now treats an already-complete loaded-workspace traversal as lineage-ready without requiring the `Load full lineage` button.
- `Load full lineage` remains visible only for selected lineage paths that are not already complete and not explicitly loaded.
- Lineage Audit can run on an already-complete selected traversal even without an explicit load report.

## Not changed

- No source transport, issue discovery, recursive adapter traversal, transition creation, portable tooling, dependency, or public deployment behavior changed.
- No new schema-specific companions were added in this batch.
- `Load full lineage` is still loaded-workspace exhaustion, not remote/cross-adapter recursion.

## Validation target

Expected green gates:

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
```

`runtime:smoke`, `build:public`, and `public:check` still require a full dependency install with the Vite binary available.
