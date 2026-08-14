# Tiinex Site v383 — lineage parent-authority correction

v383 is the bounded correction after M2 Q acceptance #2 exposed one concrete lineage-resolution divergence while the preceding Workspace Artifact/source/candidate corrections visibly held in the browser.

## What v383 corrects

For a declared Parent edge, explicit parent evidence is now evaluated before contextual/path inference:

```text
explicit declared parent binding / publication-comment identity / source provenance
> relative/path/alias inference
```

A weak ambiguous relative-path candidate set can therefore no longer terminate resolution while stronger explicit parent evidence remains unevaluated.

The resolver still preserves ambiguity when the strongest applicable evidence is genuinely ambiguous. It does not select first match, title-match, or guess a repository/source. Existing embedded-artifact preference over GitHub publication shells is preserved.

## Acceptance regression

`src/acceptance/m2QLineageParentAuthorityCorrection.test.mjs` models the real Tiinex/docs issue #9 shape from Q acceptance #2:

```text
Re-watch Silicon Valley
→ Silicon Valley
→ Welcome to the Next Dimension
→ root reached
```

The loaded workspace also contains broad/overlapping weak path material plus both publication-shell and embedded comment representations. The test goes through `buildWorkspaceLineageView` and `loadFullLineageCommand`, the product path behind **Load full lineage**.

The same suite preserves:

- genuine weak ambiguity remains `ambiguous-parent`;
- exact comment identity chooses the embedded Tiinex artifact over the shell;
- `Fler bondgårdar → Klagomuren → FS25 Markaryd` remains root-complete.

v383 does not redesign M5 lineage readability/status, source ownership, route/share, candidate compatibility, or Workspace Spine architecture.

## Supported local start

Use `npm run dev` after dependencies are installed. This source checkpoint intentionally excludes `node_modules` and built output.
