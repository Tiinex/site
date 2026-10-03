# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 21:50:40
  - Trace: [006-3-anchor-adversarial-recovery-integrity-task.trace.md](006-3-anchor-adversarial-recovery-integrity-task.trace.md)
  - Origin:
    - [relative](006-3-anchor-adversarial-recovery-integrity-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 21:51:02
  - Authors: Anchor
  - Why: Probe remaining exact recovery integrity and fail-closed boundaries before considering carrier major 006.
  - Summary: Anchor-to-Loom adversarial recovery-integrity falsification against carrier-major 005, preserving prior controls and requiring root-cause proof before fixes.
  - Status: ready/local

---

## Handoff Parties

- Purpose: adversarially falsify carrier-major 005 recovery integrity at bounded gaps not already covered by the earlier grounding-quality matrix, with explicit root-cause discipline before any implementation change
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- adversarial-recovery-integrity
  - Transfer Kind: work-and-responsibility
  - Description: execute the controlling Tranche C task against the accepted isolated-LLM Tooling baseline, concentrating on exact Parent recovery integrity, fail-closed behavior, bounded operator fallback, decoy resistance, and false-block avoidance that are not already closed by the earlier adversarial matrix
  - Controlling Artifact: [Adversarial Recovery Integrity — Tranche C](006-3-anchor-adversarial-recovery-integrity-task.trace.md)

- root-cause-discipline
  - Transfer Kind: work-and-responsibility
  - Description: treat each adversarial case as a falsification attempt rather than a presumed bug; modify source only after reproducing a defect and establishing the owning layer, root cause, violated invariant, and minimum correction

- bounded-regression-return
  - Transfer Kind: work-and-responsibility
  - Description: preserve existing valid controls, add permanent regression only for general invariants exposed by real failures, run the focused Tooling/Foundation gates after changes, and return exact evidence separating pass-without-change cases from reproduced-and-fixed defects

## Required Context

- controlling-task
  - Material: Adversarial Recovery Integrity — Tranche C
  - Material Reference: [Controlling Task](006-3-anchor-adversarial-recovery-integrity-task.trace.md)
  - Purpose: exact objective, adversarial targets, root-cause discipline, done criteria, and scope boundaries for this tranche
  - Availability: available

- accepted-major-baseline
  - Material: Isolated-LLM Tooling Common-Path Acceptance
  - Material Reference: [Anchor Acceptance](006-2-anchor-isolated-llm-tooling-checkpoint-decision.trace.md)
  - Purpose: accepted carrier-major 005 baseline and the exact common-path claims that must remain true while adversarial recovery behavior is tested
  - Availability: available

- earlier-adversarial-grounding-evidence
  - Material: Grounding Reliability Adversarial Quality — Loom Implementation Evidence
  - Material Reference: [Earlier Adversarial Evidence](005-2-2-1-loom-grounding-adversarial-quality-implementation-evidence.trace.md)
  - Purpose: prior ten-case fail-closed matrix, false-block controls, filename/carrier confusion guard, 2,000-record noise probe, and validated owners; use as controls rather than duplicate work
  - Availability: available

- repeated-parent-recovery-evidence
  - Material: Cold-Start Recovery Dogfood Correction — Loom Implementation Evidence
  - Material Reference: [Recovery Dogfood Evidence](005-2-3-1-1-1-1-loom-cold-start-recovery-dogfood-correction-implementation-evidence.trace.md)
  - Purpose: known second-order repeated-relative-Parent recovery failure and its pinned source-context correction, which this tranche must adversarially requalify rather than assume
  - Availability: available

## Reference Context

- fresh-host-recovery-acceptance
  - Material: Fresh Zero-Precontext Common CLI Acceptance — Loom Evidence
  - Material Reference: [Fresh Recovery Acceptance](005-2-3-1-1-1-1-1-1-1-1-1-1-1-loom-fresh-zero-precontext-common-cli-acceptance-evidence.trace.md)
  - Purpose: prior independent evidence of cumulative exact host-assisted recovery and correct stop/escalation at a pinned 404; useful as a comparison baseline, not a substitute for current adversarial results
  - Availability: available

## Retained Responsibilities

- architecture-and-major-disposition
  - Retained By: Anchor
  - Responsibility: qualify the returned carrier, decide whether observed failures are closed enough to continue toward carrier major 006, and authorize any later major progression

- semantic-authority
  - Retained By: Axiom
  - Responsibility: resolve an actual schema/semantic contradiction if Loom discovers one; no semantic redesign is delegated by default

- human-observation
  - Retained By: Sigma
  - Responsibility: provide human workflow/ergonomics observation only when materially requested; routine TL0 carrier transport is not semantic authorship

## Exclusions And Dependencies

- presumed-bug-fixing
  - Kind: excluded-scope
  - Description: do not infer implementation defects from the adversarial test list; a case that already fails or degrades correctly should be preserved as a passing falsification result, not changed for activity's sake
  - Responsible Party Or Role: Loom

- duplicate-prior-matrix
  - Kind: excluded-scope
  - Description: do not rebuild the previously preserved ten-case adversarial/currentness matrix or 2,000-record noise probe except as regression controls needed to detect a new correction's collateral effects
  - Responsible Party Or Role: Loom

- semantic-invention
  - Kind: unresolved-dependency
  - Description: if a new failure cannot be resolved without defining new authority/recovery semantics rather than enforcing existing contracts, stop that semantic branch and return the contradiction for Axiom instead of inventing meaning in Tooling
  - Responsible Party Or Role: Axiom

- viewer-extension-broad-cli-release
  - Kind: excluded-scope
  - Description: Viewer expansion, Chrome Extension/Host Bridge, semi-automation, broad human-first CLI redesign, publication/release, remote mutation, and carrier-major advancement remain outside this tranche
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns one canonical full-source Business+Docs+Site child carrier with exact Tranche C evidence showing which new adversarial recovery cases already passed, which defects were actually reproduced, their root causes and minimum fixes/regressions if any, and the post-change focused/Foundation qualification state
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: every adversarial case is expected to fail, universal host/provider correctness has been proven, carrier major 006 is authorized, or a broad CLI/Viewer/Extension tranche has opened
- Must Not Be Used To Claim: semantic ancestry from filenames/carrier dimensions, permission to substitute approximate material for an exact Parent, hidden host context as Tiinex authority, or human judgment when exact-byte recovery is merely unavailable
- Authority Limits: Loom owns bounded implementation/testing/evidence; Anchor retains architecture/progression and major disposition, Axiom retains semantic authority, Sigma retains human observation authority, and the Transport Operator retains physical carrier movement

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [006-3-anchor-adversarial-recovery-integrity-task.trace.md](006-3-anchor-adversarial-recovery-integrity-task.trace.md)
  - Value: C1cx9oCIlxwuVMtHTFSNXu4Br7lJ8_1ptYsU951wHIc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gOY9cghsLC-gixjUkSLxFPA3UT5zFa137RPWttnBiNQ