# Schema Modules

This tree contains schema companions the viewer can render, validate, or use as UI affordances. **Tiinex/docs is the canonical core origin, not the only allowed origin.** Forked viewers and app-specific viewers may ship additional schema modules only when the module origin is explicit.

Path is a discovery hint, not semantic authority. Resolve schema identity from the schema id, the module metadata, and its declared origin. For canonical Tiinex/docs schema artifacts, the embedded Markdown snapshot keeps the exact upstream schema artifact filename.

Each supported schema module should prefer:

- `tiinex.<name>.v1.schema.md` — canonical Markdown schema artifact snapshot when sourced from `Tiinex/docs`.
- `<module>.schema.json` — viewer binding metadata with origin, permalink or local path, checksum, trust role, and canonical snapshot filename.
- `<module>.schema.js` — app-readable schema companion module.

Short names such as `Root`, `Topic`, or `Evidence` are display labels only. They are not durable schema identity and must not replace canonical filenames or schema ids.

## Origin model

Schema origins are intentionally plural:

- `canonical-core` — upstream/core schemas from `Tiinex/docs`.
- `viewer-extension` — viewer-local or app-specific schemas used by this runtime.
- `external-extension` — third-party schema modules that a fork or workspace can opt into.

A viewer must not treat every unknown schema as a Tiinex/docs miss. It should report the declared origin if present, then degrade clearly when no module can resolve it.

## Canonical schema naming

Canonical Tiinex/docs schema snapshots use the exact artifact filename from `.topics/.schemas/README.md`. Examples:

- `tiinex.root.v1.schema.md`
- `tiinex.topic.v1.schema.md`
- `tiinex.evidence.v1.schema.md`

Legacy local names such as `root.schema.md` or `topic.schema.md` may remain as migration aliases while the runtime transitions, but the binding `snapshot` must point at the canonical filename. Aliases are declared in `snapshotAliases` and are never the semantic authority.

## Forking contract

A fork may add schemas under its own namespace without changing Tiinex/docs. Add an explicit schema origin in `.workspace.md` or the schema manifest before using those modules in runtime UI.

## Viewer-local workspace module

`src/schemas/workspace/` is the first viewer-extension schema companion. It binds the site-local `.topics/.schemas/tiinex.workspace.v1.schema.md` artifact to runtime capabilities, React surfaces, source/progress presentation, validation, and transitions. This keeps workspace-specific UI near the schema instead of duplicating it in a generic React component tree.

## Companion contract

A schema companion owns schema-specific presentation and transitions:

- compact card projection;
- expanded/read projection;
- detail projection;
- available transition/action surface for a given viewer context.

The generic workspace viewer owns layout, anchoring, dialogs, markdown display, and dispatch. It must not hardcode that `Evidence` has `Supported Claim`, or that `Topic` has `Current Read`; those projections belong to schema companions.
