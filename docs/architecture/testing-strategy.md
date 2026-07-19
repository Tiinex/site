# Tiinex Site Testing Strategy

## Intent

Tiinex Site should be testable in a way that is credible to professional reviewers. A green build is necessary, but not enough. The project must show that it protects source boundaries, local startup, public bundling, and the recognizable Tiinex workspace pattern.

## Test levels

### Machine green

Machine green means the source package is safe to replace the repo with and the public build can be produced by CI/CD.

Covered by:

```bash
npm run validate
npm run ui:shape
npm run build:public
npm run public:check
npm run metrics
npm run storage:scan
npm test
```

### UI shape guard

`tools/check-ui-shape.mjs` is not a pixel-perfect visual test. It is a structural guard that checks the default runtime still exposes the expected Tiinex shape:

- one focused Tiinex window in the default path,
- source row above mode row,
- card feed as the primary surface,
- badges before title,
- action row at the card bottom,
- diagnostics behind secondary disclosure,
- implemented verses only in primary controls.
- default active pane is Tiinex/site so the legacy Documentation/Start rhythm is visible.
- Map runtime is absent until Column is stable.

This prevents the refactor from silently drifting back into a dashboard/scaffold page.

### Public build check

`tools/build-public.mjs` creates `.site-publish` for CI/CD. The source zip must not include `.site-publish`, but the workflow may build it.

The public build intentionally emits:

- `tiinex.bundle.css`
- `tiinex.bundle.js`
- `tiinex.build.json`

The source tree remains copied into public output for auditability while the public entrypoint uses the bundle for faster loading.

### Boundary invariants

The tests should protect these invariants as first-class Tiinex behavior:

- local/draft/static material must not become guessed GitHub source,
- source-backed material requires an explicit source descriptor,
- unimplemented verses must not appear as ready primary flows,
- audit must not claim full lineage traversal before traversal exists,
- Column must preserve source truth rather than create it. Planned Map/Atlas must not become runtime-visible until Column happy path is stable and tested.

### Visual parity

Visual parity is not fully machine-testable yet. Q's screenshots remain evidence until the focused window and mobile flows are stable enough for screenshot smoke tests.

Future smoke snapshots should cover:

- desktop default focused window,
- mobile default focused window,
- lineage/tree mode,
- action sheet,
- create continuation flow.

Snapshot tests should start as drift warnings, not hard pixel gates, until the design stabilizes.

## Workflow expectation

The GitHub workflow should:

1. run the machine tests,
2. build the bundled public output,
3. keep the source package clean,
4. publish Pages when configured,
5. mirror public output when the repository configuration asks for it.

Q receives a source-clean repo replacement zip. Q does not receive or deploy a dist zip.
