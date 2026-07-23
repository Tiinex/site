



## Bootstrap entrypoint found

The package’s human entrypoint is **`START.md`**. It says to begin with:

```bash
node bin/tiinex-portable.mjs operations --compact
```

The executable CLI entrypoint is **`bin/tiinex-portable.mjs`**, which delegates to `runPortableCli(...)`. The readable fallback entrypoint is **`bootstrap/tiinex.llm.bootstrap.md`**, supported by **`operation-catalog.json`**.

I ran only the read-only operation-catalog command above. It reported 37 operations and made no source mutation or remote write.

## First operation I would use

For an actual lineage-inspection task, I would first use **`search-lineage`** against the supplied artifact material.

That choice is explicit in the bootstrap:

> “Use `search-lineage` before reading every artifact body.”

It is the smallest bounded operation because it searches loaded lineage by text, schema, source mode, Parent-lineage role, integrity, continuity context, findings, path, and traversal scope. It is read-only, loaded-only, does not fetch missing ancestors, and does not infer undeclared edges.

After locating the relevant slice, **`resolve-lineage`** would be appropriate to traverse declared lineage edges within that loaded material.

I would not run either operation yet: this archive contains the method and runtime, but no project lineage to inspect.

## Material required to inspect or continue a lineage

At minimum, an **artifact package or explicit local material set** containing the relevant Tiinex artifacts is required. The artifacts must carry enough declared identity and relationships to search or traverse—particularly explicit Parent edges where lineage is expected.

Depending on the task, continuation may also require:

- Missing ancestor or descendant artifacts, supplied explicitly; `search-lineage` will not retrieve them.
- Exact readable schema Markdown for the artifacts involved, or authorized access to the pinned canonical docs source.
- An optional handoff artifact or portable session/checkpoint as navigation or recovery help. A handoff is not required and its claims must be verified against loaded artifacts.
- Explicit source and qualification evidence where provenance, integrity, continuity, or checkpoint qualification matters.

The bootstrap pins canonical schema material to:

```text
repository: Tiinex/docs
commit: 52ecdea0a75893882ce282214d155f70e1309c2a
```

No canonical schema snapshots are bundled. Therefore, absent supplied schema Markdown or an authorized provider able to read that exact commit, schema meaning beyond the bootstrap’s explicitly qualified fallback remains unknown.

## Exactly what I read

I inspected the archive directory listing, then read:

- `README.md` — entire file.
- `START.md` — entire file.
- `USER_GUIDE.md` — entire file.
- `bootstrap/tiinex.llm.bootstrap.pointer.json` — entire file.
- `canonical/docs.pointer.json` — entire file.
- `manifest.json` — entire file.
- `provider-modes.json` — entire file.
- `package.json` — entire file.
- `bin/tiinex-portable.mjs` — entire file.
- `operation-catalog.json` — its opening portion directly, and the full compact catalog through the CLI operation output.
- `bootstrap/tiinex.llm.bootstrap.md`:
  - lines 1–60, covering purpose, package boundaries, startup, and handoff absence;
  - lines 286–336, covering lineage search behavior and limits;
  - lines 680–712, covering CLI examples.

I also ran:

```bash
node --version
```

which returned `v22.16.0`, and:

```bash
node bin/tiinex-portable.mjs operations --compact
```

No Tiinex artifact, draft, stage, checkpoint, package, handoff, or lineage state was created or modified. I did make a temporary extracted working copy under `/tmp/tiinex_ro` solely to read the archive contents; the original ZIP was not modified.