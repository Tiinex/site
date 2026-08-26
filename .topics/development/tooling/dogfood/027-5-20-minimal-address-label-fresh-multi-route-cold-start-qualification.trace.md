# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-25 21:45:00
  - Authors: Anchor
  - Why: Run one genuinely fresh recipient-v2 cold-start after Sigma accepted the carrier interior but required the host transport to become a minimal deterministic address label with no Workspace or semantic-Handoff hints.
  - Summary: Tooling 027-5-20 — fresh multi-route cold-start qualification of the minimized recipient-v2 transport: one shared ZIP, common Start, one exact recipient-specific Continue-from Pointer, no Workspace/Handoff-path leakage, and no sibling-route inference.
  - Status: open/local

---

# Tooling 027-5-20 — minimal address-label fresh multi-route cold-start qualification

## Objective

Prove that a truly fresh LLM can consume one shared recipient-v2 carrier containing multiple qualified Handoff routes when the host supplies only the fixed package Start artifact plus exactly one recipient-specific package-local Handoff Route Pointer.

## Done Criteria

- Use a genuinely fresh Loom dialogue with no prior Tooling 027 conversation or branch state.
- Attach exactly one recipient-v2 ZIP that contains at least two qualified sibling Handoff Route Pointers over the same carrier bytes.
- Send exactly the Tooling-generated Loom transport bytes; do not manually add Workspace, semantic Handoff path, Role, Task, Required Context, expected outcome, or package explanation.
- Normal transport text contains `Start: 001-1-READ-BEFORE-PROCEEDING.trace.md` and exactly one `Continue from: <package-local handoff-pointer.trace.md>` value.
- Normal transport text contains no `Workspace:` field and no Workspace id/name.
- Normal transport text does not duplicate the Workspace-relative Handoff path.
- The fresh recipient begins with the named Start artifact, follows only the addressed Continue-from Pointer, and does not infer or select the sibling route.
- The selected Pointer resolves the exact Loom Handoff/Workspace binding through package-owned facts and payload bytes.
- The recipient grounds the current Loom Role, this controlling Task, Required Context, and package-local Parent lineage from the package rather than host prose.
- `orient-handoff-package`, `ground-cold-consumer`, and cold-start qualification do not require broad pre-Tiinex archive archaeology for route/Handoff grounding.
- Any host/native action before Tiinex takeover is reported and classified using Tooling 026 preferred-path semantics; recovered success is not relabeled as preferred PASS.
- The exact same ZIP bytes can regenerate a distinct Axiom outer invocation that differs only in the addressed Continue-from route Pointer.
- No source mutation, package redesign, remote write, publication, commit, push, authentication, or default activation occurs in the recipient run.
- Anchor preserves the fresh observation and, with Sigma, explicitly decides whether another retest or default-promotion decision is warranted.

## Scope

Read-only cold-start qualification of the accepted recipient-v2 carrier plus minimized host-layer address label. No broad artifact-tooling refactor, schema invention, unrelated Tooling work, or remote mutation.

## Dependencies

- [Sigma minimal recipient address-label feedback](027-5-19-2-sigma-minimal-recipient-address-label-feedback.trace.md)
- [Anchor minimal recipient address-label standardization result](027-5-19-3-anchor-minimal-recipient-address-label-standardization-result.trace.md)
- [Tooling 026 preferred-path qualification](026-cold-start-tiinex-first-ingress-and-preferred-path-qualification.trace.md)
- [Loom Role](../../loom/role/001-loom-role.trace.md)

## Promotion Boundary

A clean preferred-path PASS is necessary but does not silently activate recipient-v2. Anchor and Sigma must explicitly preserve the resulting promotion decision. A recovered-not-preferred result remains useful evidence but does not prove the transport standard.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Hzqr33B7lCSLcjy4A6rCWxOupoq4tH0S_-qIu5uYQag
