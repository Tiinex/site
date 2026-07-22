# Validation Notes — v195 display/tree/view-state parity

## Base

- Checkpoint base: `site(9).zip` supplied by Q.
- Site base reported by package before changes: `0.2.14-v194`.
- Portable tooling paths were present and left untouched.

## Scope

v195 narrows to the owners identified by the 1-fps review and audit:

- Display options default and copy: `Leaves only` is default-on; visible `Leaves first` is removed.
- Material-role inference: source/schema/adapter support surfaces are not work leaves merely because they have schema identity or continuity metadata.
- Tree/Feed parity: both use the same material-role truth via the existing filtered record list and path-tree counters.
- Lineage interaction: the unified RecordCard chain stays, but card click toggles read preview; anchor/reference movement is explicit.
- Route/view continuity: scroll positions are captured and restored across Discovery/Tree/Lineage transitions and route restoration.

Out of scope:

- Feed ranking rewrite or recency/product decision;
- partial promotion;
- real issue reader;
- full mirror/proxy parity;
- new Lineage layout polish;
- portable-tooling edits.

## Validation run

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

All green in the working tree.

## Additional guarded behavior

`src/workspaces/workspace.materialRole.test.mjs` checks that:

- `.trace.md` Topic material remains a work leaf;
- canonical `.schema.md` snapshots are schema definitions;
- adapter/source support surfaces are supporting material, not work leaves;
- plain Markdown without Tiinex leaf evidence remains supporting material.

## Browser test focus

- Display options opens with `Leaves only` checked and no visible `Leaves first` row.
- Concrete `.adapters` / source-support paths no longer inflate leaf counts solely due to schema identity.
- Discovery scroll restores after opening Lineage and going back.
- Browser Back/Forward restores view state without rerunning source discovery.
- In Lineage, clicking a card toggles preview; the explicit Anchor action changes reference point.

## Known limits

`npm run test` was not run end-to-end because public build/runtime smoke requires installed Vite/React dependencies in this sandbox.
