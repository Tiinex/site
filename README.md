# Tiinex Site v188

v188 is a focused Lineage viewer parity checkpoint. It builds on v187 but tightens the default Lineage reading surface toward the PoC: compact peer artifact cards first, expansion only on request, diagnostics out of the normal viewer, and the home/logo command re-centered without touching the image file.

## v188 batch

- Lineage cards now start collapsed by default. The default card shows status/schema/source, title, summary, path and actions; it no longer dumps schema-owned sections immediately.
- Expanded Lineage cards show a limited, curated schema-owned read excerpt. Full record metadata remains in Open details and exact source remains in Show markdown.
- The selected Lineage status banner only appears for mismatch/missing cases. Successful `root reached` paths are expressed through the card chain instead of repeated report blocks.
- The workspace diagnostics overview is no longer rendered as a default footer under selected Lineage. Users can still enter Audit details explicitly from the mode controls outside the viewer path.
- Current, parent and root cards keep the same physical/action model while reducing diagnostic labels such as `current anchor` in the card chrome.
- Lineage viewer CSS now owns the card stack directly and suppresses decorative/pseudo overlays inside card content.
- The home/logo button is re-centered with CSS only; the PNG asset is unchanged.
- The top toolbar remains content-fit and tighter around the controls.

## Source/material boundaries

Source, transport, cache and material provenance behavior remains from v187. v188 intentionally avoids new transport or materialization work so the Lineage viewer contract can be tested cleanly.

Known limits remain: no partial import promotion, no real browser issue snapshot reader, and no automatic binary asset fetching.

## Supported local start

Use the React dev server:

```txt
npm run dev
```

The old static runtime is archived under `.old/` for behavioral reference only.
