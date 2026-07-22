# Tiinex Site v176 Validation Notes

v176 continues closure repair after v175 presentation work by tightening semantic labels and action boundaries.

Validated in this checkpoint:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

Semantic presentation guards now assert:

- `Open` is artifact/detail reading, not a hidden Lineage transition;
- selected Lineage focus uses a separate `Lineage` artifact action;
- `byte ok` is absent because the runtime has not performed byte/digest verification;
- Evidence preservation is named as preservation, not old Reference parity;
- selected lineage status is separated from workspace overview findings;
- parity ledger can mark suspected wrong-ports explicitly.

`npm run test` includes public build/runtime checks and requires installed Vite/React dependencies.
