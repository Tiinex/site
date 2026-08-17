# M2 recovery v385 — Open-On-Apply semantic closure

## Canonical authority

Workspace entrypoint applicability is owned by `workspace.entrypoints.js` rather than by startup UI or app-config-specific code.

```text
workspaceEntrypointApplies(entrypoint)
```

matches the PoC/default-true contract:

- missing value → apply,
- affirmative value → apply,
- explicit negative value → skip,
- unknown value → retain default-true fallback.

`workspaceSourceInputsFromMarkdown()` therefore returns only applicable entrypoints. The same predicate is reused by app-config startup planning and first-entrypoint selection.

## Why this matters

A Workspace Artifact is a workspace-set descriptor. `Open On Apply` is part of that descriptor's semantics, so Open, Merge and startup application must not invent separate filtering rules.

The disabled entrypoint is filtered before workspace lifecycle creation/materialization, not hidden later by startup-specific UI logic.

## Nonclaims

This checkpoint does not reopen the broader v384 owners or the historically failed M2 acceptance gate. No Q test is requested.
