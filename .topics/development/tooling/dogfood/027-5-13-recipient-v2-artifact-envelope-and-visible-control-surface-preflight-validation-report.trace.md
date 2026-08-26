# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.validation.report.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/validation/report/tiinex.validation.report.v1.schema.md)
  - Created At: 2026-08-25 15:24:00
  - Authors: Anchor
  - Why: Preserve the stricter serialized-artifact preflight that quarantined the first Anchor-manufactured flat-v2 Sigma specimen even though topology, roundtrip, orientation, context carriage, and package-level qualification were green.
  - Summary: The 027-5-13 candidate proved the flat carrier shape and exact-byte path but was withheld because its visible Workspace External Payload artifact embedded a very large manufacture-internal transport correlation key; standalone Workspace invalidity was separately classified as duplicate schema-provider ambiguity rather than bad Workspace bytes, and generated footer spacing was normalized before a new specimen.
  - Status: blocked-candidate/quarantined/local

---

# Tooling 027-5-13 recipient-v2 artifact-envelope and visible-control-surface preflight

## Report Scope

- Scope: the exact serialized bytes of the first Anchor-manufactured 027-5-13 flat recipient-facing v2 audit specimen after the 027-5-12.2 performance repair, including root topology, generated Tiinex artifact envelopes, carried Workspace bytes, ZIP payload ownership, orientation, context audit, and exact-byte roundtrip.
- Targets: determine whether the actual recipient-visible artifact surface is suitable for Sigma personal audit without relying only on in-memory carrier projections or package-level ready state.
- Workspace: Tiinex/site reconstructed full working state with the exact qualified `.topics/.workspaces/tiinex-site.workspace.md` target and the 027-5-13 Sigma audit Handoff.
- Time Window: Anchor preflight immediately after successful 027-5-13 manufacture on 2026-08-25; candidate was never delivered to Sigma.

## Validation Methods

- Methods Used: open the physical ZIP; enumerate exact root entries; hash and deterministically reserialize received bytes; run recipient-v2 inspection, orientation, and context audit in separate processes; extract every visible Markdown artifact; verify c14n-v2 self integrity; run available schema validation; isolate the carried Workspace against the canonical Workspace schema after generic provider ambiguity; inspect generated Pointer, External Payload, and Relation shapes against their pinned canonical schema contracts; inspect visible facts for human-readable semantic/control-surface boundaries.
- Method Boundaries: child-specific standalone validators for `tiinex.pointer.v1` and `tiinex.external.payload.v1` were not available to the generic local `validate-draft` material set, so those shapes were checked through the recipient-v2 inspector plus exact pinned canonical contracts; no fresh LLM cold-start and no Sigma product audit were performed.
- Human Review: Anchor performed the additional artifact-envelope/control-surface review after Sigma had earlier established that the actual ZIP root, not an internal projection, is the product surface to audit.

## Findings Summary

- Summary: package topology and exact serialized-byte mechanics pass, and the carried Workspace bytes themselves validate cleanly against the canonical Workspace schema. The candidate is nevertheless blocked because one visible External Payload artifact serializes manufacture-internal correlation control metadata at enormous size, defeating the intended readable semantic surface. A secondary readability issue collapses canonical whitespace after footer `Value:` even though the c14n-v2 parser verifies the digest.
- Overall State: FAIL-BLOCKED — quarantine 027-5-13 and correct the visible semantic/control boundary before Sigma delivery.
- Pass Count: 5
- Warning Count: 2
- Fail Count: 1
- Skipped Count: 1
- Unavailable Count: 1

## Finding List

