# Tiinex Site v176

v176 is a semantic presentation checkpoint for the React/Vite refactor. It keeps the v175 old-like card/tree presentation but tightens labels and actions so the UI does not claim stronger evidence than the runtime has.

## v176 batch

- `Open` opens the artifact detail/read view again.
- `Lineage` is a separate artifact action that focuses the selected record in Lineage mode.
- `byte ok` was removed from presentation and material shaping; readable records now say `schema ok` because no byte/digest verification is performed there.
- The previous `Reference` action is user-facing as `Preserve evidence` until the old cross-artifact Reference relation is explicitly rebuilt.
- Selected Lineage status is separated from workspace-wide lineage findings.
- Parity ledger can classify suspected wrong ports instead of redefining parity around the current implementation.

## Validation

Run:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

Full public runtime validation additionally requires installed Vite/React dependencies:

```bash
npm install --no-audit --no-fund
npm run test
```

## Supported local start

Use the Vite runtime:

```bash
npm install --no-audit --no-fund
npm run dev
```

Opening source `index.html` directly as a file is not a supported runtime loop because the React entry uses JSX/Vite bundling.
