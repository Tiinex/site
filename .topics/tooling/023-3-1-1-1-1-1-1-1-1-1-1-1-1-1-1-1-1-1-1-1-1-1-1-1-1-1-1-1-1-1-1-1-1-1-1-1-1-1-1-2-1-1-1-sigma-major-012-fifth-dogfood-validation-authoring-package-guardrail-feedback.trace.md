# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 23:10:08
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-anchor-to-sigma-major-012-fifth-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-anchor-to-sigma-major-012-fifth-dogfood-handoff.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-anchor-to-sigma-major-012-fifth-dogfood-handoff.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 23:37:11
  - Authors: Anchor
  - Why: Preserve the fifth dogfood correctness defects durably before routing a broader shared-core repair so Sigma is not forced into manual debugging.
  - Summary: Sigma's fifth VS Code dogfood exposed missing permalink, Parent-integrity, endpoint-selection and Workspace-identity guardrails despite native UI progress.
  - Status: ready/local

---

# Major 012 Fifth Dogfood — Validation, Authoring And Package Guardrail Feedback

## Observed Signal

- Sigma's fifth native VS Code dogfood showed meaningful operator progress, but the candidate still permits structurally inconsistent artifacts to appear clean and asks for endpoint identity through free text where qualified Party/Role material is already available.
- The generated Handoff path mixed schema-reference conventions: `Current Schema` could be emitted as a commit-pinned canonical schema reference while `Envelope Schema` remained a plain schema identifier, yet native diagnostics reported no problem.
- Quick Fix could reseal a local self footer while leaving unresolved schema-reference and Parent/integrity guardrails outside the fix, creating a misleading clean state.
- Parent-target integrity was not reliably checked against the actual Parent through either a truthful relative target or a qualified immutable permalink.
- The Package Builder reached `tiinex.package-builder.workspace-id-ambiguous:docs` when more than one qualified Workspace artifact represented material associated with the same repository, exposing repository-name identity collapse in package selection.

## Source

- Source: Sigma's direct silent-video dogfood observation of Tiinex VS Code 0.1.4 on 2026-09-07, plus Anchor's source audit of the current shared Site editor-assistance, validation/integrity, lineage-repair and Workspace-package-source paths and a bounded comparison against historical `Tiinex/ai-provenance` continuity-validation mechanics.

## Interpretation

- Interpretation: the remaining failure is broader than one VS Code widget bug. The thin host adapter is now invoking shared core correctly enough to expose a gap in the shared validation/audit composition: editor assistance currently validates ordinary artifact shape and self integrity but does not compose all qualified continuity, schema-reference, Parent-target, and workspace-identity guardrails required before presenting a clean artifact or deterministic repair.
- Historical `ai-provenance` is useful implementation evidence because it already demonstrated commit-pinned schema-permalink checks, local multi-root Git resolution, direct Parent coherence, targeted continuity checksum verification, and fail-visible unresolved states. Those mechanics are evidence to harvest, not semantic authority and not a reason to fork current core.

## Feedback Target

- Target: shared Tiinex artifact audit/editor-assistance and package-source projections consumed by the thin `Tiinex/vscode` adapter, plus the native Handoff endpoint authoring projection.

## Feedback Received

- Native validation must automatically combine the active schema contract with qualified continuity/reference/integrity checks rather than declaring clean after only local body/self-footer qualification.
- For ordinary published trace artifacts, canonical schema references should follow current Root publication authority: use immutable canonical locators when available; local/self schema-note cases must retain their separately authorized truthful-relative behavior rather than being over-normalized.
- `Envelope Schema`, `Current Schema`, and `Parent Schema` references must remain mutually coherent with the artifact's actual schema/Parent semantics and should not be rendered with arbitrary mixed conventions.
- If `Parent` is declared, the validator must resolve the Parent where qualified material permits, compare declared `Parent Schema` with the resolved Parent's `Current Schema`, and validate every applicable Parent-target integrity entry against exact Parent bytes. Relative and qualified commit-pinned external recovery paths are both legitimate when current authority allows them.
- Quick Fix must be holistic and deterministic. A self-checksum reseal must not produce a clean result while another qualified reference/Parent/integrity requirement remains broken. Repair all proven related surfaces as one plan or refuse the repair and preserve blockers.
- Findings should anchor to the exact owning field/footer line where possible so native VS Code diagnostics and Code Actions remain understandable.
- Handoff endpoint UX should expose qualified Role or Party selections when `Kind` is `role` or `party`, automatically preserving the corresponding durable reference. Free text should be used only when `Kind: unknown`; no undeclared `other` kind should be invented.
- Package Builder must preserve Workspace artifact identity independently from repository snapshot identity. Multiple qualified Workspace artifacts associated with one repository must remain distinct selectable Workspace choices; physical snapshot reuse/deduplication may be a separate transport concern.
- Regression coverage should use realistic malformed/repairable artifacts representing these exact fifth-dogfood cases rather than only synthetic success cases.

## Disposition

- State: accepted
- Follow-Up: keep Major 012 open and route one broader correctness/guardrail tranche to Loom. Require Loom to first audit the existing shared core and historical `ai-provenance` mechanics, then integrate only the missing host-neutral guardrails into current shared Tooling before rebuilding another VSIX.

## Limits

- Boundary: this feedback does not make `ai-provenance` canonical, does not require network access when qualified local/immutable source material is unavailable, does not require every schema-note self-reference to become a GitHub permalink, and does not authorize guessing unavailable Parent or schema identity.
- Boundary: Sigma is reporting actual-path usability/correctness evidence, not defining new canonical schema semantics. If the current Docs contracts prove insufficient or contradictory, Loom must fail closed and return the semantic gap to Anchor/Axiom rather than invent a rule.
- Boundary: no commit/push or Major 012 closure is requested from Sigma for the 0.1.4 candidate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-anchor-to-sigma-major-012-fifth-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-anchor-to-sigma-major-012-fifth-dogfood-handoff.trace.md)
  - Value: 3hVXmfnjxy167O8d74pq6AX3tsPGw57qvnraUTggDqk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xRkGeC2MTHO-oCW4yyLVOnknMBZkG5_g6InR7Rtd04k