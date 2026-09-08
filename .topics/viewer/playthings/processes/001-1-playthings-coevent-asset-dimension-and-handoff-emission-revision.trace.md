# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-08 01:34:00
  - Trace: [Playthings Visual Production And Asset Lifecycle](001-playthings-visual-production-and-asset-lifecycle-process.trace.md)
  - Origin:
    - [relative](001-playthings-visual-production-and-asset-lifecycle-process.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 02:49:00
  - Authors: Anchor; Sigma
  - Why: Tighten two production invariants exposed during repository review: same-event assets must not manufacture false numeric child lineage, and Handoff delivery must use the exact Tooling-projected carrier filename and routing text rather than a manually renamed package or reconstructed transport prose.
  - Summary: Co-event asset dimensions and Tooling-owned Handoff emission are mandatory for future Playthings production.
  - Status: accepted/local

---

# Playthings Co-Event Asset Dimension And Handoff Emission Revision

## Decision

### Co-event asset naming

A non-final asset created by a lineage event uses the **exact numeric dimension of its controlling artifact**.

```text
001-some-evidence.trace.md
001-generated-01.png
001-generated-02.png
```

If several assets arise in the same event, ordering is expressed at the **end of the semantic slug** (`-01`, `-02`, ...), not by extending the numeric lineage dimension.

```text
correct
001-input-character-identity-01.png
001-input-style-02.png

incorrect when both assets arose during event 001
001-1-input-character-identity.png
001-2-input-style.png
```

A numeric child such as `001-1` means a later lineage event. It must never be used merely as an attachment index.

The existing-asset exception remains unchanged: if a suitable asset already exists in the Workspace, reference it in place instead of duplicating it only to satisfy lineage locality.

### Handoff human emission

A manufactured Tiinex Handoff is delivered using Tooling-owned `humanOutput` only:

```text
humanOutput.primary.filename
+
humanOutput.normalInlineRouting.content
```

- Do not prepend project prose to, rename, or otherwise improvise the Tooling-projected package basename.
- Do not manually reconstruct Start/Continue-from routing when Tooling can project it from package truth.
- When the requested checkpoint requires several Workspaces, the carrier must include and qualify every requested Workspace before emission.
- `--transport-text` may write the same routing bytes as a disposable recovery sidecar, but the normal chat delivery remains the sole primary package plus the exact inline routing content.

## Tooling Consequence

`tools/playthings/playthings-assets.mjs` must:

- import genuinely new non-final assets beside the controlling artifact using its exact numeric dimension;
- support optional slug-tail ordinals without creating numeric child dimensions;
- audit lineage-local visual assets for a same-directory controlling trace with the same numeric dimension;
- continue to reject a repository-root `reference/` production tree.

## Interpretation Limits

- Does Not Mean: independent later Evidence/Decision/Handoff events must share a parent dimension; genuine later events continue to use children/siblings according to lineage semantics.
- Does Not Mean: pre-existing Workspace assets must be copied beside every artifact that references them.
- Must Not Be Used To Claim: a manually renamed ZIP is a canonical Tiinex human transport just because its internal carrier bytes validate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Playthings Visual Production And Asset Lifecycle](001-playthings-visual-production-and-asset-lifecycle-process.trace.md)
  - Value: P_rNw-rNQl8xAOiN8dpha7GSXLkfjX2olpYpTFh7SYw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:y-y84JfVgaXc9fvWyfcgGTSanOPuY3BG2Xc33AFQomI
