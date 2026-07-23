# Tiinex Portable LLM Bootstrap

## Purpose

This bootstrap gives an LLM a thin entrypoint to the same JavaScript parsing, schema capability, audit, lineage, creation-contract, and schema-companion logic used by `Tiinex/site`.

It also exposes capability-level host discovery, concrete host-tool binding and receipt normalization, schema providers, compact schema guides, bounded schema retrieval, loaded-lineage search/filtering, local draft creation/staging, draft validation, repair planning, durable-finding materialization, recoverable checkpoints, the current site runtime-package round trip, host-mediated asset analysis preparation, and explicit checkpoint qualification receipts so an LLM does not need to repeatedly reread every Markdown file in full or mistake an incomplete validation run for a qualified checkpoint.

It is not a second Tiinex runtime. It does not make a chat, IDE, CLI, MCP host, or LLM prompt the semantic authority for a Tiinex artifact.

Readable Markdown remains the fallback authority surface when JavaScript cannot run.

## Startup Modes

The same workflow must survive different host arrangements:

### Project source plus uploaded material

When this bootstrap or the portable repository is available as a project source, normalize only the explicitly uploaded Markdown, archive, and project-source material, then start with `discover-tooling` or `prepare-task`.

### Bootstrap travels inside an archive

When `tiinex.llm.bootstrap.md` or `tiinex.llm.bootstrap.pointer.json` is present inside a received archive, read the pointer/bootstrap first. Treat all other archive entries as supplied material and do not execute package code.

### Bootstrap exists but no handoff exists

Open an explicit portable session from the loaded material. Keep durable findings, staged drafts, current focus, and schema cache in session state. Create a recoverable portable checkpoint only at a meaningful interruption boundary; do not invent a handoff artifact.

### Pre-prompt only; no bootstrap source is loaded

Use the host's equivalent repository search/read or HTTP-read capability to fetch a versioned bootstrap from:

```text
repository: Tiinex/site
path: src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md
pointer: src/tooling/portable/bootstrap/tiinex.llm.bootstrap.pointer.json
```

Prefer an explicit commit or release ref and disclose when a moving branch was used. If no provider can retrieve it, request the bootstrap or a tooling archive instead of reconstructing Tiinex instructions from memory.

### Bootstrap exists without a pre-prompt

Read the pointer/bootstrap, discover equivalent host capabilities, inspect the operation catalog, and choose the next operation from the actual task and loaded material. A separate pre-prompt is helpful but not required.

## Material Boundary

Treat only explicitly supplied attachments, project sources, records, and paths as loaded material.

- Do not infer that local or draft material came from GitHub.
- Do not fetch missing artifact parents or origins unless the human explicitly requests and authorizes that separate action. Readable schema material may be fetched only through an explicit host-mediated provider request or trusted provider adapter.
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

The entrypoint cannot enumerate ChatGPT attachments, project sources, IDE buffers, or host files by itself. The host or LLM must pass their readable contents explicitly. It can, however, classify descriptions of available host tools and return the equivalent capability route to use.


## Start By Discovering Equivalent Host Tooling

Do not depend on product-specific tool names such as `git clone`, `GitHub.fetch_file`, or `open_image`. Describe the available host tools and let portable tooling classify their capabilities:

```js
const prepared = await runTiinexLlmOperation('prepare-task', {
  task: 'create-artifact',
  schemaId: 'tiinex.example.v1',
  ...material,
  tools: hostToolDescriptions
});
```

Or inspect only the host profile:

```js
await runTiinexLlmOperation('discover-tooling', {
  tools: [
    { name: 'repository.search', description: 'Search files in a repository.' },
    { name: 'repository.read', description: 'Read one repository file.' },
    { name: 'archive.extract', description: 'Extract a zip entry.' },
    { name: 'vision.image', description: 'Analyze an image.' }
  ]
});
```

Capabilities are normalized into attachment/project-source access, filesystem/archive access, repository search/read, execution, multimodal reading, and mutation availability. Remote writes remain unauthorized unless the human explicitly authorizes a separate adapter action.

`prepare-task` can orchestrate:

```text
read-schema
create-artifact
validate-draft
search-lineage
analyze-asset
materialize-findings
qualify-checkpoint
checkpoint
package
```

It returns one explicit `nextAction`, such as collecting missing inputs, calling a host repository provider, creating a local draft, repairing findings, staging, or exposing an asset to host vision.

