# Tiinex Site v212

v212 is a Root-milestone action availability pass on top of v211. It keeps Root validation truth and gates user-visible create-like record actions behind schema/transition capability instead of presenting generic Continue/Reference affordances for every readable card.

## v212 batch

- Record cards keep inspect/read actions: Open details, Show markdown, Source, Share, and Lineage anchoring where relevant.
- Continue and Reference/Preserve are no longer shown as generic actions unless a schema companion exposes a concrete transition capability.
- Root fallback, unknown child schemas, and generic source-backed records no longer look create-capable just because they are readable.
- Existing transition draft helpers remain available behind explicit code paths; this batch does not implement artifact creation or transition execution.
- Schema module `viewActions` declarations no longer list broad Continue/Reference actions by default.
- No recursive adapter traversal, issue discovery, source transport change, transition artifact creation, or new schema-specific companions are introduced in this batch.

## Validation

See `VALIDATION_NOTES.md`. Manual milestone browser testing is intentionally deferred until the Root milestone closes.

## Supported local start

Use the Vite development server:

```bash
npm install
npm run dev
```

Source `index.html` is not a double-click runtime; JSX is compiled by Vite.
