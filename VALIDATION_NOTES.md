# Validation Notes v470 — Schema Reading-Contract Materialization Identity + Source Coalescing Authority Correction

Checkpoint: `v470`  
Version: `0.2.289-v470`  
Runtime: `react-v470-schema-reading-contract-materialization-identity-source-coalescing-authority-correction`

## Foundation validation/checkpoint workflow

- `npm run validate:static:diagnostic` executes the unchanged `tools/validate-static.mjs` gate, preserves its exact raw findings, and classifies them against `tools/static-validation.baseline.json`. Exact inherited findings may remain non-blocking for diagnostic/integration continuation only; new findings, newly oversized files, or growth of an inherited oversized file above its recorded byte baseline block immediately.
- `npm run validate:integration` uses that regression-aware static diagnostic in place of the strict static step so later integration checks can be exercised without erasing inherited debt. When inherited debt remains and no new static regression appears, the profile status is `diagnostic-qualified`, not `passed` or release-qualified.
- `npm run validate:closure` continues to execute the original strict `node tools/validate-static.mjs` gate. Existing inherited debt therefore remains a real closure blocker until it is actually resolved; the diagnostic baseline cannot convert it into closure success.
- Current inherited static debt is two rule families: the absent `docs/architecture/uc001-workspace-lifecycle.md` requirement (also independently required by `tools/check-public-build.mjs`) and twelve source files already above the historical `v119` 24,000-byte guard. The size rule remains a current regression ceiling because `src/acceptance/m3PersistenceOwnerReadabilityExtraction.test.mjs` explicitly refers to the unchanged source-size guard; the historical label is not treated as evidence of obsolescence.
- After substantive focused qualification, manufacture or refresh a canonical full-source Business + Docs + Site role return before starting broad/long closure. That return is a recoverability checkpoint, not acceptance, and may truthfully preserve unresolved blockers. This reduces Tiinex-owned repeated-work exposure without claiming control over host safeguards.

## v470 bounded correction

- Open Schema materialization no longer uses first-hit id/path/representation collision as reading-contract authority. Collision discovery is bounded; each concrete collision candidate is independently qualified from its own Markdown bytes and, for linked declarations, its own exact representation evidence before reuse.
- Exactly one reusable concrete collision may be reused; multiple reusable collisions fail closed as materialization ambiguity. Unqualified bundled/local id/path occupants fail closed rather than being overwritten or annotated as qualified. Representation-backed source records may coexist under their stronger exact representation-backed record identity when path alone collides.
- Exact GitHub source coalescing qualifies repo, ref, and configured root assertions as explicit 0/1/>1 dimensions. Contradictory aliases are non-coalescing and remain untouched; multiple exact coherent source candidates fail closed rather than becoming first-hit authority.
- v465-v469 semantic byte qualification, explicit declaration/recovery precedence, effective/final retrieval target truth, bounded Open Schema copying, provider neutrality, strict GitHub target authority, and no-remote-executable-code guards remain preserved.
- `src/tooling/portable/**`, canonical schema bytes, and generic origin parsing remain frozen for this correction.
- Browser/public runtime remains unclaimed unless separately exercised.

## v469 predecessor

# Validation Notes v469 — Effective Schema Retrieval Identity + Representation Evidence + Bounded Open Correction

Checkpoint: `v469`  
Version: `0.2.288-v469`  
Runtime: `react-v469-effective-schema-retrieval-identity-representation-evidence-bounded-open-correction`

## v469 bounded correction

- Linked schema recovery preserves the raw declared locator separately from the effective HTTP request target and final retrieved target. Fetch uses redirect-fail-closed semantics; when response target evidence is available, a redirect or final-target mismatch cannot be labeled as the declared representation provenance.
- Generic HTTP(S) representation identity is derived from the standard effective request URL. Dot-segment, host-case, and default-port normalization therefore cannot create a second pre-normalized "exact retrieved representation" identity, while the declaration lexeme remains explicit evidence.
- Loaded GitHub reading-contract representation qualification cross-checks repo/ref/path tuple authority against concrete sourceTarget/permalink URL evidence. Canonical browse/raw forms for one tuple coexist; contradictory target evidence is ambiguous/unavailable. Same-dimension repo/ref aliases use exact 0/1/>1 qualification instead of first-match selection.
- Stored `schemaNavigation.representationIdentity` is derived/cache metadata. Exact selected records are returned with representation metadata recomputed from concrete source evidence rather than preserving contradictory stale cache values.
- Open Schema focus and materialization use targeted immutable state/workspace/records/view copies. They do not `structuredClone` the full app state, preserving unrelated record object/material identity and avoiding unrelated deep reads after candidate selection.
- v465-v468 semantic byte qualification, declaration multiplicity, provider neutrality, hostile URL/Unicode totality, A/B representation coexistence, generic origin parsing, frozen Tooling/canonical schema bytes, and no-remote-executable-code guards remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v468 predecessor

# Validation Notes v468 — Exact Declared Schema Representation + Recovery Precedence Correction

Checkpoint: `v468`  
Version: `0.2.287-v468`  
Runtime: `react-v468-exact-declared-schema-representation-recovery-precedence-correction`

## v468 bounded correction

