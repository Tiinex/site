# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-05 17:24:59
  - Trace: [020-1-1-anchor-to-axiom-work-provenance-grounding-semantics-handoff.trace.md](020-1-1-anchor-to-axiom-work-provenance-grounding-semantics-handoff.trace.md)
  - Origin:
    - [relative](020-1-1-anchor-to-axiom-work-provenance-grounding-semantics-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-05 17:38:40
  - Authors: Axiom
  - Why: Resolve the generic organizational work-provenance semantic seam without broadening Parent, inventing Tiinex-specific planning vocabulary, or hardcoding human authority.
  - Summary: Axiom accepts a source-to-upstream work-provenance relation family with optional Relation Artifact materialization, fail-visible grounding projection, and no new participant-input authority schema rule.
  - Status: ready/local

---

# Work-Provenance And Grounding Semantics Decision

Axiom accepts one bounded semantic contract for organizational work provenance without changing Tiinex `Parent`: work provenance is a typed non-Parent relation owned by the work that was spawned or commissioned, pointing back to the qualified work artifact that caused or controls why that work exists. The same qualified edge may be traversed in reverse for downward discovery; no inverse duplicate artifact is required.

## Decision

- State: accepted.
- Subject: generic work-provenance relation semantics, grounding projection semantics, Relation Artifact materialization, and participant-input authority boundary for the current Grounding + Handoff Trust Major.
- Parent boundary: `Parent` remains direct artifact-continuity ancestry. Project, Initiative, Epic, outcome, Task, organization, repository, or work-causation relationships must not be encoded by broadening `Parent` merely to connect a graph.
- Canonical relation family: use `work-provenance` as the domain-neutral relation family for a qualified edge whose purpose is to explain why one bounded body of work exists because another work artifact explicitly caused, commissioned, originated, or controls that work.
- Source role: the relation source is the spawned/derived execution-work anchor whose existence needs explanation. This should normally be the technical work root, or the work-spawning Handoff when that Handoff itself is the durable source artifact that owns the provenance declaration.
- Target role: the relation target is the qualified upstream work artifact that caused, commissioned, originated, or controls the source work. The target may be a Project, Initiative, Epic, outcome, Task, or another project-defined work artifact; those nouns are examples, not runtime categories.
- Primary direction: `source execution work -> controlling/originating work artifact`.
- Reverse discovery: tooling may index and project the same qualified edge in reverse as `controlling/originating work -> spawned execution work`. Reverse traversal is a projection of the same relation, not a second semantic edge and not a requirement to mutate the controlling workspace.
- Relation type: `Relation Type` must preserve the precise declared predicate for the concrete edge and must not collapse to a vague `related`. Projects may use precise predicates such as `spawned by`, `commissioned by`, `implements`, or `advances` when those meanings are actually qualified. Generic grounding should key the work-provenance class from `Relation Family: work-provenance` and preserve the exact relation type rather than inventing one universal project-planning verb.
- Relation scope: the ordinary scope is work-level provenance. The relation explains why the source work exists; it does not by itself prove responsibility transfer, delegation authority, project ownership, acceptance, completion, priority, validation, or success.
- Multiple upstreams: more than one qualified work-provenance edge may exist. Tooling must preserve each declared edge and predicate distinctly and must not choose a single controlling target from filename order, source order, repository placement, or graph proximity. A project that requires a single primary controller must declare that meaning separately rather than receiving it from the generic family.

## Relation Materialization And Placement

- Standalone `tiinex.relation.v1` materialization is optional, not mandatory. The maintained Relation schema already permits ordinary artifacts or schema contracts to declare/project typed non-Parent edges when another artifact owns the main semantics.
- Prefer an inline/projected relation on the source work artifact when its active schema contract already has a qualified typed-relation surface capable of preserving relation family, type, direction, scope, and durable target.
- Use a standalone `tiinex.relation.v1` artifact when the source artifact has no such qualified relation surface, or when the relation instance itself needs independent provenance, state, uncertainty, interpretation limits, review, or lifecycle.
- Placement follows semantic ownership, not graph direction. A standalone work-provenance Relation Artifact should normally live with the source/execution work that owns the declaration, or in another explicitly declared relation-owning workspace. It must not be placed under the upstream organizational artifact merely to manufacture a child tree.
- The Relation Artifact's own `Parent`, when present, remains its local artifact continuity. Its work-provenance target is carried in Relation semantics and must not become the artifact `Parent` merely because the target is organizationally upstream.
- Cross-workspace targets should use the most durable qualified reference available. A controlling Business/organizational artifact does not need a mirrored technical subtree or an inverse Relation Artifact merely to support downward discovery.
- Existing Handoff `Transfers -> Controlling Artifact` semantics remain valid where a Handoff directly names the durable artifact that controls or defines the transferred work. That field may be projected as Handoff-local controlling-work context when its meaning matches. It does not eliminate the need for a separate work-provenance edge when the technical work root itself still lacks a qualified connection to higher-level originating work.
- For the current Tiinex dogfood case, if Anchor wants the Site Major work to be traversable to the Business `Portable Handoff, Cold-Start And LLM Ingress` Task before any ordinary technical-work schema gains a typed relation surface, one standalone Relation Artifact beside the Site source work is the smallest no-new-schema materialization. This is an implementation choice, not a requirement of the canonical relation semantics.

## Grounding Projection Semantics

- A cold-start grounding projection may expose work provenance only from qualified declared relation material or another active contract that owns equivalent typed semantics.
- A qualified projection should preserve at least: source work anchor; target controlling/originating work artifact; relation family; exact relation type; declared direction; relation scope; durable target/reference status; the basis that qualified the edge; and any explicitly recoverable project/organization context owned by the target or its qualified context.
- Downward discovery may be produced by a reverse index over qualified `work-provenance` edges. The reverse index is navigation/projection, not a new Relation Artifact and not source authority.
- The projection must keep work provenance distinct from artifact Parent lineage, workspace/repository identity, role/participant authority, responsibility transfer, and transport/package membership.
- If no qualified work-provenance edge is available for a work anchor that is expected to have organizational provenance, project it as `unresolved` and preserve the reason. Candidate prose references, Dependencies, Required Context entries, repository names, directory placement, branch names, summaries, nearby artifacts, or human narration may be useful diagnostic evidence but must not be promoted into a qualified edge.
- `Unresolved` is not equivalent to `none`. Absence of a qualified edge does not prove the work has no organizational origin; it means Tooling cannot currently prove one from declared authority.
- Organization/project context must likewise be projected only when explicitly declared or recoverable through qualified relations/material. Tooling must not infer organization/project identity from repository names, workspace IDs, folders, branch names, or current Tiinex Foundation topology.
- A grounding projection does not become semantic authority by presenting the edge. It must expose relation provenance and unresolved state in a way that lets later readers distinguish declared truth from bounded projection.

## Participant Input And Authority

- No new canonical Root/Role/Feedback/Decision/Handoff rule is required for the participant-input boundary in this Major.
- The generic rule is not `human input is always feedback`. The generic rule is that participant identity, humanness, transport position, authorship, or conversational presence does not by itself create semantic authority or a governing state transition.
- `tiinex.party.role.v1` already separates role meaning, holder state, what a role may do, and what the role does not authorize. A Role does not silently become proof of holder identity, consent, delegation, acceptance, validation, or truth.
- `tiinex.feedback.v1` already requires feedback to preserve its target and disposition and explicitly forbids silently converting feedback into a decision.
- `tiinex.decision.v1` already owns landed governing outcomes and requires an operative decision to state what now governs; when a Decision authorizes work or execution, that effect must be explicit.
- `tiinex.handoff.v1` already states that transfer declarations do not by themselves prove sender delegation authority, recipient acceptance, completion, identity, or transport truth.
- Root already requires LLM/runtime interpretation to preserve declared meaning without inventing missing authority.
- Therefore ordinary participant input should remain observation/feedback/unresolved signal unless a qualified project artifact or runtime authority surface explicitly gives that participant/Role capacity and the input expresses the required operative intent. The exact authoritative instrument may be a Role, Decision, Handoff, Instrument, Task, acceptance artifact, or another project-defined authority; generic Tooling must not hardcode one human topology.
- In the current Tiinex project, the Sigma Role plus the accepted Foundation plan Decision already establish the stronger project-specific rule that ordinary Sigma input is feedback/observation by default and only explicit acceptance, decision, priority, or equivalent unambiguous intent changes governing human disposition where the controlling work makes that human decision relevant. That project rule should be grounded from those artifacts, not promoted into a universal human-input schema law.

## Basis

- The maintained Relation schema explicitly keeps `Parent` narrow and already supports typed non-Parent edges without requiring a standalone Relation Artifact for every edge.
- Anchor's discovery correctly identified that the missing piece is not graph capacity but a discoverable, domain-neutral semantic class for why technical work exists relative to higher-level work.
- A relation family plus a precise local relation type is smaller and safer than a universal `implements`, `serves`, `controlled by`, or `spawned by` predicate. Those verbs can carry materially different project semantics and should remain exact edge predicates rather than be flattened by generic Tooling.
- Source-to-upstream direction is the safest canonical orientation because the cold consumer begins from current execution work and asks why it exists. Reverse indexing provides the Business/organizational downward view without duplicating source artifacts or mutating the upstream work tree.
- Optional Relation Artifact materialization follows the existing canonical Relation contract and avoids creating a companion-file requirement where an owning artifact already has typed relation authority.
- Existing Role, Feedback, Decision, Handoff, and Root semantics already fail closed on the participant-authority issue. Adding a universal `human statements are feedback` rule would actually weaken domain neutrality by overriding projects that explicitly grant a Role direct decision or acceptance authority.

## Consequences

- Anchor may reconcile Loom's semantics-independent grounding mechanics against this contract and add a work-provenance projection only where qualified relation material exists.
- Loom should not infer work provenance from Dependencies, Required Context, filenames, repository/workspace identity, or prose. Until a qualified edge exists, the organizational provenance slot remains unresolved.
- Generic Tooling may recognize `Relation Family: work-provenance` as the cross-project discovery hook while preserving exact local `Relation Type` meaning and relation provenance.
- Tooling should support reverse discovery over the same qualified edge rather than requiring Business/organizational duplication or inverse relation artifacts.
- No mandatory change to `tiinex.relation.v1` is required merely to permit this representation. If Anchor wants the `work-provenance` family documented in canonical Docs as a shared vocabulary item for long-term interoperability, that is a narrow follow-up clarification, not a prerequisite for the current semantic disposition and not permission to broaden Relation schema behavior.
- No participant-authority schema change is required. Grounding should instead project the currently qualified Role/Decision/Handoff/other authority basis and preserve unresolved authority when no such basis is available.
- This Decision does not implement Site Tooling, create the dogfood Relation Artifact, modify Business or Docs source, close the Major, or authorize remote mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-1-1-anchor-to-axiom-work-provenance-grounding-semantics-handoff.trace.md](020-1-1-anchor-to-axiom-work-provenance-grounding-semantics-handoff.trace.md)
  - Value: m66LMCriTZ9SwvGMs_ndMUAtw22SlSYBd1PwbxjGIsE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: -BPYM0XGU9J-l7xDk0uPunMysLx-o-TtBmJnjwnp4QY