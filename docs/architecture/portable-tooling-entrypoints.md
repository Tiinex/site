# Portable Tooling Entrypoints

## Status

This document describes the additive portable-tooling line now present on `Tiinex/site@refactor`.

The first batch exposed existing site parsing, schema capability, audit, lineage, creation-contract, and schema-companion logic to non-React callers. The second batch adds LLM-oriented schema guides, progressive schema retrieval, draft validation/repair planning, and loaded-lineage search/filtering.

The work was compatibility-checked against the current v193 branch head. It does not introduce a second Tiinex engine.

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

Each operation descriptor declares its name, safety class, input/output schema ids, remote boundaries, source-mutation boundary, and serializability.

Current operations:

```text
inspect
audit
resolve-lineage
search-lineage
resolve-capabilities
describe-schema-chain
inspect-creation-contract
make-writer-brief
schema-guide
read-schema-section
plan-artifact
validate-draft
explain-findings
repair-plan
serialize-session
restore-session
```

The current surface is read-only, planning-only, or explicit local session state. It does not expose durable creation, package writes, source mutation, or remote writes.

## Source Boundary

Portable input is supplied material.

- Local material is never guessed as GitHub-backed.
- Explicit source metadata can be preserved, but is marked as supplied and unverified unless the existing source model already qualifies it.
- Lineage traversal and search are loaded-only.
- No operation fetches missing parents or origins.
- Received package code is data and is not executed.
- No operation performs source mutation or remote writes.

## Qualification

Every capability-sensitive result exposes a portable qualification object distinguishing exact module resolution, implemented capability, operation outcome, fallback use, parent-capability evaluation, limitations, safe actions, and blocked actions.

The shared schema resolver in the tested v190–v193 range supports exact registered resolution or direct Root fallback. It does not yet execute a capability-by-capability semantic-parent fallback chain.

Portable tooling therefore reports:

```text
fallback.mode = direct-root
fallback.parentCapabilitiesEvaluated = false
```

Root validation must not be presented as proof of child-schema validity.

## LLM Schema Guide

`schema-guide` compiles a compact task-specific working guide from:

```text
supplied readable schema Markdown
registered schema binding and capability metadata
existing creation contracts
optional schema-specific LLM companion hints
```

A guide contains a cache key, purpose, capability qualification, unconditional required inputs/structure/fields, conditional requirements, authoring steps, hard rules, common failures, validation plan, and progressive retrieval hints.

The guide compiler deliberately separates unconditional and conditional contract requirements. A group with `Required When` is reported for trigger-aware review and is not silently promoted to an unconditional failure.

### Progressive retrieval

An LLM should normally read schema material in layers:

```text
0. capability/qualification
1. compact task guide
2. relevant validation or creation groups
3. selected examples
4. full readable schema only when needed
```

`read-schema-section` retrieves bounded sections from supplied schema Markdown. It does not change schema meaning.

### Cache key

Guide cache keys include:

```text
schema id
task
detail level
schema checksum or supplied schema material hash
guide compiler version
LLM companion version
```

Hosts may reuse a guide until the cache key changes.

## Schema-Specific LLM Companions

Schema-specific hints use the non-authoritative runtime shape:

```js
{
  schema: 'tiinex.llm.schema-companion.v1',
  schemaId: 'tiinex.evidence.v1',
  version: '1',
  tasks: {
    create: {
      purpose: 'Create bounded evidence without promoting it to truth.',
      authoringSteps: ['Separate preserved material from interpretation.'],
      hardRules: ['Do not call evidence proof.'],
      commonFailures: ['Omitting provenance limits.'],
      prioritySections: ['Artifact Creation Contract'],
      retrievalHints: ['read:Interpretation Boundaries']
    }
  }
}
```

Resolution order:

```text
direct request companion
→ supplied companion collection keyed by schema id
→ supplied `<schema-id>.llm.json` companion data
→ registered site schema module llmCompanion/llm property
→ generic contract compiler
```

The companion may prioritize and explain. It must not redefine required fields, allowed values, or validation semantics. Those remain owned by readable schema contracts and shared validators.

A future schema-local file such as `evidence.llm.js` can export this object and be attached to the corresponding site schema module. Supplied packages may also carry safe data-only companions such as `tiinex.evidence.v1.llm.json`; received JavaScript is never executed. Until the shared schema-module seam is intentionally changed, portable callers may pass `llmCompanion` or `llmCompanions` directly.

## Artifact Planning And Draft Validation

The intended LLM writer loop is:

```text
schema-guide(create)
→ collect missing unconditional inputs
→ review conditional requirements
→ read selected schema sections/examples on demand
→ plan-artifact
→ write a local draft
→ validate-draft
→ explain-findings / repair-plan
→ apply the smallest bounded repair
→ validate again
```

`validate-draft` combines the existing site audit engine with contract-driven checks for explicit unconditional required sections and fields when readable child schema material is supplied.

Contract-driven structural checks do not claim to evaluate every prose-bound semantic rule. Conditional requirements are surfaced separately for trigger-aware review.

`repair-plan` never rewrites an artifact automatically. It preserves unknown sections, continuity, and source boundaries.

## Loaded-Lineage Search

`search-lineage` gives an LLM a compact retrieval surface over loaded artifacts rather than requiring full Markdown traversal.

It supports:

```text
weighted full-text search over title, summary, path, schema, body, origin, trace, and source metadata
schema and parent-schema filters
source-mode and path filters
root/leaf/intermediate Parent-lineage role filters
integrity and continuity-presence filters
finding severity and qualification filters
ancestor/descendant traversal scope from one or more loaded start ids
pagination, snippets, scores, and facets
```

Root/leaf role is based on resolved semantic Parent edges. Origin recovery edges do not become Parent edges for role filtering.

Search remains loaded-only and does not infer missing edges or fetch remote material.

## Schema Chain Description

`describe-schema-chain` combines registered `parentSchemaId` values from site schema modules with explicit Parent declarations from supplied readable schema artifacts.

This describes ancestry for a human or LLM. It does not itself execute validation or creation through those parents.

## Writer Fallback

`make-writer-brief` has three outcomes:

```text
exact-create-tooling-available
llm-writer-fallback
parent-or-root-artifact-only
```

An LLM writer fallback may interpret supplied readable child schema material, but must keep the result local, preserve source and continuity boundaries, read the parent chain, run available validation, report partial qualification, and avoid claiming exact create tooling.

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

Session methods expose the same schema-guide, search, planning, validation, and repair operations. Hidden chat state is not provenance.

## Adapter Reuse

Future MCP, LSP, and VS Code work should map to the operation catalog rather than reimplement domain rules.

```text
MCP tools/resources
→ operation catalog, schema guides, and supplied material resources

LSP diagnostics/document links
→ audit, search, lineage, schema-guide, and draft-validation operations

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
- Parent capability fallback remains a shared-core follow-up.
- Schema-specific LLM companions are runtime hints, not canonical authority.
- Contract-driven draft checks cover explicit structured requirements, not every prose semantic.
- Schema snapshot binding/checksum diagnostics remain owned by the existing schema-binding validation path.

## Validation

Portable files have dedicated Node tests and syntax checks and should also be validated with the repository's normal commands.

```bash
node src/tooling/portable/portable.test.mjs
npm run validate
```

Checkpoint-local baseline failures must be reported separately rather than hidden or attributed to portable tooling.
