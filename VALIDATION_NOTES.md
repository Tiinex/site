# Validation Notes v254

## v254 desktop dialog and source-action polish

Video evidence after v253 showed the lineage regressions were no longer the main issue. UX friction was concentrated in desktop dialog scale and action availability/presentation:

- Add source, details, and Markdown dialogs were too small for desktop work.
- Open source appeared on issue-derived cards but was missing from some traversed source-backed parent cards.
- Open source was visually heavier than the other icon actions.
- New GitHub sources required manually enabling issue discovery even though current Milestone A testing depends on both repo files and issue snapshots.

Changed in v254:

- widened desktop dialog classes and increased dialog body height budgets;
- made the GitHub source form default both repo files and issue snapshots for new sources;
- kept continuation-source defaults bound to the existing source state;
- made source action icon-only on old-like cards;
- widened source href derivation to use GitHub browse/raw/source metadata before repo/ref/path fallback;
- added record action guards for recovered raw parent links without a route-shell ref and for synthetic issue display paths not becoming fake GitHub blob URLs.

Validation commands run for this checkpoint:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Not verified in this sandbox:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```
