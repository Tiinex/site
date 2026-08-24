# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 09:08:00
  - Authors: Anchor
  - Why: Preserve the mutation boundary that must follow read-only integrity planning: repair only approved header/footer integrity/provenance surfaces, reseal descendants deterministically, and never normalize unrelated authored representation as a side effect.
  - Summary: Tooling 021 — approved lineage integrity repair application, topological resealing, representation preservation, and repair receipts.
  - Status: blocked/local

---

# Tooling 021 — approved lineage integrity repair application and representation preservation

## Objective

Implement deterministic local repair application over an explicit qualified Tooling 020 repair plan. The operation must mutate only approved Root header/provenance fields and Continuity Integrity footer entries, preserve unrelated authored artifact bytes/structure, reseal affected descendants in topological order when individually approved, and produce a complete repair receipt. A mismatch is never silently treated as harmless.

## Done Criteria

- Accept an explicit repair plan plus per-artifact approval/disposition; reject ad-hoc "repair everything" requests that bypass the plan state.
- Separate repair classes: missing Parent-target backfill, stale/mismatching Parent-target review, self reseal caused by approved footer/header change, qualified Parent Origin/permalink update, and unsupported/blocked semantic cases.
- Require an explicit harmless/representation-only disposition (or another qualified semantic decision) before refreshing a mismatching Parent target. Missing-backfill may use a narrower approval policy only when Tooling 020 proves exact Parent identity and no contradictory target evidence.
- Apply cascade in root-to-leaf/topological order. Each approved child binds to the newly verified primary self digest of its declared Parent; unapproved or blocked descendants stop the affected branch and are reported rather than silently rewritten.
- Preserve body content and unrelated representation. Normal mutation is restricted to the explicitly approved `Continuity Context` Parent/Origin/Repairs surface and `# Continuity Integrity` footer. Existing schema-specific body sections, prose, headings, dividers, blank lines, list formatting, and unrelated header fields must remain unchanged.
- Use structure-aware editing. Broad grep/sed/regex replacement that can duplicate/remove dividers, headings, blank lines, or unrelated content is not an accepted normal implementation.
- Provide a representation-diff guard: if the actual mutation extends outside the qualified header/footer surface, fail closed unless a separate explicit representation-migration authority is supplied.
- Compute external Parent target values first, render fixed footer entries, and compute the artifact's primary self seal last. Preserve sibling footer entries exactly unless the plan explicitly repairs them.
- When an exact qualified immutable Parent publication locator is available and the approved plan calls for it, update the canonical Parent Origin/target locator consistently. Never fabricate a commit/permalink for unpublished material.
- If current Root semantics require a publication locator that cannot truthfully exist for an unpublished Parent, block that repair and surface the semantic gap rather than inventing provenance.
- Emit a machine-readable and human-readable receipt for every touched artifact: path/identity, repair class, reason/disposition, old/new header targets, old/new Parent target digest, old/new self digest, descendants considered, mutation range/surface, body-preservation check, and remaining blockers.
- Add adversarial formatting fixtures: multiple blank lines, dividers adjacent to body/footer, existing multiple integrity entries, long nested lists, Parent + Origin variants, absent footer, malformed footer, and arbitrary body text that must remain byte-identical.
- Prove idempotence: reapplying the same accepted repair to an already repaired lineage produces no content change and a no-op/healthy receipt rather than footer duplication.
- Do not mutate remote systems. Output repaired local material/changeset suitable for the human merge/publish workflow.

## Scope

Local approved mutation, structural header/footer editing, topological resealing, exact representation preservation, repair receipts, idempotence, adversarial formatting tests, and local changeset output.

Out of scope: deciding semantic impact of a mismatch, Root/schema mutation, automatic remote publication, GitHub authentication, Viewer/VS Code UI, generic canonical formatting, rewriting historical commits, or inferring missing Parent identity.

## Dependencies

- Tooling 019 accepted prospective creation integrity.
- Tooling 020 accepted read-only inspection and repair-plan contract.
- [Lineage repair and human adapter feedback](../../architect/continuity/001-31-lineage-integrity-repair-publication-permalink-and-human-adapter-workflow-feedback.trace.md)
- [Unpublished Parent Origin semantic gap](../../architect/continuity/001-31-1-unpublished-parent-origin-truthfulness-and-canonical-requirement-gap.trace.md) remains a blocker where truthful locator requirements cannot be met.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:0k2zCHpRme_WWrtPzoHs2nQB3R0iizXAHA7h_LE1118
