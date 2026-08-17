# Validation Notes v424 — Canonical Transition Product Vertical Slice

Checkpoint: `v424`  
Version: `0.2.243-v424`  
Runtime: `react-v424-canonical-transition-product-vertical-slice`

## Scope

v424 is the first bounded canonical Transition product/execution slice. It preserves the frozen v421–v423 semantic owners and adds product-owned canonical definition data, exact source-qualified schema cache material, product discovery/preparation, explicit legacy presentation precedence, a five-field canonical Task form, one bounded Task renderer/preflight adapter, and one browser-local create command.

## Exact canonical schema cache

Production cache source: `Tiinex/docs@d69b8ff55a56b8cb9282b8684db6a938a4435b94`.

```text
tiinex.root.v1
Git blob 7078e4832872be0df0df4ee944ee1bcd1d886f12

 tiinex.transition.definition.v1
Git blob 548dac027abcc4fddf918e294a80b5aca1603c46

 tiinex.task.v1
Git blob e4d545ad45382a150351ead587339d8b43cc0fb2
```

`src/transitions/canonicalTransition.schemaCache.test.mjs` recomputes Git blob identity from the bundled bytes and proves a one-byte/EOF change fails source qualification. Site-local schema snapshots and Tooling fixtures are not used as production authority.

## Canonical product definition and discovery

The bundled `topic-to-task-transition-definition.trace.md` is read through the frozen Root→Transition registry/read chain and must be `canonicalReadQualified=true`. Its semantic identity is `tiinex.site.topic-to-task.v1`; lifecycle, Parent, generation, destination, placement, and naming truth come from the Markdown Artifact itself, never from the legacy shorthand object.

Canonical definitions already present as workspace records are eligible through the same registry when independently qualified. Product capability is shape/capability-derived; preparation contains no canonical-ID execution switch.

## Authoring / fresh planning

Canonical Task authoring inputs come from the exact Task Artifact Creation Contract:

```text
Summary
Objective
Done Criteria
Scope
Dependencies
```

Tooling configuration fields remain separate. On Create, v424 rebuilds product preparation from the latest workspace state, then recomputes frozen v422 invocation bindings and frozen v423 output-materialization intent from submitted values. Only `v423.qualification = qualified` may reach the mutation boundary.

## Local materializer / Parent / path boundary

The supported local-create pattern is exactly one artifact output (`tiinex.task.v1`), one requested `create` operation, one `new-materialization` placement into the active browser-local workspace, explicit naming, one deterministic Parent `set(source-topic)`, no Relation Effects, and no unresolved Conditions.

Source Topic Parent recovery requires a repository, commit-pinned 40-hex ref, and source Artifact path. The generated Task uses canonical Root fields (`Envelope Schema`, `Parent Schema`, `Trace`, `Origin`, `Current Schema`, exact Root timestamp shape, `Summary`) and a canonical Method Entry (`Towards`, `Value`). It does not emit legacy `Draft Local Integrity` or `Next Step` semantics.

Before mutation the rendered candidate is parsed and projected through the exact Root→Task compiled contract. Required body sections and submitted values are checked explicitly. `path` remains blank, `concretePath` remains null, no GitHub source object is inherited, no remote write occurs, and the source Topic is byte/object unchanged.

## Compatibility presentation

The only compatibility mapping is explicit presentation policy:

```text
tiinex.site.topic-to-task.v1
→ legacy definition id topic.continue.task
```

When canonical product capability is qualified, that exact legacy action is suppressed. When canonical preparation/materialization cannot qualify, legacy presentation may remain. The legacy object is never translated into canonical Transition Definition truth.

## Focused A–M matrix + adjacent product sweep

`src/acceptance/postV423CanonicalTransitionProductVerticalSlice.test.mjs` proves:

```text
A canonical bundled definition read-qualified / no legacy schema promotion       PASS
B exact current source Topic binding / unrelated Topic not auto-selected         PASS
C complete form + workspace + Parent recovery → fresh v423 qualified / 1 create  PASS
D missing required Task input → v423 incomplete / 0 mutations                    PASS
E wrong current schema → no canonical product capability / 0 mutations           PASS
F contradictory participant identity → fail closed / 0 mutations                 PASS
G Parent recovery unavailable → no Parent omission / 0 mutations                 PASS
H Parent Trace/Origin exact source Topic / source unchanged                      PASS
I canonical Task body + Root→Task validation / no inherited source / path blank   PASS
J stale or missing schema-cache bytes → preparation fails closed                  PASS
K malformed canonical definition → not canonical-qualified / legacy not promoted  PASS
L local command boundary remoteWrite/sourceMutation/relation=false, path null      PASS
M canonical-capable suppresses exact legacy action; incapable keeps fallback       PASS
```

