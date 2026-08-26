# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 01:10:00
  - Authors: Anchor
  - Why: Independently gate the corrected Tooling 027-5 implementation against the first real Tiinex/site v2 manufacture attempt rather than accepting only fixture-scale behavior.
  - Summary: Anchor review after Tooling 027-5-4 — semantic/static blockers are closed, but first-live v2 manufacture is still blocked because the v2 facade obligatorily constructs a full exploded v1 carrier before upgrading it; the real 1,510-entry workspace exceeds a five-minute execution window even with explicit routing and roundtrip disabled.
  - Status: correction-required/local

---

# Tooling 027-5-5 Anchor review — first-live v2 manufacture performance correction required

## Decision

- State: correction-required / implementation-retained / first-live-v2-candidate-blocked
- Subject: operational readiness of the corrected archive-backed Handoff carrier v2 against the real Tiinex/site workspace
- Decision: retain the semantically corrected 027-5 implementation, but withhold first-live v2 candidate generation until the opt-in v2 manufacture path no longer requires materializing the entire complete workspace as an exploded current/v1 package before archive conversion. Open one bounded Loom correction for the v2 manufacture path only; current/default v1 remains unchanged.
- Boundary: this review does not reopen Tooling 027-4 Workspace/archive semantics, reject the corrected Workspace-target conformance, authorize partial archives as complete, relax package verification, or switch default routing.

## Independent Replay Evidence

- Returned 027-5-4 current/v1 package orientation and context audit: ready/clean with 4/4 exact Required Context closure.
- Exact correction diff against the retained 027-5 implementation baseline: eight source paths plus Loom's result/return artifacts, matching the declared correction set.
- Focused archive-v2 suite: PASS, including verified c14n-v2 Workspace target qualification and fail-closed unverified/mismatch/Root-invalid/Parent-invalid/provider-descriptor cases.
- Downstream replay PASS: material closure, Handoff manufacture, route-artifact conformance, carrier projection, Pointer, cold consumer, Tooling 026 cold-start, context audit, multi-root manufacture, human output, transport companion, architecture shape, browser import boundary, schema bindings/runtime projections, and TypeScript.
- Full-source `validate-static.mjs` reaches the normal predicate and reports exactly the five historical pre-027-5 oversized `.js` files; Tooling 027-5 adds zero new source-size failures.
- A durable `.topics/.workspaces/tiinex-site.workspace.md` artifact was deliberately authored after those semantic/static checks. It validates clean as `tiinex.workspace.v1`, has verified c14n-v2 self integrity, has no invented Parent, and remains useful independently of Handoff transport.

## First-Live Manufacture Finding

The real first-candidate path was exercised against the current full working source with one explicit route, one exact real Workspace target, embedded bootstrap, and roundtrip disabled to minimize work.

Observed phase evidence:

- deterministic Node workspace preparation/enumeration completed in about `1.847s` for `1,510` regular workspace entries plus `325` embedded bootstrap files;
- execution then entered the synchronous v2 manufacture phase and did not complete within a `180s` focused benchmark;
- the ordinary CLI attempt, including explicit `--handoff-routes` and `--no-roundtrip`, still did not complete within the enclosing `300s` execution window and emitted no package;
- therefore workspace enumeration itself is not the dominant observed blocker.

The current implementation structure explains the pressure: `manufactureRecipientRelativeHandoffPackageV2(...)` first calls full `manufactureRecipientRelativeHandoffPackage(...)`, which materializes and qualifies the complete workspace in exploded current/v1 carrier form, and only afterwards calls `upgradeRecipientRelativeHandoffTransportPackageV2(...)` to replace those exploded workspace files with the archive-backed representation.

For a real complete workspace this makes the new compact representation depend on constructing the expensive representation it is intended to replace. Fixture-scale correctness remains valid, but first-live operational readiness is not yet qualified.

## Required Correction Boundary

- Keep `manufacture-handoff-package` current/v1 behavior, bytes, topology, and public/default semantics unchanged.
- Make the explicit `manufacture-handoff-package-v2` path reuse shared v1 semantic planning/closure/route qualification where appropriate without requiring a full exploded complete-workspace carrier as a mandatory byte-materialization intermediate.
- Preserve the exact accepted v2 semantics: one explicit qualified Workspace target, one exact independently verified complete workspace archive, archive-provider addressing by qualified workspace identity + normalized inner path, exact Required Context dedup/fallback, bootstrap outside nested archives, outer file-map authority, Pointer/START projection, selected-Handoff conformance, and fail-closed tamper/provider/completeness behavior.
- Do not weaken completeness evidence or reinterpret a partial workspace as complete merely to improve runtime.
- Add regression pressure proving the direct/optimized v2 manufacture remains equivalent to the accepted small-fixture output semantics while current/v1 regressions remain byte/topology compatible.
- Exercise the real carried Tiinex/site working source with its exact `tiinex-site.workspace.md` target. The v2 manufacture must complete inside the current Loom host's `120s` execution window with explicit route selection; record phase and total timings rather than fabricating PASS if the host budget is exceeded.
- A temporary internal v2 test output may be generated for verification, but the Loom return to Anchor must remain one current/v1 route-scoped partial package. Sigma's first human-deliverable v2 package remains an Anchor-retained gate.

## Retained Gates

- Workspace target conformance and zero-new-static-regression findings are closed and must not be reopened or relaxed.
- The first human-deliverable v2 package remains blocked until Anchor independently accepts the manufacture-performance correction and successfully manufactures/verifies it from the real full working source.
- Sigma must personally inspect that first package before any fresh worker consumes v2 or default routing changes.
- No publication, commit, push, authentication, credential flow, or remote mutation is authorized.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:NGuu6woQ6-VfVIg3UVw_fIYBmQBFfYTGXgMtnwgUWqk
