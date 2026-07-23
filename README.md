# Tiinex Site v207

v207 is a Root lineage terminal-state and audit-completeness contract pass on top of v206. It keeps the Root fallback/read-state layer intact and makes selected Lineage paths distinguish complete roots from partial or unavailable paths before transport recursion and schema-specific companions expand.

## v207 batch

- Adds explicit selected-lineage terminal states: `root-reached`, `no-parent-declared`, `target-unavailable`, `ambiguous-parent`, `depth-limited`, and `not-exhausted`.
- Exposes `complete` / `partial` lineage claims through loaded lineage reports and inline lineage Audit reports.
- Reports source scope transitions when a loaded selected lineage crosses explicit source identities or refs.
- Keeps Discovery from doing recursive adapter traversal and keeps Lineage exhaustive loading limited to the loaded workspace graph.
- Does not change source transport, issue discovery, recursive adapter traversal, transitions, portable tooling, dependency pinning, or public build semantics.

## Supported local start

Use the Vite development server for source work:

```bash
npm install
npm run dev
```

Directly opening `index.html` from the source tree is not the supported local runtime path for the React/Vite app.

## Validation

Run the usual local gates before handoff:

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
```

Manual browser testing is intentionally deferred until the end of this Root-closure milestone unless a runtime failure appears.