The mandatory adjacent-state/product sweep additionally crosses source-backed/local/wrong current records, qualified/malformed/absent definitions, complete/missing generation input, active/missing destination, qualified/unavailable Parent recovery, exact/stale/missing cache, and legacy compatibility state. Every failed preflight axis produces zero lifecycle mutation calls.

The sweep caught and corrected one local v424 presentation bug before packaging: the compatibility bridge initially compared the mapped legacy definition id to the rendered `record.transition:*` action id. Final v424 compares explicit `definitionId`, preserving migration policy without changing legacy semantics.

## Final v424 exact product-shape + scoped-definition-identity closure

Architect's final source sweep corrected six local product-owner seams without opening frozen v421–v423 owners.

### Exact executable shape

The product predicate now requires exactly one Input Role and exactly one Output Role. The Input Role is the current/Parent canonical Topic (`artifact`, `tiinex.topic.v1`, `1..1`, `existing-only`); the Output Role is one artifact Task (`tiinex.task.v1`, `1..1`, `target-schema`).

The sole supported lifecycle declaration is active and exact:

```text
Target Binding = sole Task output
Effect = create-new
Logical Continuity = new-subject
Required Materialization Operation = create
Result Binding = absent
Preserve Why = absent | no
Member Mapping = absent | single
```

The sole Parent `set` effect must bind the same Task output to the same current Topic role and may use only absent or `single` Member Mapping. Explicit `custom`, `by-key`, `pairwise`, `broadcast`, `all-to-all`, or `explicit-at-invocation` declarations are not erased by singular cardinality convenience.

### Parent path byte preservation

`recoverCanonicalParentReference()` no longer whitespace-trims the repo-relative source path. It preserves source path bytes and separately percent-encodes permalink path segments. Focused pressure covers internal SPACE, leading SPACE, trailing SPACE, `)`, and non-ASCII; the generated Markdown target contains no raw SPACE/`)` while `parentRecovery.path` remains exact source truth.

### Scoped definition identity

The previous global `Canonical Identifier` conflict rule is removed. Independently qualified definitions with the same non-empty identifier remain distinct registry definitions with distinct execution keys. Command lookup still requires exactly one execution-key match, so first/last-wins remains impossible. `preparation.identityConflicts` remains an empty compatibility projection rather than global same-string authority.

### Exact legacy bridge provenance

Legacy `topic.continue.task` suppression now requires the exact product-capable Site-bundled definition provenance:

```text
sourceMode = bundled-canonical-transition-definition
sourceArtifactPath = src/transitions/definitions/topic-to-task-transition-definition.trace.md
Canonical Identifier = tiinex.site.topic-to-task.v1
```

A workspace definition reusing the same Canonical Identifier is not the migration replacement. When bundled product capability is unavailable, such a workspace definition may remain canonical/product-capable while the legacy fallback remains visible.

### Mandatory final cross-sweep

The focused v424 acceptance now crosses one/two inputs, one/two outputs, exact/contradictory lifecycle continuity, Result Binding absent/present, lifecycle and Parent mapping absent/single/custom, ordinary/internal/leading/trailing-space/`)`/non-ASCII Parent paths, bundled/workspace/same-ID registry identities, and malformed definitions. Every unsupported product shape records zero lifecycle mutation calls.

## Frozen / closed surfaces

No semantic edits are authorized or made to the frozen portable Tooling/read/planner stack. Exact byte proof is finalized after packaging.

Still closed:

```text
remote publication
repository/filesystem path allocation
generic Relation execution
Condition evaluation
producer recursion
File Naming prose/template interpretation
source Topic mutation
generic Transition execution
Q product acceptance (waiting for Architect source PASS)
```

## Source qualification

Current pre-package qualification:

```text
canonical schema-cache blob regression                PASS
focused v424 A–M + adjacent product sweep             PASS
focused v423/v422/v421/v420/v419 chain                PASS
portable aggregate                                    PASS
validate-static / architecture / UI / typecheck       PASS
```

Exact v423→v424 diff counts, source file count, package hashes, full validate boundary, frozen-owner hashes, and full/overlay reconstruction evidence are finalized after the documented delivery candidate is locked.

## Exact frozen v423 → v424 delta

```text
frozen v423 source files   918
v424 source files          932
added                       14
modified                    12
removed                      0
```

Added:

```text
src/acceptance/postV423CanonicalTransitionProductVerticalSlice.test.mjs
src/app/canonicalTransitionLocalCreateCommand.js
src/schemas/workspace/workspace.canonicalTaskDialog.views.jsx
src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md
src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.task.v1.schema.md
src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.transition.definition.v1.schema.md
src/transitions/canonicalTransition.productDefaults.js
src/transitions/canonicalTransition.schemaCache.js
src/transitions/canonicalTransition.schemaCache.test.mjs
src/transitions/definitions/topic-to-task-transition-definition.trace.md
src/transitions/transition.productPreparation.js
src/transitions/transition.productPresentation.browser.js
src/transitions/transition.productPresentation.js
src/transitions/transition.taskMaterializer.js
```

