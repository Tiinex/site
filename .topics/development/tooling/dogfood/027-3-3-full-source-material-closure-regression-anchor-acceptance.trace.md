# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 23:16:00
  - Authors: Anchor
  - Why: Independently close the final full-source regression exposed by Tooling 027-3 and authorize the retained workspace/archive semantic classification only after replaying the returned correction against the full working source.
  - Summary: Anchor acceptance of Tooling 027-3-2 — stale material-closure fixtures are corrected behind the fail-closed selected-Handoff gate, full-source replay is green, and Axiom workspace/archive classification may proceed.
  - Status: accepted-bounded/local

---

# Tooling 027-3-2 Anchor acceptance — full-source regression closed

The returned correction is accepted as a bounded test-harness migration. It closes the remaining Tooling 027-3 acceptance blocker without changing production Handoff conformance semantics or activating a new carrier format.

## Decision

- State: accepted-bounded / correction-closed
- Subject: Tooling 027-3-2 full-source material-closure regression correction
- Decision: accept the returned `materialClosure.test.mjs` migration and close the remaining Tooling 027-3/027-3-2 acceptance blocker. The selected-Handoff Root/schema/self/Parent-target fail-closed readiness gate remains controlling and unchanged. The retained Axiom workspace-artifact↔package-local-archive semantic classification may now open.
- Boundary: acceptance covers the returned test-harness correction and independently replayed conformance/static checks only; it does not accept a new carrier representation, resolve workspace/archive semantics, authorize canonical schema mutation, or authorize remote state changes.

## Basis

- The returned current-format package independently orients `ready`; its selected Loom→Anchor Handoff is `tiinex.handoff.v1`, compiled-schema validated, self-integrity verified, and has no invented Parent.
- Diff against the previous accepted working source contains exactly one changed source file, `src/tooling/portable/handoff/materialClosure.test.mjs`, plus the Loom result and return Handoff artifacts. No production conformance implementation file changed in this correction.
- The changed test replaces stale structurally minimal Handoff bytes with independently sealed `qualifiedHandoffFixture(...)` instances, carries the selected Handoff as an actual workspace route byte, and preserves dedicated duplicate-id/true-collision blocking cases rather than weakening ambiguity rules.
- Independent full-source replay passes `materialClosure.test.mjs`, `routeArtifactConformance.test.mjs`, manufacture, carrier projection, Pointer, cold-consumer, Tooling 026 cold-start, context audit, multi-root, scale, human-output presentation, and transport companion regressions.
- Independent static replay passes architecture shape, browser import boundary, schema bindings, and TypeScript. The scale replay remained green at `1,286` workspace carriers and `1,306` package files; timing is observational only.
- The observed Loom completion time for this correction is preserved separately as a local temporal duration annotation rather than mixed into acceptance semantics.

## Consequences

- Stage the returned test-harness correction, Loom result, and Loom return Handoff into the current working source.
- Treat Tooling 027 selected-route artifact conformance/readiness correction as accepted for the bounded carrier audit lineage.
- Open Tooling 027-4 to Axiom for canonical classification of the workspace-artifact to exact package-local archive representation relationship before any production carrier migration.
- Keep Sigma's first-new-format package inspection gate retained; this accepted return is still the current carrier format.
- Keep carrier implementation with Loom and architecture acceptance/routing with Anchor after Axiom returns.

## Review Conditions

- Reopen this acceptance if later full-source replay shows the fixture wrapper masking a production conformance defect, if selected-route grounding can be bypassed without a real carried Handoff byte, or if the migrated duplicate/collision cases cease to exercise their original fail-closed semantics.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:9-phk0q7XjzhJ7nvwJdJhHOKhzDyzr33LHKI1O5QKuk
