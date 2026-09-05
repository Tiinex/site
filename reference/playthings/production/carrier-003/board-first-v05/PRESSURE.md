# Pressure — board layout generality

The first robust extractor attempt incorrectly assumed `1536 x 1024` source boards. An alternate explorer board was `1312 x 1199`, correctly falsifying that assumption.

v0.5 replaces source-resolution authority with observed board-layout authority:

- foreground-density detects top and walk bands;
- weighted 1D foreground clustering detects eight walk centers;
- extraction and normalization remain identical after discovery.

Unmodified v0.5 results:

| Board | Source size | Max walk source-height drift | world64 safety probe |
|---|---:|---:|---|
| primary explorer | 1536x1024 | 0.37% | PASS |
| alternate explorer | 1312x1199 | 2.24% | PASS |
| primary robot | 1536x1024 | 0.56% | PASS |
| alternate robot | 1536x1024 | 0.39% | PASS |

The alternate boards are pressure inputs only; they do not replace the two frozen primary source boards.

Raw alternate pressure-board bytes are not carried in this Sigma review package; only the pressure result summary is carried. The two primary proof-of-two source-board bytes remain carried and frozen.