- Findings:
  - PASS — the physical outer ZIP is flat and contains only the eight intended Tiinex Markdown/payload entries; rejected legacy `context/`, `handoff.workspaces/`, `tiinex.bootstrap/`, `tiinex.package/`, and opaque `handoff-entrypoint-*` surfaces are absent.
  - PASS — recipient-v2 inspection, selected-Handoff qualification, orientation, context audit, and exact deterministic serialized-byte roundtrip are clean; roundtrip reproduces the exact original ZIP bytes and digest.
  - PASS — all generated recipient artifacts have verified c14n-v2 self integrity, and the visible Workspace representation Relation qualifies against its exact contract.
  - PASS — the carried `tiinex-site.workspace.md` has structurally valid Root shape, verified c14n-v2 self integrity, and validates cleanly with zero findings when the canonical `tiinex.workspace.v1` schema is selected explicitly.
  - PASS — the earlier generic Workspace `portable.schema-provider.material.ambiguous` finding is validation-context ambiguity caused by two equally ranked Workspace schema representations in the full working tree; it is not a defect in the carried Workspace bytes and must not be reported as such.
  - WARNING — generic standalone child-validator material is unavailable for the generated Pointer and External Payload schemas in this local validation path. Their required canonical sections/fields, visible-to-sealed-fact correlation, root conformance, and self integrity are enforced by recipient-v2 inspection, but this does not convert an unavailable standalone child validator into a claimed pass.
  - WARNING — generated recipient artifacts render `Value:<digest>` without the canonical readable space shown by maintained Tiinex schema artifacts. The parser verifies this representation, but new manufacture should emit `Value: <digest>` consistently.
  - FAIL — `001-2-tiinex-site-workspace-payload.trace.md` is roughly 717 KB because its visible facts serialize the full manufacture-internal `transportCorrelationKey`, including a huge entry-correlation object. This is disposable transport-control metadata rather than Workspace/archive semantic truth, makes a supposedly readable External Payload artifact effectively a machine dump, and violates the accepted recipient-facing control-surface boundary.
  - UNAVAILABLE — no claim is made that generic local validation can execute every child-specific canonical validator from the extracted artifact alone; validation availability and artifact correctness remain separate states.
  - SKIPPED — Sigma personal audit and fresh recipient cold-start are intentionally blocked until a corrected physical specimen passes this preflight.

## Run Boundary

- Run Context: exact quarantined 027-5-13 specimen at `/mnt/data/tiinex-site-027-5-13-flat-recipient-v2-audit-specimen.zip`; extracted bytes and validation receipts are local Anchor evidence and are not an accepted user-facing carrier.
- What Was Not Checked: no v2 default activation, no remote publication, no fresh recipient dialog, no Sigma acceptance, and no claim that historical package-wide continuity debt has been repaired.
- Incomplete Checks: a new corrected physical specimen must be manufactured and the same serialized-byte/artifact-envelope checks rerun after the visible-control correction.

## Interpretation Limits

- Does Not Prove: that the 027-5-13 candidate is acceptable merely because package-level tooling returned ready, or that a generic validator ambiguity means the Workspace bytes are invalid.
- Must Not Hide: the candidate was internally green at package level but still quarantined by stricter recipient-surface review; the full transport correlation metadata leak is a real visible-surface blocker; Pointer/External Payload standalone child validation was unavailable rather than silently passed.
- Open Risks: the correction must preserve exact Workspace/archive/route qualification and v1 isolation while removing only the visible transport-control leak and normalizing newly generated footer readability.
- Follow-Up Needed: remove manufacture-internal correlation metadata from visible semantic artifacts, reconstruct any recipient-local provider correlation from already qualified visible identity facts in memory, normalize generated c14n-v2 Value spacing, rerun focused and regression gates, then manufacture a new numbered Sigma specimen rather than rewriting 027-5-13 history.

## Related Artifacts

- Preceding packaging closure decision: [Tooling 027-5-12.2 Anchor packaging-closure performance repair and acceptance](027-5-12-2-anchor-packaging-closure-performance-repair-and-acceptance.trace.md). This is process/evidence lineage only; no Parent is declared because the local predecessor has no truthful published `browse + git` Parent-origin authority to carry in a Root-conformant Parent envelope.
- Ownership transition: [Anchor packaging-closure ownership takeover](027-5-12-1-anchor-packaging-closure-ownership-takeover-decision.trace.md).


# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Vt7joNL8NUwPULYZLQWR_2dM47wZrI6xxshQL5gImOk
