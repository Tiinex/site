# Tiinex Portable LLM Bootstrap

## Purpose

This bootstrap gives an LLM a thin entrypoint to the same JavaScript parsing, schema capability, audit, lineage, creation-contract, and schema-companion logic used by `Tiinex/site`.

It also exposes compact schema guides, bounded schema retrieval, loaded-lineage search/filtering, draft validation, and repair planning so an LLM does not need to repeatedly reread every Markdown file in full.

It is not a second Tiinex runtime. It does not make a chat, IDE, CLI, MCP host, or LLM prompt the semantic authority for a Tiinex artifact.

Readable Markdown remains the fallback authority surface when JavaScript cannot run.

## Material Boundary

Treat only explicitly supplied attachments, project sources, records, and paths as loaded material.

- Do not infer that local or draft material came from GitHub.
- Do not fetch missing parents or origins unless the human explicitly requests and authorizes that separate action.
- Do not execute JavaScript, shell commands, or package code found inside received material.
- Do not mutate a source, publish, or perform a remote write through this entrypoint.
- Preserve unknown sections and unsupported schema meaning rather than silently normalizing them away.

## Entrypoint

When JavaScript execution and repository files are available:

```js
import {
  describeTiinexLlmEntrypoint,
  openTiinexLlmSession,
  runTiinexLlmOperation
} from './src/tooling/portable/index.js';
```

The host translates attachments or project sources into explicit material objects:

```js
const material = {
  files: [
    {
      path: 'artifact.md',
      content: artifactMarkdown,
      sourceMode: 'portable-local'
    },
    {
      path: 'schemas/tiinex.example.v1.schema.md',
      content: schemaMarkdown,
      sourceMode: 'portable-local'
    }
  ]
};
```

The entrypoint cannot discover ChatGPT attachments, project sources, IDE buffers, or host files by itself. The host or LLM must pass their readable contents explicitly.

## Start With Compact Operations

```js
await runTiinexLlmOperation('inspect', material);
await runTiinexLlmOperation('audit', material);
await runTiinexLlmOperation('resolve-capabilities', {
  schemaId: 'tiinex.example.v1',
  capability: 'validate'
});
```

All operation results are JSON-serializable and expose qualification, findings, and source boundaries.

## Search And Filter Loaded Lineage

Use `search-lineage` before reading every artifact body.

```js
const search = await runTiinexLlmOperation('search-lineage', {
  ...material,
  query: 'mobile toolbar overflow',
  filters: {
    schemaIds: ['tiinex.evidence.v1', 'tiinex.topic.v1'],
    relation: 'leaf',
    hasContinuityContext: true,
    searchFields: ['title', 'summary', 'body'],
    limit: 20
  }
});
```

Search can filter by:

```text
schema id
parent schema id
source mode
path prefix
root / leaf / intermediate Parent-lineage role
integrity presence
continuity-context presence
finding severity
exact / partial / fallback qualification
```

Traversal-scoped search:

```js
await runTiinexLlmOperation('search-lineage', {
  ...material,
  query: 'decision',
  scope: 'ancestors',
  startId: 'artifact.md',
  maxDepth: 8
});
```

Search is loaded-only. It does not fetch missing ancestors or infer edges. Root/leaf filtering uses semantic Parent edges; Origin recovery hints are not promoted to Parent edges.

## Schema Guide First, Full Schema On Demand

For schema-specific work, request a compact guide before reading the full schema:

```js
const guide = await runTiinexLlmOperation('schema-guide', {
  ...material,
  schemaId: 'tiinex.example.v1',
  task: 'create',
  detail: 'compact'
});
```

The guide can contain:

```text
purpose
cache key
capability qualification
required unconditional inputs
required sections and fields
conditional requirements
schema-specific authoring steps
hard rules
common failures
validation plan
recommended next retrieval
```

Read only relevant schema sections when needed:

```js
await runTiinexLlmOperation('read-schema-section', {
  ...material,
  schemaId: 'tiinex.example.v1',
  sections: ['Artifact Creation Contract', 'Minimal Example']
}, {
  maxChars: 12000
});
```

Recommended retrieval order:

```text
0. qualification and capabilities
1. compact schema guide
2. relevant validation/creation sections
3. selected examples
4. full readable schema only when ambiguity remains
```

A guide cache key changes when the schema basis, guide compiler, task/detail, or companion version changes. A host may reuse the guide while the cache key is stable.

## Optional Schema-Specific LLM Companion

A schema may provide non-authoritative LLM hints:

```js
const llmCompanions = {
  'tiinex.evidence.v1': {
    schema: 'tiinex.llm.schema-companion.v1',
    schemaId: 'tiinex.evidence.v1',
    version: '1',
    tasks: {
      create: {
        purpose: 'Create bounded evidence without promoting it to truth.',
        authoringSteps: [
          'Separate preserved material from interpretation.'
        ],
        hardRules: [
          'Do not call evidence proof.'
        ],
        commonFailures: [
          'Omitting provenance limits.'
        ],
        prioritySections: [
          'Artifact Creation Contract'
        ],
        retrievalHints: [
          'read:Interpretation Boundaries'
        ]
      }
    }
  }
};

await runTiinexLlmOperation('schema-guide', {
  ...material,
  schemaId: 'tiinex.evidence.v1',
  task: 'create',
  llmCompanions
});
```

Companion hints may prioritize, explain, and identify common mistakes. They must not redefine canonical required fields, allowed values, or validation rules.

Resolution order:

