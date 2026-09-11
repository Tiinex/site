# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 15:26:00
  - Trace: [Cold-Start Recovery Dogfood Correction — Loom To Anchor Return](005-2-3-1-1-1-1-1-loom-to-anchor-cold-start-recovery-dogfood-correction-return-handoff.trace.md)
  - Origin:
    - [relative](005-2-3-1-1-1-1-1-loom-to-anchor-cold-start-recovery-dogfood-correction-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-02 16:04:00
  - Authors: Sigma; Anchor
  - Why: Preserve Sigma's direct observation that the current isolated-sandbox host-recovery path still forces the LLM to become glue code between otherwise correct Tooling operations.
  - Summary: Human feedback that normal host-assisted ground recovery must not require hand-built request/plan/receipt files or improvised Python/Node glue, and that this material Sigma contribution should remain visible in lineage.
  - Status: accepted/local

---

# Sigma Common CLI Host-Recovery Ergonomics Feedback

## Observed Signal

- During Anchor dogfood of the returned isolated-sandbox recovery flow, Sigma observed the LLM creating temporary protocol files and improvised glue code between Tooling operations even though the semantic recovery target itself was exact and correctly bounded.

## Source

- Source: direct Sigma observation and screenshots from the active Anchor workflow on 2026-09-02, with Anchor preserving the feedback into durable Tiinex form.

## Interpretation

- Interpretation: the recursive continuity semantics may be correct while the public common path is still ergonomically incomplete. If the consumer must understand or manually bridge internal protocol schemas, Tooling has shifted integration burden back onto the LLM/human instead of owning it.

## Feedback Target

- Target: the one public human/LLM `ground` path when a cold or bounded recipient must recover an exact required Parent through a host connector and then resume lineage qualification.

## Feedback Received

- Sigma observed Anchor using the returned correction carrier and saw the LLM create temporary JSON/request material and improvise Python around `plan-host-action`, connector execution, `accept-host-receipt`, and repeated `ground` calls.
- Sigma considers that a failure of LLM ergonomics and, because humans and LLMs are meant to share one public CLI model, an indirect failure of human ergonomics too.
- The ordinary path should not require the consumer to understand or manually construct Tiinex internal request, plan, receipt, hash, prior-recovery, or resume-state schemas.
- Tooling should own those protocol details. The consumer should receive the exact bounded host action, execute that action through the available host capability, return the host result through one simple supported continuation surface, and continue the same public `ground` path.
- The normal continuation surface may use stdin, an explicit Tooling-owned continuation token/state, or another equally simple common-path mechanism, but temporary request/plan/receipt files and custom glue scripts must be optional diagnostics or escape hatches rather than the taught happy path.
- The existing semantic protections must remain: exact target only, no search broadening, FETCHED != VERIFIED, cumulative recovery explicit rather than hidden memory, and Transport Operator escalation only when bounded exact host recovery is genuinely unavailable.
- Fresh model-cold acceptance should wait until this ergonomic seam is closed; a role that merely performs a package cold start inside an already warm chat is not sufficient evidence that a zero-precontext LLM can use the path naturally.
- Because this observation materially redirects the Tooling work, preserve Sigma as a visible causal contributor in artifact lineage rather than letting the correction appear as another Anchor/Loom-only turn.

## Disposition

- State: accepted
- Follow-Up: Anchor routes a bounded correction to Loom inside the current common-CLI/LLM-ergonomics Task. Close the normal host-recovery glue seam first, then run a genuinely fresh cold-role acceptance before treating isolated-sandbox grounding ergonomics as stable.

## Limits

- Fidelity: bounded durable summary of Sigma's direct statements and screenshots from the active Anchor workflow; the screenshots themselves remain transient human observation material and are not added as a new Handoff-package artifact kind.
- Boundary: this feedback does not require removal of advanced explicit JSON operations, debugging receipts, or programmatic APIs. It requires that they stop being necessary knowledge on the ordinary public path.
- Boundary: this feedback does not authorize a second LLM-only CLI, hidden recovery memory, package-topology changes, schema redesign, Viewer/connected-runtime expansion, search-based ancestry, weaker lineage qualification, or remote mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Cold-Start Recovery Dogfood Correction — Loom To Anchor Return](005-2-3-1-1-1-1-1-loom-to-anchor-cold-start-recovery-dogfood-correction-return-handoff.trace.md)
  - Value: hw6Dt7ox-Lo3miO3l0xX8mX2pUaRCcECrq_QFP_anRs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: eNoH10W65XpdouwH0YKyXYGlbNoTlOOoZbkyM_WWoGg
