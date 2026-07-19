# Tiinex Site v110

Source-clean Column-only runtime for UC-001: empty start, create browser-local workspace, restore view state through URL hash plus local storage cache, use browser back/forward for route states, and close the workspace non-destructively.

## Local manual check

Open `index.html` directly in a browser.

1. Start with no `#state=` hash: the Column surface should be empty even if stale localStorage cache exists.
2. Press Create from the left side of the centered logo.
3. Enter a workspace name and create it.
4. Refresh: the workspace should restore from the URL hash/local cache.
5. Switch Feed/Tree or close the workspace, then use browser back/forward to move between route states.
6. Press the Tiinex logo: it should return to the clean empty viewer route.

## Validation

```bash
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
npm run metrics
npm run storage:scan
npm test
```

## Delivery rule

This zip is a source-clean repo replacement package. It intentionally excludes `.site-publish`. CI/workflow owns bundled public output after push.

## v110 UC-001 route grounding

v110 keeps the old quiet empty-stage visual baseline and moves from generic persistence to explicit route ownership. The URL hash is the source of visible view state; localStorage is a cache mirror, not an implicit clean-URL restore source. The centered logo now acts as a home/clean-route control, while Create sits to the left of the logo.

Schema support is also made multi-origin by design: Tiinex/docs remains canonical core, while viewer-local and fork-specific schema origins can be declared explicitly instead of being guessed as Tiinex/docs material.
