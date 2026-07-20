# Schema Modules

This tree contains schema projections the viewer can render, validate, or use as UI affordances. **Tiinex/docs is a canonical origin, not the only allowed origin.** Forked viewers and app-specific viewers may ship their own schema modules when the module origin is explicit.

Path is a discovery hint, not semantic authority. Resolve schema identity from the schema id, the module metadata, and its declared origin.

Each supported schema module should prefer:

- `<name>.schema.md` — human-readable schema artifact snapshot.
- `<name>.schema.json` — binding metadata with origin, permalink or local path, checksum when available, and trust role.
- `<name>.schema.js` — app-readable projection.

## Origin model

Schema origins are intentionally plural:

- `canonical-core` — upstream/core schemas, normally from Tiinex/docs.
- `viewer-extension` — viewer-local or app-specific schemas used by this runtime.
- `external-extension` — third-party schema modules that a fork or workspace can opt into.

A viewer must not treat every unknown schema as a Tiinex/docs miss. It should report the declared origin if present, then degrade clearly when no module can resolve it.

## Forking contract

A fork may add schemas under its own namespace without changing Tiinex/docs. Add an explicit schema origin in `.workspace.md` or the schema manifest before using those modules in runtime UI.
## Viewer-local workspace module

`src/schemas/workspace/` is the first viewer-extension schema companion. It binds the site-local `.topics/.schemas/tiinex.workspace.v1.schema.md` artifact to runtime capabilities, React surfaces, source/progress presentation, validation, and transitions. This keeps workspace-specific UI near the schema instead of duplicating it in a generic React component tree.