- Concrete linked `Current Schema` now owns both logical schema identity and exact representation/source selection for that Open Schema invocation. The existing recovery-target owner derives one representation identity; navigation does not duplicate provider/path parsing.
- Loaded reading-contract candidates for a linked declaration are narrowed by that exact representation identity before semantic byte qualification. A same-schema contract from source A cannot satisfy declared target B; A+B is disambiguated to B, while multiple exact B representations remain ambiguous.
- A linked declaration is recovery-authoritative. Fetch failure, unqualified returned bytes, malformed target authority, or other target failure remains `schema.unavailable` with the exact recovery evidence and never falls through to bundled/catalog material. Plain schema-id declarations retain logical loaded/bundled reuse.
- Source-backed schema materialization now preserves qualified representation identity in record identity and schema-navigation metadata. Same logical schema + different qualified target can coexist without merge/provenance overwrite; selected `sourceTarget` metadata corresponds to the representation actually selected or recovered.
- v465-v467 semantic qualification, provider neutrality, hostile Unicode/URL totality, candidate boundedness, concrete declaration identity/multiplicity, frozen Tooling/canonical schema bytes, and no-remote-executable-code guards remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v467 predecessor

# Validation Notes v467 — Schema Reading-Contract Candidate Role + Declaration Authority Correction

Checkpoint: `v467`  
Version: `0.2.286-v467`  
Runtime: `react-v467-schema-reading-contract-candidate-role-declaration-authority-correction`

## v467 bounded correction

- Loaded reading-contract discovery no longer treats ordinary `record.schemaId` / `record.currentSchemaId` equality as sufficient candidacy. Exact schema-navigation reading-contract markers, exact schema-definition paths, or explicit schema-definition/reading-contract role evidence narrow candidates before any Markdown deep read.
- Candidate deep qualification is isolated per record. A malformed or throwing candidate fails closed locally and cannot abort reuse of a separate exact qualified reading contract; multiple exact qualified candidates remain ambiguous.
- Open Schema derives concrete Current Schema authority from a bounded local 0/1/2+ declaration collector. Duplicate-identical and duplicate-conflicting declarations fail closed before retrieval or bundled fallback.
- An explicit requested schema id must equal the single concrete declaration exactly. Without an explicit request, the single concrete declaration owns command schema identity over stale cached record metadata. Plain exact schema-id declarations can still use an installed/bundled reading contract; remote recovery requires an exact declared target.
- Concrete non-shell material with no Current Schema declaration cannot invent schema identity or target from metadata/path hints. Route/material-unavailable shells retain bounded metadata behavior without invented remote declaration authority.
- v465/v466 exact semantic qualification, retrieval totality, provider-neutral mirrors, traversal/Unicode/lexical guards, frozen Tooling/canonical schema bytes, and the no-remote-executable-code guard remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v466 predecessor

# Validation Notes v466 — Schema Recovery Authority + Bounded Discovery Correction

Checkpoint: `v466`  
Version: `0.2.285-v466`  
Runtime: `react-v466-schema-recovery-authority-bounded-discovery-correction`

## v466 bounded correction

- Final `openSchemaForRecordCommand()` semantic materialization always re-runs reading-contract qualification against the exact concrete Markdown bytes and requested schema id. Precomputed `semanticQualification` remains evidence only and cannot independently authorize a schema record.
- GitHub relative schema recovery now uses a total lexical resolver. Unpaired UTF-16 surrogates, invalid repository/ref/path identities, traversal above repository root, query/fragment syntax, and already percent-encoded relative references fail closed without throwing or silent retargeting.
- Canonical `https://github.com/.../blob/...` and `https://raw.githubusercontent.com/...` declarations retain GitHub source behavior. Noncanonical GitHub-ish HTTP(S) declarations are not promoted to GitHub authority; they remain explicit provider-neutral HTTP retrieval targets when otherwise valid.
- Loaded-schema lookup first narrows records using non-authoritative `schemaId`, `currentSchemaId`, `schemaNavigation.schemaId`, or filename/path hints. Only narrowed candidates have Markdown deep-read and exact reading-contract qualification; candidate evidence alone never establishes semantic identity.
- Generic origin/reference parsing, Tooling portable semantics, canonical schema Markdown/bindings, and remote-code guards remain unchanged. No provider registry, Schema Builder, eval, downloaded executable code, or dynamic remote import is introduced.
- Browser/public runtime remains unclaimed unless separately exercised.

## v465 predecessor

# Validation Notes v465 — Qualified Schema Recovery + Source Input Totality Correction

Checkpoint: `v465`  
Version: `0.2.284-v465`  
Runtime: `react-v465-qualified-schema-recovery-source-input-totality-correction`

## v465 bounded correction

