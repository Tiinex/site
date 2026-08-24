# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 08:04:00
  - Authors: Anchor
  - Why: Close the smallest Tooling-owned gap exposed by Q's fresh Loom run and independent Anchor source review: a package can manufacture successfully while the normal manufacture summary withholds the exact inline routing text and labels the only text-bearing projection as a non-normal fallback.
  - Summary: Make one normal manufacture/projection result self-sufficient for Role-to-human return by exposing one primary package plus exact Tooling-derived inline routing text as an explicit normal human-output contract, without changing canonical Handoff semantics or making the optional sidecar normal.
  - Status: open/local

---

# Tooling 018 — normal human-output emission cold-start closure

## Objective

Make the normal portable Handoff manufacturing/output surface self-sufficient for cold-start Role return. A Role that successfully invokes the normal manufacturer for a selected qualified route must receive, in that same Tooling result, an unambiguous normal human-return projection consisting of exactly one primary Handoff package plus the exact package-derived routing text that must be rendered copyably adjacent. The Role must not need predecessor-chat memory, a second projection command, fallback-sidecar interpretation, filename inference, or Role-authored substitute prose to discover the completion contract.

## Done Criteria

- Preserve the accepted carrier/package truth owners. Human return data remains a disposable Tooling projection over qualified route truth and acquires no Parent, assignment, acceptance, source, package-identity, or canonical Handoff authority.
- Preserve exactly one normal human file choice: `humanOutput.primary` remains the sole required package carrier and retains `singleHumanTransportChoice: true`. Internal result traces, receipts, audits and helper files are not surfaced as alternative normal transport choices.
- Add an explicit normal inline-routing projection to `projectHandoffHumanOutput` (name may vary if a clearer existing vocabulary fits) whose content is generated from the same selected qualified workspace/route truth as the existing transport text. It must contain only the minimal transport orientation currently accepted: package attached, workspace identity, and exact workspace-relative `Continue from:` path.
- Distinguish normal inline rendering from the optional cross-device sidecar. The inline routing projection is part of normal human-output completion; the `.transport.txt` sidecar remains optional, `normalEmission: false`, non-authoritative, and is not required on the desktop fast path.
- Make the normal `manufacture-handoff-package` CLI/operation summary preserve the exact normal inline routing content when human output is `ready`. Do not strip the only normal-routing bytes from the result.
- Keep `project-handoff-carrier-output` as a valid read-only regeneration path after cold start/device loss, and make it expose the same normal human-return projection rather than a semantically different summary.
- Shared carriers still require explicit qualified route selection. A `selection-required` or blocked projection must not emit a guessed primary package or routing text.
- Add a focused regression proving that a fresh caller can invoke manufacture once with `--output-dir` and a qualified selected route, then recover from the returned structured result both the sole primary package and the exact normal inline routing content without calling a second operation. Include shared-route selection-required pressure and preserve Tooling 012/013/015-017 regressions.
- Update portable bootstrap/help so a cold consumer is told that normal completion is the Tooling-returned primary package plus normal inline routing projection. Do not encode ChatGPT-specific Markdown fence syntax as canonical/package semantics; host presentation may wrap the returned exact text in an appropriate copyable surface.
- Prove the returned result against a recipient-relative Handoff package and include the exact Tooling output object used for the human return. A Role-authored paraphrase is not completion evidence.
- Keep the currently unresolved full-workspace manufacturing performance evidence separate. Record timing if touched, but do not expand this correction into scaling optimization unless the human-output change directly causes or owns a reproducible cost.

## Scope

Portable Handoff human-output projection, manufacture CLI/operation summary, focused tests, bootstrap/help discoverability, and directly required read-only regeneration parity. Out of scope: canonical Handoff/Pointer/Workspace/Source semantics, Viewer behavior, START migration, Role schema/home design, cross-device sidecar promotion, package performance optimization, publication, or host-specific UI implementation.

## Dependencies

- [Known Role cold-start trust closure](../../architect/continuity/001-24-known-role-cold-start-trust-closure-task.trace.md) is the controlling trust tranche.
- [Q known Role cold-start transport reliability priority feedback](../../architect/continuity/001-23-q-known-role-cold-start-transport-reliability-priority-feedback.trace.md) is the fresh actual-path failure evidence.
- [Handoff human output copyable transport correction disposition](../../architect/continuity/001-19-6-1-handoff-human-output-copyable-transport-correction-disposition.trace.md) defines the accepted current-host presentation invariant and is superseded only in ownership classification: Q's later fresh-run evidence now proves that durable Role memory plus an optional second operation is insufficient reliability.
- [Tooling 015 Anchor acceptance](015-1-handoff-package-multi-root-workspace-manufacturing-anchor-acceptance.trace.md), [Tooling 016 Anchor acceptance](016-1-handoff-package-tiinex-pointer-entrypoint-anchor-acceptance.trace.md), and [Tooling 017 Anchor acceptance](017-1-handoff-package-recipient-context-audit-anchor-acceptance.trace.md) preserve the independently reviewed package-foundation baseline and its limits.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:pTgGL09est85K2DXeUoh7_zrEPhPlYp0m6akFFCi_RU