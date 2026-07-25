# Validation Notes v236

## Root cause hypothesis

The v235 video showed the source transport badge working, but also revealed a remaining PoC drift around issue-backed lineage:

1. The refactor could recover an embedded Tiinex artifact from a GitHub issue body.
2. The recovered artifact could still show as fallback/partial and remain isolated because its source path was not always recovered from PoC-era publication labels.
3. `Load full lineage` only indexed already-loaded records; it did not try to load the declared missing parent target from the same explicit GitHub source boundary.

The old PoC felt better because issue-backed artifacts could reveal their parent hierarchy through a source-scope transition. The refactor must preserve the Tiinex invariant of no global guessing, but it can still load exact declared parent targets from the same registered GitHub source.

## Fix

- Extended GitHub issue embedded-source parsing to accept `Source Path`, `Source Artifact`, and quoted `Source Path` labels.
- Added `src/app/lineageSourceRecovery.js` as the source-assisted lineage recovery owner.
- `Load full lineage` now asks that helper to build an exact recovery plan from selected traversal missing edges.
- Recovery only fetches exact repo-relative targets derived from the declaring record path and declared Parent Trace.
- Recovery inserts fetched parents through the existing source lifecycle so source count, source boundary, route/session state, and display filters stay coherent.
- GitHub explicit file materialization now resolves the default branch when needed, so exact parent loads are not blocked by an initially empty source ref.

## Guard coverage

- `src/app/lineageSourceRecovery.test.mjs` proves a missing relative Parent Trace becomes an exact repo file ref under the same GitHub source.
- `src/adapters/github/github.issueSnapshot.test.mjs` proves PoC-style `Source Path` publication metadata preserves the embedded artifact path.
- Existing lineage tests still protect loaded-only traversal and no global basename guessing.
- Architecture guard still enforces the `TiinexApp.jsx` line budget.

## Known limits

- Source-assisted lineage recovery is exact and bounded; it does not recursively clone the repo or guess missing parents by title/basename.
- If the declared parent path is wrong, unavailable, outside the source boundary, or blocked by transport policy, Lineage remains partial/degraded.
- Discussions remain degraded/deferred.
- Public build must be verified in an environment with Vite installed.
