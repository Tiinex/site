# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:08:00
  - Trace: [002-playthings-runtime-companion-expansion-major-task.trace.md](002-playthings-runtime-companion-expansion-major-task.trace.md)
  - Origin:
    - [relative](002-playthings-runtime-companion-expansion-major-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:24:00
  - Authors: Anchor
  - Summary: Workspace artifact-local tiles companion binding
  - Status: draft/local

---

# Workspace artifact-local tiles companion binding

## Objective

Bind loaded workspace PNG assets to their sibling artifacts/schemas using the reserved `<basename>.playthings.tiles.png` convention, qualify embedded tile metadata from exact loaded bytes, feed the result into the existing artifact/schema/ancestor/Root tile resolver, and make companion changes participate in presentation refresh fingerprints without acquiring semantic authority.

## Done Criteria

- Artifact path `.topics/foo.trace.md` resolves only the exact same-workspace `.topics/foo.playthings.tiles.png`; schema path `tiinex.task.v1.schema.md` resolves `tiinex.task.v1.playthings.tiles.png`.
- A companion qualifies only when full bytes/data URL are locally available and embedded `tiinex.playthings.tiles` metadata validates; metadata-only assets fail closed to schema/Root fallback.
- Same-workspace artifact-local companion outranks schema companion and Root.
- Schema artifacts with valid companions populate the schema companion map so ordinary artifacts may inherit an exact/ancestor schema tilesheet through the same presentation ancestry interpretation.
- Persistent organization/workspace Place rendering receives the artifact’s resolved tile companion and falls back per-token to Root when a custom sheet omits a token.
- Companion byte identity participates in Playthings presentation fingerprinting so replacing a PNG refreshes rendering even when artifact Markdown is unchanged.
- Existing and new Playthings pure cases pass; browser import boundary, architecture shape and TypeScript pass.
- Large/unloaded source assets remain metadata-only and do not pretend to be runtime-ready.

## Scope

Presentation asset binding only. Exact path co-location is a presentation convention, not Parent/Role/schema authority. The slice uses workspace-owned loaded assets already present in the Viewer model; it does not fetch arbitrary remote binary URLs or promote source references into owned bytes. Root fallback remains valid when custom companion bytes are unavailable or invalid.

## Dependencies

- Parent major 002.
- `playthings.tiles.js` metadata parser/resolver.
- Workspace `assets` collection and archive adapter `dataUrl` representation for small loaded PNGs.
- Playthings model projection and presentation fingerprint.
- Viewer persistent Place rendering.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-playthings-runtime-companion-expansion-major-task.trace.md](002-playthings-runtime-companion-expansion-major-task.trace.md)
  - Value: rBa_FL6VodICHqLiDwOaW1AGM1XYOv_xD340PreOFm0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 4XVOc-eNsDTPqbzH0ZuPY-WCpAg1VIObXYlg77SRqDw
