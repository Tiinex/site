# M2 v383 — lineage parent-authority correction

## Invariant

For a declared Parent edge, explicit declared parent identity/provenance is stronger than inferred path/alias evidence.

```text
verified/declared explicit parent binding
> contextual relative path
> issue-local/path alias
> suffix/heuristic matching
```

The implementation does not convert ambiguity into first-match selection. If strong evidence resolves to multiple semantic artifacts after existing material-preference rules, it remains ambiguous.

## Product proof

Q acceptance #2 exposed `Re-watch Silicon Valley` resolving as a one-node ambiguous lineage in v382 while the published chain is explicitly bound:

```text
Re-watch Silicon Valley
→ Silicon Valley (GitHub comment 4881782365)
→ Welcome to the Next Dimension (issue #9 root)
```

The v383 acceptance fixture deliberately includes overlapping weak path material plus shell/embedded comment representations, so the proof exercises precedence rather than a trivial unique-path case.

## Nonclaims

No M5 lineage presentation/status redesign, source ownership redesign, route/share work, or candidate compatibility cleanup is part of v383.
