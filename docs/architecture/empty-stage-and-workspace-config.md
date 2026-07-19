# Empty Stage and Workspace Config

v107 restores the `.old` empty-start behavior: before a workspace exists, the app shows a quiet empty stage instead of an onboarding card or dashboard.

The text is parsed from `.workspace.md`-style data through `src/workspaces/workspace.config.js`:

- `## Viewer Identity` can provide shell identity such as browser title.
- `## Empty Stage` provides one or more `Subtitle` values.
- Empty-stage behavior stays content/config driven, not hardcoded in `src/main.js`.

The Create affordance lives in the global dock. The empty stage remains a low-noise background invitation, matching the old Tiinex pattern where the user starts from a quiet canvas and uses the dock to create/open material.

A multiverse switch affordance exists immediately left of the Tiinex logo. It is a placement contract only while Column is the only runtime verse; Map/Atlas remain frozen until Column happy path is stable.
