# Playthings generative visual postprocess tooling

`motion_sheet_tool.py` performs deterministic, non-generative operations on alpha-isolated motion sheets.

Supported commands:

- `inspect <sheet> [--out report.json]` — RGBA, alpha, grid, per-frame bbox/floor/anchor facts.
- `repack <sheet> <output.png> [--safe-margin N] [--report report.json]` — whole-frame alpha crop, one shared scale, centered placement, common bottom safe margin.
- `diagnose <sheet> [--out report.json]` — stabilized alpha-shape adjacent/pair similarity diagnostics.
- `preview <sheet> <preview.webp>` — stabilized lossless animated WebP with exact alpha round-trip verification.
- `surgery <sheet> <manifest.json> <preview.webp>` — recorded whole-frame `copy`/`replace`/`drop`/`duplicate`/`reorder`/`duration` review variants.

The tool never repaints, inpaints, or invents image content. Exact generated source bytes must remain separately preserved. Stable promotion is a process decision outside this tool.

Run the synthetic regression test with:

```sh
python tools/playthings/generative_visual/tests/test_motion_sheet_tool.py
```
