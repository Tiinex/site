# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 20:59:00
  - Authors: Loom
  - Why: Record the bounded Tooling 026 implementation and executable qualification evidence without self-accepting the work, redesigning the carrier, or adding provider-specific semantic authority.
  - Summary: Tooling 026 result — Tiinex-first cold-start ingress, consumer grounding, provider/session capability projection, degraded capture, and recovery-versus-preferred-path qualification
  - Status: draft/local

---

# Tooling 026 result — cold-start Tiinex-first ingress and preferred-path qualification

## Objective

Implemented a portable cold-start qualification layer that makes Tiinex-first takeover mechanically distinguishable from eventual recovery. Routed Handoff ingress now names `orient-handoff-package` as the preferred first semantic operation after at most one minimal host/bootstrap action, workspace bootstrap names `discover-tooling` then `search-lineage`, and qualification measures native pre-takeover use, arbitrary reads before orientation/frontier, Tiinex calls/actions/bytes/time to orientation, candidate artifacts inspected, and fallback use/reason.

## Done Criteria

The shared implementation is `src/tooling/portable/handoff/coldStartQualification.js`, exposed through the portable operation catalog and CLI as `describe-cold-start-ingress`, `project-cold-start-host`, `ground-cold-consumer`, and `qualify-cold-start`. Preferred-path state is independent from recovery state: the deterministic Axiom-style fixture performs broad native archive/filesystem archaeology, later reaches a correct outcome, and qualifies as `recovered-not-preferred` rather than PASS. Preferred routed-Handoff and workspace-bootstrap fixtures qualify only when their first semantic operation, orientation/frontier operation, grounding sequence, pre-takeover native boundary, and fallback evidence satisfy the ingress contract. Adversarial guards also prove that degraded voice/STT capture does not self-classify as native archaeology, a native read cannot evade arbitrary-read qualification merely by being labelled `minimal-bootstrap`, and a nested host profile retains its concrete host identity in the provider/host/session capability instance.

Recipient grounding reuses qualified `orient-handoff-package` route truth, reads the exact selected Handoff parties/purpose, resolves matching current Role material when supplied or carried, records Role boundary/authority/interpretation limits plus transition/predecessor state, and degrades rather than invents Role material when a bounded `To Kind: role` endpoint lacks a resolvable current Role artifact. Participant and contribution declarations allow multiple identities and Roles/capacities; one transport channel is never identity proof. Interaction purpose/mode is explicit and supports review, explanation, design discussion, orientation, collaborative dialogue, and execution without assuming one-shot behavior.

The degraded capture path preserves contribution and speaker attribution when Tooling is unavailable while prohibiting Tooling-dependent mutation/claims, hidden network use, and durable qualification until a later Tooling-capable turn. Provider-neutral host discovery now distinguishes provider, host, and current session capability instance and projects repository write, process execution, artifact return, human confirmation, authentication request, and copyable-text presentation capabilities without granting capability from provider name. Capability advertisement remains separate from exercised evidence; existing accepted receipt boundaries remain authoritative for trust-sensitive exercise.

The package-local START projection now carries additive preferred-path guidance for newly manufactured carriers while its inspector remains backward-compatible with pre-026 qualified START projections. Replaying the actual received 026 carrier under the modified runtime returns qualified Handoff orientation and a deliberate degraded Role grounding because this carried package contains no current Loom Role artifact. Lineage leaf/topology, workflow/current frontier, and Task lifecycle state are explicitly kept separate rather than collapsed into one currentness flag.

Deterministic fixtures are pinned in `src/tooling/portable/handoff/fixtures/cold-start-qualification.v1.examples.json` and exercised by `coldStartQualification.test.mjs`. Focused host capability/binding, operation catalog, bootstrap, CLI, START compatibility, 026 qualification, Handoff manufacture, Pointer, normal human output, and context-audit tests pass. TypeScript typecheck passes.

## Scope

The carried snapshot cannot execute several broader checks because required pre-existing files are absent from the package rather than because assertions failed: the portable aggregate stops on missing `src/schemas/core/topic/tiinex.topic.v1.schema.md`; `materialClosure.test.mjs` cannot import missing `src/export/package.zip.js`; architecture shape expects missing `src/schemas/workspace/workspace.views.jsx`; browser import boundary has no carried `src/main.jsx`; and schema-binding validation lacks the carried schema manifest/snapshots. No missing authority or source file was fabricated or fetched to convert those snapshot limitations into passes.

No carrier representation redesign, Viewer/VS Code implementation, zero-state starter authoring, provider semantic fork, hidden network access, credential collection, source/repository mutation, remote write, commit, push, publication, or independent acceptance was performed.

## Dependencies

Controlling task: `.topics/development/tooling/dogfood/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md`. Controlling transfer: `.topics/development/handoff/loom/026-cold-start-tiinex-first-ingress-and-preferred-path-qualification-handoff.trace.md`. Existing `orient-handoff-package`, `search-lineage`, `discover-tooling`, `plan-host-action`, and host receipt acceptance contracts remain reused rather than forked. Independent Tooling 026 acceptance remains with Anchor or another fresh reviewer. Tooling 027 carrier layout/control-plane work and later Tooling 029 bridge work remain separate.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:hKPw1oF8wnEllhNg224Afk-lzoMIwWn7tEkkMQHwnQc
