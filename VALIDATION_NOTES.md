# v88 Validation Notes

v88 adds the first audit load-all skeleton after the v87 UX reconstruction pass. It is not full source-backed traversal yet. It proves the operation shape before GitHub/source-backed read paths are reintroduced.

## Local-open guard

- `index.html` loads `src/main.js` as a classic script.
- `src/main.js` contains no import/export startup so Chrome can run it from `file://`.
- Static and public checks fail if module startup is reintroduced.

## Audit skeleton scope

- Adds explicit `Audit loaded workspace` controls.
- Scans the currently loaded workspace records.
- Re-runs available scaffold validators for each loaded artifact.
- Counts finding severities across the loaded set.
- Detects declared parent edges whose target is not loaded and reports them as open parent boundaries.
- Reports integrity footer state as pending/open. It does not claim byte verification yet.
- Performs zero network fetches in v88.

## Legacy behavior evidence used

The archived `.old/app.js` lineage audit behavior influenced v88 without being imported. Useful lessons carried forward:

- audit is explicit and user-invoked;
- missing parent lineage is an open boundary, not proof of absence;
- audit should show loaded-boundary progress;
- audit counts should distinguish OK/mismatch/open/pending-style states;
- visible report feedback matters more than silent validation internals.

## Parser/card/verse scope

- Parses `# Continuity Context` envelope fields.
- Resolves known schema modules by schema id.
- Falls back to root when schema is missing or unknown.
- Builds card view models for Topic, Evidence, and unknown-schema fallback.
- Feed and Tree Verse use the same workspace records and parsed view models.
- Switching Feed/Tree changes arrangement only. It must not change parsed artifact truth, validation state, source boundary, or root fallback disclosure.

## Manual test expectation

Open local `index.html`. A screenshot is enough for this pass: check that the workspace frame still renders, then click `Audit loaded workspace` or `Run audit` and confirm an audit report appears with counts and open/pending disclosure.

## Source boundary discipline

Workspace state records whether material came from a static fixture, a user-selected local file, pasted draft text, or an explicit source-backed descriptor. Local, draft, and static material must not be promoted into GitHub source authority by guesswork.
