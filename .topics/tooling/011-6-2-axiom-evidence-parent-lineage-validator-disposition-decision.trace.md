# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 09:56:21
  - Trace: [011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
  - Origin:
    - [relative](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-04 10:03:48
  - Authors: Axiom
  - Why: Resolve the factory-proof conflict without conflating Evidence schema specialization with artifact continuity Parent semantics.
  - Summary: Axiom decision: the unconditional Evidence missing-Preservation-Parent warning is non-canonical; artifact Parent is used only for truthful direct continuity and preservation basis remains owned by Evidence fields and explicit references.
  - Status: ready/local

---

# Evidence Preservation Parent Validator Disposition

The current Site warning conflates schema specialization with artifact continuity and is not canonical Evidence validation authority.

## Decision

- State: accepted.
- Subject: `evidence.preservation.parent.unresolved` and the boundary between Evidence-over-Preservation schema inheritance and artifact `Parent` continuity.
- Classification: `evidence.preservation.parent.unresolved` is non-canonical in its current unconditional form and must not be emitted merely because a `tiinex.evidence.v1` artifact has no artifact-level `Parent`.
- Artifact Parent rule: an Evidence artifact is not required to continue a Preservation artifact. Root `Parent` is optional direct continuity ancestry. An Evidence artifact may declare a Preservation artifact as `Parent` only when the Evidence artifact truthfully continues that specific Preservation artifact as its direct continuity parent.
- Schema inheritance rule: `tiinex.evidence.v1` specializing `tiinex.preservation.v1` transfers schema semantics and qualified inherited contract authority; it does not manufacture an artifact lineage edge and does not constrain every Evidence artifact's direct Parent to a Preservation artifact.
- Preservation representation rule: when preserved material or a prior Preservation artifact grounds Evidence without being its direct continuity ancestor, the Evidence artifact should represent that truth through the Evidence-owned surfaces already declared by canonical authority: required `Provenance -> Preservation Basis`; optional `Provenance -> Preservation Artifact`; optional `Evidence Material -> Preservation Artifact`; optional `Evidence Material -> External Payload`; optional `Linked Preservation Artifact`; and typed relation/reference semantics when the relationship itself needs explicit non-parent representation.
- Minimal validator disposition: remove the unconditional missing-Parent warning from Evidence validation. No replacement Evidence warning is required solely because artifact `Parent`, `Preservation Artifact`, or `External Payload` is absent. Required preservation/provenance/fidelity obligations remain enforced by the shared Evidence contract.
- Conditional diagnostics: if an artifact explicitly declares a `Parent`, Root continuity validation owns whether that Parent is structurally valid and resolvable. If an Evidence artifact explicitly declares a Preservation Artifact, External Payload, or other reference and that declared reference is unresolved or contradictory, a reference/provenance validator may report that declared-reference problem. Such a finding must be triggered by the explicit declaration and its canonical contract, not by schema ancestry or by absence of artifact `Parent`.

## Basis

- Root states that `Parent` identifies the direct continuity parent when one is declared; `Parent` absence means the artifact is the root of its local lineage, and `Parent` describes ancestry only.
- Preservation states that `Parent` remains direct continuity ancestry and that related targets should be represented through relation or target fields unless direct continuation is being declared.
- Evidence defines itself as a Preservation specialization but separately states that preserved material may be embedded, attached, linked to a Preservation artifact, referenced through an external payload, or otherwise preserved. `Preservation Artifact` and `External Payload` are optional Evidence fields rather than mandatory lineage edges.
- Evidence's structural inheritance repair replaces generic Preservation body structure while preserving inherited preservation semantics. That merge authority does not add an artifact-level Parent requirement.
- The current Site validator warning is therefore implementation-private policy: it infers `no parent preservation edge` from `artifact.envelope.parent.schema.id` absence even though no canonical Evidence or Root contract makes that condition a warning.

## Consequences

- Loom should remove `evidence.preservation.parent.unresolved` from the Evidence validator's unconditional path and remove or retire its associated finding/i18n registration unless another canonical condition later reuses the code with newly declared authority.
- Loom must not replace it with a rule that requires `Parent Schema: tiinex.preservation.v1`, fabricates a Preservation artifact, or treats schema parentage as artifact ancestry.
- Existing Evidence required-field validation remains unchanged: `Preservation Basis`, provenance limits, material identity, preservation state, fidelity, known losses, and interpretation limits continue to carry the preservation boundary.
- Shared Root validation continues to own declared `Parent` structure and resolution. Shared reference/provenance validation may own explicitly declared Preservation Artifact or External Payload references when such validators exist.
- The bounded four-schema factory proof should be rerun after the warning is removed. Intended Evidence factory state is zero validation errors and no preservation-parent warning when no truthful artifact Parent is declared.
- This decision does not authorize broad factory fan-out or Sigma acceptance; those remain gated by the controlling factory task and subsequent Anchor reconciliation.

## Review Conditions

- Re-review if canonical Docs later adds an explicit Evidence condition requiring a specific preservation reference or artifact Parent under a bounded declared circumstance.
- Re-review if Loom finds that an existing canonical reference-resolution contract already owns a narrower finding for an explicitly declared Preservation Artifact or External Payload; that may be wired generically without restoring the missing-Parent warning.
- Any implementation that derives artifact Parent from schema inheritance, filename adjacency, package membership, or Viewer create context violates this decision.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md](011-6-anchor-evidence-parent-lineage-validator-semantic-adjudication-task.trace.md)
  - Value: Woyc40LHRgUO-yxOexdiM0nfHwGoTuHl7W0k0A_dIJc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: q7UslMbl8aVKLvXX2x453TB_m-0-lkgkpAaNcu0bfNs