# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 14:50:00
  - Authors: Anchor, Q
  - Why: Preserve the cold-start finding that successful recovery is insufficient when a fresh consumer first performs native archive/filesystem archaeology, and preserve the emerging consumer-grounding and package-carrier direction needed to make Tiinex efficient and predictable across hosts without hiding truth or duplicating semantics into provider-specific skills.
  - Summary: Cold-start should qualify Tiinex-first ingress, Role/participant/interaction grounding and provider-neutral capability binding; a future carrier should make Tiinex Tooling the obvious first semantic path while keeping workspace truth transparent, potentially by carrying each workspace as a lineage-bearing workspace artifact paired with an archive snapshot rather than exposing every workspace file directly at package root depth.
  - Status: draft/local

---

# Cold-start consumer grounding, provider capability and carrier ingress feedback

## Observed Signal

- Routed cold-start Handoffs repeatedly prove that fresh Roles can recover bounded state from a package plus a precise locator and complete useful work.
- Portable Tooling already exposes Tiinex-native orientation, lineage discovery, schema guidance, host-tool discovery/planning, host-receipt acceptance and Handoff manufacturing.
- Fresh consumers can still begin with native `zipfile`, shell traversal, `find`/`grep`, arbitrary trace reads or provider-specific repository tools before invoking Tiinex orientation/discovery.
- The fresh Axiom consumer of the Anchor-to-Axiom publication-classification package demonstrated this exact split: it correctly inspected Axiom Role/lineage material and canonical Root semantics, but first inspected/extracted the archive and performed native filesystem/Python lineage archaeology before listing and using portable Tiinex operations.
- Successful recovery after native archaeology demonstrates model competence, not preferred-path Tiinex cold-start qualification.
- Different providers, hosts and sessions expose materially different attachment, filesystem, repository, execution, copyability, authentication and receipt capabilities. Provider identity alone cannot establish the current session capability set.

## Source

- Current full-Site Handoff packages and their root Pointer, `tiinex.bootstrap`, `handoff.workspaces`, `handoff.material`, `context/workspace.json` and `tiinex.package` control surfaces.
- Existing portable operation catalog including Handoff orientation, lineage discovery, host capability planning/receipts and manufacturing.
- Fresh Axiom cold-start actual-path observation where native archive/filesystem/Python discovery preceded portable Tiinex operation discovery while Role/schema grounding still succeeded.
- Existing `tiinex.workspace.v1` schema and current multi-workspace Handoff manufacturing behavior.
- Q design feedback on multi-identity interactions, voice/STT degraded capture, workspace-artifact plus workspace-archive carriage and package boilerplate/minimality.

## Feedback Target

- Cold-start preferred-path qualification and consumer grounding.
- Provider/host/session capability projection and future skill/bootstrap adapters.
- Handoff package workspace/material/control-plane representation.
- Viewer/CLI/VS Code parity for discovery and operation binding.

## Feedback Received

- Recovery correctness alone is insufficient; Tiinex should make qualified Tooling the normal first semantic path.
- Cold consumers need explicit Role, participant/contribution and interaction-purpose grounding rather than merely acting Role-like from Handoff prose.
- One chat transport may carry contributions from multiple identities; dialogue and one-shot execution are ergonomic defaults, not semantic constraints.
- A transparent nested workspace archive paired with a normal lineage-bearing workspace artifact may reduce accidental native indexing while preserving independent inspectability.
- Current package JSON/control surfaces and `handoff.material` should be responsibility-audited and minimized only after exact closure/integrity dependencies are understood.

## Interpretation

- Treat provider-specific skill/pre-prompt forms as non-authoritative projections over one portable semantic/operational core.
- Separate semantic navigation from host execution mechanics: native tools remain valid execution/fallback mechanisms, while Tiinex should own normal semantic orientation/discovery when available.
- Treat workspace archive snapshots as material representations bound to workspace semantics, not as semantic identity by filename or nesting.
- Prefer transparent host-assisted or soft bootstrap ingress over hard enforcement such as encryption; independent truth inspection must remain possible if Tooling fails.

## Consumer Grounding Direction

Before substantive reasoning or mutation, a cold consumer should obtain an explicit grounding result that distinguishes:

- recipient Role/capacity resolution and the exact Role boundary actually loaded;
- interaction participants and contribution attribution, without assuming one chat transport channel equals one semantic human identity;
- the current contribution/speaker where explicitly declared, while preserving unverified attribution as unverified;
- interaction purpose/mode, which may be execution, review, explanation, design discussion, orientation, collaborative dialogue or another bounded mode rather than an assumed one-shot request/response;
- available Tiinex operations and provider-neutral capability requirements;
- current host/session bindings and any unavailable/degraded paths.

A session may contain multiple identities and multiple Roles/capacities. The normal one-LLM plus one-human/operator case is an ergonomic default, not a semantic cardinality rule.

Voice/STT or other environments where Tooling is unavailable may act as a degraded capture mode: preserve contributions and speaker attribution, avoid Tooling-dependent claims or mutation, then condense/falsify/qualify valuable material in the next Tooling-capable turn.

## Preferred-Path Qualification Direction

- Tiinex should not depend on an LLM "wanting" to use Tiinex Tooling. When Tiinex is available, its first semantic operation should be explicit, mechanically discoverable and cheaper than arbitrary repository exploration.
- Absolute package-only zero-ingress is impossible for a consumer that has no signal Tiinex exists. A host/bootstrap boundary may therefore provide one minimal ingress action; after that Tiinex Tooling should own semantic orientation/discovery.
- Native filesystem/archive/process tools remain valid execution mechanics and explicit fallback, but should not be the normal semantic discovery path when qualified Tiinex operations are available.
- Measure native actions before Tiinex takeover, arbitrary files read before qualified orientation/frontier, calls/bytes/time to orientation, candidate artifacts inspected and whether fallback was explicit and justified.
- A consumer that eventually arrives at the correct answer after broad native archaeology does not pass preferred-path qualification.

