# Validation Notes v207

v207 is a Root lineage terminal-state and audit-completeness contract pass.

## Changed

- Checkpoint/version moved from `0.2.26-v206` to `0.2.27-v207`.
- Selected Lineage traversal now exposes terminal states for root reached, no parent declared, unavailable targets, ambiguous parents, depth limits, and non-exhausted partial paths.
- Loaded lineage reports now include `terminalState`, `statusLabel`, complete/partial state, and scope-transition counts.
- Inline Lineage Audit now says `complete` only when the loaded lineage report and traversal both prove completion; otherwise it reports partial.
- Workspace Lineage tests now guard no-parent terminal roots, target-unavailable partial paths, and loaded source-scope transitions.

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
