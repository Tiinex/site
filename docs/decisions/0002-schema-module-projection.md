# 0002 Schema Module Projection

Decision: represent each supported Tiinex schema with three local files where practical:

- `<name>.schema.md` — local snapshot of the schema artifact.
- `<name>.schema.json` — binding metadata, checksum, permalink, and local module path.
- `<name>.schema.js` / future `<name>.schema.ts` — app-readable module projection.

The path mirrors Tiinex/docs for navigation, but schema identity and parentage are resolved from artifact content and binding metadata, not path alone.