- Explicit Current Schema targets authorize bounded retrieval only. Retrieved or already-loaded bytes become a semantic schema reading contract only when the current runtime can prove exact installed schema-source checksum identity, exact requested `Current Schema`, and the existing exact supported Root/child artifact-validation state.
- Provider/location truth remains separate from semantic qualification. Exact supported schema bytes can qualify from an explicit non-GitHub HTTP(S) mirror; arbitrary README text, unknown custom schema material, wrong-schema bytes, and filename-only `<schemaId>.schema.md` candidates fail closed.
- Loaded schema selection no longer uses path suffix as semantic identity. Exactly one qualified loaded contract is reused; multiple qualified candidates are reported as ambiguous rather than first-match selected.
- Exact GitHub schema-source target/provider qualification is total over hostile declarative source paths. Unpaired UTF-16 surrogates return unavailable with a truthful finding; valid Unicode scalar values including non-BMP filenames remain canonical and round-trip qualified without lossy replacement.
- No remote executable Schema/Companion/Transition path, dynamic provider registry, Schema Builder implementation, `eval`, downloaded JavaScript, or remote dynamic import is introduced. v464 exact lexical/provider/dot-segment target authority remains preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v464 predecessor

# Validation Notes v464 — Canonical Schema Target Representation + Repository Lexical Authority Correction

Checkpoint: `v464`  
Version: `0.2.283-v464`  
Runtime: `react-v464-canonical-schema-target-representation-repository-lexical-authority-correction`

## v464 bounded correction

- Canonical GitHub schema-source path segments now use deterministic Markdown-safe percent encoding for representation-sensitive characters. Qualified source paths containing raw `)` or balanced parentheses render to exact `%29` / `%28` targets and round-trip through the production schema-reference parser/qualifier without first-match or decode/re-encode equivalence.
- Exact target comparison remains lexical. Raw decoded aliases are not accepted as equivalent to the canonical generated target, and current built-in schema blob/raw URLs remain byte-for-byte unchanged because their paths require no additional escaping.
- Exact GitHub source tuples reject repository owner/name components equal to `.` or `..`. Those identities remain unavailable through both canonical target derivation and explicit binding-based GitHub provider qualification, so ordinary URL dot-segment normalization cannot redefine repository identity.
- Generic origin/reference parsing, v463 provider qualification, v461 immutable execution-input snapshots, frozen Tooling portable semantics, canonical schema Markdown/bindings, and the no-remote-executable-code guard remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v463 predecessor

# Validation Notes v463 — Schema Reference Lexical Fidelity + Source Provider Authority Correction

Checkpoint: `v463`  
Version: `0.2.282-v463`  
Runtime: `react-v463-schema-reference-lexical-fidelity-source-provider-authority-correction`

## v463 bounded correction

- Production schema-reference authority now preserves exact raw markdown-link label and target lexemes. Whitespace inside the label or destination cannot be trimmed into exact authority, including through the real resealed ordinary-Create result-validation path.
- Bundled schema-source qualification now distinguishes source tuple truth from provider truth. A repository + immutable-looking revision + exact path does not imply GitHub; GitHub provider authority is qualified only from explicit exact canonical GitHub binding evidence owned by the schema source.
- `schema.githubSourceTarget` requires `provider: github` before deriving canonical blob/raw targets. Synthetic non-GitHub/custom source tuples remain Plain Schema Id even when their revision happens to be 40 hexadecimal characters.
- Generic origin/reference parsing, v462 lexical URL hardening, frozen Tooling portable semantics, canonical schema Markdown/bindings, and the no-remote-executable-code guard remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v462 predecessor

# Validation Notes v462 — Exact Schema Reference Lexical / Source-Target Authority Correction

Checkpoint: `v462`  
Version: `0.2.282-v463`  
Runtime: `react-v463-schema-reference-lexical-fidelity-source-provider-authority-correction`

## v462 bounded correction

- Exact schema-reference GitHub targets are now mechanically derived only from an already-qualified schema-source repository + exact 40-character commit + exact source path.
- The schema-reference authority no longer promotes the broader generic origin/reference parser into exact-target authority. Generic origin parsing remains unchanged for its existing evidence/recovery callers.
- Only canonical HTTPS `github.com/<owner>/<repo>/blob/<commit>/<path>` and `raw.githubusercontent.com/<owner>/<repo>/<commit>/<path>` forms qualify. Unsafe/non-canonical aliases involving alternate schemes/hosts, credentials, ports, mutable refs, path normalization tricks, encoded separators, duplicate slashes, query or fragment text never become preferred exact authority.
- Viewer-local/custom/non-GitHub schema sources without exact supported target authority continue to render Plain Schema Id.
- v461 immutable execution-input snapshots, v460 schema-id/reference separation, frozen Tooling portable semantics, canonical schema bytes, and the no-remote-executable-code guard remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v461 predecessor

# Validation Notes v461 — Immutable Execution Input + Schema Reference Source Authority Correction

Checkpoint: `v461`  
Version: `0.2.280-v461`  
Runtime: `react-v461-immutable-execution-input-schema-reference-source-authority-correction`

## v461 bounded correction

- Ordinary root Create now snapshots only exact declared creation inputs plus execution-owned Created At before calling the implementation. Authority-bearing values are copied to immutable scalar projections; caller-owned `values`, `inputs`, and `Date` objects are never frozen or mutated in place.
- Representative preflight and concrete execution share the same snapshot owner, while post-execution qualification reads a separate immutable authority snapshot rather than the implementation-facing object. An implementation cannot rewrite the value that later becomes expected truth.
- Invalid/unrepresentable Created At fails before implementation and remains classified explicitly under execution-metadata fidelity.
- Schema-reference targets are cross-qualified against the already-qualified schema-source repository, exact 40-character commit, and exact source path using the existing GitHub-file origin parser. Raw `permalink`, `rawUrl`, or `exactReferenceTarget` fields cannot self-certify an unrelated URL.
- Same-commit wrong-path/wrong-repository and mutable branch URLs do not become exact schema-reference targets; non-GitHub/viewer-local schemas without exact target authority remain Plain Schema Id.
- v460 schema-id/reference separation, root multiplicity, exact caller fidelity, c14n-v2 integrity, no Status/Why generic Root extension, no Parent on standalone Create, and the no-remote-code guard remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v460 predecessor

