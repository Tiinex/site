# v85 Validation Notes

v85 adds reader-aware Topic/Evidence/root-fallback artifact cards on top of the v83 parser scaffold.

## Local-open guard

- `index.html` loads `src/main.js` as a classic script.
- `src/main.js` contains no import/export startup so Chrome can run it from `file://`.
- Static and public checks fail if module startup is reintroduced.

## Parser/card scope

- Parses `# Continuity Context` envelope fields.
- Extracts `Envelope Schema`, `Current -> Current Schema`, `Current -> Created At`, optional parent schema, body title, body sections, and integrity footer presence.
- Resolves known schema modules by schema id.
- Falls back to root when schema is missing or unknown.
- Builds a card view model from parser output for Topic, Evidence, and unknown-schema fallback.
- Scan/Power/Audit reader density changes disclosure without changing validation truth.
- Performs scaffold-depth validation only; full schema contract validation and lineage load-all audit remain later work.

## Manual test expectation

Open local `index.html`, try the Topic, Evidence, and Unknown schema sample buttons, switch Scan/Power/Audit reader density, and optionally load a local `.trace.md` file. Unknown schema should show `root-fallback` and a degraded/warning state.


## v85 Source Boundary Discipline

Workspace state now records whether material came from a static fixture, a user-selected local file, pasted draft text, or an explicit source-backed descriptor. Local, draft, and static material must not be promoted into GitHub source authority by guesswork.
