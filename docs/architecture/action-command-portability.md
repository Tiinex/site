# Action Command Portability

Visible actions should be modelled as command vocabulary, not ad hoc buttons.

## Purpose

Tiinex Site should be portable to other interfaces such as CLI, remote control, and future automation surfaces. UI labels, icons, and placement are presentation details over stable action semantics.

## Rule

- A UI action has a semantic command id.
- A command id has scope: artifact, workspace, source, draft, audit, or transport.
- UI actions may be icon-first, but the command remains nameable and portable.
- CLI mappings are provisional until the CLI exists, but the command shape should not require reinterpreting artifact truth.

Examples:

```text
open      -> tiinex workspace open <id>
merge     -> tiinex lineage merge <id>
source    -> tiinex source show <id>
audit     -> tiinex audit loaded
markdown  -> tiinex artifact markdown <id>
```

## Boundary

Command portability does not mean every UI action is implemented. Scaffolded actions must remain visibly scaffolded until the behavior exists.