Modified:

```text
README.md
VALIDATION_NOTES.md
index.html
package-lock.json
package.json
src/app/TiinexApp.jsx
src/build.identity.js
src/schemas/workspace/workspace.cards.views.jsx
src/schemas/workspace/workspace.discovery.views.jsx
src/schemas/workspace/workspace.lineage.views.jsx
src/schemas/workspace/workspace.recordDialogs.views.jsx
src/schemas/workspace/workspace.views.jsx
```

## Frozen-owner byte proof

```text
src/tooling/portable/**                                  104 / 104 byte-identical
transition.definitionRegistry.js                         2ffd9f5aaa2a2f2c39dfd56413a758d81c3940073a00776dcc0fb507fb319646
transition.definitionReadProjection.js                   ed3fabf19b14dfa65d43fcb85bd58026e9ff07c6018cda0e33484cb8d1cbd0f1
transition.availabilityPlanner.js                        8118b83d102c9e601cc6f6108a492106555d99322fb3afc9c5bfb090a47213c7
transition.availabilitySemantics.js                      be198d7f3a4d15843106268f371d35baca0de814a28ce09c71b3db1a1df03035
transition.resultSemantics.js                            c6ee823c478e2fc955e94f62b9301e5542a0e88226388ce1d0021ecb25dfe6ac
transition.invocationBindingPacket.js                    54f16a452c7c4a507fc13b8ae223255c75a923cd9270bac1ca5319d05879fbaa
transition.invocationBindingPlanner.js                   5872e454b02b9ad8c5ae4e58d24a08ed88b0c431f9a09272ea7b2954c889c745
transition.outputMaterializationPlanner.js               2217c3ec26a9ecd864ec67fd114b90c60b3f481471fdbc4bde52d788154ad99e
```

Legacy quarantine/presentation semantic files are also byte-identical to frozen v423:

```text
transition.definitions.js
transition.legacyShorthand.js
schemas/core/topic/tiinex.topic.v1.transitions.js
transition.presentation.js
```

## Final validation expectation

The finalized delivery candidate must retain:

```text
checkpoint/package-lock/static/architecture/UI/type      PASS
cache Git blob identity                                  PASS
focused v424 A–M + adjacent product sweep                PASS
v405–v423 frozen regression chain                        PASS
portable aggregate                                       PASS
full validate prefix                                     PASS through v424 + M4-A
first source-clean boundary                              ERR_MODULE_NOT_FOUND: react / useLocalMaterialIntake.js
validate suffix                                           PASS
metrics / storage:scan / portable:smoke / UC001          PASS
runtime:smoke / public:check                             NOT CLAIMED (restore-source environment)
```

## Exact local-placement declaration closure

Architect source pressure identified one remaining v424 capability seam: the browser-local command ignored explicit Destination Binding `Destination Kind` / `Capability Requirement` and adjacent Output Placement declaration fields that its mechanism does not consume.

The correction is confined to `transition.productPreparation.js::supportedLocalPlacement()` plus the existing focused v424 acceptance file.

Supported local product declaration:

```text
Destination Binding count = 1
Required = yes
Destination Kind = absent / empty
Capability Requirement = absent / empty

Output Placement count = 1
Output Binding = sole Task output
Destination Binding = sole destination
Placement Intent = new-materialization
Naming Authority = explicit-binding
Naming Authority Reference = absent / empty
Relative To Binding = absent
Relative Placement Meaning = absent / empty
Explicit Override Allowed = no
```

Any non-empty unsupported destination/placement authority remains preserved by frozen result semantics but makes v424 `productCapable=false`; command pressure proves zero workspace mutations.

Focused required cases cover Destination Kind, Capability Requirement, both together, Relative Placement Meaning without Relative To Binding, Relative To Binding, Naming Authority Reference under explicit naming, and the exact baseline fresh-v422/fresh-v423 success path.

Adjacent declaration sweep covers:

```text
Required: yes / no / unknown
× Destination Kind: absent / arbitrary
× Capability Requirement: absent / arbitrary

Placement Intent: new-materialization / no-materialization / preserve-current
× Naming Authority: explicit-binding / target-schema / external-authority
× Naming Authority Reference: absent / present

Relative To Binding: absent / source-topic
× Relative Placement Meaning: absent / present
× Explicit Override Allowed: no / yes / unknown
```

No generic destination/capability vocabulary or resolver was added. Remote write, repository path allocation, generic placement execution, and Q remain closed.
