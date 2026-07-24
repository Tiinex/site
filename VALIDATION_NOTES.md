# Validation Notes v232

## Root cause hypothesis

Browser feedback on v231 showed that GitHub issue loading could freeze-lag and that the issue discovery checkbox could be unchecked after an F5/hash restore. The likely owners were not the issue lineage recovery itself; they were the source continuation read model and the progress/persistence loop around large GitHub source operations.

The concrete risks were:

1. `workspace.route.js` compacted source shells without preserving selected/requested discovery surfaces, so route-only restore could lose `issueDiscovery`/`requestedSurfaces`.
2. `workspace.add.views.jsx` defaulted issue discovery from incomplete-state only, so a previously requested issue surface could be unchecked even though the source plan remembered it.
3. `TiinexApp.jsx` committed progress on every GitHub progress event. On large repo + issue operations this could repeatedly write route hash and session cache while the browser was also fetching/parsing source material.
4. Issue snapshot materialization looped targets without yielding back to the browser and defaulted to a larger browser workload than needed for Milestone A.

## Fix

- Route source shells now preserve `repoDiscovery`, `issueDiscovery`, `issueUrls`, `requestedSurfaces`, and `surfaces`.
- The GitHub continuation form defaults selected checkboxes from the remembered source plan, not only from incomplete-state.
- GitHub progress persistence is throttled in `src/app/githubProgress.js` and imported by `TiinexApp.jsx`.
- The app yields after showing source-progress UI before the heavy materialization await continues.
- Issue snapshot materialization yields between targets and defaults to 12 issues / 6 comments per issue.
- Source record counts remain cumulative after adding issue records to an already materialized source.

## Validation run in sandbox

Confirmed green before packaging:

```bash
npm run validate
```

Additional validation still expected locally by Q because the sandbox lacks a reliable local Vite runtime:

```bash
npm run build:public
npm run public:check
```

## Manual browser checks

1. Open an existing source, refresh with F5, and confirm Repo files / Issue snapshot discovery stay selected according to the source plan.
2. Load GitHub repo files + issue snapshots and confirm the Add dialog closes promptly and progress appears instead of freezing in-dialog.
3. Confirm issue-backed embedded Tiinex artifacts still recover lineage when available.
4. Confirm plain GitHub issues remain read-only Evidence snapshots.
5. Regression-check Discovery, Tree, Lineage, Audit, Display options, Export ZIP, and header.
