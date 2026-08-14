# M1 v366 last-known-good local persistence correction

v366 preserves the v359–v365 recovery and changes only the durable local write failure strategy identified in architect review of v365.

## Problem

Before v366, a failed write to `tiinex.site.localDeltas.v1` removed both the durable local-delta key and `tiinex.site.localRecoveryIndex.v1` before retry. If the retry also failed, the previous successful local recovery was gone even though the product warning fired.

## Contract

```text
existing last-known-good durable local snapshot
→ attempt newer durable snapshot
→ newer write fails
→ prune disposable route/session cache only
→ retry newer durable write
→ if retry still fails:
   previous local delta remains readable
   previous recovery index remains readable
   newest changes are explicitly reported as not persisted
   user-visible persistence warning still fires
```

If a partial retry changed durable data before the full durable pair qualified, v366 attempts to restore the prior serialized local delta/index. The normal successful write path is unchanged.

## Regression proof

`src/workspaces/workspace.persistence.test.mjs` now writes `# OLD SAVED WORK`, forces later writes to `LOCAL_DELTA_KEY` to fail, attempts `# NEWER UNSAVED WORK`, and verifies:

- serialized last-known-good delta is unchanged;
- recovery index is unchanged;
- `readRecoverableLocalState()` still returns the old saved work;
- the newer failed work is not presented as durably persisted;
- failure receipt/event disclose `newestChangesPersisted: false` and `lastKnownGoodPreserved: true`.

`TiinexApp` surfaces a distinct notice when the previous recovery is preserved.

## Boundary

This is a bounded M1 data-safety correction. It does not redesign storage authorities, broaden route validation, start M2, or claim browser/Q parity.