## Provider Capability / Skill Projection Direction

- Canonical Handoff/workspace/schema/Process truth remains provider-neutral.
- Express operational needs using provider-neutral capabilities such as filesystem read/write, process execution, repository read/write, artifact return, human confirmation, authentication request and copyable-text presentation.
- Distinguish provider, host and current session capability instance.
- Capability advertisement is distinct from exercised capability evidence; trust-sensitive operations retain accepted receipt requirements.
- A provider "skill" or pre-prompt may be a generated consumer projection, but should not become a second semantic authority when its guidance is derivable from canonical schemas, Processes/operations, Tooling contracts and capability bindings.
- Warm agents may receive a lightweight host projection because Tooling/Role/workspace bindings are already registered. Cold attachment consumers need a stronger package-local bootstrap projection.

## Carrier / Workspace Packaging Direction

Q proposed reducing cold-consumer native indexing pressure without encryption or hidden truth by making workspaces explicit Tiinex material inside the carrier instead of exposing their entire trees as ordinary outer-archive directories.

Candidate shape:

- package root keeps only obvious Tiinex entry/control surfaces;
- `tiinex.workspaces/tiinex-site.workspace.md` is a normal lineage-bearing `tiinex.workspace.v1` artifact describing the workspace;
- `tiinex.workspaces/tiinex-site.workspace.zip` carries the exact workspace tree/material snapshot;
- additional workspaces repeat the same artifact-plus-archive pattern;
- bootstrap/runtime Tooling remains outside the nested workspace archives so the consumer can orient/open them without first extracting a workspace;
- the archive is transparent transport material, not encrypted semantic authority and not semantic identity by filename;
- package construction should avoid pointless double compression, for example by storing already-compressed workspace archives without recompressing them where supported.

This is attractive because the `.workspace.md` artifact can itself have Tiinex lineage while the `.workspace.zip` is the exact tree representation/material bound to that workspace instance. Existing `tiinex.workspace.v1` already provides a portable workspace artifact, but the canonical way to bind a package-local exact archive snapshot to that artifact requires classification before implementation.

## Current Package Control-Plane / Material Questions

Current Handoff packages expose root Pointer, `tiinex.bootstrap`, `handoff.workspaces`, `handoff.material`, `context/workspace.json` and a relatively large `tiinex.package` control directory containing carrier/closure/file-map/contract/build receipt/findings/index/manifest/receipt/companion/START projections.

Some control documents have clear integrity/route purposes, especially carrier, closure and file-map. Others appear to reuse generic export-package planning structures; for example the current manifest/receipt can describe a "future" package and claim no zip was written while already residing inside a manufactured Handoff carrier. That may be legitimate layered reuse, stale projection language or avoidable boilerplate and must be audited rather than assumed necessary.

`handoff.material` currently provides exact byte materialization for Required Context and therefore closes recipient-relative material even when workspace discovery/path semantics differ. It should not be removed casually. A future optimization may allow a Required Context binding to exact bytes already addressable inside a qualified workspace archive by workspace identity/path/hash, using detached `handoff.material` only when exact material is otherwise unavailable or must remain route-local. This requires fail-closed equivalence and context-audit proof.

## Bootstrap Availability Direction

- A cold portable carrier should contain enough bootstrap outside workspace archives to identify the package, orient it and access the embedded workspace/material providers.
- A warm/persistent host may omit duplicate bootstrap payload only when the exact required bootstrap version/source/integrity is already qualified and locally available or deterministically retrievable.
- A GitHub-hosted bootstrap archive may be a retrieval source, but absence from a package must never silently become a network assumption; unavailable retrieval must produce an explicit degraded/blocking state.
- The preferred package-root human/LLM entry should remain a normal Tiinex projection such as a qualified Pointer/bootstrap surface rather than an ad-hoc semantic README.

## Relationship To Discovery / Viewer

- `lineage leaf`, workflow/current frontier and Task state remain distinct. Tiinex-first ingress should eventually obtain current/relevant work mechanically rather than infer it from filenames or arbitrary leaf enumeration.
- Viewer, VS Code, CLI, LLM bootstrap and provider skill projections should consume the same underlying operation/capability/discovery truth rather than independently reimplementing it.
- Viewer can become the strongest host-assisted path: recognizing a Handoff carrier, orienting it, binding capabilities, surfacing Role/participant/purpose grounding and only then exposing discussion/repair/execution actions.

## Disposition

- State: accepted-for-planning
- Follow-Up: keep Tooling 026 as the preferred-path/consumer-grounding qualification task and open a separate bounded package-layout/control-plane audit before changing carrier representation.
- Scheduling: do not interrupt or rewrite the already active Axiom publication-semantic classification route merely to carry this design discussion.

## Limits

- This feedback does not require a new canonical `tiinex.skill.v1` schema.
- It does not authorize provider-specific Handoff semantics, encryption, hidden payloads, hidden network invocation, remote writes or authentication.
- It does not yet choose the canonical binding between a workspace artifact and a package-local workspace archive.
- It does not authorize deleting current `tiinex.package`, `handoff.material`, `context` or exploded-workspace controls before an exact responsibility/compatibility audit.
- It does not claim blind workspace discovery, Role-grounded preferred-path ingress or zero-state bootstrap are currently qualified.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:xjqVpjJNMEX0d6iFZ0Bbq8KDRqCSYfAtXyxSWzLXA0w