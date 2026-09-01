# Tiinex/site

**Current source identity:** Tiinex Site v470 (`v470`). This checkpoint label is repository/build identity, not a claim that the current Foundation work is a qualified public release.

`Tiinex/site` is the current Viewer, reference implementation, and shared Tooling source used to exercise Tiinex artifacts and provenance workflows.

Tiinex itself is broader than this repository. Its primary semantic authority lives in readable artifacts and maintained schemas, especially in `Tiinex/docs`; organizational priorities and human acceptance live in `Tiinex/business`.

## What this repository is

Current Foundation work here covers:

- the Viewer/reference implementation;
- shared portable Tooling for reading, validating, grounding, and carrying Tiinex artifacts;
- Handoff-package cold start and return manufacture;
- validation/qualification support used by Business, Docs, and Site workspaces together.

This repository is **not** a general-purpose AI runtime, and the current working branch must not be mistaken for a qualified public release merely because its source is available.

## Current status

The Foundation path is active and intentionally conservative.

Current qualified work has demonstrated, among other things:

- cold-start recovery from a routed Handoff package;
- complete Business + Docs + Site workspace carriage for Foundation turns;
- package-parent reuse for unchanged carried workspaces;
- focused Tooling/Foundation validation without introducing new static debt.

Some broader release/closure checks can still be blocked by host dependency availability. A source-only checkout without installed dependencies does not claim runtime/browser readiness.

Historical implementation notes and prior version narratives remain recoverable in Git history; they are not the current first-contact surface.

## LLM / machine first contact

Read [`llms.txt`](./llms.txt) first.

The portable bootstrap source is:

- [`src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`](./src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md)
- [`src/tooling/portable/bootstrap/tiinex.llm.bootstrap.pointer.json`](./src/tooling/portable/bootstrap/tiinex.llm.bootstrap.pointer.json)

The bootstrap is a routing and Tooling aid, **not semantic authority**. Prefer an exact commit or qualified release when retrieving it remotely; disclose when a moving branch was used.

## Supported local start

With dependencies already available:

```bash
npm run dev
```

Expected local address:

```text
http://127.0.0.1:5173/
```

If dependency installation cannot complete, treat runtime/build qualification as blocked rather than silently downgrading it to a pass.

## Where to continue

- Tiinex identity and public orientation: `Tiinex/.github`
- Maintained schemas and semantic contracts: `Tiinex/docs`
- Organizational truth, priorities, and acceptance: `Tiinex/business`
- Portable Tooling entrypoint: `tools/tiinex-portable.mjs`

Read the declared artifacts and qualification evidence before inferring current capability from filenames, branch names, old release notes, or historical implementation prose.
