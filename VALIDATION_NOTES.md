# Tiinex Site v138 Validation Notes

## Scope

v138 is a multi-loop value batch over v137. It does not introduce new product families or Verse expansion. It tightens three PoC-relevant areas:

```text
imported material
→ compact diagnostics/projection
→ path-tree readability
→ schema-conforming Continue/Reference local drafts
```

## Changed files of interest

- `src/workspaces/workspace.summary.js`
  - Adds pure workspace material summary projection.
  - Reports records, assets, workspace candidates, source-backed records, and latest import diagnostics.

- `src/workspaces/workspace.summary.test.mjs`
  - Guards summary counts and latest import projection.

- `src/schemas/workspace/workspace.views.jsx`
  - Renders compact material summary.
  - Reduces card badge noise by moving paths into a separate path line.
  - Uses compact path-tree count chips.

- `src/styles/app.css`
  - Adds v138 summary, card and path-tree readability styles.

- `src/transitions/record.transitions.js`
  - Continue/Reference drafts now include root-style continuity envelopes and draft integrity markers.

- `src/transitions/record.transitions.test.mjs`
  - Parses generated Continue/Reference markdown and checks root-required envelope fields.

- `src/ui/primitives/Icon.jsx`
  - Adds `check` and `warning` icons for compact import diagnostics.

- `package.json`
  - Bumps checkpoint metadata to v138 and wires workspace summary test into `validate`.

## Validation run in sandbox

Passed after installing dependencies for Vite/public checks:

```bash
npm run test
```

Expanded checks passed:

```bash
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
```

After source-clean cleanup, the dependency-free checks also passed:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

## Manual checks to run locally

1. Drop a source zip or folder containing nested Markdown and assets.
2. Confirm workspace summary shows counts without duplicating empty-state boilerplate.
3. Switch to Tree and confirm path groups are compact, readable and expandable.
4. Confirm Feed cards show paths as path lines rather than noisy badge rows.
5. Create a Continue draft and inspect markdown for Envelope Schema, Parent Schema, Trace, Current Schema, Created At and Continuity Integrity.
6. Create a Reference draft and confirm the same root envelope requirements.
7. Refresh and confirm workspace, records, assets, summary and local/source boundaries remain intact.

## Known remaining gaps

- Tree is still path-tree parity, not full declared-edge lineage parity.
- Audit/Lineage recovery remains a separate PoC-loop.
- Password-based encrypted zip import remains bridge-required/unavailable; encrypted entries are reported, not faked.
- Full PoC issue snapshot/mirror/git-native behavior still needs separate loop recovery passes.
