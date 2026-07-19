# Workspace config grounding

v109 restores the `.workspace.md` entrypoint as runtime input instead of treating empty-start copy and viewer help as hardcoded UI strings.

## Contract

- `.topics/.workspaces/viewer.workspace.md` is present in the source tree.
- `src/workspaces/workspace.config.js` parses the bundled workspace markdown shape.
- The quiet empty stage reads its subtitle from `Empty Stage`.
- The help dialog reads its entries from `Help`.
- Workspace discovery, entrypoints, mirrors, and transports are parsed now so later source-adapter work can attach to data rather than UI scaffolding.

## File-size boundary

`src/main.js` stays under the current 420-line ceiling. Config parsing, lifecycle, persistence, and icon vocabulary remain separated so the UI behavior can be ported to CLI or remote renderers without scraping DOM text.
