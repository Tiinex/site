# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.decision.v1](../../src/schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-06 14:58:21
  - Trace: [023-3-1-1-1-1-1-anchor-major-012-pointerless-carrier-semantic-return-reconciliation-decision.trace.md](023-3-1-1-1-1-1-anchor-major-012-pointerless-carrier-semantic-return-reconciliation-decision.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-anchor-major-012-pointerless-carrier-semantic-return-reconciliation-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 14:58:34
  - Authors: Anchor
  - Why: Major 012 now has a clean Axiom semantic disposition for pointerless Workspace carriers and an already-qualified Loom foundation; the remaining work is one bounded shared Tooling plus thin VS Code implementation follow-through before canonical Docs completion and Sigma dogfood.
  - Summary: Route the accepted two-mode carrier semantics plus the full native human-operator acceptance surface to Loom for one final bounded implementation and qualified return.
  - Status: ready/local

---

# Major 012 Final Native VS Code Operator Follow-Through — Anchor To Loom

## Handoff Parties

- Purpose: complete the final bounded Major 012 shared Tooling and `Tiinex/vscode` implementation tranche against the accepted Axiom two-mode carrier semantics and the full human-operator acceptance surface, then return qualified implementation evidence to Anchor without closing the Major or inventing canonical semantics.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- major-012-final-operator-implementation
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify the remaining Major 012 shared core plus native VS Code operator surface described below, preserving the existing qualified foundation and consuming the exact Axiom pointerless-carrier decision without redefining its meaning.
  - Controlling Artifact: [Anchor semantic-return reconciliation](023-3-1-1-1-1-1-anchor-major-012-pointerless-carrier-semantic-return-reconciliation-decision.trace.md)
  - Boundary: implementation and technical qualification only; canonical schema meaning, Major closure, and human product acceptance remain outside Loom authority.

- qualified-return-to-anchor
  - Transfer Kind: work
  - Description: return one canonical Loom-to-Anchor Handoff with exact changed source, test/VSIX receipts, fail-closed unresolved dependencies, and any concrete semantic contradiction that prevents completion.
  - Boundary: no remote publication or Major closure is implied by the return.

## Required Context

- accepted-pointerless-carrier-semantics
  - Material: Axiom decision defining the exact two-mode `tiinex.handoff.package.v1` delta.
  - Material Reference: [Axiom pointerless carrier decision](023-3-1-1-axiom-pointerless-handoff-carrier-mode-semantics-decision.trace.md)
  - Purpose: sole semantic boundary for Handoff-carrier versus pointerless Workspace-carrier behavior.
  - Availability: available

- anchor-semantic-return-reconciliation
  - Material: Anchor acceptance and sequencing of the Axiom semantic return.
  - Material Reference: [Anchor semantic-return reconciliation](023-3-1-1-1-1-1-anchor-major-012-pointerless-carrier-semantic-return-reconciliation-decision.trace.md)
  - Purpose: establishes the operative implementation scope and remaining canonical follow-through boundary.
  - Availability: available

- human-operator-acceptance-refinement
  - Material: prior Anchor reconciliation of Loom's foundation against Sigma operator acceptance requirements.
  - Material Reference: [Major 012 operator acceptance refinement](023-3-anchor-major-012-loom-return-and-operator-acceptance-reconciliation-decision.trace.md)
  - Purpose: supplies the accepted diagnostics, Quick Fix, Git policy, branch, authoring, package-builder, and settings requirements.
  - Availability: available

- prior-loom-foundation-evidence
  - Material: qualified Loom implementation evidence for the existing Site landing-plan seam and thin VS Code foundation.
  - Material Reference: [Prior Loom implementation evidence](023-2-1-loom-major-012-vscode-operator-implementation-evidence.trace.md)
  - Purpose: preserve and extend the already-qualified implementation rather than rebuilding or widening it unnecessarily.
  - Availability: available

- controlling-major-task
  - Material: Major 012 VS Code Human Operator Bridge Task.
  - Material Reference: [Major 012 controlling Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: preserves the utility-Major objective, exclusions, and thin-interface architecture.
  - Availability: available

- current-handoff-package-authority
  - Material: current maintained `tiinex.handoff.package.v1` contract carried in Docs.
  - Material Reference: [Current Handoff Package schema](docs::.topics/.schemas/coordination/handoff/package/tiinex.handoff.package.v1.schema.md)
  - Purpose: baseline canonical contract; consume together with the accepted Axiom delta and do not silently weaken current exact-route behavior.
  - Availability: available

## Reference Context

- current-handoff-authoring-contract
  - Material: current `tiinex.handoff.v1` Artifact Creation Contract.
  - Material Reference: [Current Handoff schema](docs::.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Purpose: native Handoff authoring must use this shared creation/validation boundary rather than a VS Code-specific artifact grammar.
  - Availability: available

## Retained Responsibilities

- major-012-reconciliation-and-closure
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: independently review Loom's return, route any remaining canonical Docs follow-through, decide Sigma dogfood readiness, and decide Major closure.

- canonical-schema-materialization-and-semantic-review
  - Retained By: Axiom
  - Retained By Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)
  - Responsibility: materialize/review canonical Docs semantics when the accepted pointerless delta reaches the canonical follow-through step or if Loom returns a concrete contradiction.
  - Boundary: exact implementation of the accepted delta does not require Loom to invent or own canonical schema meaning.

- human-operator-observation
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)
  - Responsibility: bounded human UX observation after Anchor technical/canonical qualification; Sigma is not a technical or semantic acceptance authority merely by operating the extension.

## Exclusions And Dependencies

- canonical-pointerless-docs-follow-through
  - Kind: unresolved-dependency
  - Description: the accepted Axiom decision defines the pointerless Workspace-carrier delta, but maintained canonical Docs text has not yet been materialized. Loom should implement the shared mechanics against the exact decision, while actual pointerless manufacture remains fail-closed until canonical qualification accepts the mode.
  - Responsible Party Or Role: Anchor for sequencing; Axiom for canonical semantic materialization.

- no-vscode-semantic-fork
  - Kind: excluded-scope
  - Description: VS Code must remain a thin host adapter. Any logic meaningful to CLI/LLM/Viewer or required to validate/author/manufacture Tiinex material belongs in shared core/tooling rather than extension-local semantic code.

- no-broad-product-expansion
  - Kind: excluded-scope
  - Description: do not turn this tranche into general Viewer replacement, provenance-extension migration, a generic artifact studio beyond the Handoff creation PoC, destructive Reduction apply, Playthings transfer, Pages/deployment/release work, or Foundation exit.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one qualified Loom implementation tranche where the accepted native operator flows are implemented or each remaining blocker is explicit and fail-closed, with permanent tests, installable VSIX evidence, and exact shared-core versus VS Code ownership preserved.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Loom may change canonical Handoff/Handoff Package meaning, pointerless transport becomes a Handoff, package membership creates From/To/current-work authority, a successful VSIX closes Major 012, or optional Git publication is allowed to bypass explicit policy and safety checks.
- Must Not Be Used To Claim: Sigma acceptance, Windows certification, canonical Docs landing, remote publication, deployment/release readiness, destructive authority, or completion of later Viewer/schema-parity work.
- Authority Limits: Axiom owns canonical semantic meaning; Loom owns bounded shared implementation qualification; Anchor owns architecture/reconciliation/closure; Sigma supplies later human observation.
- Transport Limits: Handoff/package transport remains non-authoritative for endpoint, transfer, acceptance, completion, and Role-holder semantics.

### Required implementation acceptance surface

- Diagnostics: native VS Code diagnostics must select the applicable qualified validator(s) for the artifact being viewed and place Error/Warning diagnostics on the most precise supported document line. If a validator cannot deterministically locate a line, preserve that limitation rather than fabricate one.
- Quick Fixes: expose deterministic Code Actions for bounded hygiene, prioritizing envelope/reference/footer/checksum repair where shared Tooling can prove the exact repair. Never hide semantic rewriting or LLM-only guesses behind a Quick Fix.
- Settings: keep one compact Tiinex settings family with sensible Handoff/Git groupings. Safety invariants are fixed behavior, not toggles. All mutating/automatic policies default to the least destructive value.
- Discovery: support `manual` and opt-in `auto` Handoff package discovery with an explicit inbox override and conservative partial-download/debounce behavior.
- After landing: independent `commit = no | ask | yes` and `push = no | ask | yes` policies, both default `no`. Push is eligible only for the exact successful landing-created commit on the already configured current upstream; never force-push, invent upstream, push unrelated ahead commits, or silently broaden publication.
- Branch safety: before any content write, preflight all target repositories. If a package Workspace expects a different operational branch/ref, offer an explicit safe switch. Declining or failing any required switch aborts the whole landing before source replacement.
- Open Handoff: `no | ask | yes`, default `no`; when an exact selected Handoff route exists, open the authoritative Handoff artifact after successful landing according to policy. Pointerless Workspace carriers have no Handoff target to open.
- Native Handoff authoring: provide a first-class native VS Code command/panel flow that creates a `tiinex.handoff.v1` artifact through shared schema Artifact Creation Contract, authoring, validation, Parent/reference, and integrity/sealing mechanics. The operator must not manually write Markdown, envelope, or footer/checksum. From/To and transfer semantics are editable only in this Handoff-authoring flow.
- Native package builder: provide a first-class native package UX, not tasks.json or operator-run scripts. Present only currently qualified Handoff leaves as route candidates; always offer explicit `No Handoff pointer`; display selected Handoff From/To read-only; allow explicit Workspace inclusion; preview the exact carrier/landing-relevant plan; invoke shared Tooling manufacture.
- Workspace snapshot choice: the operator may choose which qualified Workspaces are included. `.git`, gitignored/runtime-generated material and prior generated carrier ZIPs may be excluded when the shared complete-snapshot profile already treats them as out-of-source. Do not offer arbitrary tracked-source exclusion that would falsify `Coverage: complete`; fail visible or require another authorized representation contract instead.
- Pointerless manufacture: implement the Axiom two-mode contract in shared Tooling, but until canonical Docs follow-through qualifies it, the VS Code `No Handoff pointer` manufacture action must fail closed with a clear semantic-dependency message rather than emit a nonconforming package.
- Existing Git UX: retain native Generate Tiinex Commit Message and explicit Stage/Commit/Push. Commit-message derivation remains one shared algorithm; VS Code should fill native SCM surfaces rather than duplicate derivation logic.
- Multi-root and safety: preserve explicit repository identity matching, clean-tree checks except qualified ignored-local preservation, path traversal rejection, collision visibility, one clear pre-write confirmation across affected repositories, and no inference from editor focus/cwd.
- Qualification: add permanent shared-core and extension tests for the above modes and failures, and produce one installable byte-deterministic VSIX suitable for Anchor review and later Sigma dogfood.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-anchor-major-012-pointerless-carrier-semantic-return-reconciliation-decision.trace.md](023-3-1-1-1-1-1-anchor-major-012-pointerless-carrier-semantic-return-reconciliation-decision.trace.md)
  - Value: BTr1D7dVTQS8YhxKKjSfm5kT9Bwq5ux2pORGuXMWRv4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: QXuVEvq9t95rh5--eSmZZh43sJ_NsdgumlhhnVSxl80