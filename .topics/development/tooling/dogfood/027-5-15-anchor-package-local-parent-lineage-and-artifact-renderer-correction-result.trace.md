# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 17:05:00
  - Authors: Anchor
  - Why: Land the Anchor-owned recipient-v2 correction after Sigma demonstrated that 027-5-14 lacked actual package-local Parent lineage and exposed non-canonical artifact representation, while also preserving the newly discovered shared artifact-renderer debt without expanding this closure into an unrelated broad refactor.
  - Summary: Recipient-v2 now generates one truthful package-local Parent tree mirrored by numeric pathing, verifies every Parent target and leaf-to-root traversal, preserves exact durable Workspace bytes inside the archive, restores canonical Root links and body/footer dividers, and corrects the shared generic artifact renderer/parser boundary; older schema-specific materializer representation drift is retained as separate debt rather than hidden or opportunistically rewritten.
  - Status: implementation-complete/final-specimen-qualification-pending/local

---

# Anchor package-local Parent lineage and artifact renderer correction result

## Decision

- State: accepted implementation / final physical specimen qualification pending.
- Subject: recipient-v2 package-local lineage, artifact-envelope representation, and bounded shared artifact-renderer correction.
- Decision: retain the corrected recipient-v2 topology and shared generic creation representation changes. Generated package-local Markdown nodes declare Parent continuity that mirrors their numeric path dimension; exact durable Workspace source bytes remain unchanged inside the Workspace archive; current/default v1 remains unchanged.
- Operative Tree: `001` package root; `001-1` READ, `001-2` bootstrap, and `001-3+` Workspace nodes are root children; selected route Pointer is a child of its Workspace; optional cache is a child of that Pointer. ZIP companions share their owning Markdown node's numeric dimension and are not independent Markdown lineage nodes.

## Basis

- Sigma's 027-5-14 old-Site-PoC exercise showed that opening any generated artifact immediately reached a lineage root because the generated artifacts declared no Parent.
- Sigma clarified that this carrier intentionally creates one package-local Parent tree and mirrors it in numeric pathing; filenames remain non-authoritative by themselves, but divergence between the generator-owned Parent tree and path projection is a defect.
- Maintained Tiinex schema artifacts supplied by Sigma also exposed representation drift: generated carrier Markdown lacked the canonical body/footer horizontal divider and did not consistently use exact maintained schema links where authority was available.
- The shared generic artifact creation renderer had the same missing body/footer divider, and the production Markdown parser initially treated the newly restored divider as body content. Both shared surfaces were corrected together so generated canonical representation does not corrupt section input-fidelity semantics.

## Corrected Carrier Model

```text
001-<handoff-package>.trace.md
├─ 001-1-READ-BEFORE-PROCEEDING.trace.md
├─ 001-2-bootstrap.trace.md
├─ 001-2-bootstrap.zip
├─ 001-3-<workspace>.workspace.md
├─ 001-3-<workspace>.workspace.zip
└─ 001-3-1-handoff-pointer.trace.md
```

```text
001 package root
├─ 001-1 READ                         Parent -> 001
├─ 001-2 bootstrap node               Parent -> 001
└─ 001-3 Workspace node               Parent -> 001
   └─ 001-3-1 selected Handoff Pointer Parent -> 001-3
```

- Each generated Markdown Parent trace resolves to an actual sibling/root package artifact.
- Each generated Parent-bearing artifact contains one non-self c14n-v2 entry whose value equals the resolved parent's validated primary v2 self digest, plus its own primary self entry computed last.
- Recipient inspection compares numeric parent dimension with declared Parent trace and traverses each generated Markdown node to exactly one package root.
- The READ artifact uses `001-1-*` so common lexical Explorer ordering exposes orientation before later numbered material without making sort order semantic authority.

## Durable Workspace Boundary

- The visible `001-3-<workspace>.workspace.md` is a newly generated package-local `tiinex.workspace.v1` carrier node and may truthfully have the package root as Parent because it did not exist before the disposable carrier.
- The exact durable source Workspace artifact is not rewritten. Its original bytes, continuity envelope, self integrity, and provenance remain inside `001-3-<workspace>.workspace.zip` at the exact declared inner path.
- The package-local Workspace node binds the visible archive payload to Workspace identity/materialization facts while keeping the historical durable Workspace representation distinct.

