# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-02 22:36:10
  - Trace: [007-1-anchor-to-loom-human-first-common-cli-tranche-a-handoff.trace.md](007-1-anchor-to-loom-human-first-common-cli-tranche-a-handoff.trace.md)
  - Origin:
    - [relative](007-1-anchor-to-loom-human-first-common-cli-tranche-a-handoff.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-02 22:53:52
  - Authors: Loom
  - Why: Preserve the reproduced advanced-help disclosure defect, its minimum correction, and the qualified no-source-mutation boundary for Anchor review.
  - Summary: Root-cause-qualified unchanged-source evaluation of public CLI discoverability, shared author/return ergonomics, and validation results.
  - Status: ready/local

---

# Human-First Common CLI — Tranche A Loom Evaluation Evidence

## Preserved Material

- Material Description: unchanged-source evaluation of the accepted carrier-major `006` common CLI surface, including public-help reproduction, root-cause localization, common-path authoring/return evaluation, focused Tooling validation, and Foundation acceptance.
- Material Kind: bounded implementation/evaluation evidence and validation qualification.

## Preservation Act

- Preservation Method: preserve the exact reproduced common-path friction, its owning layer and violated invariant, the minimum justified correction, the authority boundary that prevented shared-source mutation in this Loom run, and the unchanged-source validation receipts in one durable Site Evidence artifact.
- Preservation Time Or State: captured after cold-start bootstrap/orientation/grounding reached `grounded-to-act`, `ground --continue` materialized the exact carried Site Workspace, the public help surface was exercised unchanged-source, focused/tooling passed 4/4 with static debt clean, and Foundation passed 55/55.

## Supported Claim Or Question

- Supported Claim Or Question: whether the accepted carrier-major `006` public CLI already satisfies the Human-First Common CLI Tranche A requirement that ordinary help present the common lifecycle before and separately from advanced/internal operation vocabulary, while preserving the already-accepted post-ground `author` and `handoff` common path.
- Evidence Role: root-cause-qualified Loom evaluation returned to Anchor; it distinguishes reproduced defects from hypotheses and does not claim carrier-major `007` acceptance.

## Provenance

- Known Source: the untouched Anchor-to-Loom carrier supplied in this conversation; its declared Start/bootstrap path; Tiinex orientation and exact selected route `handoff-route:site:.topics/tooling/007-1-anchor-to-loom-human-first-common-cli-tranche-a-handoff.trace.md`; the exact carried Site Workspace materialized through ordinary `ground --continue`; and unchanged-source validation output from that Workspace.
- Preservation Basis: Tiinex grounded the route to the exact Task `site/.topics/tooling/007-anchor-human-first-common-cli-tranche-a-task.trace.md` with all three Required Context items qualified. No native outer Continue-from read, sibling-route inference, package archaeology, remote mutation, or shared-source edit was used.
- Provenance Limits: local bootstrap/runtime paths, complete terminal transcripts, checkpoint scratch state, and process timing are execution-local and are not promoted into semantic authority.

## Evidence Material

- Material Kind: public-help behavior, owning CLI adapter implementation, invariant analysis, validation receipts, and common-path return qualification.
- Material: unchanged-source `node tools/tiinex-portable.mjs --help` leads with the intended four-step common lifecycle (`ground`, `ground --continue`, `author`, `handoff`) and explicitly says advanced/internal discovery is available through `operations`, but the same default help output then immediately emits the complete advanced/internal command catalog. `node tools/tiinex-portable.mjs author --help` and `node tools/tiinex-portable.mjs handoff --help` reproduce the same full global dump rather than command-focused help. This is a reproduced defect, not a hypothetical consumer concern. The owning layer is `src/tooling/portable/adapters/cli/cli.help.js` plus the help branch in `src/tooling/portable/adapters/cli/cli.run.js`: `portableCliHelpText()` directly appends every advanced/internal command after advertising `operations` as the deliberate catalog, while `runPortableCli()` handles any missing command, `help`, or `parsed.flags.help` by calling that one global help function before subcommand dispatch. `parseArgs()` records the surface command, but the help branch does not use it. The defect therefore belongs to public CLI help composition/dispatch, not schema semantics, package grammar, grounding, or user invocation. The violated Human-First invariant is progressive disclosure: ordinary help must not require or expose the internal operation catalog, while deliberate advanced discovery remains separately available. The current output satisfies ordering but not separation; the advanced catalog is opt-in in wording only, not behavior. The minimum justified correction is to keep default/global help bounded to the common lifecycle, concise common-path options/boundaries, and one explicit `operations` pointer, while leaving the existing `operations` command as the advanced catalog. If subcommand help is retained, `author --help`, `handoff --help`, and other common commands should route to bounded command-specific usage instead of the same full global dump. A permanent general regression belongs in the existing focused Tooling CLI test spine, asserting that default help contains the common commands and `operations` pointer but omits representative advanced operation names, while explicit `operations` still exposes the catalog. No schema or carrier-topology change is justified. No shared Tooling source correction was applied in this Loom run because the qualified incoming Handoff mutation boundary explicitly reports `sourceMutation: false` and `remoteWrite: false`; Loom therefore preserves the reproduced defect and minimum correction for Anchor rather than silently widening authority. This is an authority constraint, not evidence that the defect is acceptable. The accepted authoring/return common path from carrier-major `006` remains present on the unchanged source. The public help describes runtime-only `.tiinex/continuation.json`, Parent inference, c14n-v2 sealing, audit/staging, and plain `handoff <workspace>` inference. This Evidence and its child return Handoff are authored through that public `author` path, and the final carrier is manufactured through plain `handoff <workspace>`; successful qualification of those steps demonstrates that Sigma's earlier bespoke authoring/return ceremony does not need to be reopened merely because the help-disclosure defect remains. `npm run validate:tooling-iteration` passed profile `focused/tooling` with `executed=4/4`, `reused=0`; static debt was `clean`, `inherited=0`, `introduced=0`, `resolved=13`. `npm test` passed the Foundation acceptance spine `55/55`. No release/closure profile was run or claimed.

## Preservation And Fidelity

- Preservation State: durable Site Evidence containing the unchanged-source reproduction, exact owning source locations, root cause, violated invariant, minimum correction recommendation, authority constraint, and requested focused/Foundation validation outcomes.
- Fidelity Notes: the evidence preserves the exact behavioral distinction that default help exposes advanced vocabulary despite advertising deliberate advanced discovery, and preserves the exact green validation counts from the current carried source.
- Known Losses: full help output, complete command stdout, all source lines around unrelated CLI operations, checkpoint directories, and process timing are omitted because the decisive facts are captured directly and those details are not semantic authority.

## Fidelity And Loss

- Fidelity Notes: the reproduced symptom, minimal reproduction commands, owning layer, root cause, violated invariant, minimum correction, absence of source mutation, and validation receipts are preserved in reviewable form.
- Known Losses: this artifact does not embed a source patch because none was authorized; it does not fabricate a regression result for a test that has not yet been added; it does not preserve transient `.tiinex` runtime state in canonical Workspace bytes.

## Custody Or Storage Boundary

- Storage Or Custody State: this Evidence is staged in the returned local Site Workspace and canonical child Handoff carrier. Runtime-only `.tiinex` continuation/checkpoint state and disposable bootstrap extraction remain outside canonical Workspace manufacture.
- Reuse Boundary: Anchor may use this evidence to authorize and review the smallest shared Tooling help correction, or to decide another bounded disposition. It does not itself authorize Loom source mutation, carrier-major `007`, release, deployment, Viewer/Extension work, or remote writes.

## Interpretation Limits

- Does Not Prove: carrier-major `007` acceptance, Sigma final human acceptance, release qualification, correctness of unexecuted future help changes, live connector/provider behavior, Viewer/Chrome Extension readiness, or remote repository state.
- Must Not Be Treated As: permission to create a second LLM-only CLI, weaken fail-closed continuity/recovery, change artifact/package semantics, infer alternate ancestry, or mutate shared/remote source without authority.
- Not Yet Used As: an implementation acceptance decision or progression authorization; the reproduced help defect remains open pending a separately authorized source correction or explicit Anchor disposition.
- Need For Review: Anchor should review the reproduced help behavior and owning source layer, then authorize the minimum common-help/progressive-disclosure correction if desired. The already-accepted grounding and authoring/return common paths should remain unchanged absent a separate reproduced contradiction.
- Authority Limits: Loom owns this bounded evaluation evidence only. Anchor retains architecture/progression and any source-change authorization; Sigma retains human workflow quality; Axiom retains canonical semantics; Transport Operator retains exact-material fallback.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [007-1-anchor-to-loom-human-first-common-cli-tranche-a-handoff.trace.md](007-1-anchor-to-loom-human-first-common-cli-tranche-a-handoff.trace.md)
  - Value: nGQGIN9vWz9VuvTNvUuZmf78wxXnz_dqUjR4-sBIALs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 32SEjDbICh4ePcCGHQUMEMvlSAxZd8YrzXebkDdPu-g