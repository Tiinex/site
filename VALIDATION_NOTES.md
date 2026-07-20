# Tiinex Site v127 Validation Notes

## Scope

v127 adds a schema-aware transition foundation on top of v126 local folder/action foundation.

Primary goal: make record actions produce material, not only display copyable capsules.

## Added

- `src/transitions/record.transitions.js`
  - `tiinex.record.transitions.v1`
  - `tiinex.record.transition.result.v1`
  - schema-aware continuation targets from the schema registry
  - browser-local continuation draft creation
  - browser-local reference draft creation
  - parent boundary preservation in generated Markdown
- `src/transitions/record.transitions.test.mjs`
- `RecordActionDialog` now supports:
  - Continue → choose target schema → create local continuation leaf
  - Reference → create local evidence/reference leaf
- New local transition records are inserted through workspace lifecycle, not UI-local arrays.

## Validation run in sandbox

Passed:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

Included checks:

- static React UC-001 source guards
- schema binding guard
- workspace schema/config/parser guard
- workspace lifecycle tests
- GitHub loader tests
- adapter registry tests
- local adapter tests
- source model tests
- record action tests
- record transition tests
- UI shape guard
- UC-001 create/restore/close guard

## Not completed in sandbox

These require local dependency/runtime availability:

```bash
npm run runtime:smoke
npm run build:public
npm run public:check
```

In this sandbox the source-clean tree does not have a usable Vite binary in `node_modules/.bin`, so public build checks cannot be treated as source-code evidence here.

## Manual checks to run locally

1. Import a local folder with Markdown files.
2. Click `Continue` on a local record.
3. Choose `Topic`, `Preservation`, or `Evidence` as continuation target.
4. Create the continuation.
5. Confirm a new local/session record appears.
6. Open the new record and confirm:
   - Markdown preview exists.
   - Continuity Context references the parent record.
   - Boundary says local/session or source-backed correctly.
   - No GitHub provenance is inferred for local parents.
7. Click `Reference` on a local record.
8. Create reference and confirm it appears as `tiinex.evidence.v1`.
9. Repeat Continue/Reference on GitHub source-backed material and confirm the generated draft preserves source-backed parent boundary without copying source ownership to the new local draft.
