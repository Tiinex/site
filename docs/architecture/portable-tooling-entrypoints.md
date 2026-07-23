# Portable Tooling Entrypoints

## Status

This document describes the additive portable-tooling line now present on `Tiinex/site@refactor`.

The first batch exposed existing site parsing, schema capability, audit, lineage, creation-contract, and schema-companion logic to non-React callers. The second batch added LLM-oriented schema guides, progressive schema retrieval, draft validation/repair planning, and loaded-lineage search/filtering. The third batch added capability-level host discovery, material/schema providers, unknown-schema parent-chain material resolution, explicit schema cache, safe local draft creation/staging, task orchestration, and host-mediated asset analysis preparation. The fourth batch added explicit durable-finding materialization, recoverable non-handoff checkpoints, and the current site runtime-package build/inspection/round-trip surface with optional local ZIP serialization in the Node CLI. The fifth batch binds capability-level needs to concrete host tools, ranked alternatives, invocation templates, and explicit normalized receipts so the LLM can identify not only that a capability exists, but which tool to call and how to return the result safely. The sixth batch adds fixed checkpoint-gate descriptions, explicit validation-receipt qualification, deterministic portable source/catalog fingerprints, continuity and reproducibility diagnostics, and a Node-only fixed-command verifier that can later be wired into CI without placing shell execution inside the portable semantic core.

The cumulative portable line is grounded and validated against the supplied v199 checkpoint (`site(12).zip`). It does not introduce a second Tiinex engine.

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

## Bootstrap And Startup Modes

`bootstrap/tiinex.llm.bootstrap.pointer.json` is the compact machine-readable locator for the full bootstrap, ESM entrypoint, and CLI. The full bootstrap documents five supported startup modes:

```text
project source plus uploaded Markdown/archive material
bootstrap travelling inside an archive
bootstrap present without a handoff
pre-prompt only, with host-mediated versioned bootstrap retrieval
bootstrap present without a separate pre-prompt
```

When only a pre-prompt exists, the host should use its equivalent repository or HTTP reader to fetch an explicitly versioned `Tiinex/site` bootstrap. If that is unavailable, the LLM must request bootstrap material rather than reconstruct Tiinex rules from memory.

## Operation Catalog

Each operation descriptor declares its name, safety class, input/output schema ids, remote boundaries, source-mutation boundary, and serializability.

Current operations:

```text
prepare-task
discover-tooling
plan-host-action
accept-host-receipt
describe-checkpoint-gate
qualify-checkpoint
list-material-providers
resolve-schema-material
resolve-schema-chain-material
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
create-local-draft
validate-draft
explain-findings
repair-plan
stage-draft
inspect-assets
prepare-asset-analysis
plan-durable-materialization
materialize-durable-findings
create-checkpoint
restore-checkpoint
build-runtime-package
inspect-runtime-package
rehydrate-runtime-package
roundtrip-runtime-package
serialize-session
restore-session
```

The current surface is read-only, planning-only, explicit local draft/session/package state, or optional host-mediated schema reads. The portable operation catalog does not publish, mutate sources, authorize remote writes, claim a canonical handoff, or execute received code. The Node CLI may perform an explicit local filesystem write when `build-runtime-package --output <file.zip>` is requested.

## Source Boundary

Portable input is supplied material.

- Local material is never guessed as GitHub-backed.
- Explicit source metadata can be preserved, but is marked as supplied and unverified unless the existing source model already qualifies it.
- Lineage traversal and search are loaded-only.
- Missing artifact parents and origins are not fetched automatically. Readable schema material may be resolved through explicit host-mediated provider adapters or provider-response handoff.
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


## Host Capability Discovery And Task Orchestration

`discover-tooling` classifies host tool descriptors by capability rather than product name. It recognizes attachment/project-source access, filesystem/archive access, repository search/read, execution, multimodal reading, and mutation availability. Remote write availability is separate from explicit authorization.

