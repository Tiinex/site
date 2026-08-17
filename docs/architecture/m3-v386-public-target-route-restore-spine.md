# M3 v386 — Public Target Route / Restore Spine

## Authority split

```text
semantic #state
= workspace/view navigation authority

public target hash
= explicit external target identity

clean URL
= existing startup authority
```

The public hash syntax is encoding, not domain architecture. It is decoded once to `tiinex.publicTarget.v1` before materialization.

## Public restore

Public target restore is asynchronous and intentionally lives above persistence. It starts from empty canonical state to prevent unrelated local recovery from taking ownership.

Materialization reuses the existing GitHub source operation or explicit URL material command. After materialization the target is interpreted as a canonical artifact: ordinary artifacts are selected; Workspace Artifacts use the existing Open/apply lifecycle.

## Nonclaims

M3-A does not define the final Share UI or public eligibility policy. It only establishes truthful route/restore ownership that later Share projections can consume.
