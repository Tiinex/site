# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 19:40:00
  - Authors: Anchor
  - Why: Preserve Q's actual-path failure that a mechanically valid primary Handoff carrier was surfaced without the adjacent copyable minimal routing block required for low-friction human transport.
  - Summary: A normal Role-to-Role Handoff output is incomplete for current dogfood when it exposes the primary carrier but omits the package-derived minimal transport text in an adjacent copyable code block.
  - Status: draft/local

---

# Handoff human output copyable transport block feedback

## Observed Signal

- The active successor Anchor surfaced the qualified Axiom Handoff ZIP as the sole primary carrier but did not include the package-derived minimal routing text in an adjacent fenced/copyable code block.
- Q had to flag the omission before transport, making the normal human fast path incomplete even though the package itself remained qualified.
- Independent `project-handoff-carrier-output` inspection of that same package proves the route path and transport-text content were mechanically derivable from package truth at the time of output.

## Interpretation

- The package and route can remain mechanically qualified while the human-facing Handoff output is operationally incomplete for the current host.
- Because current Tooling already derives the exact route and fallback text, the observation does not by itself prove a package-engine defect; it proves the end-to-end output contract is not yet reliably reproduced by cold-started Roles.
- The correction should preserve the one-primary-carrier rule and make the minimal routing block a deterministic projection of package truth rather than a remembered conversational habit.

## Feedback Target

- Target: normal human-facing Role-to-Role Handoff output on the current ChatGPT host, including the relation between the one primary Handoff carrier and the minimal routing text shown to Q.
- Not Target: Handoff semantic authority, package identity, outer filename authority, recipient work interpretation, or a requirement that every host emit a separate transport-text attachment.

## Feedback Received

- Q received the mechanically qualified `tiinex-site-001-1-anchor-to-axiom.handoff-package.zip` from the active successor Anchor without an adjacent transport text in a fenced/copyable code block.
- Q classifies that output as a workflow failure because the established fast path is one obvious primary carrier plus one directly copyable minimal routing block; requiring Q to reconstruct or request the locator reintroduces human transport work.
- The expected routing block carries only workspace identity plus the exact workspace-relative controlling Handoff locator. It must not carry work interpretation, technical reconciliation, acceptance guidance, Role readiness claims, or other semantic steering.
- Desktop normal path should not require a second helper attachment merely to copy routing text. The previously accepted cross-device fallback may still expose/regenerate a small transport-text file when old conversation state is inaccessible but Files remain available.

## Independent Tooling Observation

Running the current portable `project-handoff-carrier-output` operation against the same Axiom carrier returns `status: ready` and a `humanOutput` projection containing:

- one `primary` Handoff package with `singleHumanTransportChoice: true`;
- the exact workspace-relative Handoff path;
- a `fallbackTransportText.content` value derived from package truth;
- `normalEmission: false` for the fallback sidecar projection.

This bounds the observed failure: current Tooling can derive the required routing information, but the end-to-end Role/human-output path did not guarantee that the minimal text was visibly surfaced in a copyable block next to the carrier. Whether the correction belongs in Role/process output discipline, Tooling human-output projection, or both remains for the active Anchor to classify rather than being assumed here.

## Desired Fast Path

```text
one primary Handoff carrier
+
adjacent copyable minimal routing block
```

Example presentation shape only:

```text
Ny current <workspace title> workspace bifogad.

Fortsätt från:
<exact workspace-relative controlling Handoff path>
```

The text is a disposable host projection. Package truth and the controlling Handoff remain authoritative.

## Source

- Q actual-path observation from the active successor Anchor's Axiom dispatch output on 2026-08-23.
- Independent inspection of the returned Axiom carrier with the current package-local portable Tooling `project-handoff-carrier-output` operation.
- Existing single-primary-deliverable, carrier projection and cross-device fallback decisions.

## Evidence Material

- [ChatGPT host transport budget and single-primary-deliverable feedback](001-16-chatgpt-host-transport-budget-and-single-primary-deliverable-feedback.trace.md)
- [Handoff carrier dimensional lineage and human projection decision](001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
- [ChatGPT cross-device conversation/files fallback feedback](001-17-1-chatgpt-cross-device-conversation-files-fallback-feedback.trace.md)
- [Post-rotation predecessor evidence durable transfer decision](001-18-4-post-rotation-predecessor-evidence-durable-transfer-decision.trace.md)

## Disposition

- State: accepted-for-dogfood
- Follow-Up: hold the pending Axiom dispatch long enough for the active Anchor to classify and correct the human-output contract, then repeat the actual handoff output. Reuse the already-qualified Axiom semantic work/package content where safe; do not discard valid work solely because the presentation layer failed.
- Acceptance Effect: current dogfood treats primary-carrier-only output without adjacent copyable minimal routing text as incomplete human transport output.

## Limits

- This feedback does not establish a canonical Markdown/code-fence presentation requirement for all future hosts; it records the current host's safe human path.
- It does not require a second normal transport attachment, change Handoff semantics, or make transport prose authoritative.
- It does not prove a portable Tooling implementation defect by itself because the current carrier projection already derives the missing text.
- Q is not responsible for reconstructing the path, interpreting package internals, or deciding which implementation layer should be corrected.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:T6QK644TPzPUxrT439D2n94mzf1VSHKJp2CbhHUH718
