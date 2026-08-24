# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 09:05:00
  - Authors: Anchor
  - Why: Preserve Q's design feedback that integrity repair is a trust-sensitive lineage process rather than a checksum search-and-replace, and that the same portable repair foundation should later support Viewer and VS Code human workflows without fabricating publication provenance.
  - Summary: Lineage integrity repair must preserve authored body content, treat mismatches as review flags, distinguish missing backfill from stale/mutated Parent truth, update truthful Parent publication locators only when qualified, and expose adapter-neutral repair opportunities for future Viewer/VS Code surfaces.
  - Status: draft/local

---

# Lineage integrity repair, publication permalink, and human adapter workflow feedback

## Observed Signal

- Q identified that a future lineage repair path must not become a blind checksum refresh: mismatches are trust-impacting signals, repair can cascade through descendant self digests, and broad textual rewriting can damage Markdown representation even when hashes are mathematically correct.
- Q also identified the intended human path: Viewer should eventually surface repair/permalink opportunities on imported Handoff/workspace material, with VS Code later reusing the same portable operation and remote GitHub write remaining a separately authorized capability.

## Source

- Source: Q actual-path design discussion during the Site Tooling cold-start trust campaign on 2026-08-24.
- Source: direct review of current Root/c14n-v2 semantics and the already-materialized Tooling 019 Parent-target creation gap.

## Interpretation

- The repair problem is a process/trust workflow, not a search-and-replace operation.
- Portable Tooling should own exact integrity inspection, planning, structure-preserving local mutation, and adapter-neutral projections; human surfaces should consume those results rather than reinterpret integrity rules.
- Publication locator repair is only legitimate when exact published Parent representation identity is independently qualified.

## Feedback Target

- Target: Parent-bearing Tiinex artifact creation, lineage integrity inspection/repair planning, future local repair application, and human repair adapters that consume the same portable Tooling foundation.
- Target: existing [Tooling 019](../../tooling/dogfood/019-parent-target-v2-continuity-integrity-emission-and-validation-closure.trace.md) plus planned Tooling 020/021/022 repair capabilities.

## Feedback Received

- Current Parent-bearing artifacts broadly lack a v2 Parent target-self-digest entry, so creation must be fixed prospectively and existing current representations need a deliberate migration/repair path.
- Repair is not equivalent to recomputing every checksum. A digest mismatch is evidence that the resolved Parent snapshot differs from the snapshot the child records and must be surfaced as a trust-impacting flag before any refresh.
- A repair may cascade: changing one artifact's footer changes its primary self digest, so descendants that intentionally bind to that exact Parent snapshot may require a subsequent Parent-target update.
- Cascade mechanics do not create semantic approval. Each affected child should expose an explicit repair disposition or qualified policy explaining why the Parent representation change does or does not affect the child's semantic claims.
- For the current Tiinex lineage, Q is provisionally comfortable with a bounded migration/backfill when review confirms that semantic truth did not change and the defect is representation/integrity plumbing rather than Parent meaning.
- Integrity repair should primarily mutate only Root header/envelope fields explicitly targeted by the repair and the `# Continuity Integrity` footer. Unrelated body prose, headings, lists, dividers, blank-line structure, schema-specific sections, and human-authored formatting should remain byte-stable where no qualified repair targets them.
- Broad grep/sed/regex-style rewriting is not an acceptable normal repair path when structure-aware editing is possible. Canonical full rerendering and integrity repair are separate operations.
- Parent integrity verifies the already-declared Parent; it must not invent Parent from chronology, dimensions, filename adjacency, repository layout, or Viewer preference.
- Missing Parent-target integrity may be a backfill candidate after exact Parent resolution. An existing Parent-target mismatch is a trust flag and should not be automatically refreshed.
- When a qualified immutable `browse + git` permalink for the exact Parent representation exists, a repair may propose updating the Parent Origin/target locator where canonical policy permits/requires it. When no truthful immutable locator exists because the Parent is unpublished, tooling must not fabricate publication provenance.
- Portable Tooling should expose read-only integrity inspection and repair planning before mutation. Plans should show exact Parent/digest state, publication-locator state, expected header/footer-only mutation, cascade impact, required approval/disposition, and blockers.
- Repair application should consume an explicit approved plan/disposition and emit receipts with old/new Parent targets, old/new self digests, publication locator updates, affected descendants, unresolved blockers, and body-preservation evidence.
- Viewer is the preferred first human surface for the workflow because it already discovers artifacts, sources, Handoff packages, and lineage context. VS Code should later reuse the same underlying portable operation rather than implement a second repair algorithm.
- Initial human adapters may remain local/export based: preview repair -> apply to local workspace -> user downloads/copy-merges -> commits/pushes through the existing publication workflow. A future higher-access adapter may request explicit authentication/authorization for GitHub mutation, but remote write is not implied now.
- Historical `ai-provenance` quick-fix tooling may be inspected as prior art if available, but it is not presumed current, schema-correct, or authoritative.

## Disposition

- State: accepted-for-tooling-planning
- Follow-Up: preserve this feedback as the product/trust boundary for Tooling 020 read-only repair planning, Tooling 021 approved structure-preserving repair application, and Tooling 022 adapter-neutral human repair projection.
- Follow-Up: keep semantic Parent/Origin contract changes, Viewer/VS Code UI implementation, authentication/access policy, and remote GitHub writes outside the current Loom implementation leaf.

## Limits

- This feedback does not change Root, c14n-v2, Source, publication, access-level, Viewer, or GitHub adapter semantics by itself.
- Q's provisional comfort with current-lineage cascade/backfill is not a universal policy that all future mismatches are harmless.
- A matching checksum proves representation equality for the qualified target; it does not prove semantic Parent correctness or publication authority.
- Prior-art tooling may inform implementation but must not override current canonical contracts.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:-crHM-L4OHQS17eRNVWUHuDcBO1WXDTv4QJ9KVYeEjo
