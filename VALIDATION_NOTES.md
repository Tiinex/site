# Validation Notes v383 — Tiinex Site v383

Checkpoint: `v383`  
Version: `0.2.202-v383`  
Runtime: `react-v383-lineage-parent-authority-correction`

## Acceptance context

M2 Q acceptance #2 failed on one bounded lineage parent-authority divergence. Other previously corrected Workspace Artifact action composition, candidate quarantine, explicit-only issue targets, source provenance actions, targeted schema recovery and canonical Workspace Artifact readmodel visibly passed in the same browser run and are preserved.

## Correction

`src/lineage/lineage.resolve.js` now evaluates strong declared parent binding before simple/dot-relative path inference for Parent edges.

This closes the reproduced precedence defect:

```text
weak inferred relative path
→ multiple candidates / ambiguous
→ must NOT terminate while stronger explicit parent binding remains available
```

Strong evidence may include exact declared publication/comment provenance and explicit Parent Source/Raw/Artifact Path bindings already carried by the parsed record. If that strongest evidence is itself conflicting, ambiguity remains.

## Regression proof

`src/acceptance/m2QLineageParentAuthorityCorrection.test.mjs` covers the actual product path:

- Tiinex/docs issue #9-like loaded material includes broad weak aliases, issue root, comment publication shell and embedded Tiinex artifact;
- selected `Re-watch Silicon Valley` declares comment `4881782365` as parent through source/raw/path binding;
- `buildWorkspaceLineageView` yields `Re-watch Silicon Valley → Silicon Valley → Welcome to the Next Dimension`;
- `loadFullLineageCommand` reports 3 nodes, complete, `rootReached=true`, no ambiguity and no unnecessary recovery;
- embedded comment artifact wins over the publication shell;
- the same weak relative aliases without a stronger binding remain `ambiguous-parent`;
- known-good `Fler bondgårdar → Klagomuren → FS25 Markaryd` remains root-complete.

Existing lineage resolver, workspace lineage view, lineage command and source-recovery suites remain green.

## Qualification status

Worktree qualification before versioning passed:

- architecture:shape
- ui:shape
- validate-static
- typecheck
- metrics
- storage:scan
- portable:smoke
- usecase:uc001
- lineage resolver/view/command/recovery targeted suites
- v383 acceptance regression

Full `npm run validate` passed the entire source/static/M1/M2 prefix including v383, then stopped only at the known restore-environment boundary where `src/app/useLocalMaterialIntake.test.mjs` imports missing `react`. The complete suffix after that test passed separately through the portable aggregate suite.

Final versioned qualification on `0.2.202-v383` passed the same targeted and project gates. Full `npm run validate` again passed the entire source/static/M1/M2 prefix including the v383 parent-authority correction and stopped only at the known missing-React boundary. The complete suffix after that test passed separately through the portable aggregate suite.

`runtime:smoke` and `public:check` were rerun and remain explicit source-checkpoint nonclaims: the restore tree has no installed Vite dependency tree and no built public output.

## Scope

No broad lineage redesign or static audit is included. No route/share, source/discovery, candidate compatibility or M3+ work is opened.

```text
M1 = CLOSED
M2 Q acceptance #1 = FAIL (historical)
M2 Q acceptance #2 = FAIL (lineage parent authority)

v383 = bounded lineage parent-authority correction candidate
v383 != M2 PASS
v383 != product PASS
v383 != Q-test-ready until architect targeted source review
```
