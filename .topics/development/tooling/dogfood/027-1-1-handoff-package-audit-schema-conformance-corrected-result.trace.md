# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 14:52:00
  - Trace: [027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md](027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md)
  - Origin:
    - [relative](027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/b7de59cc6c47e122265188debbd2964b8e5a00a1/.topics/development/tooling/dogfood/027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 22:38:00
  - Authors: Loom
  - Why: Return a schema-conformant correction of the Tooling 027 result while preserving the accepted audit substance and recording the bounded 027-3 selected-Handoff readiness-gate implementation.
  - Summary: Corrected Tooling 027 result — preserved carrier audit findings plus exact selected-route Handoff schema/continuity fail-closed qualification evidence.
  - Status: complete/local

---

# Tooling 027 corrected result — Handoff audit substance and selected-route conformance correction

## Decision

- State: correction-complete / independent-acceptance-pending
- Subject: Tooling 027 carrier/control-plane audit substance and Tooling 027-3 Handoff route-artifact readiness correction
- Decision: preserve the Tooling 027 audit findings and bounded candidate evidence, keep production carrier migration gated on Axiom workspace/archive binding classification, and treat Tooling 027-3 as locally implemented evidence that manufacture/readiness now fails closed when exact selected Handoff bytes violate Root, the registered `tiinex.handoff.v1` contract, self integrity, or required Parent-target integrity.
- Boundary: this corrected result does not accept a new carrier representation, resolve the Axiom binding question, publish artifacts, or self-accept the implementation.

## Preserved Tooling 027 Audit Substance

- The workspace-artifact plus exact workspace-archive direction remains mechanically viable and can materially reduce exposed outer workspace leaves, but current `tiinex.workspace.v1` does not authorize a package-local arbitrary workspace-artifact/instance to exact workspace-tree archive binding. `Workspace Entrypoints`, `Repository Transports`, filenames, adjacency, and directory placement must not be overloaded to create that meaning.
- The preferred next semantic question remains whether a Handoff/package-local workspace-carrier binding can own artifact digest, archive digest, and inner-entry-map correlation while leaving `tiinex.workspace.v1` unchanged, or whether Axiom requires a schema extension.
- `handoff.workspaces/<id>/...` remains the current exact workspace-byte provider; its directory shape is not semantic identity. A future archive-backed provider must preserve workspace-qualified addressing, normalized safe inner paths, exact bytes/SHA-256, duplicate rejection, and unavailable-decoder failure.
- `handoff.material/**` remains an exact Required/Reference Context fallback rather than globally redundant material. In the audited package all six detached material carriers were byte-identical to qualified workspace entries, proving a concrete deduplication opportunity only once an equivalent fail-closed workspace/archive binding exists.
- `tiinex.package/file-map.json` remains unique outer-package tamper/integrity authority. START, Pointer, carrier, closure, companion, generic manifest/receipt/contract/index/findings/build-receipt controls have different projection/compatibility responsibilities and must not be deleted piecemeal merely because some fields duplicate.
- The generic manifest/receipt language is valid as an inner export planning/build layer but misleading when read as final Handoff lifecycle state after a carrier has already been manufactured. A future Handoff-specific topology should rehome or remove that projection reuse only while preserving its actual invariants.
- Bootstrap/runtime Tooling remains outside nested workspace archives. Persistent-host reuse remains conditional on exact version/source/integrity qualification plus explicit unavailable/retrieval behavior.
- Tooling 026 remains the preferred-path behavioral authority. Reducing outer workspace leaves lowers accidental native-indexing pressure; it never grants permission for pre-orientation archaeology.

## Preserved Quantitative Evidence

- Audited production-format baseline: `4,743,466` outer ZIP bytes, `430` outer files, STORE-only outer entries.
- `handoff.workspaces`: `96` files and `962,833` payload bytes; `tiinex.bootstrap`: `315` files and `3,178,145` payload bytes; `tiinex.package`: `11` files and `456,676` payload bytes; file map: `303,985` bytes; detached `handoff.material`: `45,424` bytes, with `6/6` detached carriers duplicated byte-for-byte inside the qualified workspace.
- Bounded nested candidate with inner workspace DEFLATE and outer STORE: `4,024,643` bytes and `336` outer files, a measured reduction of `718,823` bytes / `15.15%`; the inner archive was `266,699` bytes versus `962,833` raw workspace payload.
- Outer-DEFLATE observations remain non-production evidence: uncompressed inner archive plus outer DEFLATE measured `1,022,452` bytes, while inner DEFLATE plus outer DEFLATE measured `1,070,114` bytes, demonstrating a concrete double-compression penalty for the tested shape.
- Local serialization observations remain non-SLA evidence: current outer STORE rebuild median about `9.83 ms`; inner workspace DEFLATE about `31.24 ms`; candidate outer STORE assembly after inner archive existed about `6.61 ms`; outer-DEFLATE variants about `108–134 ms`.
- Cold-start A/B observations remain bounded evidence rather than candidate qualification: current outer load `430` files / median about `57.0 ms`; current orientation over loaded material `ready` / median about `45.8 ms`; nested candidate outer load `336` files / median about `21.2 ms`; existing archive decoder consumed all `96` inner entries in memory with zero errors/warnings at about `70.8–98.9 ms` depending on verification work. Exact route plus all four Required Context targets were recovered with SHA-256 values matching the current carrier, without filesystem extraction.
- The nested candidate still does not qualify production orientation because current route/closure/orientation owners expect exploded workspace package paths. Any future implementation must wire an archive-backed provider and rerun single/multi-workspace, Required Context, tamper, context-audit, Tooling 026, bootstrap-unavailable, and package-wide continuity qualification.

## Tooling 027-3 Representation Correction

- The prior Loom Tooling 027 result is preserved only as `src/tooling/portable/handoff/fixtures/027-invalid-audit-result.fixture.txt`. Under its declared `tiinex.task.v1` contract it is schema-invalid because required task sections are absent even though its c14n-v2 self integrity verifies.
- The prior Loom return Handoff is preserved only as `src/tooling/portable/handoff/fixtures/027-invalid-return-handoff.fixture.txt`. Its exact self and Parent-target digests verify, but the Handoff contract still fails: `## Exclusions And Dependencies` is missing, `Transfer Kind: result` is outside the allowed domain, `Signal Kind: decision` is outside the allowed domain, and its declared Parent Origin lacks required `browse + git` authority.
- A shared `routeArtifactConformance` owner now validates exact selected Handoff Markdown through the maintained registered artifact validator, requires exact `tiinex.handoff.v1`, requires a qualified compiled contract state, independently recomputes c14n-v2 self integrity, and when Parent exists requires one qualified Parent-target edge whose exact Parent representation is independently resolved and recomputed.
- Parent path/Origin references are used only as candidate recovery. If local path recovery is unavailable, carried package candidates are scanned by independently verified primary self digest across workspace materializations and detached material; stored child-target and candidate-self string equality alone never qualifies the edge.
- Carrier route qualification consumes this shared conformance result. Manufacture readiness now suppresses `ready` whenever any selected Handoff route is conformance-blocked, including single-route packages. Existing single-route fallback behavior for unrelated non-Handoff projection details remains unchanged; shared-route projection still preserves its stricter all-route readiness rules.
- Manufacture surfaces `verification.selectedHandoffConformance` and propagates exact selected-Handoff conformance findings rather than silently rewriting, resealing, or normalizing invalid carried bytes.
- Generated package-root `tiinex.pointer.v1` route controls now pass the shared Root/self-integrity conformance layer in addition to their existing Pointer-specific schema form, destination cardinality, exact route-target projection, no-Parent, and self-integrity checks.
- Bootstrap guidance now states the fail-closed exact selected-Handoff qualification boundary and explicitly says legacy single-route output fallback cannot bypass Handoff schema/self/Parent-target conformance.

## Implementation Evidence

Core implementation changes:

- `src/tooling/portable/handoff/routeArtifactConformance.js` — new shared exact-byte Tiinex route-artifact qualification owner.
- `src/tooling/portable/handoff/carrierProjection.js` — selected Handoff conformance consumption, package-wide Parent candidate recovery, conformance projection/findings.
- `src/tooling/portable/handoff/materialClosure.package.js` — selected-Handoff conformance now participates in single- and shared-route transport readiness.
- `src/tooling/portable/handoff/manufacture.js` — explicit selected-Handoff verification state and conformance findings in manufacture results.
- `src/tooling/portable/handoff/pointerEntrypoint.js` — generated package-root Pointer Root/self conformance check.
- `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md` — operator/runtime guidance updated to the exact-byte ready-gate contract.

Focused regression support:

- `src/tooling/portable/handoff/qualifiedHandoffFixture.js` — reusable schema-valid, c14n-v2-sealed Handoff fixture builder.
- `src/tooling/portable/handoff/routeArtifactConformance.test.mjs` — valid pass; missing Exclusions; invalid Transfer Kind; invalid Signal Kind; malformed self; exact prior invalid return; valid Parent; Parent missing `browse + git`; wrong Parent-target; corrupted Parent.
- `src/tooling/portable/handoff/handoff.manufacture.test.mjs` — manufacture-level invalid selected-Handoff suppression plus exact original invalid 027 return substitution with satisfied required-material closure.
- Legacy portable tests that previously used structurally minimal fake Handoffs were upgraded to the qualified fixture baseline so they exercise their original behavior behind the new conformance gate rather than bypassing it.

## Regression Evidence

- Exact prior invalid return manufacture regression: Required Context closure is satisfiable; exact Handoff self integrity is `verified`; exact Parent-target verification is `verified`; `verification.selectedHandoffConformance` is `blocked`; manufacture status is `blocked`; findings include missing required section, missing required Parent Origin authority, and both closed-domain field violations. This proves checksum-valid continuity strings cannot mask schema failure at readiness.
- Focused `routeArtifactConformance.test.mjs`: pass.
- Available portable Handoff regression suite: carrier projection pass; cold-consumer entrypoint pass; Tooling 026 cold-start qualification pass; context audit pass; manufacture scale pass; manufacture pass; copyable/normal human output pass; multi-root manufacture pass; Pointer entrypoint pass; route-artifact conformance pass; transport companion pass.
- Scale regression remained green at `1,286` workspace carriers and `1,306` package files in about `2.1 s` on this local run. Timing is observational only.
- `materialClosure.test.mjs` was not executable from the supplied isolated handoff archive because the package does not contain its pre-existing test-only dependency `src/export/package.zip.js`. The implementation does not fabricate or replace that omitted repository source; material-closure behavior remains exercised transitively by manufacture, carrier, context-audit, multi-root, and scale tests available in the package.

## Corrected Disposition

- Tooling 027 audit substance remains accepted-for-downstream-classification evidence, matching Anchor's `accepted-substance / representation-blocked` disposition.
- Tooling 027-3 is locally complete for independent review: the selected-Handoff readiness hole is corrected without changing carrier representation, canonical schemas, integrity algorithms, or carried canonical bytes.
- Axiom workspace/archive semantic classification remains retained and must precede any production nested-workspace carrier implementation.
- Sigma's first-new-format personal inspection remains retained because this correction emits the current carrier format only and does not activate the proposed future format.

## Limits

- No production carrier migration, nested-workspace activation, zero-JSON topology, canonical Workspace/Handoff/Root schema change, publication, authentication, Git commit/push, credential flow, historical lineage repair, Viewer/VS Code work, or active publication-semantics change is authorized or performed here.
- This local corrected result is not itself publication evidence. Parent authority is declared only to the exact published Tooling 027 task with complete relative plus `browse + git` Origin and verified Parent-target c14n-v2 continuity.
- Independent Anchor/fresh-reviewer acceptance remains required before the Axiom/carrier route proceeds.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md](https://github.com/Tiinex/site/blob/b7de59cc6c47e122265188debbd2964b8e5a00a1/.topics/development/tooling/dogfood/027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md)
  - Value: 69L82rqQfMJ_O0xGPtbwH1nj3_H2smyGvMYj_sEVZjQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:186Vj4praznfijD7gVH0aBu6jlXzs3H4S2lgTK3Hg7E