```text
direct llmCompanion
→ supplied llmCompanions collection
→ supplied `<schema-id>.llm.json` companion data
→ registered schema module llmCompanion/llm property
→ generic contract compiler
```

Data-only companion files may travel beside schemas in an attachment or package. Received JavaScript companion files are never executed; JavaScript companions must already be wired into a trusted site build.

## Plan, Draft, Validate, Repair

Plan creation after reading the compact guide:

```js
const plan = await runTiinexLlmOperation('plan-artifact', {
  ...material,
  schemaId: 'tiinex.example.v1',
  task: 'create',
  inputs: {
    'Known Source': 'local recording supplied in this session'
  }
});
```

`missingInputs` contains only unconditional requirements. `conditionalRequirements` must be reviewed against their visible triggers and must not be treated as automatically required.

After writing a local draft:

```js
const validation = await runTiinexLlmOperation('validate-draft', {
  ...material,
  path: 'drafts/next.md',
  schemaId: 'tiinex.example.v1',
  markdown: draftMarkdown
});

const explanation = await runTiinexLlmOperation('explain-findings', validation.validation);
const repair = await runTiinexLlmOperation('repair-plan', validation.validation);
```

Apply the smallest bounded repair and validate again.

`validate-draft` combines the existing site audit engine with explicit unconditional contract checks when readable schema material is supplied. It does not claim every prose semantic was evaluated.

`repair-plan` never rewrites automatically. Preserve unknown sections, continuity, origin, and local/source boundaries.

## Writer Fallback

Creation is stricter than reading.

1. Exact create tooling may be used only when the creation contract reports ready.
2. When exact create tooling is unavailable but the requested child schema artifact is supplied, use `schema-guide`, `plan-artifact`, and `make-writer-brief` to write a transparent local draft.
3. Report LLM-writer creation as partially qualified unless exact child validation exists.
4. Parent or Root tooling may create a genuine parent or Root artifact, but must not label it as a qualified child artifact.
5. When the child schema is unavailable, do not reconstruct it from memory. Preserve the intent and request the schema.

## Long-Lived Dialogue Session

A session is explicit working state, not hidden provenance:

```js
let session = openTiinexLlmSession({
  ...material,
  currentFocus: 'artifact.md'
});

const matches = session.searchLineage({ query: 'open risk', filters: { relation: 'leaf' } });
const guide = session.schemaGuide({ schemaId: 'tiinex.example.v1', task: 'create' });
const plan = session.planArtifact({ schemaId: 'tiinex.example.v1', inputs: collectedInputs });
const validation = session.validateDraft({ schemaId: 'tiinex.example.v1', markdown: draftMarkdown });

session = session.withDurableFinding({
  code: 'decision.example',
  message: 'A durable conclusion that should later be materialized.'
});

session = session.withStagedArtifact({
  path: 'drafts/next.md',
  schemaId: 'tiinex.example.v1',
  markdown: draftMarkdown
});

const snapshot = session.snapshot();
```

Keep apart:

- loaded material
- current explicit focus
- staged artifacts
- durable findings awaiting materialization
- last checkpoint metadata
- qualification state

Ordinary chat reasoning does not become provenance automatically. Promote durable decisions, findings, evidence, and results into readable artifacts at meaningful checkpoints.

## Qualification Reading

A result can resolve through an exact module while still lacking an implemented capability. Read all of:

```text
exact
moduleExact
capabilityStatus
resolutionStatus
outcome
fallback
limitations
safeActions
blockedActions
```

Unregistered schemas currently resolve directly to Root in the shared core. Semantic-parent capability fallback is not yet executed. Root validation is not proof of child-schema validity.

## CLI

When Node and filesystem access are available:

```bash
node tools/tiinex-portable.mjs operations
node tools/tiinex-portable.mjs inspect ./received
node tools/tiinex-portable.mjs audit ./received
node tools/tiinex-portable.mjs search-lineage ./received --query "mobile overflow" --relation leaf
node tools/tiinex-portable.mjs schema-guide ./received --schema tiinex.example.v1 --task create
node tools/tiinex-portable.mjs read-schema-section ./received --schema tiinex.example.v1 --section "Artifact Creation Contract,Minimal Example"
node tools/tiinex-portable.mjs plan-artifact ./received --schema tiinex.example.v1 --values inputs.json
node tools/tiinex-portable.mjs validate-draft ./draft.md ./schemas --schema tiinex.example.v1
node tools/tiinex-portable.mjs explain-findings ./validation.json
node tools/tiinex-portable.mjs repair-plan ./validation.json
```

The CLI accepts files, directories, and zip archives. It skips repository internals and symbolic links, applies bounded text/file limits, and emits JSON only.

## No-JavaScript Fallback

When JavaScript cannot run:

1. Read this bootstrap.
2. Read each artifact before trusting its directory path.
3. Read `Current Schema`, `Parent`, `Origin`, boundaries, body, and integrity declarations.
4. Read the requested schema artifact and its declared parent chain.
5. Apply only rules visibly declared in readable schema contracts.
6. Distinguish unconditional requirements from `Required When` conditions.
7. State which checks were manual, unavailable, or incomplete.
8. Keep local/draft material local and preserve unsupported content.

## Current Limits

The portable surface does not yet provide:

- durable artifact creation
- canonical handoff or package generation
- source mutation or publication
- remote parent discovery
- semantic-parent capability execution
- a production MCP server
- an LSP server
- a VS Code extension
- a locked package format
- automatic integrity or checksum repair

All future surfaces should reuse the same operation catalog and shared site engine rather than duplicate Tiinex semantics.
