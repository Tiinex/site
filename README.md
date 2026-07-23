# Tiinex Site v216

v216 is a Root-milestone Discovery work-leaf membership repair on top of v215. It keeps the terminal loaded-lineage leaf rule, but adds the missing prerequisite: Discovery `Leaves only` means terminal work leaves, not schema/type-definition records that happen to be terminal in the schema hierarchy.

## v216 batch

- Discovery `Leaves only` now hides `.schema.md` / schema type-definition artifacts even when they are terminal nodes.
- Terminal source-backed metadata-only work leaves, such as `.trace.md` material, remain visible after refresh/session restore.
- Route-only material-unavailable shells remain hidden.
- Lineage display scope remains unchanged: parent/root chains are not filtered by Discovery-only `Leaves only` membership.
- Display-option copy/counts now refer to terminal work leaves rather than generic Tiinex artifact leaves.
- No transition/artifact creation, source transport, issue discovery, recursive adapter traversal, or new schema-specific companion work is included.

## Supported local start

```bash
npm install
npm run dev
```

The supported local loop is Vite via `npm run dev`; source `index.html` is not a standalone file:// runtime.

## Validation

Use the normal checkpoint gate:

```bash
npm run validate
npm run ui:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
```

For Windows lock portability smoke:

```bash
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
```
