

**Bootstrap entrypoint located**

I opened `manifest.json` and found the `entrypoints` block:

```json
  "entrypoints": {
    "bootstrap": "bootstrap/tiinex.llm.bootstrap.md",
    "cli": "bin/tiinex-portable.mjs",
    "coldStartTest": "COLD_START_TEST.md",
    "operationCatalog": "operation-catalog.json",
    "start": "START.md",
    "userGuide": "USER_GUIDE.md",
    "verifier": "bin/verify-bootstrap.mjs"
  }
```

The bootstrap entrypoint is therefore **`bootstrap/tiinex.llm.bootstrap.md`**.

---

**First read-only operation**

Inside `operation-catalog.json`, the relevant read-only operation is:

```json
{
      "description": "Parse supplied material and return compact...t, schema companion, source-boundary, and qualification views.",
      "inputSchema": "tiinex.portable.input.v1",
      "name": "inspect",
      "outputSchema": "tiinex.portable.operation.result.v1",
      "remoteFetch": false,
      "remoteWrite": false,
      "safety": "read-only",
      "serializableResult": true,
      "sourceMutation": false
    }
```

I would begin with the **`inspect`** operation, which is explicitly marked *read-only* and suited to examining the package contents.

---

**Material required to inspect or continue a lineage**

`canonical/docs.pointer.json` states:

```json
{
  "schema": "tiinex.bootstrap.canonical-material.pointer.v1",
  "version": 1,
  "repository": "Tiinex/docs",
  "ref": "52ecdea0a75893882ce282214d155f70e1309c2a",
  "movingRef": false,
  "schemaIndexPath": ".topics/.schemas/README.md",
  "rootSchemaPath": ".topics/.schemas/tiinex.root.v1.schema.md",
  "materialPolicy": "Canonical schema meaning remains in Tiinex/...ntly replace canonical Markdown with site runtime projections.",
  "offlineBoundary": "When an exact readable schema is not suppl...n meaning and use only explicitly qualified fallback behavior.",
  "includedSnapshots": []
}
```

To carry the lineage forward you would need:

1. The **`Tiinex/docs`** repository at commit `52ecdea0a75893882ce282214d155f70e1309c2a` (or later if `movingRef` were `true`) to resolve referenced schemas.  
2. Any items that might appear in `includedSnapshots` (none are listed here).  
3. The files pointed to by `schemaIndexPath` and `rootSchemaPath` inside that repository, which define the schema hierarchy.

No material has been created or modified; the answer quotes exactly what was read.