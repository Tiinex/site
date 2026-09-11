# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 17:38:00
  - Trace: [Extract Core and App; unblock the Playthings consumer](business::.topics/initiatives/001-3-6-core-app-site-extraction-task.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-3-6-core-app-site-extraction-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 17:38:00
  - Authors: Anchor
  - Why: Preserve the user-requested source extraction and its actual qualification boundary.
  - Summary: Continue the Business extraction as a thin Site deployment.
  - Status: active/local

---

# Host the shared Tiinex application

## Objective

Consume @tiinex/app and @tiinex/core as packages; retain deployment config and registered overrides, not copied runtime source.

## Done Criteria

Install locked dependencies, build the actual Viewer and mount an external Verse with loaded Workspace data.

## Scope

No historical artifact deletion in this bounded checkpoint. Historical reduction remains a qualified Round-2 operation.

## Dependencies

- [Business task](business::.topics/initiatives/001-3-6-core-app-site-extraction-task.trace.md)
- [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
- [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Extract Core and App; unblock the Playthings consumer](business::.topics/initiatives/001-3-6-core-app-site-extraction-task.trace.md)
  - Value: SOxxB77pxLrbHBJ3AodTGDgynI770PNNulV-Ov0MPqQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:HtJrHXje6wzo9OZtxjZ3Ao20AjzZoA3HZjIuWRW6lCo