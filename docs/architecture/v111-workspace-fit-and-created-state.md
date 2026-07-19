# v111 Workspace Fit and Created State

The global dock is not a workspace header. It should size around its actual controls and stay centered on the Tiinex logo. Previous/next controls are route affordances for multi-workspace overflow only; they are not rendered for a single local workspace.

Created local workspaces must look like first-class Column state, not unstyled browser controls. The empty workspace card keeps the old card/action rhythm while remaining explicit about local/session and no-GitHub boundary.

Route state remains owned by `src/workspaces/workspace.route.js`; local storage is a cache mirror only. Clean URL still means clean empty stage.
