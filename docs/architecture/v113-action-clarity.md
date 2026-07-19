# v113 Action Clarity

The v112 video review showed that the created-workspace path still looked and felt like scaffold:

- `Add material` sounded like a source import even though it only created a browser-local record.
- `Continue` and `Merge` appeared before their source/continuity use-cases existed.
- Command-info dialogs explained unavailable behavior instead of keeping the primary path clean.

v113 keeps UC-001 narrow and testable:

- Empty workspace exposes only `Add local note` and `Open workspace`.
- `Add local note` is explicit that it creates a temporary local/session record and does not import files or infer GitHub provenance.
- Local/session record cards hide Merge until a source-bound merge use-case exists.
- Deferred command handlers remain route-aware in code, but they are not surfaced as primary actions.

This keeps the action model portable to CLI: the command vocabulary can still exist, but visible commands are filtered by context and readiness before presentation.
