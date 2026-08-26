# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 23:37:00
  - Authors: Anchor
  - Why: Implement the archive-backed recipient-relative carrier only after Axiom and Anchor closed the Workspace/archive semantic boundary, while retaining a hard Sigma inspection gate before the first new-format package is used onward.
  - Summary: Tooling 027-5 — implement an opt-in archive-backed Handoff carrier v2, migrate route/context consumers to a qualified workspace-archive provider, and preflight the first new-format topology without switching default manufacture.
  - Status: open/local

---

# Tooling 027-5 — archive-backed Handoff carrier v2 implementation and first-candidate preflight

## Objective

Implement one versioned, opt-in recipient-relative Handoff carrier topology that replaces exploded workspace carriage with a qualified lineage-bearing Workspace target plus exact workspace archive representation, while preserving current semantic Handoff truth, outer package tamper authority, Tiinex-first cold-start behavior, multi-workspace addressing, and detached-material fallback. Return implementation and test evidence to Anchor in the current carrier format; do not make the new format the default or use it for onward routing in this turn.

## Done Criteria

- Implement a package-local Workspace/archive binding descriptor in the existing Handoff closure/materialization control plane using the accepted Tooling 027-4 contract. It must carry enough exact machine truth to qualify one Workspace target, one archive representation, inner-entry correlation, completeness state, provider state, and authority boundary without deriving identity from filename or placement.
- Workspace target qualification must bind the carrier workspace identifier to an exact package-carried `tiinex.workspace.v1` artifact reference plus independently verifiable artifact/representation identity. If no truthful unique Workspace artifact exists for a workspace, fail closed and report the blocker rather than silently minting a transport-only semantic Workspace identity.
- Archive representation qualification must include package-local locator, representation kind, media/codec when decoder selection depends on it, exact archive byte size when available, exact archive digest/method/target, and deterministic archive manufacture. Compression is implementation policy only; preserve exact bytes and avoid accidental double-compression where practical.
- Implement an archive-backed workspace byte provider keyed by qualified Workspace identity plus normalized inner path. Require safe path normalization, reject traversal/unsafe paths, reject duplicate inner paths, and verify exact per-entry bytes/digests or equivalent independently checkable entry-map proof.
- A complete workspace snapshot claim must have explicit exact included-entry/completeness evidence for the declared workspace boundary. Missing or stale completeness evidence must not degrade into a heuristic partial/complete guess.
- Make selected-route Handoff conformance, Required Context resolution, Reference Context disposition, context audit, carrier projection, orientation/START, Pointer routing, cold-consumer grounding, and human-output projection consume the provider abstraction rather than assuming exploded outer `handoff.workspaces/<id>/...` leaves.
- Preserve fail-closed behavior for duplicate/ambiguous Workspace identities, same inner relative path across different workspaces, duplicate/unsafe inner path, unavailable decoder/provider, archive digest mismatch, per-entry mismatch, stale binding, incomplete snapshot evidence, unresolvable Workspace target, invalid selected Handoff, and outer file-map tamper.
- Preserve `tiinex.package/file-map.json` (or a byte-equivalent versioned owner retaining the same independently inspectable outer exact-file authority) during this tranche. Inner archive digest/index must not silently replace package-wide exact-file tamper qualification.
- Deduplicate `handoff.material/**` only when a Required/Reference Context requirement resolves to an exact qualified archive entry with equivalent fail-closed digest/provenance proof. Preserve detached material when archive equivalence is unavailable or intentionally route-local.
- Keep bootstrap/runtime Tooling outside nested workspace archives. Persistent-host bootstrap reuse remains separately qualified. START and package-root Pointer remain non-authoritative orientation projections and must not become Workspace/archive identity.
- Introduce a versioned/opt-in carrier-v2 manufacture path. **Do not change current/default manufacture or normal return routing in this turn.** Loom's return to Anchor must use the current qualified carrier so the new implementation cannot self-activate before independent acceptance.
- The v2 candidate should minimize the exposed cold-consumer surface: ordinary Tiinex orientation/Pointer and Workspace artifacts plus exact workspace archive(s) should be primary; generic export planning controls must not remain primary user-facing navigation merely because the old builder produced them. Rehome/remove controls only invariant-by-invariant, preserving independent inspectability and compatibility evidence. Do not use opacity/encryption as enforcement.
- Preserve recipient-relative route isolation: one delivery selects one route, sibling routes do not leak, and multi-workspace packages retain workspace-qualified route/path identity.
- Preserve package-wide Tiinex artifact conformance. Newly generated Tiinex Markdown must be Root/schema-valid with independently recomputed c14n-v2 self integrity and, when Parent is truthfully declared, exactly one qualified Parent-target v2 entry plus one self entry. Exact carried source artifacts must remain byte-exact rather than being silently resealed by transport.
- Add positive/adversarial regressions for single workspace, two workspaces sharing the same inner relative route path, archive-backed Required Context, detached fallback, duplicate Workspace identity, duplicate/unsafe path, wrong archive digest, wrong inner digest, stale binding/index, unavailable decoder, incomplete snapshot evidence, invalid selected Handoff, outer file-map tamper, and package-wide Continuity Integrity recomputation.
- Rerun the downstream Anchor acceptance suite before returning: material closure, route artifact conformance, manufacture, carrier projection, Pointer, cold consumer, Tooling 026 cold-start qualification, context audit, multi-root/multi-workspace, scale, human-output normal emission, transport companion, architecture shape, browser import boundary, schema bindings, and TypeScript where the carried environment supports them. Record unavailable prerequisites without fabricating PASS.
- Exercise carrier-v2 manufacture/roundtrip in-memory or as disposable local test bytes, but do **not** designate or return a new-format ZIP as the primary human transport. Return the exact opt-in API/CLI invocation Anchor should use to generate the first human-deliverable candidate after independent acceptance.
- Return exactly one primary Loom→Anchor Handoff package in the current carrier format. Avoid helper-package proliferation; supplementary implementation/test evidence belongs inside the carried workspace or bounded referenced artifacts, not as multiple competing human transport choices.

## Scope

Portable Handoff package manufacture, workspace archive provider/binding, carrier/closure/orientation consumers, package-control topology migration behind an opt-in v2 mode, exact regressions, and first-candidate preflight only. This task does not change canonical Tiinex schemas, publish/commit/push remotely, change Viewer/VS Code UI, authorize production default migration, bypass Sigma's first-new-format audit, or mutate unrelated source areas opportunistically.

## Dependencies

- [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md) is the controlling accepted semantic boundary for implementation.
- [Axiom Tooling 027-4 result](027-4-1-workspace-artifact-archive-binding-semantic-classification-result.trace.md) defines the minimum binding facts, fail-closed states, and durable Relation/External Payload boundary.
- [Tooling 027 corrected audit result](027-1-1-handoff-package-audit-schema-conformance-corrected-result.trace.md) preserves the measured nested candidate, control-plane inventory, archive-provider A/B evidence, and bounded implementation shape.
- [Tooling 027-3-2 Anchor acceptance](027-3-3-full-source-material-closure-regression-anchor-acceptance.trace.md) controls selected-Handoff schema/integrity readiness and full-source regression closure.
- [Tooling 026 Anchor acceptance](026-2-cold-start-tiinex-first-ingress-anchor-acceptance.trace.md) remains the preferred-ingress behavioral authority; carrier simplification must not redefine cold-start PASS.
- [Tooling 027 original audit task](027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md) retains the broader carrier minimality objective and first-new-format inspection sequencing.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:TpuSQVawFOmpDciqBf3B9t28vNAZ9XR28I7ApLU6mxw