## Bind Capabilities To Concrete Host Tools

`discover-tooling` reports both capability availability and ranked concrete tool bindings. Use `plan-host-action` when the next step must leave the JavaScript runtime and be executed by the host:

```js
const plan = await runTiinexLlmOperation('plan-host-action', {
  action: 'repository-schema-resolution',
  tools: hostToolDescriptions,
  request: providerRequest
});
```

A plan includes selected tool ids/names, alternatives, generic argument templates, expected normalized results, and a receipt contract. Adapt the generic template to the selected host tool's real argument schema; do not invent unsupported parameters.

After the host call, return an explicit receipt rather than passing opaque raw output directly into Tiinex logic:

```js
const accepted = await runTiinexLlmOperation('accept-host-receipt', {
  plan,
  receipt: {
    schema: 'tiinex.portable.host-action-receipt.v1',
    actionId: plan.actionId,
    action: plan.action,
    steps: [{
      stepId: plan.steps[0].stepId,
      toolId: plan.steps[0].tool.id,
      status: 'completed',
      normalized: { /* explicit result matching the receipt contract */ }
    }]
  }
});
```

Repository material becomes `providerResponses`; local/archive material remains local; image/PDF descriptions remain generated interpretations and are not source evidence. Missing repository commits are disclosed as moving-ref qualification. Remote writes remain blocked unless explicitly authorized by the human.

## Qualify The Actual Checkpoint

Use `describe-checkpoint-gate` to inspect the fixed gates for `portable`, `source-clean`, or `release` profiles without executing anything:

```js
await runTiinexLlmOperation('describe-checkpoint-gate', { profile: 'source-clean' });
```

The pure portable operation `qualify-checkpoint` accepts explicit `tiinex.portable.validation-receipt.v1` results. It checks required gates, package/checkpoint identity, portable source fingerprints, dependency/install reproducibility metadata, and private dogfood-evidence boundaries. It never runs shell commands and never upgrades a technical gate receipt into browser parity or a canonical release claim.

A trusted local Node host may execute the fixed gate list through:

```bash
node tools/tiinex-portable-verify.mjs --profile source-clean --output portable-checkpoint-report.json
```

Profiles:

```text
portable     → portable source syntax + aggregate portable suite
source-clean → portable + shared validation + UI shape + UC001 + metrics + storage scan + focused typecheck
release      → source-clean + runtime smoke + public build + public output check
```

The Node verifier hashes the complete portable source set and operation catalog, emits command receipts, and passes them through the same pure qualifier. Missing dependencies produce an incomplete/blocked release qualification rather than a false pass. Current dependency pinning, lockfile/installer mismatch, or checkpoint identity drift remain visible diagnostics and are not repaired by this adapter.

Private manual corpora may be listed as private evidence, but `private: true` together with `embedded: true` is a hard qualification error.

## Resolve Unknown Schemas Through Providers

Provider order is deterministic:

```text
already loaded schema material
→ explicit serializable schema cache
→ host/provider responses already supplied
→ local directory or Git checkout
→ archive
→ host repository connector
→ explicit HTTP provider
→ preserve-only
```

List the current choices:

```js
await runTiinexLlmOperation('list-material-providers', {
  ...material,
  tools: hostToolDescriptions,
  schemaCache
});
```

Resolve one schema or its readable parent chain:

```js
const resolved = await runTiinexLlmOperation('resolve-schema-chain-material', {
  ...material,
  schemaId: 'tiinex.example.v1',
  schemaCache,
  tools: hostToolDescriptions
});
```

When a connector exists but cannot be invoked inside the JavaScript sandbox, the result is not a dead end. It returns a self-describing `providerRequest` containing repository, ref, search queries, expected paths, required response shape, and the next operation. The LLM uses its equivalent host repository tools, then supplies the result explicitly:

```js
await runTiinexLlmOperation('resolve-schema-material', {
  schemaId: 'tiinex.example.v1',
  providerResponses: [{
    providerId: 'host-repository',
    files: [{
      path: '.topics/.schemas/.../tiinex.example.v1.schema.md',
      content: fetchedMarkdown,
      source: {
        repository: 'Tiinex/docs',
        ref: 'master',
        commit: resolvedCommit,
        path: '.topics/.schemas/.../tiinex.example.v1.schema.md',
        authority: 'canonical-core'
      }
    }]
  }]
});
```

Filename matches are insufficient. The supplied schema must declare the requested `Current Schema`. Registered repository/commit/path bindings are compared when available. A provider never gains authority merely because it is remote.

