# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 01:55:00
  - Authors: Anchor
  - Why: Independently gate Tooling 027-5-7 against the retained full Tiinex/site working source rather than accepting a performance qualification measured only on Loom's smaller surviving route-scoped tree.
  - Summary: Anchor review after Tooling 027-5-7 — direct-v2 semantics and focused/downstream regressions are clean, but the real retained full-source path still exceeds the 120-second manufacture budget; Loom's 31.7-second result covered a 1,168-entry surviving tree while Anchor's accepted full working baseline already contained 1,513 files before the 027-5-7 overlay.
  - Status: correction-required/local

---

# Tooling 027-5-8 Anchor review — full-source v2 scale correction required

## Decision

- State: correction-required / implementation-retained / first-human-v2-candidate-blocked
- Subject: operational readiness of direct archive-backed Handoff carrier v2 against the retained full Tiinex/site working source
- Decision: retain Tooling 027-5-7's direct-v2 implementation and semantic/static corrections, but withhold the first human-deliverable v2 package until direct manufacture completes inside the 120-second budget against Anchor's retained full working source, not only Loom's smaller surviving route-scoped tree. Return one bounded Loom performance/scale correction using the exact supplied full-source snapshot as execution input.
- Boundary: this review does not reopen Tooling 027-4 semantics, reject direct-v2 equivalence/adversarial evidence, change current/default v1, authorize partial-as-complete carriage, or permit remote mutation.

## Independent Acceptance Evidence That Remains Green

- Returned current/v1 027-5-7 package orientation: ready; selected Handoff conformance qualified; Required Context 5/5 qualified; context audit clean; no findings.
- Exact returned workspace delta against Anchor's accepted 027-5-4 baseline: five implementation paths plus Loom's result and return Handoff, matching the declared bounded performance tranche.
- `027-5-7-direct-v2-manufacture-performance-correction-result.trace.md`: clean `tiinex.decision.v1` structural validation with independently verified c14n-v2 self integrity.
- `027-5-7-direct-v2-manufacture-performance-correction-result-handoff.trace.md`: clean `tiinex.handoff.v1` validation and independently verified c14n-v2 self integrity.
- Focused archive-v2 suite: PASS, including direct-versus-retained-legacy descriptor/route/archive equivalence, adversarial provider/archive/Workspace-target cases, and the added scale fixture.
- Downstream replay PASS: material closure, Handoff manufacture, route-artifact conformance, carrier projection, Pointer, cold consumer, Tooling 026 cold-start, context audit, multi-root, scale, human-output, transport companion, architecture shape, browser boundary, schema bindings/runtime projections, and TypeScript.
- Full `validate-static.mjs` reaches the normal repository predicate and reports exactly the same five historical source-size violations; Tooling 027-5-7 adds zero new source-size violations.

## Full-Source Performance Finding

The accepted full Anchor working state contained `1,513` regular files before overlaying the 027-5-7 return. The 027-5-7 overlay changes four existing source files, adds one production source file, and adds two Loom artifacts, yielding `1,516` files before this review's local artifacts.

Independent Node preparation against that retained full state completed in about `2.141s` and enumerated `1,516` workspace entries plus `326` embedded bootstrap transport files. Therefore full-source enumeration itself remains fast.

Two independent explicit v2 CLI attempts then exceeded Anchor's `120s` execution window without emitting output:

- ordinary direct-v2 manufacture with roundtrip enabled;
- direct-v2 manufacture with `--no-roundtrip`.

Both used the exact real `.topics/.workspaces/tiinex-site.workspace.md` target and exact 027-5-7 Handoff route. The second attempt demonstrates that roundtrip verification is not the observed cause of the remaining timeout.

Loom's returned performance evidence remains useful but is narrower: it reports `1,168` workspace entries and about `31.7s` total prepare + direct manufacture + serialization in the surviving Loom tree. That tree originated from recipient-relative route-scoped carriage and is materially smaller than Anchor's retained full working source. A successful benchmark over that tree does not by itself qualify full-workspace operational readiness.

## Required Correction Boundary

- Use the exact detached full-source snapshot supplied by this Handoff as the performance/reproduction baseline. Do not reconstruct repository completeness from Loom's surviving partial tree or from remote state.
- Preserve the accepted direct-v2 semantic owners and current/default v1 bytes/topology. This is a performance/scale correction, not a new representation or authority model.
- Profile enough of direct manufacture to identify the remaining superlinear or repeated full-workspace work between completed enumeration and ZIP emission on the supplied full-source snapshot.
- Remove or bound that repeated work without weakening Workspace Root/schema/self/Parent-target conformance, archive completeness, exact entry-map/digest proof, Required Context resolution, route conformance, Pointer/START, outer file-map authority, provider/tamper rejection, or archive determinism.
- Add regression pressure representative of the supplied mixed real workspace shape, not only many trivial files. The test should include enough Tiinex Markdown/schema/runtime/source diversity to catch the remaining scaling behavior while staying deterministic.
- The exact supplied full-source snapshot must complete direct v2 manufacture plus ZIP serialization inside `120s` with explicit route and `--no-roundtrip`; record phase timings, enumerated workspace count, bootstrap count, output size, and status. Prefer a comfortable margin rather than a result barely under the cutoff.
- After that benchmark, rerun the focused archive-v2 suite and the downstream acceptance set already named by Tooling 027-5-7. Full static may continue to report only the five historical source-size findings; introduce zero new findings.
- Return exactly one current/v1 recipient-relative partial Loom→Anchor package. Do not attach a v2 package, activate v2 as default, invent a new Workspace artifact, or perform publication/remote mutation.

## Retained Gates

- Anchor retains independent full-source replay after Loom returns.
- Sigma with Anchor retains personal inspection of the first human-deliverable v2 package after full-source performance acceptance.
- A route-scoped or otherwise incomplete tree must never be used as evidence for a complete-workspace claim merely because all locally visible files were enumerated.
- No publication, commit, push, authentication, credential flow, or remote mutation is authorized.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:013qELJg4u42Xe8aqGJN7Vbgk4jyLaCIA4gQmAUIWQk
