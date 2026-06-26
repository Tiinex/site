# Validation Notes

Package: v6-406 product CP121

## Purpose

CP121 is a GitHub Pages publish validation repair on top of the CP120 wizard-shell baseline. It intentionally avoids wizard/runtime behavior changes. Its goal is to make `npm test` pass both in the packaged zip shape and in the real GitHub Actions checkout, where repo-level metadata such as `.git`, `CNAME`, `LICENSE`, `NOTICE`, and `discord/` are present.

## Cleanup performed

- Split root package-shape validation into app-package entries, repo metadata entries, and ignored infrastructure entries.
- Allowed source-repo metadata required by the live repository: `CNAME`, `LICENSE`, `NOTICE`, and `discord/`.
- Ignored `.git/` internals during recursive validation walks so GitHub checkout metadata does not become part of the app package surface.
- Kept unexpected root entries blocked so accidental generated artifacts still fail validation.
- Documented the distinction between static app package shape and source-repository metadata in README.

## Intentionally unchanged

- wizard shell behavior from CP120
- wizard step semantics and product flow
- schema registry contents
- create-intent semantics
- parent-picker semantics
- sibling naming
- raw markdown review/editor fallback behavior
- scroll restore
- Discovery auto-more
- mobile badge packing
- lineage traversal
- storage keys and browser persistence
- schema parsing
- i18n

## Readiness signals

The authoring-shell cleanup keeps product-readiness signals expected to remain green:

- architectureScaffoldReady: yes
- coreExtractionReady: yes
- serviceStateExtractionReady: yes
- uiFeatureExtractionReady: yes
- viewStateIsolationReady: yes
- publicBuildReady: yes
- cleanupReadyForProductWork: yes
- architectureReadyForProductWork: yes

## Static validation commands

Run from package root:

```bash
node --check app.js
for f in tools/*.mjs; do node --check "$f"; done
find src -type f \( -name '*.mjs' -o -name '*.js' \) -print0 | sort -z | xargs -0 -n1 node --check
npm test
npm run metrics
npm run storage:scan
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

## Browser validation focus

CP121 does not change browser runtime behavior. Browser validation can be limited to a quick sanity check after applying the package:

- app loads
- desktop or mobile Discovery renders
- Continue still opens the wizard
- GitHub Pages publish workflow passes the `Validate source` step
