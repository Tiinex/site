# Validation Notes v119

## Status

v119 keeps React/Vite as the active runtime, keeps workspace UI inside the workspace schema companion hierarchy, and tightens the Add/workspace UI toward compact old-like behavior with less boilerplate.

Implemented and guarded:

- React entrypoint through `index.html` → `src/main.jsx`.
- UC-001 clean empty stage and create workspace flow.
- Created local/session Column workspace.
- Workspace schema companion under `src/schemas/workspace/`.
- Site-local `tiinex.workspace.v1` binding registered in `src/schemas/manifest.json` and `src/schemas/registry.js`.
- Viewer-extension schema validation support for site-local schema bindings.
- Compact old-like `Add to workspace` menu owned by workspace schema companions.
- Compact created-workspace chrome: titlebar, source row, toolbar, empty result, and Add modal density.
- Local Markdown intake from manual files, manual folder selection, drag/drop, and explicit URL fetch.
- GitHub source registration as a source boundary without fake loaded records or fake progress.
- Source row for local/session and explicitly registered sources.
- Tree view shows workspace/source boundaries and loaded local records.
- Hash-owned route restoration.
- Clean URL does not restore stale localStorage.
- Close workspace is non-destructive and restores clean start.
- Font Awesome through `src/ui/primitives/Icon.jsx`.
- Workspace schema/config/parser drift guard.

## Commands run

```bash
node --check app.js 2>/dev/null || true
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
node --check .site-publish/assets/index-*.js
npm run metrics
npm run storage:scan
npm test
```

## Known risks

- Source-backed repository loading remains the main missing behavior compared with `.old`.
- Explicit URL fetch depends on browser CORS/source availability.
- Zip intake is not wired yet; unsupported files are skipped and disclosed.
- `src/app/TiinexApp.jsx` still owns app shell/dialog orchestration; further extraction should follow the next use-case.
- Old `.old` remains more complete for source-backed material loading and mature Column behavior.

## Next recommended batch

Source loading should come next: GitHub source → mirror/source material load → source counts → records/cards → progress completion/failure states, using portal/adapter semantics instead of fake progress.


## v119.1 footer and dock recognition patch

- Footer restored to old-like persistent bottom origin marker behavior.
- Dock logo remains intentionally larger than neighboring buttons.
- Desktop dock wraps visible controls instead of stretching wider than content.
- No new feature behavior added.

## v119.2 footer and compact-recognition patch

Root cause:

- A legacy empty-stage rule still set `.tx-empty-stage-mode .tx-footer { display: none; }`, so the React footer did not appear before workspace creation even though v119.1 had fixed-position footer rules later in the cascade.
- The React footer used non-link `<strong>Tiinex</strong>` text, while `.old` used a link.
- Created-workspace local/session boundary text was more verbose than the old Column baseline.

Fix:

- Added final cascade guard that explicitly restores `display: block` for the footer in both empty and workspace modes.
- Changed the footer to `Powered by <a href="https://github.com/Tiinex">Tiinex</a>`.
- Restored old-like dark translucent footer background and link hover behavior.
- Reduced created-workspace boilerplate while preserving local/source boundary metadata.

Validation re-run and passing:

```bash
node --check app.js 2>/dev/null || true
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
node --check .site-publish/assets/*.js
npm run metrics
npm run storage:scan
npm test
```
