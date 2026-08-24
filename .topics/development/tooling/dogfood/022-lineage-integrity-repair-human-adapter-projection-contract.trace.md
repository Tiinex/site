# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 09:09:00
  - Authors: Anchor
  - Why: Ensure the lineage repair foundation becomes reusable by human products instead of remaining an LLM-only/bootstrap capability, while keeping UI and remote-write authority outside the portable semantic/tooling core.
  - Summary: Tooling 022 — adapter-neutral integrity repair opportunity/projection contract for future Viewer and VS Code consumption.
  - Status: blocked/local

---

# Tooling 022 — adapter-neutral lineage repair opportunity and human projection contract

## Objective

Expose Tooling 020/021 inspection, plan, approval requirements, local repair results, and publication-locator opportunities through a stable adapter-neutral projection that Viewer and VS Code can consume without reimplementing lineage integrity logic. Preserve a strict boundary between local repair capability and future authenticated remote publication.

## Done Criteria

- Define one portable projection for human repair opportunities with stable machine states and compact human explanations: affected artifact, finding class, severity/trust impact, exact Parent target, publication locator status, proposed header/footer mutation, cascade impact, required decision/approval, and available safe actions.
- Project Handoff-package and ordinary workspace/source intake equivalently: an adapter may run repair discovery after import/discovery, but package carriage itself does not authorize repair.
- Support the case where a Parent is independently discovered at an exact qualified Git commit while the child lacks a commit-pinned Parent Origin/target locator: expose `qualified permalink repair available` without applying it automatically.
- Support local-only/unpublished parents truthfully: show unresolved/unavailable publication locator state rather than fabricating one.
- Preserve access separation: default/level-0 adapters may inspect, plan, preview, apply to local owned material, and export a changeset; they may not commit/push or claim publication.
- Model future higher-access remote publication only as a host capability/authorization requirement. Do not implement credential collection, OAuth, GitHub commits, or automatic push in this task.
- Keep Viewer and VS Code as adapters over the same portable operation. Do not create separate integrity algorithms or policy forks in either UI.
- Provide deterministic examples/fixtures suitable for Kodax follow-up: healthy chain, missing Parent target, mismatch requiring review, qualified permalink repair, unpublished Parent blocker, cascade preview, and repaired-local-result ready for export.
- Keep normal human wording concise and action-oriented while retaining full machine evidence separately, following the Tooling 018 human-output boundary.

## Scope

Adapter-neutral result/projection contract, host capability requirements, local/export action boundaries, fixtures, and documentation for future Viewer/VS Code integration.

Out of scope: Viewer component implementation, VS Code extension implementation, remote GitHub writes, authentication flows, access-policy schema changes, or semantic classification of Root/Origin gaps.

## Dependencies

- Tooling 020 accepted.
- Tooling 021 accepted before mutation actions are exposed.
- [Lineage repair and human adapter feedback](../../architect/continuity/001-31-lineage-integrity-repair-publication-permalink-and-human-adapter-workflow-feedback.trace.md)
- Tooling 018 human-output separation remains authoritative for machine evidence versus normal human emission.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:_21cN0SLcaXU9Mibt1GEFHUdiwed5cev6LxlJQ9bB-g