# Validation Notes v460 — Schema Reference + Root Metadata Authority Correction

Checkpoint: `v460`  
Version: `0.2.279-v460`  
Runtime: `react-v460-schema-reference-root-metadata-authority-correction`

## v460 bounded correction

- Ordinary root Create now qualifies schema identifier truth separately from schema-reference target truth. Plain exact schema ids remain valid where Root permits them; Markdown link targets must match exact immutable binding authority or fail closed.
- The shared schema-reference renderer no longer synthesizes `<schemaId>.schema.md`. Exact immutable binding targets may be preserved as links; otherwise the truthful representation is a plain schema id.
- Created At is bound exactly once at the ordinary-Create execution boundary when omitted, and the same bound instant is consumed by the renderer and concrete execution qualifier.
- Generic ordinary Root Create no longer serializes undeclared `Current -> Status` or target-schema `Current -> Why`; Root-owned Current Schema / Created At / optional Summary remain the generic envelope surface.
- v459 multiplicity, exact caller input fidelity, complete Required Shape coverage, portable-structural validation, c14n-v2 self-integrity, lazy schema-source ownership, and no-remote-code guard remain preserved.
- Browser/public runtime remains unclaimed unless separately exercised.

## v459 predecessor

# Validation Notes v459 — Root Envelope Multiplicity + Execution Metadata Fidelity Correction

Checkpoint: `v459`  
Version: `0.2.278-v459`  
Runtime: `react-v459-root-envelope-multiplicity-execution-metadata-fidelity-correction`

## v459 bounded correction

- Ordinary root Create now preserves raw `Envelope Schema` multiplicity in the shared schema-opaque creation representation owner. Exactly one occurrence is required; duplicate-identical and duplicate-conflicting values fail closed in direct result validation and representative readiness.
- Concrete ordinary Create now qualifies execution-owned `Created At` against the exact invocation instant after canonical UTC conversion to Root `YYYY-MM-DD hh:mm:ss` seconds precision. A shape-valid timestamp that replays representative-preflight metadata fails concrete execution.
- Caller-content fidelity, execution-metadata fidelity, representation multiplicity, complete Required Shape coverage, portable Root+target structural validation, and c14n-v2 integrity remain separate observable gates.
- Contextual continuation behavior, v458 Required Shape ownership, frozen Tooling portable semantics, and canonical schema/binding bytes remain unchanged. Browser/public runtime remains unclaimed unless separately exercised.

## v458 predecessor

# Validation Notes v458 — Creation Representation Completeness + Multiplicity Fail-Closed Correction

Checkpoint: `v458`  
Version: `0.2.277-v458`  
Runtime: `react-v458-creation-representation-completeness-multiplicity-correction`

## v458 bounded correction

- Ordinary root Create now inspects raw representation occurrences before semantic projection, preserving 0/1/2+ ambiguity for Current metadata, body title, bound required sections, and the active c14n-v2 self-integrity entry.
- Correctly resealed duplicate-identical or duplicate-conflicting required representation targets fail closed; schema-owned Topic/Task local-materialization qualifiers apply the same multiplicity discipline to their exact required sections.
- Runtime schema projections preserve each declared Artifact Creation `Required Shape` item with a stable source-local id and a build-time classification into supported generic primitives versus residual authority.
- Generic Create readiness requires complete declared Required Shape coverage. Topic's orienting sentence is owned and qualified by a Topic schema companion; Task remains fully generic-projectable. Residual future shape without a schema-owned qualifier blocks readiness.
- Ordinary root Create renders Root `Created At` as canonical `YYYY-MM-DD hh:mm:ss`; contextual continuation timestamp representation is unchanged.
- Portable Root+target validation remains visible as `portable-structural` coverage and is no longer labelled an exact semantic result; multiplicity, Required Shape coverage, caller input fidelity, portable structural validation, and integrity remain separate gates.
- Frozen Tooling portable semantics and canonical schema/binding bytes remain unchanged; browser/public runtime remains unclaimed unless separately exercised.

## v457 predecessor

### Validation Notes v457 — Per-Execution Creation Fidelity + Exact Input Binding Correction

Checkpoint: `v457`  
Version: `0.2.276-v457`  
Runtime: `react-v457-per-execution-creation-fidelity-exact-input-binding-correction`

## v457 bounded correction

