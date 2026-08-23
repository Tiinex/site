# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 14:40:00
  - Trace: [Handoff carrier projection, shared-route, and human-output closure](012-handoff-carrier-projection-shared-route-and-human-output-closure.trace.md)
  - Origin:
    - [relative](012-handoff-carrier-projection-shared-route-and-human-output-closure.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 16:04:00
  - Authors: Anchor
  - Why: Preserve independent review evidence that Tooling 012 correctly qualifies shared-route Handoff bytes and human projection, but can currently advertise a secondary route as ready even when that route's own Required Context cannot be grounded from the package.
  - Summary: Tooling 012 remains correction-pending until every advertised shared route proves its own required recipient closure rather than only exact Handoff bytes, parties, dimension, and workspace correlation.
  - Status: draft/local

---

# Tooling 012 secondary-route closure qualification feedback

## Feedback Target

- Target: Tooling 012 shared-route qualification in `src/tooling/portable/handoff/carrierProjection.js` and the route/material construction feeding it.
- Review Boundary: independent Anchor architecture/source acceptance of shared-carrier recipient readiness; not canonical Handoff semantics, Viewer behavior, filename semantics, or the later parseable cold-consumer entrypoint request.

## Feedback Received

- Exact returned package integrity is clean: `tiinex.package/file-map.json` governs 1,638 non-file-map package files with exact path/byte/SHA-256 agreement, and the embedded Tooling manifest declares 298 runtime files whose bytes and digests all match.
- Independent focused reruns pass static guards, Tooling 012 carrier projection, Tooling 011 manufacturing regression, transport companion, Node ZIP input, operation catalog, portable bootstrap, and `portable:smoke`.
- Independent projection from the exact returned ZIP succeeds despite `tiinex.package/handoff-closure.json` being about 1.4 MiB: `project-handoff-carrier-output` rehydrates package control JSON, validates the package-local carrier projection, and regenerates `tiinex-site-004-1-1-loom-to-anchor.handoff-package.zip` plus the exact workspace-relative return locator without prior chat state.
- The shared-route qualifier currently checks one qualified workspace materialization, exact packaged Handoff bytes/digest, `tiinex.handoff.v1` declaration, Handoff Parties, and dimensional filename projection. It does not independently project/resolve each advertised route's Handoff Required Context.
- Anchor reproduced a concrete counterexample on the exact Tooling 012 source: a primary Loom Handoff with no requirements plus a secondary Axiom Handoff declaring an available Required Context reference to a missing `missing.trace.md`. Manufacturing returned `status=ready`, `transportExecutable=true`, and both routes `state=qualified`; the package plan reported zero required requirements because only the primary Handoff contributed material closure.
- Therefore a shared carrier can currently advertise a secondary route as qualified even though a cold recipient following that route cannot obtain its declared required material. Exact route bytes are qualified, but recipient-grounding closure for that route is not.

## Source

- Uploaded `tiinex-site-004-1-1-loom-to-anchor.handoff-package.zip` and its exact returned `current-site` workspace bytes.
- Independent package file-map/bootstrap-manifest verification and focused regression reruns.
- Independent synthetic shared-route counterexample executed against the exact returned Tooling 012 source, with one missing Required Context reachable only from the secondary route.

## Disposition

- State: correction-required
- Follow-Up: keep Tooling 012 open. Shared route qualification must include each advertised Handoff's required recipient closure, not only route artifact/workspace qualification. Manufacturing should union or otherwise materialize route-specific required closure and fail closed when any advertised route cannot independently ground its Required Context.
- Preservation Requirement: retain Tooling 012's working deterministic filename projection, same-dimension parallel routes, explicit selector behavior, collision-only `--N`, one-primary human output, >128 KiB package-control rehydration correction, and Tooling 011 single-route regression behavior.
- Evidence Requirement: add a regression equivalent to the reproduced missing-secondary-required-material case and prove the shared package blocks or marks the route unqualified until the required material is carried and correlated.

## Limits

- Reference Context need not become a blocking Required Context merely to satisfy this correction; preserve existing Handoff required/reference semantics.
- This feedback does not require multi-workspace carrier projection yet. Single-workspace remains a valid ergonomic default; later work may generalize route/workspace projection without weakening this per-route closure invariant.
- This feedback does not make Handoff filenames, dimensions, route labels, or human transport prose authoritative.
- Package readiness or an exact Handoff byte match must not be renamed as recipient readiness when the selected Handoff's own required grounding material is absent.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:5Zs8u2iNk2WSXjFn3RNhwLV6WUjdRZQ2-1eKvkt2vZ8
