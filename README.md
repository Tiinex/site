# Tiinex Site v291

Checkpoint: `v291`
Version: `0.2.111-v291`
Runtime: `react-v291-poc-config-chooser-parity`

## v291 focus

Hosted Tiinex app config intake now follows the PoC bootstrap order and treats Workspace Discovery as a chooser/catalog, not as “load every Markdown file under the source root.”

## Changed in v291

- PoC-hosted apps prefer explicit link/meta config, then runtime `workspaceCandidates` / issue pointers, then embedded `EMBEDDED_DEFAULT_WORKSPACE_MD`, and only then static path fallbacks such as `.topics/.workspaces/viewer.workspace.md`.
- Workspace Discovery `Match: *.workspace.md` is preserved into the source boundary.
- Repo discovery applies the workspace match before materializing records, including direct discovery and preloaded mirror/cache records.
- Source metadata preserves `workspaceMatch`, `appConfigPlan`, `openBehavior`, and `preferredDisplay` through registration, materialization, route state, and source records.
- Source-backed `.workspace.md` records remain explicit Open / Merge targets.

## Validation

See `VALIDATION_NOTES.md`.

## Supported local start

```bash
npm install
npm run dev
```

Common validation commands:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```