- Cached ordinary-Create execution qualification is explicitly representative/preflight evidence, not universal proof of later caller-value fidelity.
- Every concrete `create-artifact` execution now proves exact required input presence, exact source-derived input→representation binding, concrete caller-value preservation, exact Root + target validation, and c14n-v2 integrity before rendered bytes are accepted.
- Generic creation input lookup no longer normalizes case/punctuation or selects the first normalized alias. Required input identity is exact unless future semantic authority explicitly declares otherwise.
- Build-time creation input→section projection also uses exact declared labels; punctuation/case coincidence does not invent a binding.
- Representative implementation qualification, concrete invocation fidelity, exact Root + target qualification, and integrity remain separately inspectable.
- v454 lazy schema-source discipline and v456 compact exact validation projection remain intact; no whole-registry execution is added to hot interaction paths.
- Browser/public runtime remains unclaimed unless separately exercised.

## v456 predecessor

# Validation Notes v456 — Exact Creation Result Qualification Correction

Checkpoint: `v456`  
Version: `0.2.275-v456`  
Runtime: `react-v456-exact-creation-result-qualification-correction`

## v456 bounded correction

- Ordinary `create-artifact` readiness now requires representative execution to pass the existing portable exact Root + target contract validator through a mechanically generated compact runtime validation projection; `module.validate()` is no longer treated as full-contract proof.
- Root ordinary Create uses the existing `sha256-base64url-c14n-v2` self sealer and must verify before readiness/result qualification; contextual continuation retains its predecessor draft-integrity behavior and is not migrated in this tranche.
- Generic Summary/body-title representation no longer trims, collapses whitespace, or truncates to 96/280 characters. Exactly representable one-line values are preserved; outer-whitespace or multiline values in that one-line binding fail closed.
- Multiline section-body values remain representation-preserved and final ordinary Create bytes are revalidated before `createArtifactDraftMarkdown(...)` returns them.
- v454 lazy full-schema Markdown ownership remains intact; runtime validation uses compact mechanically regenerated projections rather than eager full Markdown or a browser runtime schema compiler.
- Portable consumers are behavior-checked against the same creation readiness boundary; portable source byte identity alone is not used as proof.
- Browser/public runtime remains unclaimed unless separately exercised.

## v455 predecessor

# Validation Notes v455 — Creation Input Fidelity + Root Continuity Correction

Checkpoint: `v455`  
Version: `0.2.274-v455`  
Runtime: `react-v455-creation-input-fidelity-root-continuity-correction`

## v455 bounded correction

- Ordinary `create-artifact` readiness now proves every required non-tooling authoring input has a compiler-derived representation binding and survives the advertised execution owner with exact target validation.
- Generic creation renderer no longer owns semantic defaults through Topic/Task section-name recognition. Section body values come only from exact generated input bindings.
- Standalone/root `create-artifact` emits no Continuity Parent and refuses supplied Parent state; contextual continuation requires/preserves explicit parent identity.
- Blocked/unknown exact creation returns no materialization bytes from `createArtifactDraftMarkdown(...)`; there is no generic fail-open fallback.
- v454 lazy schema-source/runtime-projection ownership is preserved; runtime projections now also preserve the mechanically derived creation input-binding relation.
- Browser/public runtime remains unclaimed unless separately exercised.

## v454 predecessor

### v454 bounded correction

- Ordinary `create-artifact` readiness now includes deterministic execution qualification against the installed target schema validator; a callable alone is not sufficient.
- Topic and Task remain ordinary-Create ready; Evidence fails closed until an execution owner can satisfy its required Evidence shape; Relation remains without ordinary Create authority.
- Installed schema source companions use compact mechanically generated runtime projections bound to exact schema checksums. Full readable `.schema.md` assets are loaded lazily and checksum-qualified on use.
- `tools/check-schema-runtime-projections.mjs` regenerates/byte-compares projections against the authoritative sibling Markdown.
- Browser/public runtime remains unclaimed unless separately exercised.

## v453 bounded correction

- Ordinary Create semantic authority is derived from exact module-owned bundled schema Markdown after browser-safe SHA-256 qualification and the existing portable schema-contract compiler.
- A renderer id/status string is not executable proof; creation implementation readiness requires a callable owner.
- Installed schema modules expose one bundled readable-source capability; schema navigation/catalog are derived from that source instead of separate concrete-schema lists.
- Relation is therefore available through bundled schema navigation without a Relation-specific generic branch.
- Generic companion read presentation consumes module-owned `redundantIdentitySections` metadata instead of Topic/Evidence schema-id dispatch.
- Exact schema-source compilation is lazy and memoized per representation, not paid during ordinary registry import/render.
- Static schema module installation remains explicitly deferred; Tooling and canonical schema Markdown bytes are not mutated.
- Browser/public runtime is not claimed by source/static qualification.

## v452 predecessor

# Validation Notes v452 — Schema Companion / Capability Ownership Correction

Checkpoint: `v452`  
Version: `0.2.271-v452`  
Runtime: `react-v452-schema-companion-ownership-correction`

## v452 bounded correction

- Topic/Task/Relation/Interpretation local representation adapters are schema-companion owned; the generic materializer facade resolves them opaquely through the schema module.
- Ordinary Create requires both exact Artifact Creation Contract authority identity and installed implementation capability; Relation remains unavailable for ordinary Create.
- Schema identity no longer falls back to `record.kind`; active sibling read/audit/lineage/package paths use qualified schema identity.
- Companion `.transitions` metadata no longer makes canonical Continue/Reference semantically available.
- Transition/generation invocation remains the owner of continuity, concrete participants, Reference predicate/bindings, and Interpretation Source Target value.
- Tooling portable and canonical schema Markdown/JSON snapshots are not semantically modified.
- Browser/public runtime is not claimed.

