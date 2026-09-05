# Board-first Plaything Production Method v0.2

Carrier context: Playthings Carrier Major 003. Carrier-major numbering is independent of artifact-lineage numbering.

## Status

Candidate production-method checkpoint awaiting Sigma process/gait acceptance.

- proof-of-two mechanical validation: PASS (explorer + robot)
- cross-board pressure: PASS on 4 generated boards spanning 2 source resolutions
- artistic/Sigma acceptance of gait and process: still open
- final schema/artifact sheet-family requirements: intentionally open

## Purpose

Produce recoverable high-resolution Plaything visual source without making the image model responsible for runtime grids, Tiinex schema semantics, or exact export geometry.

The image model owns bounded visual imagination and within-board coherence. Local deterministic code owns source segmentation, scale, anchor/baseline, safety, validation, preview, and downstream exporters.

## Atomic visual bundle v0.2

One accepted source board is expected to carry the same identity as:

- canonical FRONT neutral view;
- canonical LEFT neutral view;
- canonical BACK neutral view;
- eight LEFT-facing walk poses in order.

This is a visual-source bundle, not a runtime sprite sheet and not the final presentation-family taxonomy.

## Generation protocol

1. Establish a strong user/Sigma visual boundary when the current visual lane is contaminated or sticky.
2. Use only visual language. Do not send Tiinex, Carrier Major, runtime, schema, pipeline, acceptance or research-poster semantics to the image model.
3. Predeclare one bounded identity bundle. If the model chooses to materialize the whole bundle in one generation, that is acceptable and currently preferred for identity coherence.
4. ACCEPT or REJECT the board atomically. Do not ask the model to repair one bad frame in place.
5. On acceptance, freeze the exact board bytes and SHA-256. Those bytes become source truth for local processing; later generations do not redefine the accepted identity.
6. Run the local extractor and validation gates.
7. Keep all later sheet-family, LOD and schema-specific requirements downstream of this source-production boundary.

## Board-layout contract

The extractor does not require a fixed source canvas size.

It derives:

- the canonical-view band from foreground-density runs;
- the walk band from the next significant foreground-density run;
- three canonical-view regions across the top band;
- eight ordered walk centers from weighted 1D foreground clustering across the walk band.

This tolerates different source dimensions, imperfect spacing, labels, dividers and layout residue while keeping the semantic board shape bounded to 3 views + 8 walk poses.

## Extraction contract

### Canonical views

Each top panel uses a central-subject GrabCut boundary and then a shared top-view scale.

### Walk strip

- frame centers come from weighted foreground clustering, not equal source cells;
- every frame is foreground-trimmed locally;
- one shared scale is computed from the strip median source height;
- the same shared scale is applied to all 8 frames;
- per-frame rescue scaling is forbidden;
- frames are bottom-centered on a shared baseline.


## Motion-review contract

Motion review is two-surface by design:

- **ordered motion contact** is the primary gait-pattern review because all eight poses remain simultaneously judgeable;
- **animated preview** is secondary temporal evidence for loop cadence and obvious pops;
- a video/GIF alone must not be used as the only gait review surface when it hides pose-to-pose structure.

Current review outputs:

- `review/explorer-walk-motion-contact.png`
- `review/explorer-walk-preview.gif`
- `review/robot-walk-motion-contact.png`
- `review/robot-walk-preview.gif`
- `review/proof-of-two-walk-review.mp4` remains supplemental only.

## Current exporter probes

Exporter probes exist to validate that visual source can survive projection; they do not lock future product requirements.

- review master cell: 256 px
- shared nominal review body height: 208 px
- review baseline: y=240
- current world compatibility probe: 64 px cell
- shared nominal world body height: 50 px
- world baseline: y=59

`world64` is a compatibility probe only. It is not design authority and does not imply that all future schema/artifact presentation families use this cell size or grid.

## Mechanical gates

- exactly 3 canonical view outputs;
- exactly 8 walk outputs;
- walk source-height drift <= 8% from strip median;
- one shared walk scale per export profile;
- all current world64 probe cells non-empty;
- current world64 probe passes top/bottom safety;
- exact source-board SHA-256 recorded.

The normalizer may not repair missing frames, gross scale drift or a structurally invalid board.

## Proof of two

### Explorer

- `explorer/source-board.png`
- conversation image generation id observed: `8a15451b-c829-4a3a-9981-dea42a06aded`
- SHA-256: `f0d3aaa12a6f2cd3d17c7908750e73b155b32eeadc47a586981dea06601501ee`
- current mechanical validation: PASS

### Robot

- `robot/source-board.png`
- conversation image generation id observed: `d1186491-1145-4892-9911-28a8fa756cdb`
- SHA-256: `5309b81a3041f871daa20ff1776081336f7f1276c5315541d5d56afee836dda0`
- current mechanical validation: PASS

## Pressure evidence

The same v0.5 extractor was run unchanged on four boards:

- primary explorer: 1536 x 1024 — PASS
- alternate explorer: 1312 x 1199 — PASS
- primary robot: 1536 x 1024 — PASS
- alternate robot: 1536 x 1024 — PASS

Observed max source-height drift remained <= 2.24% and the current world64 safety probe passed for all four.

## Explicit non-claims / open authority

This checkpoint does not lock:

- grid vs non-grid world architecture;
- interior scale, house/floor model or Minecraft-like composition;
- true fullscreen architecture;
- time representation or frame-by-frame playback semantics;
- final action/state vocabulary;
- final schema/artifact presentation-family taxonomy;
- final world/interior/companion/detail resolutions;
- final sheet layouts;
- whether future action/direction bundles should share one board or use bounded sibling boards;
- perceptual gait quality.

Those are downstream consumers of the method and may be changed after the method is accepted without redefining accepted source-board bytes.

## Research provenance boundary

External sprite-pipeline research used earlier in Carrier Major 003 remains method inspiration and is separately provenance-recorded. No third-party code, prompt text, character art or source asset is incorporated into this checkpoint.

## Recovery sequence

A future Anchor should recover in this order:

1. `METHOD.md`;
2. `VALIDATION.md` and `validation.json`;
3. exact `explorer/source-board.png` and `robot/source-board.png` bytes;
4. `board_extract_v05.py` and `board_validate_v01.py`;
5. `PRESSURE.md`;
6. ordered motion contacts first, then animated GIF previews; the MP4 is supplemental.

Do not reconstruct this method from chat memory when these materials are available.
