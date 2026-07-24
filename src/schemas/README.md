# Schema Companion Contract

This directory contains schema companions that the viewer can resolve through the schema registry. Tiinex/docs is the canonical core origin, not the only allowed origin. The file tree is an implementation detail; durable schema identity comes from each companion's schema id and binding metadata.

This README describes the companion contract. It intentionally does **not** list every installed schema, because schema inventories belong in the registry/manifest and would become stale here.

## Principle

Schema-specific meaning stays with the schema companion.

Generic engines may live outside `src/schemas`, but they must not absorb Topic/Evidence/etc. rules:

- `src/validation/` owns validation orchestration, finding normalization, and i18n lookup APIs.
- `src/integrity/` owns reusable checksum/canonicalization/integrity engines.
- `src/schemas/<schema>/` owns schema-specific validation, presentation, capabilities, findings, i18n resources, and future transitions.

## Minimal companion

A schema builder should be able to generate a useful companion with only:

```text
<schema-id>.schema.md
<schema-id>.schema.json
<schema-id>.schema.js
```

Example:

```text
tiinex.topic.v1.schema.md
tiinex.topic.v1.schema.json
tiinex.topic.v1.schema.js
```

The schema id, including version suffix, is propagated into companion filenames. Short labels such as `Topic` are display labels only.

## Optional companion roles

Optional files are added only when the schema diverges from Root or needs additional behavior:

```text
<schema-id>.validate.js
<schema-id>.presenter.js
<schema-id>.capabilities.js
<schema-id>.findings.js
<schema-id>.<locale>.i18n.json
<schema-id>.transitions.js
```

Current convention keeps the folder flat. Locale files use Tiinex-style naming:

```text
<schema-id>.en.i18n.json
<schema-id>.sv.i18n.json
```

## Validation

Validation is composed by `src/validation/validateArtifact.js`:

```text
parse
→ Root validation
→ generic integrity validation
→ exact schema validation, if available
→ normalized findings + validation truth
```

Child validators do not import or call Root validation manually. They only emit schema-specific finding codes.

## Findings and i18n

Validators emit stable finding codes, not user-facing prose as the source of truth.

```text
validator emits: topic.title.missing
findings says: severity/fixability/messageKey
i18n says: localized human text
```

A finding companion is useful when a schema owns custom finding codes. A schema that only relies on Root findings does not need its own findings file.

Human-readable messages resolve through `<schema-id>.<locale>.i18n.json`. Missing locale keys should fall back explicitly; they must not create new validation semantics.

## Presenters

`<schema-id>.presenter.js` is the schema-specific projection seam. Feed, Tree, Lineage, and other workspace surfaces may share the same presenter unless the schema truly needs a divergent projection.

Do not create surface-specific wrapper files just to set `surface: 'feed'` or similar. Add a surface-specific presenter only when it has real schema-specific behavior and is wired through the schema module/registry.

## Transitions and forms

Transitions are passive until the transition milestone. Root may define the safety contract for transitions, but concrete transition/product behavior must be explicit and schema/capability-owned.

Form companions are not part of the active Root milestone. They should be introduced with the transition/artifact-creation milestone, not shipped as inert scaffold.

## Workspace module

`src/schemas/workspace/` is the viewer-local workspace schema companion. It is allowed to contain React workspace surfaces because the workspace schema is the viewer entrypoint. Core schema companions should stay React-free.
