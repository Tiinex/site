# Tiinex Site v424 — Canonical Transition Product Vertical Slice

v424 connects the frozen canonical Transition stack to one bounded real product workflow: a source-backed Topic can expose a canonical **Create task** action, collect the canonical Task creation inputs, recompute v422/v423 from current browser state, validate a rendered Root→Task Artifact, and create exactly one browser-local Task only after every preflight gate is qualified.

## Frozen authority chain

```text
Tiinex/docs d69b8ff                         PASS / FROZEN
portable Tooling foundation                 PASS / FROZEN
v421 canonical read integration             PASS / FROZEN
v422 invocation/binding planner             PASS / FROZEN
v423 output generation/materialization      PASS / FROZEN
v424 canonical Topic→Task product slice     IMPLEMENTED / REVIEW CANDIDATE
Q                                            WAITING FOR ARCHITECT SOURCE PASS
```

## v424 product truth

- `src/transitions/definitions/topic-to-task-transition-definition.trace.md` is canonical product data. Legacy `topic.continue.task` remains quarantined compatibility presentation and is never promoted into canonical read truth.
- The product bundles a source-qualified immutable cache of the exact Root, Transition Definition, and Task schema bytes from `Tiinex/docs@d69b8ff55a56b8cb9282b8684db6a938a4435b94`. Their Git blob identities are hard-gated as `7078e483...`, `548dac027...`, and `e4d545ad...`.
- Canonical discovery uses the frozen participant index, Transition Definition registry/read seam, and availability planner. Product capability is derived from the canonical declaration/result shape and supported local mechanism capability, not from `Canonical Identifier` switches.
- The canonical Task form asks for `Summary`, `Objective`, `Done Criteria`, `Scope`, and `Dependencies`. Task tooling-configuration fields remain separate and never become authoring values.
- Final Create recomputes participant identity, canonical definition/read truth, availability, v422 invocation bindings, and v423 output intent from current state and submitted values. A stale UI plan cannot authorize mutation.
- The local mechanism supports exactly one Input Role (the current/Parent Topic) and exactly one 1..1 Task Output Role. Its sole active lifecycle declaration must be `Target Binding = task`, `Effect = create-new`, `Logical Continuity = new-subject`, `Required Materialization Operation = create`, with no `Result Binding`; `Preserve Why: yes` and unsupported lifecycle/Parent mappings are not silently ignored. Absent or `single` mapping is the only supported bounded 1×1 mapping truth.
- Parent recovery requires source-backed GitHub metadata with repository, commit-pinned 40-hex ref, and source Artifact path. Repo-relative path bytes are preserved as source truth; Markdown-link permalink projection separately RFC3986-encodes path segments, including internal/leading/trailing SPACE, `)`, and non-ASCII. If a safe recovery reference is unavailable, local create capability is unavailable; Parent is never dropped to force execution.
- The generated Task uses canonical Root envelope shape and exact Task body sections. It is re-parsed and validated against the exact compiled Root→Task contract before `addWorkspaceRecord` may be called.
- The created record has `path = ""`, browser-local source state, no inherited GitHub source object, and no repository path allocation. The source Topic remains unchanged.
- `Canonical Identifier` is local semantic truth inside each defining Transition Definition, not global registry identity. Distinct registry definitions may reuse the same string and remain distinct through registry-specific execution keys. Presentation precedence is an explicit migration bridge only for the exact Site-bundled `src/transitions/definitions/topic-to-task-transition-definition.trace.md` definition when it is product-capable; unrelated workspace definitions reusing the string never suppress legacy `topic.continue.task` by same-string identity.

## Final v424 source closure

Architect's final product-shape/identity pressure is closed in the same checkpoint identity:

```text
exact lifecycle shape                         enforced locally
exact executable Input Role count            1
exact executable Output Role count           1
lifecycle Result Binding                     absent
lifecycle/Parent Member Mapping              absent | single only
Parent repo-relative path bytes              preserved before URL encoding
Canonical Identifier                         local semantic key, never global identity
command definition lookup                    exact registry execution key, exactly one match
legacy compatibility suppression             exact bundled product provenance only
```

The final cross-sweep combines arity, lifecycle continuity/result binding/mappings, Parent mapping, unusual GitHub paths, and same-ID independent definitions. Unsupported shapes remain visible canonical truth but never become `productCapable`; every such command pressure yields zero lifecycle mutations.

## Product boundary

One successful v424 command may perform one browser-local Task create. It does **not** perform remote publication, repository/path allocation, generic Relation execution, Condition evaluation, producer recursion, File Naming prose interpretation, source Topic mutation, or generic Transition execution.

