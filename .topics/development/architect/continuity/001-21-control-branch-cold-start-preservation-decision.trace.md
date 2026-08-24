# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 20:36:00
  - Authors: Anchor
  - Why: Preserve the predecessor/control conversation before a second branch is needed, without turning that conversation back into the active execution owner or requiring Q to carry hidden semantic context between chats.
  - Summary: This conversation is now control/reference only; active project execution remains with the separate successor Anchor conversation, while this branch preserves high-value cold-start, transport, Role-materialization, Source and Tooling-trust findings for a future control successor.
  - Status: accepted/local

---

# Control branch cold-start preservation decision

## Decision

- State: accepted
- Subject: continuity of the predecessor/control Anchor conversation after the first ChatGPT branch
- Decision: treat this conversation lineage as a bounded control/reference surface only. Before another branch is required, preserve all new control findings in durable Tiinex artifacts and transfer them through a dedicated control/reference Anchor-to-Anchor Handoff. Do not let the control successor resume ordinary project execution unless a later explicit durable transition promotes it.
- Active execution boundary: the separate successor Anchor conversation remains the active execution owner. This control lineage may independently inspect packages, challenge conclusions, preserve counterevidence and test cold-start behavior, but it must not create competing normal routes/tasks merely because it still has conversational context.
- Human transport boundary: Q carries one primary Handoff package plus the package-derived minimal routing block. Q must not reconstruct, summarize or arbitrate technical context between conversations.

## Preserved Findings

### Cold-start and host activation

- A completely fresh ChatGPT project given only a Handoff ZIP acknowledged the attachment but did not autonomously traverse the package or `START.md`.
- A completely fresh project given the same class of Handoff package plus the normal minimal Tiinex routing template immediately opened the package and grounded from the controlling workspace-relative Handoff.
- Therefore current-host transport may require a generic/minimal activation locator while work semantics remain entirely package/artifact-owned. `START.md` remains the parseable package-local orientation surface, not an assumed host autorun trigger.
- Project/chat context contamination was observed as a possible host variable because behavior differed between fresh-project and existing-project trials; cause is unresolved and must not be attributed specifically to Memory without stronger evidence.

### Human-output transport contract

- Current-host Handoff dispatch is incomplete if a sender exposes only the primary ZIP without an adjacent fenced/copyable minimal routing block, even when the package itself is mechanically qualified.
- The accepted current-host output rule is one primary carrier plus one package-derived routing block containing only workspace identity and exact workspace-relative controlling Handoff path.
- This failure reproduced across more than one Role: a fresh Axiom first returned semantic artifacts directly and no recipient-relative return ZIP; after an explicit output correction it produced one qualified Axiom-to-Anchor return package plus a copyable routing block. This indicates the transport/output rule must be recoverable across Roles rather than existing only as an Anchor conversational habit.

### Role identity and materialization

- The accepted mapping remains `Architect -> Anchor`, `Tooling -> Loom`, `Schemer -> Axiom`, `Dev -> Kodax`, with Sigma as the intended human Role name and Q as a conversational handle.
- Site and Docs Viewer actual-path inspection still foregrounds historical `party.role` artifacts such as `Dev Role` and `Schemer Role`; current labels are recovered through transition/Handoff material rather than concrete current Role artifacts under those new labels.
- Historical Role artifacts must not be rewritten merely to modernize labels. A candidate direction is to materialize current successor Role artifacts in qualified continuity with their predecessor Roles so Viewer/Tooling can foreground current qualified successors while preserving historical traversal. Exact canonical relation/currentness semantics remain unclassified and must not be guessed as `Parent` merely for tree shape.
- Role identity is workspace-independent. Axiom historically worked naturally in Tiinex/docs as Schemer but may receive a Site Handoff when that task's controlling work is in Site; Handoff/workspace choice does not redefine the Role.

### Workspace/Source separation

- Workspace, Role identity, current session readiness and source authority are separate concerns.
- A workspace may need one or more heterogeneous qualified Sources. Availability of a host/default Git branch is not source authority. `Tiinex/site@refactor` is a useful concrete pressure case, not the semantic definition of Source.
- Axiom's Process classification demonstrated that package-local Site material can ground the bounded task while exact canonical Tiinex/docs authority is separately recovered at pinned identities. Whether future Axiom work should carry relevant Docs as a second workspace/material set or discover it lazily remains a packaging/discovery question, not a Role identity rule.

### Process semantic classification state

- Fresh Axiom recovered its semantic boundary independently, restored pinned canonical Root/Task/Handoff/Relation/Transition/Transition Definition/Project/Package authority, and returned a durable `schema-warranted` Process classification.
- The classification says a canonical Process artifact/schema is semantically warranted for reusable qualified multi-artifact scope/composition, exposed boundary contract and extraction provenance while reusing existing Relation and Transition Definition authority.
- Boundary crossings are only candidate inputs/outputs until explicitly qualified by the Process contract; graph topology alone is not semantic authority. Viewer graphs remain projection. No separate Process Run is warranted by current evidence. Measurement/calibration remains separate.
- The Axiom result is not canonical schema authoring; it returns to active Anchor for independent acceptance and a separately scoped Tiinex/docs authoring route if accepted.

### Portable/shared Tooling trust debt

The following remain candidate trust-qualification leaves, not tasks opened by this control lineage:

1. multi-generation non-Site self-hosting: embedded Tooling in a package containing no Site workspace manufactures a successor, and the successor repeats the process in a fresh consumer;
2. normal-operation shortcut audit: recurring production manufacture must use portable Tooling operations rather than LLM one-off ZIP assembly; independent adversarial review scripts remain acceptable;
3. clean-room host portability matrix: fresh project/session, old-chat inaccessible, network/Git unavailable where appropriate, explicit unsupported/blocked states rather than guessing;
4. multi-workspace and Source pressure: exact cross-workspace Required Context, missing/wrong workspace fail-closed, source-neutral authority/discovery;
5. shared-layer parity: portable Tooling and Viewer interpret the same artifact/lineage/workspace/Handoff truth without private semantic divergence;
6. determinism/tamper/version compatibility: semantic/package truth deterministic for equivalent inputs, tamper fail-closed, explicit runtime/package incompatibility rather than approximate success;
7. bounded performance envelope: preserve contradictory ~20-30 second and >180/>300 second observations, record exact inputs/host/runtime/phases, and do not infer root cause or SLA from one run.

## Consequences

- A future cold-started control successor should recover these findings from artifacts and continue as control/reference without requiring access to this conversation.
- No current Role schema, Source schema, Process schema, Viewer behavior, Tooling implementation, repository publication or Business-workspace placement is authorized by this preservation decision.
- The existence of a `Tiinex/business` repository is relevant future pressure for organization-shared Role/capacity material, but its canonical semantic responsibility is unresolved. Do not move Role authority there merely because a shared repository is aesthetically convenient.
- If new evidence arises in this control lineage after successor activation, route it through a durable artifact/Handoff rather than technical copy/paste prose.

## Review Conditions

Revisit this preservation decision only to add new durable control evidence, to promote the control lineage through an explicit authority transition, or when maintained canonical semantics supersede one of the provisional gaps above. Do not rewrite historical findings merely because later work resolves them.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:Qzlarx3QCTY4hKqZuL38XgjmIs_GQ9FbKa3zJzrN91U
