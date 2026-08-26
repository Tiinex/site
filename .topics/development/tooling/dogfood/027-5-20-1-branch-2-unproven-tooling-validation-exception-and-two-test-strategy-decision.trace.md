# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 22:05:00
  - Authors: Anchor
  - Why: Preserve Sigma's explicit temporary process exception and the next validation strategy before additional recipient-v2 testing, so a future cold-start Anchor can distinguish deliberate closure work from uncontrolled branch-depth drift.
  - Summary: Tooling 027-5-20.1 — while recipient-v2 transport tooling remains unproven, Sigma authorizes continuing in branch depth 2 even though it is one level beyond the normal maximum; Anchor must keep the work bounded to tooling repair/qualification and next run two orthogonal tests: a warm-recipient transport-precedence test and a minimal fresh-recipient bootstrap-sufficiency test.
  - Status: accepted/local/temporary-exception

---

# Tooling 027-5-20.1 — branch-2 unproven-tooling validation exception and two-test strategy decision

## Decision

- State: accepted temporary exception.
- Branching Boundary: the current conversation has reached branch depth 2, one level beyond the normally accepted maximum. Sigma explicitly permits this only because the Handoff tooling being used to replace the conversation is still under active qualification and cannot yet be trusted as the sole recovery path.
- Anchor Responsibility: continue to repair concrete transport/tooling defects and propose the next bounded qualification test until enough evidence exists to transfer Anchor itself through a genuinely cold-started Handoff.
- Scope Freeze: no unrelated product/tooling expansion may use this branch-depth exception as precedent. The exception ends when recipient-v2 Handoff transport is accepted for operational succession or when Sigma explicitly stops the experiment.
- Test Strategy: separate the next evidence into two orthogonal tests rather than asking one cold-start run to prove every property at once.

## Basis

- The recipient-v2 carrier interior, artifact representation, package-local Parent/pathing lineage, multi-route packaging, and minimized recipient address label have reached machine/human-audit quality, but fresh-recipient behavior is not yet proven enough to retire the long-running Anchor dialogue safely.
- Prior fresh tests exposed real transport/tooling defects, demonstrating that continuing qualification rather than enforcing branch-depth shutdown was materially useful.
- Sigma is currently the only external human validator available to Anchor, so preserving each exception, test intent, failure, correction, and disposition as Tiinex artifacts is required to avoid conversation-only development gaps.
- A warm recipient can test whether the explicit package address wins over surplus prior context; a blank recipient with a deliberately minimal Workspace can test whether bootstrap plus correctly packaged Tiinex artifacts are sufficient without the accidental help of a large mature repository.

## Test Matrix

### Test A — Warm Recipient Transport Precedence

- Recipient may intentionally carry more prior conversation context than ideal.
- Package remains Tooling-generated and recipient-addressed using the standardized `Start` plus exact `Continue from` Pointer text.
- Measure whether the recipient follows the addressed package route rather than continuing stale conversational work, selecting an unaddressed sibling route, or asking for route clarification.
- Surplus context is allowed and should be reported; it is part of the pressure condition rather than a contamination that invalidates the test.

### Test B — Minimal Fresh Workspace Bootstrap Sufficiency

- Recipient must be genuinely blank/fresh.
- Carried work material is intentionally minimal: one ordinary Tiinex work artifact plus one Handoff artifact in an otherwise empty test Workspace materialization.
- Durable Workspace identity/representation and embedded portable bootstrap are transport mechanics and do not count against the one-work-artifact plus one-Handoff test payload.
- Measure whether the recipient can enter through the Tooling-generated address label, use bootstrap/package semantics, resolve the exact Handoff, consume the single work artifact, and understand the bounded transferred work without relying on mature `tiinex-site` history.

## Progress Preservation Rule

- Every new qualification task, package correction, observed recipient behavior, and PASS/FAIL disposition after this decision must be artifactized under Tooling 027-5 lineage before it becomes the basis for the next test.
- Earlier artifacts remain immutable even when later evidence supersedes their interpretation.
- Conversation text may coordinate execution but must not become the only source of truth for why a branch continued, why a test was selected, or how a result was classified.

## Consequences

- The next two qualification artifacts are Tooling 027-5-21 and Tooling 027-5-22.
- A PASS in Test A proves transport precedence under warm-context pressure but does not prove cold-start sufficiency.
- A PASS in Test B proves minimal bootstrap/package sufficiency but does not by itself prove resistance to stale warm context.
- Both results contribute to the evidence needed before attempting a genuinely cold-started Anchor succession test.
- No recipient-v2 default activation or retirement of the current Anchor dialogue is authorized by this decision alone.

## Interpretation Limits

- Does Not Mean: branch depth 2 becomes normal, the branching maximum is abolished, warm-context success counts as cold-start evidence, or a synthetic minimal Workspace proves every mature-repository Handoff.
- Must Not Be Used To Claim: tooling is already production-standard, Sigma has delegated final promotion authority, or conversation history may replace artifact lineage because the branch is temporary.
- Exit Condition: return to normal branch discipline as soon as accepted Handoff tooling can carry Anchor continuity without relying on this over-depth conversation as the safety net.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xC0GK8CbD7gU8esbf1ik3nN0ngrxF6fqLNJmMh2h_fc