The returned cache is explicit and serializable. Reuse it through `schemaCache` or `session.withSchemaCache(...)`; do not rely on hidden process memory.

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

Create a bounded in-memory local draft only after required inputs are present:

```js
const creation = await runTiinexLlmOperation('create-local-draft', {
  ...material,
  schemaId: 'tiinex.example.v1',
  title: 'Next Artifact',
  summary: 'A local draft created from explicit inputs.',
  values: collectedInputs,
  parent: {
    id: 'loaded-parent-id',
    path: 'parent.md',
    schemaId: 'tiinex.topic.v1',
    boundary: 'portable local material; no GitHub provenance inferred'
  }
});
```

Exact registered creation contracts are reused when available. Otherwise, readable child schema material may drive an LLM-writer draft. The result remains local, carries no inherited source object, and reports partial qualification when exact child tooling is unavailable. Missing unconditional inputs block creation unless `allowIncomplete` is explicitly used for an incomplete local checkpoint.

Validate any supplied or generated local draft:

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

Apply the smallest bounded repair and validate again. Stage only after the remaining qualification is acceptable:

```js
const staged = await runTiinexLlmOperation('stage-draft', {
  ...material,
  draft: creation.draft
});
```

Staging returns an explicit serializable staged-artifact record. It does not write a file, mutate a source, publish, or make a partially validated child exact. Validation errors block staging unless an explicitly incomplete local checkpoint is requested.

`validate-draft` combines the existing site audit engine with explicit unconditional contract checks when readable schema material is supplied. It does not claim every prose semantic was evaluated.

`repair-plan` never rewrites automatically. Preserve unknown sections, continuity, origin, and local/source boundaries.

## Materialize Durable Findings Explicitly

Durable findings remain explicit session state until the human or host maps them to an explicit target schema. Never guess whether a finding is a decision, evidence artifact, outcome, topic, or another family.

```js
const materializationPlan = await runTiinexLlmOperation('plan-durable-materialization', {
  session: session.snapshot(),
  materializations: [{
    id: 'decision-artifact',
    findingIds: ['decision.example'],
    schemaId: 'tiinex.decision.v1',
    title: 'Landed Decision',
    values: collectedDecisionInputs
  }]
});

const materialized = await runTiinexLlmOperation('materialize-durable-findings', {
  session: session.snapshot(),
  ...schemaMaterial,
  materializations: materializationPlan.materializations
});
```

Only successfully materialized findings are removed from the returned session. Unmapped or blocked findings remain visible. Created artifacts remain local and are staged only when validation permits.

## Recoverable Checkpoints Are Not Handoffs

Use a portable checkpoint when a long-running host session needs recoverability before a canonical handoff schema is available or appropriate:

```js
const checkpoint = await runTiinexLlmOperation('create-checkpoint', {
  session: session.snapshot()
});

const restored = await runTiinexLlmOperation('restore-checkpoint', checkpoint);
```

The checkpoint explicitly states:

```text
canonicalHandoffArtifact = false
canonicalPackageFormatLocked = false
hiddenChatStateIncluded = false
```

Do not call it a Tiinex handoff artifact. It is an explicit portable session snapshot with a corruption guard.

## Build And Verify The Current Runtime Package

The portable layer reuses the current site `src/export/**` package implementation:

```js
const built = await runTiinexLlmOperation('build-runtime-package', {
  session: session.snapshot(),
  title: 'Portable checkpoint package'
});

const roundTrip = await runTiinexLlmOperation('roundtrip-runtime-package', {
  bundle: built.bundle
});

const rehydrated = await runTiinexLlmOperation('rehydrate-runtime-package', {
  files: extractedPackageEntries
});
```

The round trip checks that local artifact Markdown survives import unchanged, source references remain references, and local records are not guessed as GitHub-backed. The result always says that the current runtime contract is not a locked canonical handoff/package schema.

In Node, the CLI may write a local ZIP only when an explicit output path is provided:

```bash
node tools/tiinex-portable.mjs build-runtime-package --session session.json --output checkpoint-package.zip
```

This is a local filesystem write, not publication or source mutation.


## Assets And Multimodal Host Analysis

Portable tooling indexes assets and references without pretending to understand their content:

```js
const assets = await runTiinexLlmOperation('inspect-assets', material);
const request = await runTiinexLlmOperation('prepare-asset-analysis', {
  ...material,
  assetPath: 'assets/example.png',
  tools: hostToolDescriptions
});
```