## v451 predecessor

# Validation Notes v451 — v450 Human Product Architecture Correction

Checkpoint: `v451`  
Version: `0.2.270-v451`  
Runtime: `react-v451-v450-human-product-architecture-correction`

## v451 bounded correction

- Workspace selection core accepts opaque caller-owned role tokens and exact caller-owned candidate keys; no role whitelist, role label switchboard, or candidate-kind identity synthesis remains in core.
- Generic selection controller owns only session lifecycle; Reference and Placement qualification remain in separate feature adapters and fixed Parent projection remains in the authoring caller.
- Selection snapshots/restores ambient workspace presentation context; cross-workspace traversal cannot leak incidental active workspace focus, and canonical create/reference settlement explicitly focuses the subject/result workspace.
- Selection uses existing workspace/card/tree/folder presentation with select affordances instead of a separate generic semantic candidate-list model.
- Generic authoring submission preserves caller strings exactly. Topic/Task materializers own their representation-local Markdown normalization.
- Action icons no longer infer interpretation semantics from the literal field name `Interpretation Action`; generic qualified continuation presentation is used absent declarative icon authority.
- `TiinexApp.jsx` canonical create/reference orchestration was extracted into a narrower product controller, creating material architecture headroom without raising guards.
- Browser/public runtime remains not claimed unless independently exercised.

## v450 predecessor

# Validation Notes v450 — M0 Human Product Parity Hardening

Checkpoint: `v450`  
Version: `0.2.269-v450`  
Runtime: `react-v450-m0-human-product-parity-hardening`

## v450 bounded product-hardening scope

- ordinary product commits no longer run legacy workspace-candidate migration/deep cloning; migration remains persistence/recovery-owned;
- configured startup buffers materialization/config application before product commit and consumes declared view/filter/search/path intent generically;
- canonical editable creation values trim outer whitespace at the authoring boundary;
- Reference, fixed Continuity Parent review, and same-workspace Storage Placement use one generic workspace-selection session;
- canonical action icons derive from qualified result/creation capability;
- active footer is a shell-owned grid row rather than a fixed viewport overlay;
- no new Transition definitions, Tooling semantics, or canonical schemas are introduced;
- normal-origin browser/public runtime is not claimed in this environment.

## v449 predecessor

# Validation Notes v449 — M0-F Exact Mutation Target Attestation Closure

Checkpoint: `v449`  
Version: `0.2.268-v449`  
Runtime: `react-v449-m0f-exact-mutation-target-attestation-closure`

## v449 bounded Site correction

- exact GitHub remote equality is treated as representation verification only; it does not independently prove that the current guided publication operation performed a write;
- Site exposes explicit human GitHub web mutation confirmation bound to exact `planSha256` **and** exact qualified GitHub issue/comment target;
- Copy/Open remain non-write evidence and cannot substitute for the human mutation attestation;
- `verifyWorkspaceGithubPublication(...)` qualifies the exact final target first, then fails closed before remote read/shared success when exact plan+target attestation is missing, stale, or mismatched;
- with valid attestation, exact target and exact payload verification still flow through the unchanged shared `buildPublicationResult(...)` success authority;
- qualified durable workspace receipts preserve Site-local execution-attestation type, exact plan SHA, exact target kind/canonical `inputTarget`, confirmation timestamp, and the boundary that Tiinex did not perform a hidden/API write;
- local input remains unchanged and attestation does not become source/artifact semantics;
- v446 exact social target parser/contract and shared `buildPublicationResult(...)`, Tree/Handoff/package/re-ingest, and Tooling portable remain byte-unchanged.

Known source-clean missing-React behavior at `src/app/useLocalMaterialIntake.test.mjs` remains explicit if dependencies are absent. Browser/public runtime is not claimed unless separately exercised.

---

# Validation Notes v447 — M0-F GitHub Social Publication Product Integration

Checkpoint: `v447`  
Version: `0.2.266-v447`  
Runtime: `react-v447-m0f-github-social-publication-product-integration`

## v447 bounded Site integration

- existing Export dialog now exposes guided GitHub issue/comment publication for preflight-qualified owned-local artifacts;
- current shared `buildPublicationPlan(...)`, v446 exact target authority, and `buildPublicationResult(...)` remain semantic/result owners;
- supported guided modes are create-new issue, create-comment, update-known issue, and update-known comment;
- copied bytes are exactly `plan.outboundPayload.content`; Site does not generate a second publication body;
- Open uses a bounded GitHub web destination and never performs provider mutation;
- exact final target is qualified by the shared v446 parser before the read-only GitHub body owner is invoked;
- issue/comment body SHA-256 must equal the shared plan payload SHA-256 before shared success/source binding can qualify;
- qualified receipts/source bindings persist in browser-local workspace delta state while local/source input records stay unchanged;
- product Copy/Open/Verify completion is tied to the exact current plan identity, and stale verification is cleared when product input changes;
- issue-snapshot parsing does not qualify publication targets; no GitHub credentials, write API, Parent inference, or local-draft pruning is introduced;
- Tree/Handoff/package/re-ingest and M0-A–E behavior remain regression-gated.