`prepare-task` turns a requested task into one explicit next action. Supported orchestration targets are:

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

The result may ask the host to fetch a schema, collect required inputs, create a local draft, run a repair plan, stage a draft, search loaded lineage, or expose an asset to a multimodal reader. This keeps bootstrap prompts small and lets the LLM query the system instead of memorizing host-specific procedures.

## Concrete Host Tool Binding And Receipts

Capability booleans alone are insufficient for autonomous use. `discover-tooling` now preserves a ranked binding from each portable capability to concrete host tool descriptors. For example, repository search can select `GitHub.search` over an unrelated public-web search tool, while repository reads can select `GitHub.fetch_file`.

`plan-host-action` turns a capability-level request into:

```text
selected concrete tool
ranked alternatives
argument template
expected normalized result
receipt contract
continuation operation
```

The planner never invokes the host itself. The LLM or host executes the selected tool and returns an explicit `tiinex.portable.host-action-receipt.v1` object. `accept-host-receipt` verifies the plan/action/step identities and normalizes only the explicit receipt. Raw tool output is not silently promoted to provenance.

Repository receipts require explicit repository identity and remain moving-ref qualified when no commit is supplied. Local or archive receipts cannot acquire GitHub provenance, even when a caller accidentally supplies repository metadata. Multimodal receipts are stored as generated interpretations separate from the source asset. Remote-write plans remain blocked until explicit human authorization is present.

## Checkpoint Qualification And Validation Receipts

`describe-checkpoint-gate` exposes three fixed technical profiles without executing commands:

```text
portable
source-clean
release
```

`qualify-checkpoint` accepts explicit `tiinex.portable.validation-receipt.v1` records and returns `tiinex.portable.checkpoint-qualification.v1`. It distinguishes passed, failed, blocked, skipped, and missing gates; binds the result to supplied site identity and portable source/catalog fingerprints; diagnoses package/checkpoint drift; and reports dependency/install reproducibility risk. It does not claim browser parity, a canonical release, or a canonical handoff.

`tools/tiinex-portable-verify.mjs` is a Node-only adapter over this contract. It executes only the fixed commands declared by the selected profile, hashes the cumulative portable source set, emits receipts, and passes those receipts into the pure qualifier. Arbitrary command execution is not exposed through the operation catalog.

The verifier intentionally reports current `latest` dependencies, npm-without-package-lock installs, `npm install` instead of `npm ci`, and parity/checkpoint identity drift. It does not mutate package metadata or workflows because those remain shared/release seams. Private dogfood corpora may contribute manual evidence, but embedding private evidence in distributable fixtures is a qualification error.

## Schema Material Providers

Provider selection is explicit and ordered:

```text
loaded material
→ serializable schema cache
→ supplied provider responses
→ local directory/Git checkout
→ archive
→ host repository connector
→ explicit HTTP provider
→ preserve-only
```

`resolve-schema-material` verifies the schema identity from the readable artifact envelope. A matching filename alone is insufficient. Registered source repository/commit/path/checksum metadata is compared when available.

`resolve-schema-chain-material` repeats this process through declared schema parents and returns a compact chain, explicit material files, and cache updates. It does not claim that the current shared runtime executed semantic-parent capability fallback.

Executable providers are host-supplied functions passed in operation options. When the host connector is available to the LLM but not callable from the JavaScript sandbox, the operation returns a serializable `providerRequest` containing search queries, expected paths, response shape, and the next operation. The LLM invokes its equivalent host tools and supplies the response explicitly.

The schema cache is explicit session data. It preserves source qualification and is never hidden global process state.

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


## Local Draft Creation And Staging

`create-local-draft` consumes explicit inputs and produces an in-memory local draft. Exact registered creation contracts are reused when available. Otherwise, supplied readable child schema material may drive a generic schema-structured writer fallback.

The operation:

