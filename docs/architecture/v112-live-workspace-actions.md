# v112 Live Workspace Actions

v112 turns the created local workspace from a styled empty shell into a minimal live Column surface.

## Root cause addressed

The v111 workspace window still looked and behaved like a scaffold after creation: the dock could read as wider than its content, the created-workspace card felt isolated from the old Column rhythm, and card actions were styled but not meaningful enough to regression-test.

## Behavior

- The global dock is fitted to its visible controls.
- Previous/next controls remain conditional on multiple workspaces.
- A created workspace is centered as one Column window, not offset by empty-start layout rules.
- `Add material` opens a local material dialog and inserts a local/session record.
- `Continue` opens a continuation dialog and inserts a draft continuation record.
- `Open` shows a workspace summary without changing source truth.
- Mutating actions commit through the same hash/localStorage route path as workspace creation.

## Boundary

Local records created here remain browser-local session material. No GitHub source is guessed or promoted. This is intentionally still Column-only; Map/Atlas and Leaflet stay frozen until Column happy paths are stable.

## Test hooks

The UC-001 guard now checks for live workspace actions, extracted action dialogs, lifecycle-owned record insertion, and route-safe persistence.