Known source-clean missing-React behavior at `src/app/useLocalMaterialIntake.test.mjs` remains explicit if dependencies are absent. Browser/public runtime is not claimed unless separately exercised.

---

# Validation Notes v446 — M0-F Exact GitHub Social Target Representation Closure

Checkpoint: `v446`  
Version: `0.2.265-v446`  
Runtime: `react-v446-m0f-exact-social-target-representation-closure`

## v446 bounded Tooling correction

- GitHub social `externalTarget`, `containerTarget`, and execution/result target aliases are preserved raw until `parseExactGithubIssueTarget(...)` qualification; shared publication code does not trim or structurally rewrite them first.
- Unsupported whitespace-wrapped observations remain blocked/failing and are preserved exactly in plan/result evidence.
- Accepted issue-number lexemes must be positive decimal integers that round-trip exactly through JavaScript safe-integer representation; `Number.MAX_SAFE_INTEGER` is accepted, larger lexemes fail closed.
- The parser exposes exact `issueNumber` string identity while retaining numeric `number` convenience for existing consumers; canonical issue URLs are built from the accepted lexeme, never from a rounded/exponent-formatted number.
- Shared publication comparisons use exact issue identity rather than lossy numeric coercion.
- v445's explicit normalization allowlist is unchanged; no query, case, percent-decoding, path normalization, backslash, whitespace, or alternate-host broadening is introduced.
- Repo-file behavior, GitHub snapshot/read surfaces, package/re-ingest, Site/React, credentials, host execution, Semantic Package, canonical schema cache, and Tiinex/docs remain unchanged.

## Validation model

Run the combined parser + publication target-representation closure matrix, all issue-target/social-publication tests, adjacent GitHub snapshot/adapter/transport and portable publication regressions, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v445 — M0-F Raw GitHub Social Target Lexical Hardening

Checkpoint: `v445`  
Version: `0.2.264-v445`  
Runtime: `react-v445-m0f-raw-social-target-lexical-hardening`

## v445 bounded Tooling correction

- exact GitHub issue/comment authority is qualified from an explicit raw positive lexical grammar before any structural URL normalization;
- exact supported web forms are lowercase `https://github.com/<owner>/<repo>/issues/<positive-integer>` with optional single trailing slash and optional exact `#issuecomment-<digits>` fragment;
- exact supported API issue-body form is lowercase `https://api.github.com/repos/<owner>/<repo>/issues/<positive-integer>` with optional single trailing slash;
- literal/encoded dot-segments, backslashes, doubled separators, encoded structural delimiters, queries, unsupported prefixes/suffixes, case-normalized host/scheme variants, and surrounding whitespace fail closed;
- WHATWG path normalization is no longer used as qualification authority;
- publication-result pressure preserves hostile raw observations as failure evidence, emits `publication.result.social-target.invalid`, keeps `sourceBinding = null`, and never manufactures a nominal canonical permalink;
- adjacent issue/comment/pull/discussion/hosted-direct snapshot behavior remains independently regression-qualified;
- no React/UI, host write, credentials, workspace lifecycle, Handoff package/export/re-ingest, Semantic Package, canonical schema cache, or Tiinex/docs mutation is introduced.

## Validation model

Run the exact raw lexical matrix, publication-result hostile observation matrix, adjacent GitHub reader regressions, portable publication regression, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v444 — M0-F Exact GitHub Social Target Hardening

Checkpoint: `v444`  
Version: `0.2.263-v444`  
Runtime: `react-v444-m0f-exact-github-social-target-hardening`

## v444 bounded Tooling correction

- exact GitHub web issue/comment authority is restricted to `https://github.com/<owner>/<repo>/issues/<number>` with an optional exact `#issuecomment-<digits>` fragment;
- arbitrary `*.github.com` hosts, query-derived comment tokens, unsupported trailing path segments, malformed comment anchors, credentials/ports/non-HTTPS input, and unrelated raw-string token matches fail closed;
- unsupported observations are preserved as failure evidence and are never rewritten into a different supported permalink;
- one trailing slash is the only web-path normalization accepted;
- the separately explicit `https://api.github.com/repos/<owner>/<repo>/issues/<number>` issue-body read surface remains supported;
- v443 create-new issue intent, create-comment parent issue intent, update-known matching, repo/container mismatch detection, payload SHA-256 verification, mutable social binding, immutable repo-file binding, package/Handoff behavior, and portable facade remain unchanged;
- ordinary issue/comment/pull/discussion/hosted-direct issue snapshot behavior remains regression-qualified;
- no React/UI, credentials, host write, workspace lifecycle, Semantic Package, canonical schema cache, or Tiinex/docs mutation is introduced.

## Semantic authority

Current `Tiinex/docs` head was re-checked before mutation and remained `053d46ce082d4ec261b82abc44ecca403d61e240`. No semantic escalation was required.

## Validation model

Run exact parser pressure, Architect's three publication-result reproductions, adjacent GitHub issue snapshot/readers, package/re-ingest/portable regressions, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v443 — M0-F GitHub Social Publication Contract Reconciliation

Checkpoint: `v443`  
Version: `0.2.262-v443`  
Runtime: `react-v443-m0f-github-social-publication-contract-reconciliation`