The focused A–M product matrix plus the mandatory adjacent-state/product sweep proves zero workspace mutations for malformed/missing canonical authority, wrong current schema, ambiguous participant identity, missing Task input, missing destination, unrecoverable Parent, stale/missing schema cache, and malformed/absent canonical definition. The sole qualified success path creates exactly one local Task after fresh v423 qualification.

## Environment boundary

This replacement-ready source checkpoint still excludes installed React/Vite dependencies and built public output. Browser/runtime/public PASS is not claimed here. Full source validation is expected to pass all v424 pre-React gates and then reach the same historical missing-React restore-source boundary until dependencies are present.

## Supported local start

After installing dependencies:

```bash
npm install
npm run dev
```

---

# Frozen v423 baseline — Canonical Output Generation/Materialization Intent Planner Foundation

v423 adds one pure read-only planner above frozen v422 invocation/binding truth. It describes known output generation and materialization **intent** without creating Artifacts, rendering Markdown, allocating filesystem paths, mutating Parent/relations, or executing Transitions.

## Frozen authority chain

```text
Tiinex/docs d69b8ff                         PASS / FROZEN
portable Tooling foundation                 PASS / FROZEN
v421 canonical read integration             PASS / FROZEN
v422 invocation/binding planner             PASS / FROZEN
v423 output generation/materialization      IMPLEMENTED / REVIEW CANDIDATE
```

The new owner is `src/transitions/transition.outputMaterializationPlanner.js`. It recomputes the frozen v422 invocation plan and result semantics internally from the canonical definition, participant context, and caller binding packet; callers cannot inject precomputed semantic truth.

## v423 truth boundaries

- v422 `blocked`, `invalid`, `unresolved`, and `incomplete` qualifications are monotonic and never upgraded downstream.
- Output count is exact only when numeric Minimum Count equals numeric Maximum Count. Ranges, `unbounded`, and `unknown` remain unresolved; no output member IDs are invented.
- `Generation Binding: target-schema` is resolved only by compiling caller-supplied raw target-schema contract material with the frozen portable compiler and verifying exact leaf schema identity plus complete lineage.
- Compiled Artifact Creation Contract truth exposes required/optional creation inputs, required sections, tooling-configuration fields, and creation groups separately.
- Generation input presence uses own `value` + `value !== undefined`; `0`, `false`, `null`, and `""` remain concrete opaque values. Duplicate exact `(Output Role, input name)` entries are invalid. Tooling configuration fields never satisfy Artifact authoring inputs.
- Explicit Markdown Generation Binding references are preserved but unresolved because v423 opens no generic reference resolver.
- Non-artifact outputs never become Tiinex Artifact drafts/materialization work merely because labels or schema-like text look artifact-shaped.
- Lifecycle `Required Materialization Operation` is preserved as intent only. Absence never defaults to `create`; multiple simultaneously operation-bearing effects remain unresolved rather than first/last-wins.
- `new-materialization` requires its declared Destination Binding to carry a concrete v422 destination value even when that destination was optional for invocation completeness.
- `no-materialization` creates no physical placement work. `preserve-current` remains unresolved without exact subject/current-placement authority.
- `Naming Authority: explicit-binding` may preserve the qualified v422 naming component, but `target-schema`, `external-authority`, and `unknown` remain unresolved without machine resolvers. File Naming prose/Allowed Shapes are never interpreted as code.
- Relative placement is preserved as declaration truth and remains unresolved without a generic relative-placement resolver.
- Frozen v422 Member Mapping truth is consumed, not reimplemented. Deterministic mappings may remain deferred; `custom`/`unknown` stay unresolved upstream; no positional associations or future output IDs are fabricated.

Every plan remains:

```text
readOnly = true
mutation = false
networkFetch = false
artifactCreated = false
draftRendered = false
pathResolution = false
materialization = false
parentMutation = false
relationMaterialization = false
execution = false
executable = false
```

## Internal adjacent-state sweep

Before packaging, v423 runs a bounded authority-monotonicity sweep across upstream qualification, output target kind, generation authority, cardinality, placement/destination, naming authority, and mapping state. The sweep found one local v423 defect before handoff: duplicate unclaimed generation-input entries were not initially rejected. That seam is corrected in the same checkpoint; duplicate exact `(Output Role, input name)` entries are now invalid regardless of whether the input is declared or extra.

## Consolidated Architect correction batch

The Architect source gate found three local v423 seams after the initial package. They are corrected in the same `0.2.242-v423` replacement checkpoint without opening frozen owners:

- exact `0..0` output cardinality now preserves generation/lifecycle/placement/mapping declarations while marking concrete downstream work `not-required`; global caller-packet audit still applies;
- all active relevant Lifecycle Effects remain visible in `lifecycle.effects[]` even when no `Required Materialization Operation` is declared; requested operation is derived separately from the operation-bearing subset;
- a target-schema authority entry with `materials: []`, empty strings, or no non-empty readable material is `unresolved / target-schema-authority-missing`, not a false schema mismatch.