## Artifact Representation Correction

- Recipient-v2 generated artifacts now begin with exact maintained Root schema links where available.
- Generated bodies use the canonical envelope/body `---` and body/footer `---` boundaries.
- c14n-v2 self integrity is recomputed after final representation assembly.
- The shared generic artifact creation renderer now emits the same canonical body/footer divider.
- `parseArtifactMarkdown` recognizes that canonical footer divider as a representation boundary instead of leaking it into the body text; creation input-fidelity regressions V455-V461 and Parent-target V482 pass after this correction.

## Package-Local Parent Origin Limitation

- Canonical Root currently requires a `browse + git` Parent Origin whenever Parent exists.
- These recipient-v2 Parent artifacts are newly generated disposable package-local representations and have no truthful commit-pinned remote artifact representation at manufacture time.
- The generator therefore emits the truthful package-relative Parent Trace and relative Origin and does **not** fabricate a GitHub permalink. Recipient-v2 conformance carries one explicit scoped allowance only for the unavailable `Parent Origin: browse + git` field while independently requiring exact Parent resolution and Parent-target c14n-v2 verification.
- This is a bounded authority gap between current Root publication-oriented Parent recovery requirements and truthful unpublished disposable package-local lineage. It must not be hidden or generalized into a waiver for ordinary durable artifacts.

## Acceptance Evidence Before Final Specimen

- `src/tooling/portable/handoff/archiveCarrierV2.test.mjs`: PASS after Parent/pathing/representation correction.
- Downstream material closure, current/v1 manufacture, carrier projection, Pointer, cold-consumer, Tooling 026 cold-start, context audit, multi-root, 1,286-workspace scale, human-output, transport companion, bootstrap, and CLI suites: PASS in the retained corrected state.
- Creation acceptance V455, V456, V457, V458, V459, V460, V461, and V482: PASS after canonical-divider/parser correction.
- Artifact parser, validation pipeline, lineage resolve/traverse: PASS.
- Architecture shape, browser import boundary, schema bindings: PASS.
- TypeScript `tsc -p tsconfig.json`: PASS after final shared-parser correction.
- Static discipline: exactly five retained historical oversized-source findings; no new recipient-v2 source-size finding after lineage-inspector extraction.

## Historical Artifact-Tooling Debt

- Audit found older schema-specific local materialization paths that may still emit older envelope/footer forms such as bare schema references, missing footer dividers, older Parent shapes, or incomplete Parent-target continuity treatment.
- This tranche corrects the shared generic creation renderer because its drift was directly exercised by the same canonical-representation defect.
- Older schema-specific materializers are retained as explicit follow-up debt. They are not silently normalized inside transport and are not allowed to expand Tooling 027-5 into a broad unrelated authoring refactor before the carrier cold-start gate.

## Consequences

- 027-5-14 remains rejected human-audit evidence and must not be used for fresh cold-start qualification.
- 027-5-14-1 remains immutable but its over-broad Parent interpretation is superseded by `027-5-14-2`.
- The next physical Sigma specimen must be manufactured from the corrected generator, opened as serialized bytes, and independently checked for exact tree, canonical Markdown boundaries, Parent/path agreement, Parent-target/self integrity, leaf-to-root traversal, selected Handoff, context audit, orientation, and deterministic roundtrip.
- No Loom delegation, remote publication, commit, push, or default-v2 activation is authorized by this result.

## Review Conditions

- Sigma personal audit remains the final human gate before any fresh recipient receives v2.
- A Sigma PASS does not itself activate v2 as default; one true fresh cold-start remains required next.
- Any physical specimen whose generated Markdown cannot traverse from every leaf to the package root by declared Parent is rejected even if ZIP manufacture otherwise reports ready.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: kQkhwVOZ-_VZ2aSxWWCq0YLrRbl5WI68dtR0xopF3Dk