## v443 shared publication contract

- shared GitHub target qualification is surface-specific: `github.repo.file`, `github.issue.body`, and `github.issue.comment`;
- the existing exact GitHub issue/comment URL parser is centralized as a pure shared source owner and consumed by both publication and issue-snapshot materialization;
- repo-file publication still requires exact repository/path plus a 40-character materialized commit before qualified success;
- create-new issue plans may be ready without a final issue permalink;
- create-comment plans may be ready with an exact parent issue container before the final comment permalink exists;
- update-known issue/comment plans require the exact known remote target before execution;
- social publication result qualification requires matching target kind/repository/container, exact remote issue/comment identity, explicit execution success, verification state `verified`, and exact payload SHA-256 equality;
- successful social source bindings remain mutable remote representations and carry no fake repo-file path or materialized commit;
- the local draft remains distinct and unchanged; publication targets never imply Continuity Parent;
- shared/portable publication remains planning/result normalization only: no fetch, credentials, write execution, or Site/React dependency;
- v442 Handoff export/re-ingest behavior remains regression-qualified;
- no Tiinex/docs, canonical schema cache, Semantic Package, Site publication UI, OAuth/token, or GitHub host-write implementation is introduced.

## Semantic authority

Current `Tiinex/docs` head was re-checked before mutation and remained `053d46ce082d4ec261b82abc44ecca403d61e240`. No newer semantic authority changed this tranche and no Schemer escalation was required.

## Validation model

Run focused publication/social target tests, GitHub issue-source regression, package/re-ingest/portable regressions, all `src/**/*.test.mjs` individually, and repository gates. The inherited source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable; it is not a runtime/product PASS claim.

Browser/public runtime remains unclaimed unless separately exercised.

---

# Validation Notes v442 — M0-F Handoff Freshness + Archive Intake Scaling Correction

Checkpoint: `v442`  
Version: `0.2.261-v442`  
Runtime: `react-v442-m0f-handoff-freshness-archive-scaling-correction`

## v442 bounded correction

- Handoff render/read-model planning is cheap configuration only; it stores no package bundle or exact inspection.
- Explicit execution builds and inspects exactly once from the latest current workspace passed to the execution command.
- Single selected ZIP intake performs one archive decode ownership pass, then reuses decoded entries for Handoff detection or ordinary archive qualification.
- Invalid claimed Handoff packages still fail closed; ordinary Tree ZIP remains ordinary intake.
- v441 publication Case C remains unchanged.

---

# Validation Notes v441 — M0-F Product Execution Integration

Checkpoint: `v441`  
Version: `0.2.260-v441`  
Runtime: `react-v441-m0f-product-execution-integration`

## v441 bounded Site integration

- Tree export remains the default ordinary envelope-free ZIP.
- Handoff package is explicit opt-in and only builds/qualifies the shared operational package after selection.
- Valid Handoff ZIP intake rehydrates/inspects/imports/applies through accepted shared package owners and canonical workspace lifecycle.
- Claimed invalid operational packages fail closed and do not fall through to generic archive leaves.
- Source-backed package members remain reference-only; local package-owned records/assets remain local. Shared `Uint8Array` asset bytes are normalized only at the Site lifecycle boundary to JSON-safe byte arrays so exact bytes survive clone/persistence/reopen and remain reusable by shared package byte owners.
- GitHub publication is intentionally held as Case C: current shared GitHub publication requires exact repository/ref/path + verified commit, while the PoC product target is issue/comment shaped.
- The historical source-clean missing-React exception at `src/app/useLocalMaterialIntake.test.mjs` remains explicit; `npm run validate` is not labeled PASS when it occurs.

---

# Validation Notes v440 — M0-F Control-Set Completeness Correction

Checkpoint: `v440`  
Version: `0.2.259-v440`  
Runtime: `react-v440-m0f-control-set-completeness-correction`

## v440 bounded Tooling correction

- current operational package control topology is owned once by `src/export/package.controlTopology.js`;
- required controls are `index.json`, `manifest.json`, `receipt.json`, `build-receipt.json`, `contract.json`, `findings.json`, and `file-map.json`;
- every required control must exist physically and be readable JSON;
- the serialized index must point every declared control role at its exact current canonical operational path;
- blank, redirected, or duplicate control pointers fail closed;
- removing build receipt, contract, or findings and rebuilding only the durable file map remains invalid;
- unreadable index/build-receipt/contract/findings remain invalid even when outer byte metadata and file-map integrity are rebuilt;
- v439 material SHA/byte checks, collision cardinality, build-receipt material representation, manifest/receipt/contract consistency, source projection, asset bytes, workspace context, publication contracts, and Semantic Package separation remain unchanged;
- no React/UI/Site product execution, remote publication execution, credentials, canonical schema cache, or Tiinex/docs mutation is introduced.

## Validation model

Run the v440 control-topology adversarial matrix, v439 transport/publication regressions, all `src/**/*.test.mjs` individually, and repository gates. The historical source-clean `ERR_MODULE_NOT_FOUND: react` at `src/app/useLocalMaterialIntake.test.mjs` remains an explicit environment exception when dependencies are unavailable; it is not a product/runtime PASS claim.

Browser/public runtime remains unclaimed unless separately exercised.
