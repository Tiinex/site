# Tiinex Site v187

v187 is a lineage-viewer parity and transport-clarity checkpoint for the React/Vite refactor. It builds on v186's equal Lineage cards and removes the remaining debugger-like defaults from normal Lineage reading.

## v187 batch

- Tree artifact rows now enter Lineage for that artifact, matching Feed/card behavior; Details remains a separate explicit action from cards/dialogs.
- Lineage mode defaults to a cleaner artifact viewer: no selected audit footer and no repeated root terminal claim when the compact path status already says `root reached`.
- Every Lineage card receives comparable lifecycle, audit, schema, source, anchor, details, markdown, Continue, Preserve evidence, and Source actions when the record supports them.
- Current/parent/root labels are less diagnostic than the earlier `reference point / ancestor` wording.
- Source transport display separates the configured plan from observed delivery counts; the compact pill can show cache, mirror, proxy, direct, or mixed observed tiers.
- Clicking the transport chip clears same-source text cache and opens source controls so a user can explicitly retry the source path instead of silently staying on stale cache/direct behavior.
- Cache → mirror → proxy → direct remains the transport plan; mirror/proxy tiers now produce explicit unavailable/skipped events when no browser reader/configuration can service them.
- Import notices are dismissible and auto-expire; durable import information remains in workspace/source summaries instead of acting like a permanent console overlay.

## Source/material boundaries

The source cache remains a same-browser material-continuity mechanism for already source-backed records. Clearing a source cache through the transport chip does not change provenance, infer GitHub for local material, or mutate the source repository.

v187 still does not implement partial import promotion, a real browser issue snapshot reader, or automatic binary asset fetching.

## Supported local start

Use the React dev server:

```txt
npm run dev
```

The old static runtime is archived under `.old/` for behavioral reference only.
