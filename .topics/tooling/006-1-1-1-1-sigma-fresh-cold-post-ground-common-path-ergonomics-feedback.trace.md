# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 19:02:32
  - Trace: [Explicit-Root Fresh Cold Grounding Closure — Loom To Anchor Return](006-1-1-1-loom-to-anchor-explicit-root-fresh-cold-grounding-closure-return-handoff.trace.md)
  - Origin:
    - [relative](006-1-1-1-loom-to-anchor-explicit-root-fresh-cold-grounding-closure-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-02 19:13:00
  - Authors: Sigma; Anchor
  - Why: Preserve Sigma's direct observation from the genuinely fresh Loom run that cold grounding correctness is not sufficient when ordinary post-takeover work still makes the consumer write glue scripts to inspect Tooling output or materialize Workspace source.
  - Summary: Sigma feedback extending the accepted no-glue boundary from host recovery to the whole ordinary post-Tooling common path, including Required Context consumption and Workspace/source materialization.
  - Status: accepted/local

---

# Sigma Fresh-Cold Post-Ground Common-Path Ergonomics Feedback

## Observed Signal

- The genuinely fresh zero-precontext Loom reached `grounded-to-act`, but then wrote ad-hoc Python after Tooling takeover to parse the grounding JSON, search projected Required Context, and manually extract the Site Workspace archive before continuing qualification work.

## Source

- Source: direct Sigma observation and screenshots from the active fresh Loom acceptance run on 2026-09-02, with Anchor independently reviewing the returned Handoff and preserving the observation into durable Tiinex form.

## Interpretation

- Interpretation: the explicit-root continuity proof and fresh cold-start qualification are useful and may be correct, but the broader human/LLM common-path ergonomics criterion is not closed. When Tooling already knows the current Task, Required Context, Workspace identity, and exact carried bytes, forcing the consumer to parse internal JSON or open ZIP members manually makes the LLM/human act as integration code.

## Feedback Target

- Target: the ordinary isolated-sandbox Tiinex workflow after Tooling takeover, from `ground` through bounded current-work inspection, exact Required Context access, Workspace/source materialization, focused validation, and return preparation.

## Feedback Received

- Sigma considers post-takeover custom Python, Node, shell glue, hand-built temporary request/receipt JSON, JSON-search scripts, or manual Workspace ZIP extraction a failure of LLM ergonomics on the ordinary Tiinex path.
- Because humans and LLMs are intended to share one human-first public CLI model, the same friction is an indirect human ergonomics failure even when a technically capable LLM can improvise around it.
- The accepted earlier host-recovery rule is broader than recovery: Tooling should own protocol shape, bounded context selection, carried-byte identity, extraction/materialization, and continuation state whenever those are already Tiinex-known facts.
- A normal consumer should be able to ask Tiinex for the current actionable material and materialize the exact qualified Workspace/source it needs without writing a parser or archive script.
- Advanced explicit JSON operations, raw receipts, and low-level diagnostics may remain available as escape hatches, but they must not be required happy-path knowledge.
- This does not require a second LLM CLI. The human-first common command surface remains the only public semantic path; machine-readable forms may be representations of that same path.
- The fresh run should therefore count as a pass for the bounded cold-start/root-continuity proof, but not as closure of common-path operational ergonomics.

## Disposition

- State: accepted
- Follow-Up: Anchor routes one bounded shared Tooling correction to Loom. Preserve Axiom's explicit root and the successful cold-start continuity evidence, but remove the post-ground glue requirement before repeating fresh cold acceptance and before calling the isolated common CLI stable.

## Limits

- Fidelity: bounded durable summary of Sigma's direct screenshots/statements plus Anchor's interpretation of their consequence for the current Tooling Task; screenshots remain human observation material and are not added as a new Handoff-package artifact kind.
- Boundary: this feedback does not reject the one-time pre-Tooling bootstrap exception, does not require Viewer or Chrome Extension work, does not reopen Handoff package topology, and does not authorize hidden host memory, autonomous execution, weaker Parent qualification, remote mutation, or a separate LLM-only interface.
- Boundary: project build/test commands are not prohibited merely because they use shell/Node; the failure criterion is bespoke glue required to navigate Tiinex itself after Tooling takeover.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Explicit-Root Fresh Cold Grounding Closure — Loom To Anchor Return](006-1-1-1-loom-to-anchor-explicit-root-fresh-cold-grounding-closure-return-handoff.trace.md)
  - Value: K2Hgh7f1lN2OrnRStLQx24Zt7bcRBTKiEkoTz4x2-tM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ushAqify2LISY0haTyG1JZ0EP4hOHxDqmlyXHdrpLu0
