# Portable Tooling Entrypoints

## Status

This document describes the first additive portable-tooling batch built against the supplied `Tiinex/site` refactor v190 checkpoint and compatibility-checked against the current v192 branch head.

The batch exposes existing site parsing, schema capability, audit, lineage, creation-contract, and schema-companion logic to non-React callers. It does not introduce a second Tiinex engine.

## Ownership

```text
Tiinex/docs schema artifacts
→ canonical readable schema meaning

Tiinex/site schema snapshots
→ runtime materialization and validation fixtures

Tiinex/site schema companions and core modules
→ executable implementation

src/tooling/portable
→ serializable facade and adapters over the existing implementation
```

Portable adapters must not make CLI, LLM, MCP, LSP, VS Code, or React presentation into schema authority.

## Layering

```text
schema and artifact Markdown
        ↓
existing Tiinex/site core
        ↓
portable engine facade
        ↓
portable operation catalog
        ├── programmatic ESM API
        ├── LLM entrypoint
        ├── Node CLI
        ├── future MCP adapter
        ├── future LSP adapter
        └── future VS Code adapter
```

The portable core imports no React components, DOM APIs, router state, localStorage, or Vite-specific runtime code.

Node filesystem and zip handling are isolated in `input/node.input.js` and the CLI adapter. Browser or host callers pass explicit file-like objects to the ESM API.

## Operation Catalog

The operation catalog is the reusable integration seam. Each descriptor declares:

```text
name
description
safety
input schema id
output schema id
remote-fetch boundary
remote-write boundary
source-mutation boundary
serializable result
```

Initial operations:

```text
inspect
audit
resolve-lineage
resolve-capabilities
describe-schema-chain
inspect-creation-contract
make-writer-brief
serialize-session
restore-session
```

The first batch is read-only or planning-only. It does not expose durable creation or package writes.

## Source Boundary

Portable input is supplied material.

- Local material is never guessed as GitHub-backed.
- Explicit source metadata can be preserved, but the portable layer marks it as supplied and unverified unless the existing source model already qualifies it.
- Lineage traversal is loaded-only.
- No operation fetches missing parents or origins.
- Received package code is data and is not executed.
- No operation performs source mutation or remote writes.

## Qualification

Every capability-sensitive result exposes a portable qualification object.

The object distinguishes:

```text
exact module resolution
implemented capability
operation outcome
fallback use and mode
whether parent capabilities were evaluated
limitations
safe actions
blocked actions
```

The shared schema resolver in the tested v190–v192 range supports exact registered resolution or direct Root fallback. It does not yet execute a capability-by-capability semantic-parent fallback chain.

Portable tooling therefore reports:

```text
fallback.mode = direct-root
fallback.parentCapabilitiesEvaluated = false
```

It must not imply a parent fallback that the shared core did not perform.

## Schema Chain Description

`describe-schema-chain` combines two non-authoritative discovery inputs:

- registered `parentSchemaId` values from site schema modules
- explicit Parent declarations from supplied readable schema artifacts

This describes ancestry for a human or LLM. It does not itself execute validation or creation through those parents.

For an unregistered schema, the result also discloses that current runtime fallback goes directly to Root and that Root is not thereby asserted to be the semantic parent.

## Writer Fallback

`make-writer-brief` has three outcomes:

```text
exact-create-tooling-available
→ existing site creation contract is ready

llm-writer-fallback
→ exact creation is unavailable, but readable child schema material is supplied

parent-or-root-artifact-only
→ neither exact creation nor readable child schema material is available
```

An LLM writer may interpret a supplied child schema, but must:

- keep the result local
- preserve source and continuity boundaries
- read the parent chain
- run available validation
- report partial qualification
- avoid claiming exact create tooling

Parent or Root tooling may create only a genuine parent or Root artifact. It must not fabricate and mislabel a child artifact.

## Session Model

The portable session stores only explicit, serializable state:

```text
loaded material
current focus
staged artifacts
durable findings awaiting materialization
last checkpoint metadata
qualification
```

Hidden chat state is not provenance. Durable dialogue outcomes should be promoted into readable artifacts at meaningful checkpoint or transfer boundaries.

## Adapter Reuse

Future MCP, LSP, and VS Code work should map to the operation catalog rather than reimplement domain rules.

```text
MCP tools/resources
→ operation catalog and supplied material resources

LSP diagnostics/document links
→ audit, lineage, and schema-chain operations

VS Code native commands/views
→ operation catalog plus editor-specific presentation
```

Editor and agent adapters may add transport and UX, but may not raise semantic qualification.

## Known Limits

- No durable artifact creation in the portable facade.
- No canonical handoff/package generation or package-format lock.
- No production MCP, LSP, or VS Code adapter.
- No remote discovery or source mutation.
- No automatic execution of received code.
- Parent capability fallback remains a shared-core follow-up, not an adapter-local invention.
- Schema snapshot binding/checksum diagnostics are owned by the existing schema-binding validation path.

## Validation

The portable files have dedicated Node tests and syntax checks. They should also be validated with the repository's normal commands.

A pre-existing schema snapshot alias/checksum failure in a checkpoint must be reported separately rather than hidden or treated as a portable-tooling regression.
