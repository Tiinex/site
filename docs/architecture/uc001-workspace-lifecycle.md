# UC-001 Workspace Lifecycle

UC-001 is the first Column happy-path use-case for the refactor.

## Use-case

Start from an empty Column surface, create a browser-local workspace, preserve view state through URL hash and local storage cache, then close the workspace without implying source deletion.

## Contract

- Empty start is the default when no hash/cache state exists.
- Create workspace requires a human-readable workspace name.
- A created workspace is `local-session` material.
- Local/session workspace creation must never infer GitHub provenance.
- The URL hash is the primary visible view-state carrier.
- Local storage is a cache for recovery when the hash is unavailable.
- Closing a workspace removes it from the browser session only; it does not delete source files, GitHub material, local downloads, or future external adapter data.
- Discovery/Feed does not show `Lineage root reached.`
- Lineage/Tree may show `Lineage root reached.` as a trailing card.

## Portability

Workspace lifecycle code lives in `src/workspaces/workspace.lifecycle.js` and avoids DOM access. Persistence lives in `src/workspaces/workspace.persistence.js`. Both files have co-located Node smoke tests so the behavior can later be mapped to CLI/remote renderers without treating UI glyphs as semantics.

## Responsibility discipline

Runtime orchestration in `src/app/TiinexApp.jsx` should stay a React wiring layer: state hooks, dialogs, shell rendering, command dispatch, and persistence commit. Source loading, local/URL import, source close, Open/Merge, lineage, export, and schema navigation belong to feature-local command/read-model modules with adjacent tests. Line count is only a smell; ownership and behavior contracts are the pass signal.