```text
never inherits a parent source adapter object
never performs a file or remote write
blocks missing unconditional inputs by default
allows explicit incomplete local checkpoints only through allowIncomplete
runs draft validation before returning qualification
```

`stage-draft` returns a serializable staged-artifact record. Validation errors block staging unless an explicitly incomplete local checkpoint is requested. Staging does not imply export readiness, publication, exact child validation, or package conformance.

## Durable Finding Materialization

Durable conversation outcomes remain explicit session findings until a caller maps them to an explicit target schema.

```text
plan-durable-materialization
→ validate finding ids and explicit schema selections

materialize-durable-findings
→ resolve readable schema chain
→ create local draft
→ validate
→ optionally stage
→ remove only successfully materialized findings from session state
```

Portable tooling does not infer whether a durable finding is a decision, evidence, outcome, topic, or another artifact family. Unmapped findings remain visible and recoverable.

## Recoverable Portable Checkpoints

`create-checkpoint` captures explicit portable session state, including loaded material, focus, staged artifacts, durable findings, and schema cache. The checkpoint carries a deterministic non-cryptographic corruption guard and an explicit boundary:

```text
canonical handoff artifact: false
canonical package format locked: false
hidden chat state included: false
```

`restore-checkpoint` verifies the version and corruption guard before restoring the session. A portable checkpoint is a recoverability mechanism, not a substitute for a schema-qualified Tiinex handoff artifact.

## Current Runtime Package And Round Trip

`build-runtime-package`, `inspect-runtime-package`, `rehydrate-runtime-package`, and `roundtrip-runtime-package` reuse the existing `src/export/**` runtime implementation. They do not define a second package engine.

The round-trip check verifies that:

```text
local staged artifact Markdown survives import unchanged
source references remain source references
local records are not guessed as GitHub-backed
bundle inspection and import planning remain valid
```

`rehydrate-runtime-package` reconstructs the runtime file map from explicitly supplied serialized package entries, such as the entries produced by the archive adapter. This allows an actual ZIP to be parsed, rehydrated, and passed through the same import/round-trip checks. The result always states that this is the current site runtime contract, not a locked canonical handoff/package schema. The Node-only `output/node.zip.js` adapter can serialize a valid in-memory bundle to a local ZIP when the caller explicitly supplies an output path.

## Asset Index And Host Multimodal Handoff

`inspect-assets` indexes asset path, MIME/media kind, size, references, content availability, and safe local/archive locators without interpreting binary content.

`prepare-asset-analysis` returns a host action for image or PDF analysis when the host profile exposes that capability. Portable core does not implement vision. The response keeps the source asset and generated interpretation distinct and does not promote a description into evidence automatically.

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
explicit schema cache
```

Session methods expose the same schema-guide, search, planning, validation, repair, materialization, checkpoint, and runtime-package operations. Hidden chat state is not provenance.

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

- Local draft creation, staging, materialization, and checkpointing are in-memory/serializable. Only the explicit Node CLI package-output path writes a local file.
- The current site runtime package is supported and round-trip tested, but no canonical handoff/package schema or package-format lock is claimed.
- Portable checkpoints are not canonical handoff artifacts.
- No production MCP, LSP, or VS Code adapter.
- Schema reads may be host-mediated, but artifact-parent/origin discovery remains explicit and separate.
- No automatic execution of received code.
- Parent capability fallback remains a shared-core follow-up.
- Schema-specific LLM companions are runtime hints, not canonical authority.
- Contract-driven draft checks cover explicit structured requirements, not every prose semantic.
- Host multimodal analysis remains interpretation produced by the host, not source evidence by default.
- Schema snapshot binding/checksum diagnostics remain owned by the existing schema-binding validation path.

## Validation

Portable files have dedicated Node tests and syntax checks and should also be validated with the repository's normal commands.

```bash
node src/tooling/portable/portable.test.mjs
npm run validate
```

Checkpoint-local baseline failures must be reported separately rather than hidden or attributed to portable tooling.