The correction sweep re-pressures output count `0 / 1 / range` against generation authority `missing / empty / correct / wrong / explicit reference / absent`, lifecycle operation `absent / one / multiple`, placement/naming states, and generation packet `none / concrete / undefined / duplicate / extra`. That Dev-side sweep was clean at packaging time; the subsequent Architect source-authority sweep found the additional bounded provenance/authority seams closed below.

## Post-correction provenance + authority closure batch

The Architect source gate then identified four local v423 seams. They are corrected together in the same `0.2.242-v423` replacement checkpoint:

- non-artifact explicit Markdown `Generation Binding` now preserves the exact declared reference as `explicit-reference` and remains `unresolved` while no generic reference resolver exists; non-artifact output still never becomes an Artifact draft;
- every placement plan preserves frozen `Explicit Override Allowed` truth without executing or inferring override behavior;
- deferred mapping dependencies preserve exact `Mapping Key` and `Mapping Meaning` provenance from the matching frozen result-semantic declaration while remaining non-positional;
- duplicate target-schema authority entries are audited structurally for the exact declared `target-schema` Output Role even when output cardinality is exactly zero, so zero concrete members cannot hide malformed packet multiplicity.

The final closure sweep crosses artifact/non-artifact Target Kind, absent/target-schema/explicit-reference generation authority, zero/one/range output counts, new/no-materialization placement, override yes/no, and single/pairwise/by-key mapping. That sweep was clean for its targeted authority family; Architect's later placement-branch audit identified the final naming-component provenance seam closed below.

## Naming-component provenance closure

Placement qualification and naming-component evidence are now projected as independent axes. `planPlacement()` evaluates frozen v422 naming truth before any placement-intent early return. `no-materialization`, `preserve-current`, unsupported/unknown placement intent, and exact-zero output may mark concrete naming work `not-required`, but they preserve the exact naming authority plus any already-qualified explicit value or declared external reference. `new-materialization` evaluates naming normally even when its destination component is unresolved, so a resolved explicit naming component cannot upgrade the unresolved destination and an unresolved target/external naming resolver cannot erase its provenance. `concretePath` remains `null` in every branch.

The final naming branch sweep crosses `no-materialization / preserve-current / new-materialization`, `explicit-binding / target-schema / external-authority`, resolved/unresolved destination where applicable, and output count `0 / 1`. No further local projection loss or missing authority was observed.

The output-materialization owner remains below the existing source guard (`23,965` bytes); no guard was raised and no second v423 semantic owner was introduced.

## Target-schema source-material trust boundary

`targetSchemaAuthorities.materials` is still an internal authority-material seam expected to receive source-qualified schema material from a future canonical resolver. v423 compiles that material with frozen portable Tooling and verifies leaf schema identity plus lineage, but does **not** claim that the portable semantic compiler is a complete validator for arbitrary untrusted schema Markdown. Before arbitrary product/runtime input is allowed through this seam, schema-source qualification must be reopened at the appropriate generic owner rather than implemented as a Site-local validator.

## Environment boundary

This source checkpoint intentionally excludes installed React/Vite dependencies and built public output. Browser/runtime/public PASS is not claimed. Full source validation is expected to reach the same historical missing-React restore-source boundary after all v423 and pre-React gates pass.

## Supported local start

After installing dependencies:

```bash
npm install
npm run dev
```

## Exact browser-local destination / placement declaration closure

The first canonical browser-local Topic→Task product command now advertises `productCapable=true` only for the exact destination/placement declaration shape it actually understands.

The sole Destination Binding must be:

```text
Required = yes
Destination Kind = absent / empty
Capability Requirement = absent / empty
```

The sole Output Placement must be:

```text
Output Binding = sole Task output
Destination Binding = sole required destination
Placement Intent = new-materialization
Naming Authority = explicit-binding
Explicit Override Allowed = no
Relative To Binding = absent
Relative Placement Meaning = absent / empty
Naming Authority Reference = absent / empty
```

Readable `Meaning` / `Notes` remain provenance only. Non-empty destination kind/capability, relative-placement declarations, naming references, alternate naming authorities/intents, or non-exact requiredness remain readable canonical truth but make this bounded local product capability unavailable. No destination vocabulary, resolver, remote-write behavior, path allocation, or placement evaluator is introduced.

The focused v424 regression now includes a compact adjacent declaration sweep across Required × Destination Kind × Capability Requirement, Placement Intent × Naming Authority × Naming Authority Reference, and Relative To × Relative Meaning × Explicit Override Allowed. Unsupported combinations produce zero lifecycle mutations; the exact baseline still recomputes fresh v422/v423 and creates exactly one local Task.