For an image inside a zip, the host route is:

```text
discover archive entry
→ materialize/extract only that asset
→ expose it to the host image-capable model
→ return bounded observations as an explicit analysis response
```

The asset remains source material. The generated description is interpretation, not embedded provenance or evidence, unless a later explicit artifact owns that relationship.

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

const host = session.discoverTooling({ tools: hostToolDescriptions });
const schemaContext = await session.resolveSchemaChainMaterial({ schemaId: 'tiinex.example.v1' });
session = session.withSchemaCache(schemaContext.materials.schemaCache);
const matches = session.searchLineage({ query: 'open risk', filters: { relation: 'leaf' } });
const guide = session.schemaGuide({ schemaId: 'tiinex.example.v1', task: 'create' });
const plan = session.planArtifact({ schemaId: 'tiinex.example.v1', inputs: collectedInputs });
const creation = session.createLocalDraft({ schemaId: 'tiinex.example.v1', values: collectedInputs });
const validation = session.validateDraft({ schemaId: 'tiinex.example.v1', markdown: creation.draft.markdown });
const staged = session.stageDraft({ draft: creation.draft });

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
const materialized = await session.materializeDurableFindings({ materializations });
const checkpoint = await session.createCheckpoint();
const packageRoundTrip = session.roundTripRuntimePackage();
```

Keep apart:

- loaded material
- current explicit focus
- staged artifacts
- durable findings awaiting materialization
- last checkpoint metadata
- qualification state
- explicit serializable schema cache

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
node tools/tiinex-portable.mjs describe-checkpoint-gate --profile source-clean
node tools/tiinex-portable-verify.mjs --profile source-clean --output portable-checkpoint-report.json
node tools/tiinex-portable.mjs prepare-task ./received --task create-artifact --schema tiinex.example.v1 --host host.json
node tools/tiinex-portable.mjs discover-tooling --host host.json
node tools/tiinex-portable.mjs resolve-schema-chain-material ./docs.zip --schema tiinex.example.v1
node tools/tiinex-portable.mjs inspect ./received
node tools/tiinex-portable.mjs audit ./received
node tools/tiinex-portable.mjs search-lineage ./received --query "mobile overflow" --relation leaf
node tools/tiinex-portable.mjs schema-guide ./received --schema tiinex.example.v1 --task create
node tools/tiinex-portable.mjs read-schema-section ./received --schema tiinex.example.v1 --section "Artifact Creation Contract,Minimal Example"
node tools/tiinex-portable.mjs plan-artifact ./received --schema tiinex.example.v1 --values inputs.json
node tools/tiinex-portable.mjs create-local-draft ./schemas --schema tiinex.example.v1 --values inputs.json --parent parent.json
node tools/tiinex-portable.mjs validate-draft ./draft.md ./schemas --schema tiinex.example.v1
node tools/tiinex-portable.mjs stage-draft ./draft.md ./schemas --schema tiinex.example.v1
node tools/tiinex-portable.mjs inspect-assets ./received.zip
node tools/tiinex-portable.mjs prepare-asset-analysis ./received.zip --asset assets/example.png --host host.json
node tools/tiinex-portable.mjs plan-durable-materialization --session session.json --specs materializations.json
node tools/tiinex-portable.mjs materialize-durable-findings ./schemas --session session.json --specs materializations.json
node tools/tiinex-portable.mjs create-checkpoint session.json
node tools/tiinex-portable.mjs restore-checkpoint checkpoint.json
node tools/tiinex-portable.mjs build-runtime-package --session session.json --output runtime-package.zip
node tools/tiinex-portable.mjs inspect-runtime-package bundle.json
node tools/tiinex-portable.mjs rehydrate-runtime-package runtime-package.zip
node tools/tiinex-portable.mjs roundtrip-runtime-package --bundle bundle.json
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

- automatic file writes or publication of created/staged local drafts; only explicit Node runtime-package ZIP output writes locally
- canonical handoff generation or a locked canonical package schema
- source mutation or publication
- automatic artifact-parent/origin discovery; schema discovery is explicit and host-mediated
- semantic-parent capability execution
- a production MCP server
- an LSP server
- a VS Code extension
- a locked package format
- automatic integrity or checksum repair

All future surfaces should reuse the same operation catalog and shared site engine rather than duplicate Tiinex semantics.
