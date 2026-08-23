# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.signal.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/signal/tiinex.signal.v1.schema.md)
  - Created At: 2026-08-23 17:49:00
  - Authors: Anchor
  - Why: Preserve a bounded operational scaling signal discovered while manufacturing the condensed Anchor successor package without overstating the timeout as a correctness failure or established root cause.
  - Summary: Current full-workspace Handoff manufacture is clean and about 31 seconds without roundtrip, while equivalent default manufacture with roundtrip did not complete within imposed 120-second and 300-second review windows.
  - Status: observed/local

---

# Handoff successor package roundtrip scale signal

## Observed Signal

- Independent Anchor manufacture of the current successor Handoff with embedded Tooling and `--no-roundtrip` completed in approximately 31.45 seconds with about 260,320 KB maximum resident memory, produced a 15,596,109-byte ZIP, and reported `ready`, `executable=true`, `transportExecutable=true`, and zero findings.
- The resulting package independently verifies all governed file-map entries, has a `ready` carrier with qualified route/Required Context closure, and both workspace Tooling and the package's own embedded Tooling runtime orient `START.md` as `ready` / `valid` with zero findings.
- Two otherwise equivalent default manufacturing attempts that included the normal roundtrip did not complete within imposed review windows: one was stopped after 120 seconds and a later attempt after 300 seconds. No final package from those timed-out runs was relied on.

## Source

- Source: Anchor's local Tooling execution against the final condensed Tiinex/site workspace after Tooling 013 acceptance, using the current portable CLI and explicit wall-time limits

## Interpretation

- The observation indicates an unresolved practical scaling/performance boundary in the full default roundtrip path for this current full workspace and is a reasonable candidate for a later bounded Loom instrumentation/performance leaf.
- It does not presently contradict package truth or the accepted Tooling 013 cold-consumer semantics because the no-roundtrip package was independently verified through file-map, carrier, START correlation, and embedded-runtime orientation.

## Limits

- The timing is environment-specific and bounded by imposed timeout windows; it does not prove a universal host regression, identify the responsible algorithm, or prove that the roundtrip would never complete after 300 seconds.
- The signal does not invalidate prior bounded package correctness acceptance or establish a performance requirement by itself.
- Generalized large-workspace roundtrip closure should remain unclaimed until this path is bounded, diagnosed, or intentionally redesigned.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:nJhBPh3oyOrUyJZR7Vfm5waiw1Ig5xgFbjnyUKpSIjA
