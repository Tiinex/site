# Tiinex Site v109

Source-clean Column-only runtime for UC-001: empty start, create browser-local workspace, restore view state through URL hash plus local storage cache, and close the workspace non-destructively.

## Local manual check

Open `index.html` directly in a browser.

1. Start with no `#state=` hash and no local storage cache: the Column surface should be empty.
2. Press Create.
3. Enter a workspace name and create it.
4. Refresh: the workspace should restore from the URL hash/local cache.
5. Close the workspace and confirm: the app returns to the empty Column surface.

## Validation

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run build:public
npm run public:check
npm run metrics
npm run storage:scan
npm test
```

## Delivery rule

This zip is a source-clean repo replacement package. It intentionally excludes `.site-publish`. CI/workflow owns bundled public output after push.


## v108 update

- Recreated the old quiet empty start: dock + configured subtitle + footer only.
- Fixed unstyled empty dock buttons by giving the global dock a real button/icon vocabulary.
- Kept Create workspace as the primary UC-001 affordance while preserving hash/localStorage restore.
- Added `docs/architecture/old-empty-stage-parity.md`.

## v109 UC-001 grounding

v109 keeps the old quiet empty-stage visual baseline but restores `.workspace.md` as parsed configuration. The app now ships a root `.topics/.workspaces/viewer.workspace.md`, parses viewer identity, empty-stage copy, workspace discovery, entrypoints, mirrors, transports, and help, and wires global dock controls to actual behavior.
