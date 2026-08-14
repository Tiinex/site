# Export and Transport Levels

Status: v328 architecture note.

## Root boundary

Tiinex has two different export products:

1. **Tree export** — an ordinary downloadable file tree. The archive mirrors the logical Tiinex tree 1:1 and must not add `artifacts/`, `sources/`, or `tiinex.package/` envelope folders.
2. **Handoff package** — a recoverability/tooling package. It may contain `tiinex.package/` control files, source references, receipts, and package-only folders.

The default download affordance should be Tree export. Handoff package must be an explicit package/handoff action.

## PoC UX lessons retained

The PoC export adapter used a staged flow:

- configure first, execute second;
- adapter choice before execution;
- scope choice before execution;
- disabled future options are visible but do not claim to work;
- GitHub browser export is a guided manual routine: copy, open, publish, verify;
- Download export is local/archive-oriented;
- source-backed material stays unchanged by export.

The refactor should preserve those lessons without forcing every ordinary download through a heavy wizard.

## Transport Levels

Transport Level describes how Tiinex moves material to/from an origin for a specific operation. It is not a provenance claim.

- `TL0` — manual/user-mediated transport. Copy/paste, upload/download, open URL yourself. No API, no auth, no automatic traversal.
- `TL1` — direct public transport. Known public URL/path only. No API/listing/throttle when possible.
- `TL2` — public API/proxy/mirror/index transport. May be throttled, budgeted, cached, or rate-limited.
- `TL3` — authorized transport through a signed-in session/connector. No credentials are stored in source config, artifacts, or export packages.
- `TL4` — delegated/managed automation transport. Future scope for scheduled/background sync or managed publish with explicit receipts, audit, revoke, scope, and confirmation.

Transport is paired with operation capability:

- `read-known`
- `list-scope`
- `read-history`
- `write`
- `verify`
- `sync`

A source/origin configuration declares available transport levels per operation. Import/export/recovery should ask the source config for allowed transports, use the lowest sufficient transport, and fall back to lower/manual levels when possible. They must never silently upgrade to TL3/TL4.

## Auth boundary

User/password/token/refresh-token material belongs to the user identity/session layer, such as SSO or sign-in. It must not be stored in artifacts, source configs, workspace files, diagnostics, receipts, tree exports, or handoff packages.

Safe metadata may say that auth is required, which provider is needed, which scopes are expected, and that credential material is not included.


## v328 implementation boundary

The site runtime now has a small transport-level read-model in `src/sources/transport.levels.js`. Ordinary Tree Export and local archive import resolve to TL0 operation plans. Source/origin configs may declare higher transport levels per operation later, but import/export must never silently upgrade above the configured level.

Tree view and ordinary Tree Export share `workspace.recordPaths` as the path owner. List-aware issue-sidecar filename canonicalization may assign dimension prefixes for adapter-imported GitHub issue comments when legacy material only has a long comment id fallback.

## v329 export adapter boundary

The refactor now has a small export-plan read-model in `src/export/export.plan.js`.

The default workspace action opens a Configure → Execute shell before any export runs. The executable path remains intentionally narrow:

- adapter: `download`
- export type: `tree`
- scope: `all`
- operation: `local-download`
- transport: `TL0`
- package envelope: `false`

The dialog also shows future `github` and `handoff-package` adapters so the PoC's adapter-first UX remains visible, but they are not executable in this slice. GitHub publish must return later as a TL0 manual wizard (`copy → open → publish → verify`) rather than a fake write. Handoff package must remain an explicit package export because envelope folders are not valid ordinary Tree export output.
